import {Cookie, CookieOptions} from "./Cookie.js";
import {UserSession} from "./UserSession.js";
import {Nullable} from "@dexcalibur/dxc-core-api";


export interface SessionEnvelopeOptions {
    request: any,
    cookie?: CookieOptions,
    trustProxy: boolean
}

/**
 * A class to encapsulate UserSession and provide feature to session middleware
 *
 * @class
 */
export class SessionEnvelope {

    // Legacy API : to be compliant with Express API
    req:any;

    // session UID
    id:any;

    // our api
    request:any;

    cookie:Cookie;

    data: any;

    user: Nullable<UserSession> = null;

    //cookieOpts:CookieOptions;

    constructor(pOptions:SessionEnvelopeOptions) {
        this.req = this.request = pOptions.request;

        if(pOptions.cookie!=null){
            this.updateCookie(pOptions.cookie, (pOptions.trustProxy!=null?pOptions.trustProxy:false));
        }
    }

    /**
     * To create cookie options related to this incoming request
     *
     * @param pOptions
     * @param pTrustProxy
     */
    updateCookie(pOptions:CookieOptions, pTrustProxy:boolean){
        this.cookie = new Cookie(pOptions);

        if (pOptions.secure === 'auto') {
            this.cookie.secure = this.isSecure(pTrustProxy);
        }
    }

    /**
     * To detect
     * @param pTrustProxy
     */
    isSecure(pTrustProxy:boolean):boolean{
        // socket is https server
        if (this.request.connection && this.request.connection.encrypted) {
            return true;
        }

        // don't trust proxy
        if (pTrustProxy === false) {
            return false;
        }

        // no explicit trust; try req.secure from express
        if (pTrustProxy !== true) {
            return (this.request.secure === true)
        }

        // read the proto from x-forwarded-proto (XFP) header
        const header = this.request.headers['x-forwarded-proto'] || '';
        const index = header.indexOf(',');
        const proto = (index !== -1)
            ? header.slice(0, index).toLowerCase().trim()
            : header.toLowerCase().trim()

        return (proto === 'https');
    }

    touch() {
        return this.resetMaxAge();
    }

    resetMaxAge():SessionEnvelope {
        this.cookie.maxAge = this.cookie.originalMaxAge;
        return this;
    }

    /**
     * To store the session
     *
     * @param pCallback
     */
    save(pCallback:any = null) {
        this.request.sessionStore.set(this.id, this, pCallback || function(){});
        return this;
    }

    /**
     * Re-loads the session data _without_ altering
     * the maxAge properties. Invokes the callback `fn(err)`,
     * after which time if no exception has occurred the
     * `req.session` property will be a new `Session` object,
     * although representing the same session.
     *
     * @param {Function} fn
     * @return {Session} for chaining
     * @api public
     */
    reload(pCallback:any) {
        const req = this.request
        const store = this.request.sessionStore

        store.get(this.id, function(err, sess){
            if (err) return pCallback(err);
            if (!sess) return pCallback(new Error('failed to load session'));

            store.createSession(req, sess);
            pCallback();
        });
        return this;
    }
}