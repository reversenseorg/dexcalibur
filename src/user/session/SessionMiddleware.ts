import {IncomingMessage,ServerResponse} from 'http';
import {Cookie, CookieOptions} from "./Cookie.js"
import * as Log from "../../Logger.js";
import {CookieHeader} from "./CookieHeader.js";
import {SessionStore} from "./SessionStore.js";
import {CryptoUtils} from "../../CryptoUtils.js";
import {ValidationRule} from "../../Validator.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {UserSession} from "./UserSession.js";
import {MemoryStore} from "./MemoryStore.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface ExtendedIncomingMessage extends  IncomingMessage {
    [key:string]:any;
}

export interface ExtendedServerResponse extends  ServerResponse {
    [key:string]:any;
}

const defer = (typeof setImmediate === 'function')
    ? setImmediate
    : function(vFn:any){ process.nextTick(vFn.bind.apply(vFn, arguments)) }


export enum UnsetMode {
    KEEP="keep",
    DESTROY="destroy"
}

export interface SessionMiddlewareOptions {
    cookie:CookieOptions,
    genid?:string,

    // name =?= key
    name?:string,
    key?:string,

    trustProxy:boolean,
    rolling:boolean,
    resave:boolean,
    saveUninitialized:boolean,
    secret:string[],
    unset:UnsetMode,
    store: SessionStore|MemoryStore,
    enforceSecure: boolean
}

type MiddlewareFn = (req:any,rep:any,next:any)=>any;

export class SessionMiddleware {

    static VALIDATE = {
        unset: ValidationRule.newPinklistAssert([UnsetMode.KEEP,UnsetMode.DESTROY]),
        secret: ValidationRule.asArrayOf([ValidationRule.utf8String()]),
        store: ValidationRule.newCustomAssert((vStore:any)=>{
            return (vStore!=null) && ('object'===typeof vStore) && (vStore._coll!=null);
        }),
        resave: ValidationRule.bool(),
        rolling: ValidationRule.bool(),
        saveUninitialized: ValidationRule.bool(),
        trustProxy: ValidationRule.bool(),
    };

    // determine if session should be destroyed
    static DEFAULT_DURATION: number = 3600*1000;

    static shouldDestroy(vReq:any, pOptions:SessionMiddlewareOptions) {
        return vReq.sessionID && (pOptions.unset === UnsetMode.DESTROY) && (vReq.session == null);
    }


    // determine if cookie should be set on response
    static shouldSetCookie(pReq:any, pCookieID:string, pOptions:SessionMiddlewareOptions ) {
        // cannot set cookie without a session ID
        if (typeof pReq.sessionID !== 'string') {
            return false;
        }

        if(pCookieID !== pReq.sessionID){
            return pOptions.saveUninitialized || (pReq.session as UserSession).isModified(pCookieID);
        }else{
            return pOptions.rolling || (pReq.session.cookie.expires != null && pReq.session.isModified(pCookieID));
        }
    }

    // check if session has been saved
    static isSaved(pSession:any, pSavedHash:string, pOriginalID:string) {
        return (pOriginalID === pSession.getUID()) && (pSavedHash === pSession.hash());
    }

    /**
     * To check is the session has been modified
     * @param sess
     */
    static isModified(pSession:any, pOriginalID:string, pOriginalHash:string):boolean {
        return (pOriginalID !== pSession.getUID()) || (pOriginalHash !== pSession.hash());
    }

    /**
     * To sign the cookie value and set cookie header
     *
     * @param pRes
     * @param pName
     * @param pVal
     * @param pSecret
     * @param pOptions
     */
    static setCookie(pRes:ServerResponse, pName:string, pClearValue:string, pSecret:string, pOptions:CookieOptions):void {
        const signed = 's:' + Cookie.sign(pClearValue, pSecret);
        const data = CookieHeader.serialize(pName, signed, pOptions);

        Logger.debug(`[SESSION MIDDLEWARE] Set Cookie : ${data}`);

        let header = pRes.getHeader('Set-Cookie');
        if(header==undefined) header = [];

        pRes.setHeader(
            'Set-Cookie',
            Array.isArray(header) ? header.concat(data) : [header as string, data]
        )
    }

