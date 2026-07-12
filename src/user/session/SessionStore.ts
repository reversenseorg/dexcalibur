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
import {UserAccount} from "../UserAccount.js";



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
export class SessionStore /*extends expressSession.Store*/ {

    _coll:MongodbDbCollection;

    private _engine: DexcaliburEngine;

    private _emitter:EventEmitter;



    constructor( pEngine:DexcaliburEngine, pDb:MongodbDbCollection ) {
        //super();

        Logger.info("[SESSION STORE] New store");
        this._coll = pDb;
        this._engine = pEngine;
        this._emitter = new EventEmitter();
        // check if the collection indexes
        this._emitter.emit('connected');
    }

    /**
     * To generate session ID
     *
     */
    static generateSID():string {
        return Buffer.from(CryptoUtils.randomChunk(32)).toString('hex');
    }


    all(pCallback: ((err:any,sessions:any[])=>any) = noOp ){
        try{
            this._coll.getAll().then((vAll:UserSession[])=>{
                const sess:any[] = [];
                vAll.map(x => sess.push(x.getData('express-session')));

                Logger.info("[SESSION STORE][all] Get all sessions : success [count="+sess.length+"] ");
                pCallback.apply(null,[null,sess]);
            },(err)=>{
                Logger.info("[SESSION STORE][all] Get all sessions : failure : "+err);
                pCallback.apply(null,[err, []]);
            })
        }catch(e){
            Logger.debug("[SESSION STORE][all] Get all sessions : fatal error : "+e.message);
            pCallback.apply(null,[e,[]]);
        }
    }

    /**
     * To destroy a session by its SID
     *
     * @param pSID
     * @param pCallback
     */
    destroy(pSID:string, pCallback: (err:any)=>any ){

        try{

            this._coll.asyncRemoveEntry(new UserSession({ _uid: pSID})).then((vSuccess)=>{
                pCallback.apply(null,[null,vSuccess]);
                Logger.debug("[SESSION STORE][destroy] Destroy sessions : success [sid="+pSID+"] ");
            },(err)=>{
                Logger.error("[SESSION STORE][destroy] Destroy sessions : failure [sid="+pSID+"] ");
                pCallback.apply(null,[err]);
            })
        }catch(e){
            Logger.debug("[SESSION STORE][destroy] Destroy sessions : fatal error : "+e.message);
            pCallback.apply(null,[e]);
        }
    }

    /**
     * To get a session by its ID
     * @param pSID
     * @param pCallback
     */
    get(pSID:string, pCallback: (vErr:any,vSession:UserSession)=>any ){
        //Logger.debug(`[SESSION STORE][get] Read session : [sid=${pSID}] : `)
        this._coll.asyncGetEntry({ _uid: pSID })
            .then((pSession:UserSession)=>{

                if(pSession==null){
                    Logger.error(`[SESSION STORE][get] Read session : failure [sid=${pSID}] : session not found`);
                    pCallback.apply(null, [ null, null ]);
                    return;
                }

                const expired = this._engine.getUserService().getSessionService().isSessionExpired(pSession);
                //Logger.info(`[SESSION STORE][get] Read session : [sid=${pSID}][expired=${expired?'true':'false'}]`)
                if(expired){
                    //Logger.error(`[SESSION STORE][get] Read session : failure [sid=${pSID}] : session is expired`);
                    pCallback.apply(null, [{ expire:true }, null ]);
                }else if(pSession.getUserAccount()!=null){

                    this._engine.getUserService().getAccount(
                        this._engine.getInternalAcc(),
                        pSession.getUserAccount().getUID()
                    ).then((vUA:UserAccount)=>{
                        pSession.setUserAccount(vUA);
                        pCallback.apply(null, [ null, pSession ]);
                    }).catch((vE1)=>{
                        Logger.error(`[SESSION STORE][get] Read session : failure : user account cannot be refreshed [sid=${pSID}] : ${vE1}`);
                        pCallback.apply(null, [ vE1, null ]);
                    })
                    //Logger.success(`[SESSION STORE][get] Read session : success [sid=${pSID}] `);
                }else{
                    pCallback.apply(null, [ null, pSession ]);
                }
            }).catch((vErr:any)=>{
                Logger.error(`[SESSION STORE][get] Read session : failure [sid=${pSID}] : ${vErr}`);
                pCallback.apply(null, [ vErr, null ]);
            });
    }

