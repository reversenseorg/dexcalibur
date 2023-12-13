import {SessionSettings} from "./SessionSettings.js";
import {UserAccount} from "../UserAccount.js";
import {UserSession} from "./UserSession.js";
import Util from "../../Utils.js";
import {SessionCode, SessionException} from "./SessionException.js";
import * as Log from "../../Logger.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {SessionData} from "./SessionData.js";
import SqliteDbCollection from "../../../connectors/sqlite/SqliteDbCollection.js";
import {IDatabase, IDbCollection} from "@dexcalibur/dexcalibur-orm";

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

    private _sess: UserSessionMap = {}; // cache
    private _s: IDbCollection = null;
    private _store:string;
    private _sessDB: IDatabase = null;
    private _ctx:DexcaliburEngine = null;

    constructor( pSettings:SessionSettings, pContext:DexcaliburEngine=null, pSessStorage:string = null) {
        this._settings = pSettings;
        this._settings.save();
        this._store = pSessStorage!==null ? pSessStorage : this._settings.getStorage();
        this.loadSessionDB();
    }


    flushCache(){
        this._sess = {};
    }

    getSettings():SessionSettings {
        return this._settings;
    }

    loadSessionDB():void {
        //if(this._sessDB == null){
        //    const sqliConn:SqliteConnector = ConnectorFactory.getInstance().newConnector('sqlite', null);
        //    sqliConn.connect(this._storage, true);
        //    this._sessDB = sqliConn.getDB();
        // }
    }

    importSessions( pCollection:IDbCollection){
        this._s = pCollection;
        this._s.map( (o:number, v:UserSession) => {
            this._sess[v.getSessUID()] = v;
        });
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
        this._s.setEntry( sess.getSessUID(), sess);

        // update cache
        this._sess[sess.getSessUID()] = sess;

        return sess;
    }

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
    }

    removeSessionFiles( pSessUID:string):boolean {
        return true;
    }

    listAllSession(pFromCache = true): UserSessionMap {
        if(pFromCache)
            return this._sess;
        else
            return this._s.getAll();
    }


    /**
     * To trigger destroy procedure and remove from active session list
     *
     * @param pSession
     */
    destroySession( pSession:UserSession):boolean {

        // remove data associated to the session such as temporary files
        pSession.destroy();

        // remove session from active sessions list
        this._s.removeEntry(pSession.getSessUID());


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
     */
    getSessionByUID( pSessUID:string):UserSession {

        // TODO ACL : check current users can retrieve session of other users
        // TODO ACL : check current users can retrieve session of other users from the team


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
    getSessionsByAccount( pAccount:UserAccount, pOnlyActive:boolean = true):UserSession[] {

        // TODO ACL : check current users can retrieve session of other users
        // TODO ACL : check current users can retrieve session of other users from the team

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
        this._s.map( (o:number, sess:UserSession)=> {
            // destroy
            sess.destroy();
            // remove from cache
            delete this._sess[sess.getSessUID()];
            // remove from DB
            this._s.removeEntry(sess.getSessUID())
        });

        this._sess = {};
    }
}