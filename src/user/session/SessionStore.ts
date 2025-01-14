import {IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {MongodbDb, MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {User} from "../../User.js";
import {UserSession} from "./UserSession.js";
import * as Log from "../../Logger.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {EventEmitter} from "events"
import expressSession from "express-session";



let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const noOp = ()=>{};


/**
 * Represent a store where sessions are stored
 *
 * Implement API required by express-session
 *
 * express-session are encapsulated into UserSession
 *
 * @class
 */
export class SessionStore extends expressSession.Store {

    _coll:MongodbDbCollection;

    private _engine: DexcaliburEngine;

    private _emitter:EventEmitter;

    constructor( pEngine:DexcaliburEngine, pDb:MongodbDbCollection ) {
        super();

        Logger.info("[SESSION STORE] New store");
        this._coll = pDb;
        this._engine = pEngine;
        this._emitter = new EventEmitter();
        // check if the collection indexes
        this._emitter.emit('connected');
    }

    all(pCallback: ((err:any,sessions:any[])=>any) = noOp ){
        try{
            this._coll.getAll().then((vAll:UserSession[])=>{
                const sess:any[] = [];
                vAll.map(x => sess.push(x.getData('express-session')));

                //Logger.info("[SESSION STORE] Get all sessions : success [count="+sess.length+"] ");
                pCallback.apply(null,[null,sess]);
            },(err)=>{
                //Logger.info("[SESSION STORE] Get all sessions : failure : "+err);
                pCallback.apply(null,[err, []]);
            })
        }catch(e){
            Logger.debug("[SESSION STORE] Get all sessions : fatal error : "+e.message);
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
                //Logger.debug("[SESSION STORE] Destroy sessions : success [sid="+pSID+"] ");
            },(err)=>{
                //Logger.error("[SESSION STORE] Destroy sessions : failure [sid="+pSID+"] ");
                pCallback.apply(null,[err]);
            })
        }catch(e){
            Logger.debug("[SESSION STORE] Destroy sessions : fatal error : "+e.message);
            pCallback.apply(null,[e]);
        }
    }

    /**
     * To get a session by its ID
     * @param pSID
     * @param pCallback
     */
    get(pSID:string, pCallback: (err:any,sessions:any[])=>any ){
        //Logger.debug(`[SESSION STORE] Read session : [sid=${pSID}] : `)
        this._coll.asyncGetEntry({ _uid: pSID })
            .then((pSession:UserSession)=>{
                if(pSession==null){
                    //Logger.error(`[SESSION STORE] Read session : failure [sid=${pSID}] : session not found`);
                    pCallback.apply(null, [ null, null ]);
                    return;
                }

                const expired = this._engine.getUserService().getSessionService().isSessionExpired(pSession);
                //Logger.info(`[SESSION STORE] Read session : [sid=${pSID}][expired=${expired?'true':'false'}]`)
                if(expired){
                    //Logger.error(`[SESSION STORE] Read session : failure [sid=${pSID}] : session is expired`);
                    pCallback.apply(null, [ null, null ]);
                }else{

                    //Logger.success(`[SESSION STORE] Read session : success [sid=${pSID}] `);
                    pCallback.apply(null, [ null, pSession.getData('express-session') ]);
                }
            }).catch((vErr:any)=>{
                Logger.error(`[SESSION STORE] Read session : failure [sid=${pSID}] : ${vErr}`);
                pCallback.apply(null, [ vErr, null ]);
            });
    }

    /**
     * To save a session
     * @param pCallback
     */
    set(pSID:string, pSession:any, pCallback: (err:any,sessions:any[])=>any ){
        const sess = new UserSession({
            _uid: pSID,
            _acc: null,
            _created:  Date.now()
        });

        sess.addData('express-session', pSession);

        this._coll.asyncGetEntry({ _uid: pSID }).then((vSess:UserSession)=>{
            if(vSess==null){
                this._coll.asyncAddEntry( { _uid: pSID }, sess).then(()=>{
                    //Logger.info(`[SESSION STORE] Create session : success [sid=${pSID}]`);
                    pCallback.apply(null, [ null, pSession ]);
                }).catch((e)=>{
                    Logger.error(`[SESSION STORE] Create session : failure [sid=${pSID}]`);
                    pCallback.apply(null, [ e, null ]);
                });
            }else{
                //Logger.info(`[SESSION STORE] Start to update session `);
                this._coll.asyncUpdateEntry(  sess, { filter:{ _uid:pSID}, replace:true }).then((vSuccess)=>{

                    //Logger.info(`[SESSION STORE] Update session : success [sid=${pSID}]`);
                    this._coll.asyncGetEntry({ _uid: pSID }).then((vSess2:UserSession)=>{

                       // Logger.info(`[SESSION STORE] Update ses sion : success : read fresh session [sid=${pSID}]`);
                    });
                    pCallback.apply(null, [ null, pSession ]);
                }).catch((e)=>{
                    Logger.error(`[SESSION STORE] Update session : failure [sid=${pSID}]`);
                    pCallback.apply(null, [ e, null ]);
                });
            }
        }).catch((err)=>{
            Logger.error(`[SESSION STORE] Set session : failure : [sid=${pSID}] : ${err}`);
        })
    }

    /**
     * This recommended method is used to "touch" a given session ,
     * given a session ID (sid) and session (session) object.
     *
     * The callback should be called as callback(error) once the session has been touched.
     */
    /*touch(pSID:string, pSessions:any, pCallback: (err:any)=>any){

    }*/

    clear(pCallback: ((err:any,sessions:any[])=>any) = noOp ){
        try{
            this._coll.removeAll().then((vCount:number)=>{
                //Logger.info("[SESSION STORE] Clear all : "+vCount+" sessions removed");
                pCallback.apply(null,[null]);
            }).catch((err)=>{
                Logger.error("[SESSION STORE] Clear all : failure : "+err);
                pCallback.apply(null,[err, []]);
            });
        }catch(e){
            Logger.error("[SESSION STORE] Clear all : fatal error : "+e.message);
            pCallback.apply(null,[e,[]]);
        }
    }

    on() {
        this._emitter.on.apply(this._emitter, arguments);
    };

    once() {
        this._emitter.once.apply(this._emitter, arguments);
    };
}