    /**
     * To get cookie from various location with backward compat
     *
     * @param pReq
     * @param pName
     * @param pSecrets
     */
    static getCookie(pReq:any, pName:string, pSecrets:string):Nullable<string> {
        const header = pReq.headers.cookie;
        let raw:string;
        let cookieVal:Nullable<string> = null;
        let cookies:Record<string, string>;

        // read from cookie header
        if (header) {
            cookies = CookieHeader.parse(header);
            raw = cookies[pName];

            if (raw) {
                if (raw.slice(0, 2) === 's:') {
                    cookieVal = Cookie.unsign(raw.slice(2), pSecrets);

                    if (cookieVal === null) {
                        Logger.error('[SESSION MIDDLEWARE] cookie signature invalid');
                    }
                } else {
                    Logger.debug('[SESSION MIDDLEWARE] cookie unsigned')
                }
            }
        }

        // back-compat read from cookieParser() signedCookies data
        // TODO : remove ?
        if ((cookieVal==null) && pReq.signedCookies) {
            cookieVal = pReq.signedCookies[pName];

            if (cookieVal) {
                Logger.error('[SESSION MIDDLEWARE][DEPRECATED !] cookie should be available in req.headers.cookie');
            }
        }

        // back-compat read from cookieParser() cookies data
        if ((cookieVal==null)  && pReq.cookies) {
            raw = pReq.cookies[pName];

            if (raw) {
                if (raw.slice(0, 2) === 's:') {
                    cookieVal = Cookie.unsign(raw.slice(2), pSecrets);

                    if (cookieVal) {
                        Logger.info('[SESSION MIDDLEWARE] cookie should be available in req.headers.cookie');
                    }

                    if (cookieVal === null) {
                        Logger.debug('[SESSION MIDDLEWARE] cookie signature invalid');
                    }
                } else {
                    Logger.debug('[SESSION MIDDLEWARE] cookie unsigned')
                }
            }
        }

        return cookieVal;
    }



    /**
     * To generate session ID
     *
     */
    static generateSID():string {
        return CryptoUtils.randomChunk(32).toString();
    }


    /**
     * Set headers contained in array on the response object.
     *
     * @param {object} res
     * @param {array} headers
     * @private
     */

    static setHeadersFromArray(pRes:any, pHeaders:string[][]):void {
        for (let i = 0; i < pHeaders.length; i++) {
            pRes.setHeader(pHeaders[i][0], pHeaders[i][1])
        }
    }

    /**
     * Set headers contained in object on the response object.
     *
     * @param {object} res
     * @param {object} headers
     * @private
     */

    static setHeadersFromObject (pRes:any, pHeaders:Record<string,string>):void {
        let keys = Object.keys(pHeaders), key:string;
        for (let i = 0; i < keys.length; i++) {
            key = keys[i]
            if(key!=null) pRes.setHeader(key, pHeaders[key])
        }
    }

    /**
     * Set headers and other properties on the response object.
     *
     * @param {number} statusCode
     * @private
     */

