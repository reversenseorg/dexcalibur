/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {MongodbDb, MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {User} from "../../User.js";
import {UserSession} from "./UserSession.js";
import * as Log from "../../Logger.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {EventEmitter} from "events"
import expressSession from "express-session";
import {Cookie, CookieOptions} from "./Cookie.js";
import {CryptoUtils} from "../../CryptoUtils.js";
import {SessionEnvelope} from "./SessionEnvelope.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {SessionMiddleware} from "./SessionMiddleware.js";



let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const noOp = ()=>{};

export interface SessionGenerateOptions {
    generateID?: (pReq:any)=>string,
    cookie?: CookieOptions;
    trustProxy?:boolean
}

/**
 * Represent a store where sessions are stored
 *
 * Implement API required by express-session
 *
 * express-session are encapsulated into UserSession
 *
 * @class
 */
export class MemoryStore extends expressSession.Store {

    private _coll:Record<string, UserSession> = {};

    private _emitter:EventEmitter;

    constructor() {
        super();

        Logger.info("[SESSION STORE] New in-memory store");
        this._emitter = new EventEmitter();
        this._emitter.emit('connected');
    }

    /**
     * To generate session ID
     *
     */
    static generateSID():string {
        return Buffer.from(CryptoUtils.randomChunk(32)).toString('hex');
    }

    private _getSession(pSessionID:string):UserSession {
        let sess = this._coll[pSessionID];

        if (!sess) {
            throw new TypeError("Session not found");
        }

        // parse
        if (sess.cookie) {
            // destroy expired session
            if (sess.cookie.expires.getTime() <= Date.now()) {
                delete this._coll[pSessionID];
                throw new TypeError("Session has expired");
            }

            return sess;
        }

        throw new TypeError("Session has not cookie configured");
    }

    all(pCallback: ((err:any,sessions:any[])=>any) = noOp ){
        let _sess:Record<string, UserSession> = {};
        let s:Nullable<UserSession>;

        try {
            // filter to remove expired session
            for( let sid in this._coll){
                s = this._getSession(sid);
                if(s!=null){
                    _sess[sid] = s;
                }
            }

            this._coll = _sess;
            pCallback.apply(null,[null,Object.values(this._coll)]);
        }catch (err){
            pCallback.apply(null,[err,null]);
        }

    }

    /**
     * To destroy a session by its SID
     *
     * @param pSID
     * @param pCallback
     */
    destroy(pSID:string, pCallback: (err:any)=>any ){

        try {
            const s:UserSession = this._getSession(pSID);
            delete this._coll[pSID];
            pCallback.apply(null,[null,true]);
        }catch (err){
            pCallback.apply(null,[err,null]);
        }
    }

    /**
     * To get a session by its ID
     * @param pSID
     * @param pCallback
     */
    get(pSID:string, pCallback: (vErr:any,vSession:UserSession)=>any ){
        try {
            pCallback.apply(null,[null,this._getSession(pSID)]);
        }catch (err){
            pCallback.apply(null,[err,null]);
        }
    }

    /**
     * To save a session
     * @param pCallback
     */
    set(pSID:string, pSession:any, pCallback: (err:any,sessions:any)=>any ){
        this._coll[pSID] = pSession;
        pCallback.apply(null,[null,pSession]);
    }


    /**
     * This recommended method is used to "touch" a given session ,
     * given a session ID (sid) and session (session) object.
     *
     * The callback should be called as callback(error) once the session has been touched.
     */
    touch(pSID:string, pSession:UserSession, pCallback: (err:any)=>any){
        try{
            const s = this._getSession(pSID);
            s.resetMaxAge();
            s.save((vErr:any,vSession:any)=>{
                if(vErr!=null){
                    pCallback.apply(null,[vErr,null]);
                    return;
                }

                pCallback.apply(null,[null,vSession]);
            });
        }catch (err){
            pCallback.apply(null,[err]);
        }
    }

    length(pCallback: (err:any)=>any){
        this.all(function (err, sessions) {
            if (err) return pCallback.apply(null,[err])
            pCallback.apply(null,[null, Object.keys(sessions).length]);
        })
    }

    clear(pCallback: ((err:any,sessions:any[])=>any) = noOp ){
        this._coll = {};
        pCallback.apply(null,[null]);
    }

    on(pEvent:string,pCallback:(vErr:any,vRes:any)=>any) {
        this._emitter.on.apply(this._emitter, [pEvent,pCallback]);
    };

    once(pEvent:string,pCallback:(vErr:any,vRes:any)=>any) {
        this._emitter.once.apply(this._emitter, [pEvent,pCallback]);
    };

    /**
     *
     * @param req
     * @param sess
     */
    createSession(req:any, sess:any):UserSession{

        const expires = sess.cookie.expires
        const originalMaxAge = sess.cookie.originalMaxAge

        console.log("CREATE ESSION > ",req,sess);

        sess.cookie = new Cookie(sess.cookie);

        if (typeof expires === 'string') {
            // convert expires to a Date object
            sess.cookie.expires = new Date(expires)
        }

        // keep originalMaxAge intact
        sess.cookie.originalMaxAge = originalMaxAge

        req.session = new UserSession({
            _uid: sess.uid,
            _acc: null,
            _created:  Date.now(),
            expires: (new Date()).getTime()+SessionMiddleware.DEFAULT_DURATION,
            cookie: sess.cookie
        });


        return req.session;
    }

    /**
     * To create a new session, generate SID, cookie and configure it
     *
     * @param pRequest
     * @param pOptions
     */
    generate(pRequest:any, pOptions:SessionGenerateOptions):UserSession {
        pRequest.sessionID = (pOptions.generateID!=null)?pOptions.generateID(pRequest):MemoryStore.generateSID();
        pRequest.session = UserSession.fromIncomingRequest({
            request: pRequest,
            cookie: pOptions.cookie,
            trustProxy: pOptions.trustProxy
        });
        return pRequest.session;
    }

    restoreSession(pErr:any, pSession:Nullable<UserSession>):UserSession {
        return pSession;
    }
}