    /**
     * To save a session
     * @param pCallback
     */
    set(pSID:string, pSession:any, pCallback: (err:any,sessions:any[])=>any ){


        /*const sess = new UserSession({
            _uid: pSID,
            _acc: null,
            _created:  Date.now(),
            expires: (new Date()).getTime()+this._engine.getUserService().getSessionService().getSettings().getMaxDuration()
        });

        sess.addData('express-session', pSession);*/

        this._coll.asyncGetEntry({ _uid: pSID }).then((vSess:UserSession)=>{
            if(vSess==null){
                //Logger.info(`[SESSION STORE][set] Start to create session `);
                this._coll.asyncAddEntry( { _uid: pSID }, pSession).then(()=>{
                    //Logger.info(`[SESSION STORE][set] Create session : success [sid=${pSID}]`);
                    pCallback.apply(null, [ null,  pSession  ]);
                }).catch((e)=>{
                    Logger.error(`[SESSION STORE][set] Create session : failure [sid=${pSID}]`);
                    pCallback.apply(null, [ e, null ]);
                });
            }else{
                //Logger.info(`[SESSION STORE][set] Start to update session `);
                this._coll.asyncUpdateEntry(  pSession, {
                    filter:{ _uid:pSID},
                    replace:false,
                    $set:['_acc','_uid','savedHash','cookie','_data','passport','trustProxy','_destroyed']
                }).then((vSuccess)=>{

                    //Logger.info(`[SESSION STORE][set] Update session : success [sid=${pSID}][success=${vSuccess}]`);
                    this._coll.asyncGetEntry({ _uid: pSID }).then((vSess2:UserSession)=>{


                       //Logger.debug(`[SESSION STORE][set] Update session : success : read fresh session [sid=${pSID}]`);

                        // todo : update data to re-sync session over server ?
                        pCallback.apply(null, [ null, pSession  ]);
                    });
                }).catch((e)=>{
                    Logger.error(`[SESSION STORE][set] Update session : failure [sid=${pSID}]`);
                    pCallback.apply(null, [ e, null ]);
                });
            }
        }).catch((err)=>{
            Logger.error(`[SESSION STORE][set] Set session : failure : [sid=${pSID}] : ${err}`);
        })
    }

    /**
     * This recommended method is used to "touch" a given session ,
     * given a session ID (sid) and session (session) object.
     *
     * The callback should be called as callback(error) once the session has been touched.
     */
    touch(pSID:string, pSession:UserSession, pCallback: (err:any)=>any){

        if(pSID !== pSession.getUID()){
            Logger.error(`[SESSION STORE][touch] Bogged session ID [${pSID}]`);
            return;
        }

        pSession.resetMaxAge();
        pCallback.apply(null,[]);
    }

    clear(pCallback: ((err:any,sessions:any[])=>any) = noOp ){
        try{
            this._coll.removeAll().then((vCount:number)=>{
                //Logger.info("[SESSION STORE] Clear all : "+vCount+" sessions removed");
                pCallback.apply(null,[null]);
            }).catch((err)=>{
                Logger.error("[SESSION STORE][clear] Clear all : failure : "+err);
                pCallback.apply(null,[err, []]);
            });
        }catch(e){
            Logger.error("[SESSION STORE][clear] Clear all : fatal error : "+e.message);
            pCallback.apply(null,[e,[]]);
        }
    }

    on(pEvent:string,pCallback:(vErr:any,vRes:any)=>any) {
        this._emitter.on.apply(this._emitter, [pEvent,pCallback]);
    };

    once(pEvent:string,pCallback:(vErr:any,vRes:any)=>any) {
        this._emitter.once.apply(this._emitter, [pEvent,pCallback]);
    };

