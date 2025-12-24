import {SessionSettings} from "./SessionSettings.js";
import {UserAccount} from "../UserAccount.js";
import {UserSession} from "./UserSession.js";
import Util from "../../Utils.js";
import {SessionCode, SessionException} from "./SessionException.js";
import * as Log from "../../Logger.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {SessionStore} from "./SessionStore.js";
import {Nullable} from "../../core/IStringIndex.js";

/**
 * Represents the map session ID / session object
 *
 * @interface
 */
export interface UserSessionMap {
    [sessUID:string] :UserSession
}


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * Represents the component managing session at runtime
 *
 * @class
 */
export class SessionService {

    private _settings:SessionSettings;

    /**
     * Session store for express-session
     *
     * @private
     */
    private  _store:Nullable<SessionStore> = null;

    private _sess: UserSessionMap = {}; // cache
    private _s: MongodbDbCollection = null;
    private _ctx:DexcaliburEngine = null;

    constructor( pSettings:SessionSettings, pContext:DexcaliburEngine=null, pSessStorage:string = null) {
        this._settings = pSettings;
        this._settings.save();
        this._ctx = pContext;
    }


    flushCache(){
        this._sess = {};
    }

    getSettings():SessionSettings {
        return this._settings;
    }




    /**
     * To import sessions from DB to the list of active sessions
     *
     * At this step, every expired sessions are deleted
     *
     * @param pCollection
     */
    setBackendCollection( pCollection:MongodbDbCollection):void{
        this._s = pCollection;
        // to avoid statefull  server, remove static cache
        /*
        this._s.map( (o:number, v:UserSession) => {
            //if(v.isExpired)
            if(this.isSessionExpired(v)){
                Logger.info("[SESSION SVC] Archiving expired sessions. ");
                this.destroySession(v, "Session expired");
            }else if(v.isActive()){
                this._sess[v.getSessUID()] = v;
            }
        });*/
    }

    /**
     * To generate a free session ID
     *
     * @return {string} Session id
     * @private
     */
    private _generateSessID():string {
        let sessid:string;
        do {
            sessid = Util.randString( 16, Util.ALPHANUM);
        }while( this._sess[sessid]!=null);
        return sessid;
    }

    /**
     * To create a new session and return it
     * @param pAccount
     */
    newSession( pAccount:UserAccount):UserSession {
        if(pAccount == null)
            throw new SessionException("Account is mandatory", SessionCode.ACCOUNT_LOCKED);

        if(pAccount.isLocked()) // TODO : add bypass for admin role
            throw new SessionException("Account is locked", SessionCode.ACCOUNT_LOCKED);

        let sess:UserSession = UserSession.create(this._generateSessID(), pAccount);

        // add session to active list
        this._s.asyncAddEntry( { _uid: sess.getSessUID() }, sess);

        // update cache
        this._sess[sess.getSessUID()] = sess;

        return sess;
    }

    async save(pSess:UserSession):Promise<boolean> {
        return await this._s.asyncUpdateEntry( pSess, { upsert:true, replace:true});
    }

    /*
    updateSessionData( pSessionData:SessionData):boolean {

        if(pSessionData!=null){
            (this._s as SqliteDbCollection)
                .getExtra(SessionData.TYPE.getName())
                .updateEntry(pSessionData);
        }


        return true;
    }

    findSessionData( pSession:UserSession, pName:string = null):SessionData[] {

        let s:SessionData[] = [];
        if(pName != null){
            (this._s as SqliteDbCollection).getExtra(SessionData.TYPE.getName()).map( (x:any )=> {
                if(x.getName()==pName && x.session_uid===pSession.getSessUID()){
                    s.push(x);
                }
            });
        }else{
            (this._s as SqliteDbCollection).getExtra(SessionData.TYPE.getName()).map( (x:any )=> {
                if(x.session_uid===pSession.getSessUID()){
                    s.push(x);
                }
            });
        }

        return s;
    }*/

    removeSessionFiles( pSessUID:string):boolean {
        return true;
    }

    /*
    listAllSession(pFromCache = true): UserSessionMap {
        if(pFromCache)
            return this._sess;
        else
            return (this._s as MongodbDbCollection).getAll();
    }*/

    /**
     * To check if a session is expired
     *
     * A sessions is expired if ((current date - creation date) > duration)
     *
     * @param {UserSession} pSession Session to test
     * @return {boolean} TRUE if expired, else FALSE
     * @method
     */
    isSessionExpired(pSession:UserSession):boolean {
        if(pSession.cookie==null){
            return false;
        }else return pSession.cookie.expires.getTime() <  (new Date()).getTime();
    }