    static setWriteHeadHeaders ( pStatusCode:any):any[] {
        let length = arguments.length
        let headerIndex = (length > 1 && typeof arguments[1] === 'string')
            ? 2
            : 1

        let headers = (length >= headerIndex + 1)
            ? arguments[headerIndex]
            : undefined;

            (this as any).statusCode = pStatusCode

        if (Array.isArray(headers)) {
            // handle array case
            SessionMiddleware.setHeadersFromArray(this, headers)
        } else if (headers) {
            // handle object case
            SessionMiddleware.setHeadersFromObject(this, headers)
        }

        // copy leading arguments
        const args = new Array(Math.min(length, headerIndex))
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i]
        }

        return args
    }

    /**
     * Create a replacement writeHead method.
     *
     * @param {function} prevWriteHead
     * @param {function} listener
     * @private
     */

    static createWriteHead (pPrevWriteHead:any, pListener:any) {
        let fired = false

        // return function with core name and argument list
        return function writeHead (vStatusCode:number) {
            // set headers from arguments
            let args = SessionMiddleware.setWriteHeadHeaders.apply(this, arguments)

            // fire listener
            if (!fired) {
                fired = true
                pListener.call(this)

                // pass-along an updated status code
                if (typeof args[0] === 'number' && this.statusCode !== args[0]) {
                    args[0] = this.statusCode
                    args.length = 1
                }
            }

            return pPrevWriteHead.apply(this, args)
        }
    }

    static onHeaders(pRes:any, pListener:any) {
        if (!pRes) {
            throw new TypeError('argument res is required')
        }

        if (typeof pListener !== 'function') {
            throw new TypeError('argument listener must be a function')
        }

        pRes.writeHead = SessionMiddleware.createWriteHead(pRes.writeHead, pListener)
    }

    /**
     *
     * @param pOptions
     */
    static make(pOptions:SessionMiddlewareOptions):MiddlewareFn {


        // get the cookie options
        const cookieOptions = pOptions.cookie || {}

        // get the session id generate function
        const generateId = pOptions.genid || SessionMiddleware.generateSID;

        // get the session cookie name
        const name = pOptions.name || pOptions.key || 'connect.sid'

        // get the session store
        const store = pOptions.store;

        // get the trust proxy setting
        const trustProxy = pOptions.trustProxy

        // get the resave session option
        let resaveSession = pOptions.resave;

        // get the rolling session option
        const rollingSessions = Boolean(pOptions.rolling)

        // get the save uninitialized session option
        let saveUninitializedSession = pOptions.saveUninitialized

        // get the cookie signing secret
        const secret = pOptions.secret

        if (typeof generateId !== 'function') {
            throw new TypeError('genid option must be a function');
        }

        if (!SessionMiddleware.VALIDATE.unset.test(pOptions.unset)) {
            throw new TypeError('unset option must be "destroy" or "keep"');
        }

        if (Array.isArray(secret) && secret.length === 0) {
            throw new TypeError('secret option is mandatory and must be an array of one or more strings');
        }


        // notify user that this store is not
        // meant for a production environment
        /* istanbul ignore next: not tested */
        if (!SessionMiddleware.VALIDATE.store.test(store)) {
            throw new TypeError('store is not a valid, production-grade, store');
        }





        const storeImplementsTouch = typeof store.touch === 'function';

        // register event listeners for the store to track readiness
        let storeReady = true
        store.on('disconnect', function ondisconnect() {
            storeReady = false
        })
        store.on('connect', function onconnect() {
            storeReady = true
        })

        return function session(vReq:ExtendedIncomingMessage, vRes:ExtendedServerResponse, next) {

            Logger.success(`[SESSION MIDDLEWARE][${vReq.url}] Enter In `)
            // self-awareness
            if (vReq.session) {
                next()
                return
            }

            // Handle connection as if there is no session if
            // the store has temporarily disconnected etc
            if (!storeReady) {
                Logger.debug('[SESSION MIDDLEWARE] store is disconnected')
                next()
                return
            }

            // pathname mismatch
            //const originalPath = (new URL(vReq.url)).pathname || '/'
            const originalPath = vReq._parsedUrl.pathname || '/'
            if (originalPath.indexOf(cookieOptions.path || '/') !== 0) return next();

            // ensure a secret is available or bail
            if (!secret && !vReq.secret) {
                next(new Error('secret option required for sessions'));
                return;
            }

            // backwards compatibility for signed cookies
            // vReq.secret is passed from the cookie parser middleware
            const secrets:string[] = secret || [vReq.secret];

            let originalHash:string;
            let originalId:string;
            let savedHash:string;
            let touched = false

            // expose store
            vReq.sessionStore = store;

            // get the session ID from the cookie
            const cookieId = vReq.sessionID = SessionMiddleware.getCookie(vReq, name, secrets[0]);

            // Append set-cookie to header list in head of response
            SessionMiddleware.onHeaders(vRes, function(){
                if (!vReq.session) {
                    Logger.debug('[SESSION MIDDLEWARE] no session');
                    return;
                }

                if (!SessionMiddleware.shouldSetCookie(vReq,cookieId,pOptions)) {
                    return;
                }

                // only send secure cookies via https
                if (vReq.session.cookie.secure && !vReq.session.isSecure(trustProxy)) {
                    Logger.debug('[SESSION MIDDLEWARE] not secured');
                    return;
                }

                if (!touched) {
                    // touch session
                    vReq.session.touch()
                    touched = true
                }

                // set cookie
                SessionMiddleware.setCookie(vRes, name, vReq.sessionID, secrets[0], vReq.session.cookie);
            });

            // proxy end() to commit the session
            let _end = vRes.end;
            let _write = vRes.write;
            let ended = false;

            // @ts-ignore
            vRes.end = function end( kChunk:any, kEncoding:BufferEncoding, kCb?:()=>void):ExtendedServerResponse {

                if (ended) {
                    return ;
                }

                ended = true;

                let ret;
                let sync = true;

                function writeend() {
                    if (sync) {
                        ret = _end.call(vRes, kChunk, kEncoding);
                        sync = false;
                        return;
                    }

                    _end.call(vRes);
                }

                function writetop() {
                    if (!sync) {
                        return ret;
                    }

                    if (!vRes._header) {
                        vRes._implicitHeader()
                    }

                    if (kChunk == null) {
                        ret = true;
                        return ret;
                    }

                    const contentLength = Number(vRes.getHeader('Content-Length'));

                    if (!isNaN(contentLength) && contentLength > 0) {
                        // measure chunk
                        kChunk = !Buffer.isBuffer(kChunk)
                            ? Buffer.from(kChunk/*, kEncoding*/)
                            : kChunk;
                        kEncoding = undefined;

                        if (kChunk.length !== 0) {
                            Logger.debug('[SESSION MIDDLEWARE] split response');
                            ret = _write.call(vRes, kChunk.slice(0, kChunk.length - 1));
                            kChunk = kChunk.slice(kChunk.length - 1, kChunk.length);
                            return ret;
                        }
                    }

                    ret = _write.call(vRes, kChunk, kEncoding);
                    sync = false;

                    return ret;
                }

                if (SessionMiddleware.shouldDestroy(vReq,pOptions)) {
                    // destroy session
                    Logger.debug('[SESSION MIDDLEWARE] destroying');
                    store.destroy(vReq.sessionID, function ondestroy(err) {
                        if (err) {
                            // @ts-ignore
                            defer(next, err);
                        }

                        Logger.debug('[SESSION MIDDLEWARE] destroyed');
                        writeend();
                    });

                    return writetop();
                }

                // no session to save
                if (!vReq.session) {
                    Logger.debug('[SESSION MIDDLEWARE] no session');
                    return _end.call(vRes, kChunk, kEncoding);
                }

                if (!touched) {
                    // touch session
                    vReq.session.touch()
                    touched = true
                }

                if ((vReq.session as UserSession).shouldSave(vReq,originalId,originalHash,pOptions)) {
                    vReq.session.save(function onsave(err:any) {
                        if (err) {
                            defer(next);//, err);
                        }

                        writeend();
                    });

                    return writetop();
                } else if (storeImplementsTouch && (vReq.session as UserSession).shouldTouch(vReq,originalId,originalHash,pOptions)) {
                    // store implements touch method
                    Logger.debug('[SESSION MIDDLEWARE] touching');
                    store.touch(vReq.sessionID, vReq.session, function ontouch(err) {
                        if (err) {
                            defer(next);//, err);
                        }

                        Logger.debug('[SESSION MIDDLEWARE] touched');
                        writeend();
                    });

                    return writetop();
                }

                return _end.call(vRes, kChunk, kEncoding);
            };


            // generate a session if the browser doesn't send a sessionID
            if (!vReq.sessionID) {
                Logger.debug('[SESSION MIDDLEWARE] no SID sent, generating session');
                const sess = store.generate(vReq,{
                    trustProxy: pOptions.trustProxy,
                    cookie: pOptions.cookie,
                });

                originalId = vReq.sessionID;
                originalHash = sess.hash();

                sess.save((e,d)=>{

                });

                next();
                return;
            }

            // generate the session object
            Logger.debug('[SESSION MIDDLEWARE] fetching %s', vReq.sessionID);
            store.get(vReq.sessionID, function(kErr, kSess){
                // error handling
                if (kErr && kErr.code !== 'ENOENT') {
                    Logger.debug('[SESSION MIDDLEWARE] error %j', kErr);
                    next(kErr)
                    return
                }

                let s:UserSession;
                try {
                    if (kErr || kSess==null) {
                        Logger.debug('[SESSION MIDDLEWARE] no session found')
                        s = store.generate(vReq,{
                            trustProxy: pOptions.trustProxy,
                            cookie: pOptions.cookie,
                        });

                        originalId = vReq.sessionID;
                        originalHash = s.hash();

                    } else {
                        Logger.debug('[SESSION MIDDLEWARE] session found')
                        s = store.restoreSession(vReq, kSess);

                        originalId = vReq.sessionID;
                        originalHash = s.hash(pOptions);

                        if (!pOptions.resave) {
                            savedHash = originalHash;
                        }
                    }
                    s.save((e,d)=>{
                       // todo : handle error,   console.log(s);
                    });
                } catch (e) {
                    next(e)
                    return
                }

                next()
            });
        };
    }

}