    /**
     * @deprecated
     */
    createSession(req:any, pExistingSess:UserSession):UserSession{

        const expires = pExistingSess.cookie.expires
        const originalMaxAge = pExistingSess.cookie.originalMaxAge

        console.log("CREATE SESSION > ",req,pExistingSess);

        pExistingSess.cookie = new Cookie(pExistingSess.cookie);

        if (typeof expires === 'string') {
            // convert expires to a Date object
            pExistingSess.cookie.expires = new Date(expires)
        }

        // keep originalMaxAge intact
        pExistingSess.cookie.originalMaxAge = originalMaxAge

        req.session = new UserSession({
            _uid: pExistingSess.getUID(),
            _acc: null,
            _created:  Date.now(),
            expires: (new Date()).getTime()+this._engine.getUserService()
                        .getSessionService().getSettings().getMaxDuration(),
            cookie: pExistingSess.cookie,
            _data: pExistingSess._data,
            req: req
        });


        return req.session;
    }


    restoreSession(pReq:any, pExistingSess:UserSession):UserSession{

        if(pExistingSess.cookie!=null){
            const expires = pExistingSess.cookie.expires
            const originalMaxAge = pExistingSess.cookie.originalMaxAge

            //Logger.info(`[SESSION STORE][restoreSession] Restore session [existingSID=${pExistingSess.getUID()}]`);

            pExistingSess.cookie = new Cookie(pExistingSess.cookie);

            if (typeof expires === 'string') {
                // convert expires to a Date object
                pExistingSess.cookie.expires = new Date(expires)
            }

            // keep originalMaxAge intact
            pExistingSess.cookie.originalMaxAge = originalMaxAge
        }

        if(pExistingSess.passport!=null){
            if(pExistingSess.passport.user!=null){
                pExistingSess.passport.user = pExistingSess.getUserAccount();
            }
        }

        pReq.session = new UserSession({
            _uid: pExistingSess.getUID(),
            _acc: pExistingSess.getUserAccount()!=null? pExistingSess.getUserAccount() : null ,
            _created:  Date.now(),
            expires: (new Date()).getTime()+this._engine.getUserService()
                .getSessionService().getSettings().getMaxDuration(),
            cookie: pExistingSess.cookie,
            _data: pExistingSess._data,
            passport: pExistingSess.passport,
            req: pReq,
        });


        return pReq.session;
    }

    /**
     * To create a new session, generate SID, cookie and configure it
     *
     * @param pRequest
     * @param pOptions
     */
    generate(pRequest:any, pOptions:SessionGenerateOptions):UserSession {

        pRequest.sessionID = (pOptions!=null && pOptions.generateID!=null)?pOptions.generateID(pRequest):SessionStore.generateSID();
        pRequest.session = UserSession.fromIncomingRequest({
            request: pRequest,
            cookie: pOptions.cookie,
            trustProxy: pOptions.trustProxy
        });


        //Logger.info("[SESSION STORE][generate] New session generated and injected in request : "+ pRequest.sessionID);
        return pRequest.session;
    }

    regenerate(pRequest:any, pCallback:(vErr:any)=>any){

        if(pRequest.dxcApiKey && pRequest.dxcApiUuid){
            Logger.info("[SESSION STORE][generate] Skip API key-based request "+ pRequest.sessionID);
            pCallback.apply(null,[null]);
            return ;
        }

        const oldSession = pRequest.session;

        if(oldSession==null){
            Logger.error("[SESSION STORE][generate] New session generated and injected in request : "+ pRequest.sessionID);
            pCallback.apply(null,["Previous session is missing"]);
            return;
        }

        this.destroy(pRequest.sessionID, (err)=>{
            this.generate(pRequest, {
                cookie: oldSession.cookie,
                trustProxy: oldSession.trustProxy
            });

            pCallback.apply(null,[err]);
        });
    }

    load(pSID:string, pCallback:(err:any)=>any){

        //Logger.info("[SESSION STORE][load] Load session from SID:"+ pSID);
        this.get(pSID, (vErr, vSess)=>{
            if (vErr) return pCallback.apply(null,[vErr,null]);
            if (!vSess) return pCallback.apply(null,[null,vSess]);

            //var req = { sessionID: pSID, sessionStore: this };
            pCallback.apply(this, [null, this.restoreSession({ sessionID: pSID, sessionStore: this }, vSess)])
        });
    };
}