    /**
     * To trigger destroy procedure and remove from active session list
     *
     * @param pSession
     */
    destroySession( pSession:UserSession, pCause = ""):boolean {

        console.log("Destroy session (cause="+pCause+"): ",pSession);

        // remove data associated to the session such as temporary files
        pSession.destroy(()=>{
            console.log('Session Service : destroySession : session destroyed');
        });

        // remove session from active sessions list
        this._ctx.getEngineDB()
            .getCollectionOf(UserSession.TYPE.getType())
            .asyncRemoveEntry(pSession)
                .then((res)=>{

                })
                .catch((err)=>{

                })

        //this._s.removeEntry(pSession.getSessUID());


        // remove session file if session management uses FS
        if(this._settings.isFsBased()){
            this.removeSessionFiles(pSession.getSessUID());
        }

        // remove from cache
        delete this._sess[pSession.getSessUID()];

        return true;
    }

    wakeUpSession(pSession:UserSession):UserSession{
        return pSession;
    }

    /**
     * To retrieve a session by its uid
     *
     * @param pSessUID
     * @deprecated
     */
    getSessionByUID( pSessUID:string):UserSession {

        // TODO ACL : check current users can retrieve session of other users
        // TODO ACL : check current users can retrieve session of other users from the team

        this._s.asyncGetEntry( {_uid:pSessUID})

        if(this._sess[pSessUID]!=null){
            return this._sess[pSessUID];
        }else if(this._s.hasEntry(pSessUID)){
            return this._sess[pSessUID] = this._s.getEntry(pSessUID); //this.wakeUpSession( this._s.getEntry(pSessUID));
        }else{
            throw new SessionException("There is not session with the given Session UID", SessionCode.INVALID_SESSID)
        }
    }


    /**
     * To retrieve a session by its uid
     *
     * @param pSessUID
     */
    async asyncGetSessionByUID( pSessUID:string):Promise<UserSession> {

        // TODO ACL : check current users can retrieve session of other users
        // TODO ACL : check current users can retrieve session of other users from the team

        return await this._s.asyncGetEntry( {_uid:pSessUID})
    }

    /**
     * To retrieve a session by its uid
     *
     * @param pSessUID
     */
    async getSessionsByAccount( pAccount:UserAccount, pOnlyActive:boolean = true):Promise<UserSession[]> {

        // TODO ACL : check current users can retrieve session of other users
        // TODO ACL : check current users can retrieve session of other users from the team

        const accSess = await this._s.asyncGetEntry( new UserSession({ _acc:pAccount }));

        console.log("getSessionsByAccount >  ",accSess);
        let sess:UserSession[] = [];

        for(let sid in this._sess){
            if(this._sess[sid]==null)
                continue;

            if(this._sess[sid].isOwnedBy(pAccount)){
                if(pOnlyActive){
                    if(this._sess[sid].isActive())
                        sess.push(this._sess[sid]);
                }else{
                    sess.push(this._sess[sid]);
                }
            }
        }

        if(sess.length == 0){
            this._s.map( (o:number, v:UserSession)=> {
                if(v.isOwnedBy(pAccount)){
                    if(pOnlyActive){
                        if(v.isActive()) {
                            sess.push( this.wakeUpSession(v));
                        }
                    }else{
                        sess.push(this.wakeUpSession(v));
                    }
                }
            })
        }


        return sess;
    }

    flush(): void {

        Logger.debug("[SESSION SERVICE][flush] Flush all sessions ");
        this._s.map( (o:number, sess:UserSession)=> {
            // destroy
            if(sess!=null){
                sess.destroy(()=>{
                    console.log('Session Service : flush : session destroyed');
                    Logger.debug(`[SESSION SERVICE][flush][${sess.getUID()}] Session destroyed `);
                });
                // remove from cache
                delete this._sess[sess.getSessUID()];
                // remove from DB
                this._s.removeEntry(sess.getSessUID())
            }
        });

        this._sess = {};
    }

    /**
     * To create the SessionStorage instance for express-session module
     *
     * @method
     */
    createSessionStore():SessionStore {
        return this._store = new SessionStore(
            this._ctx,
            this._ctx.getEngineDB().getCollectionOf(UserSession.TYPE.getType()) as MongodbDbCollection
        );
    }
}