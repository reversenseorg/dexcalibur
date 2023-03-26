/**
 * Represents the component managing user authentication and session
 *
 * @class
 */
import {AuthenticationService} from "./auth/AuthenticationService.js";
import {SessionService} from "./session/SessionService.js";
import {AuthenticationSettings} from "./auth/AuthenticationSettings.js";
import {UserAccount} from "./UserAccount.js";
import {UserSession} from "./session/UserSession.js";
import {SessionCode, SessionException} from "./session/SessionException.js";
import {AuthenticationResult} from "./auth/Authenticator.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import * as Log from '../Logger.js';
import {IDatabase, IDatabaseAdapter, IDbCollection, IDbIndex} from "../persist/orm/DbAbstraction.js";
import {ConnectorFactory} from "../ConnectorFactory.js";
import SqliteConnector from "../../connectors/sqlite/adapter.js";
import {SqliteDb} from "../../connectors/sqlite/SqliteDb.js";
import * as _fs_ from "fs";
import {UserServiceException} from "../errors/UserServiceException.js";
import {MonitoredError} from "../errors/MonitoredError.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {SessionData} from "./session/SessionData.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface UserServiceMap {
    [pEngineUri:string] :UserService
}

const gInstance:UserServiceMap = {}

export class UserService {

    //ctx:DexcaliburEngine = null;
    authSvc: AuthenticationService;
    sessSvc: SessionService;

    private _db:IDatabase = null;
    private _settings: AuthenticationSettings = null;
    _ctx:DexcaliburEngine = null;

    constructor(pSettings:AuthenticationSettings, pContext:DexcaliburEngine = null) {
        this._settings = pSettings;
        this._ctx = pContext;

        if(pSettings==null){
            throw UserServiceException.DB_IS_NOT_READY();
        }

        UserAccount.TYPE.source(UserService.findUser);
        SessionData.TYPE.source(UserService.findAllSessionData);
        UserSession.TYPE.subscribe('save_data', UserService.saveSessionData);

        this.initService(pContext);
    }


    static findUser(pUsername:string, pEngineUID:string = null):UserAccount {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return svc.authSvc.findUser(pUsername);
    }



    static findAllSessionData( pSession:UserSession, pEngineUID:string = null):SessionData[] {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return UserService.findSessionData({ session:pSession, _name:null},pEngineUID);
    }


    static findSessionData( pData:any, pEngineUID:string = null):SessionData[] {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return svc.sessSvc.findSessionData(pData.session, pData._name);
    }


    static saveSessionData(pSessionData:SessionData, pEngineUID:string = null):boolean {

        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }


        return svc.sessSvc.updateSessionData(pSessionData);
    }

    /**
     *
     */
    initService(pContext:DexcaliburEngine):void {

        gInstance[pContext.UID] = this;

        this.authSvc = new AuthenticationService(this._settings, pContext);
        this.sessSvc = new SessionService( this._settings.getSessionSettings(),pContext);


        try{
            // load currently configured db : inmemory or sqlite
            Logger.debug('----------- BEFORE LOAD 1 ------------ ');
            this.loadDB(this._settings.db);
            Logger.debug('----------- AFTER LOAD 1 ------------ ');

            // verify state / version
            if(this.isUserDbReady()){

                Logger.debug('----------- AFTER USER IS READY ------------ ');
                this.authSvc.importUsers(this._db.getCollection('user', UserAccount.TYPE));

                Logger.debug('----------- RESTORING SESSIONS ------------ ');
                this.sessSvc.importSessions(this._db.getCollection('session', UserSession.TYPE));

                Logger.debug('----------- START USER SERVICE ------------ ');
                /*if(this.authSvc._users.size()==0){
                    throw UserServiceException.EMPTY_USER_DB();
                }*/


            }
        }catch(err){
            let dburi:string = null;

            Logger.error(err.message,err.stack);
            switch (err.getCode()){
                // (re)create from JSON file
                case UserServiceException.ERR.MISSING_DB:
                case UserServiceException.ERR.EMPTY_USER_DB:
                    dburi = this._settings.db.uri.slice(0,-3)+".json";
                    if(_fs_.existsSync(dburi)){
                        if(_fs_.existsSync(this._settings.db.uri))
                            _fs_.unlinkSync(this._settings.db.uri);
                        this._db = null;
                        this.migrateDB('inmemory', dburi);
                    }else{
                        throw UserServiceException.UNRECOVERABLE_USER_DB();
                    }
                    break;
                // migrate from json to sqlite
                case UserServiceException.ERR.WRONG_DB_FORMAT:
                    if(this._settings.db.dbms !== 'inmemory'){
                        throw UserServiceException.UNRECOVERABLE_USER_DB();
                    }

                    dburi = this._settings.db.uri;
                    this._db = null;

                    if(dburi!=null && _fs_.existsSync(dburi)){

                        Logger.debug('----------- START TO MIGRATE 2 ('+dburi+')  ---------');
                        this.migrateDB('inmemory', dburi);
                        Logger.debug('----------- STOP TO MIGRATE 2  ---------');
                    }else{
                        throw UserServiceException.UNRECOVERABLE_USER_DB();
                    }
                    break;
                case UserServiceException.ERR.INCONSISTENT_DB:
                case UserServiceException.ERR.DB_IS_NOT_READY:
                    break;
            }
        }
    }

    /**
     * To check / invalidate old
     * @param pSettings
     */
    isUserDbReady(pSettings:any = null):boolean{
        const settings = pSettings!=null ? pSettings : this._settings;


        if(this._db == null){
            throw UserServiceException.DB_IS_NOT_READY();
        }

        if(!this._db.exists('user')){
            throw UserServiceException.INCONSISTENT_DB();
        }

        return true;
    }

    /**
     * If current db is not sqlite, create it; else load existing
     * @param pOldDB
     * @param pNewDB
     */
    migrateDB( pType:string, pURI:string){
        // TODO : add db authent
        try{
            const adapter:IDatabaseAdapter = ConnectorFactory.getInstance().newConnector(pType, null);
            adapter.connect(pURI)
            const DB:IDatabase = adapter.getDB();

            if(pType == 'inmemory'){
                DB.unserialize(
                    JSON.parse(_fs_.readFileSync(
                        pURI, {encoding:'utf8'}
                    ))
                );
            }

            const userSource:IDbCollection = DB.getCollection( 'users', UserAccount.TYPE);

            if(this._settings.db.dbms == 'inmemory'){
                const path = this._settings.db.uri.endsWith('.json') ? this._settings.db.uri.slice(0,-5)+'.db' : this._settings.db.uri+'.db';
                this._settings.db.uri = path;
                this._settings.db.dbms = 'sqlite';
                this.loadDB(this._settings.db, true);

            }else if(this._db == null){
                const path = this._settings.db.uri.endsWith('.db') ? this._settings.db.uri : this._settings.db.uri+'.db';
                this._settings.db.uri = path;
                this._settings.db.dbms = 'sqlite';
                this.loadDB(this._settings.db, true);
            }else{
                    throw new Error(" Unable to migrate userDB ");
            }


            Logger.debug('----------- CREATE NEW USER COLLECTIOn INTO NEW DB  ---------');
            const userDest:IDbCollection = this._db.getCollection('user', UserAccount.TYPE);

            Logger.debug('----------- BROWSE DB TO IMPORT ('+this._settings.db.uri+') ---------',userSource.size()+"");
            userSource.map( (vOffset:number, vUser:any)=>{
                Logger.debug(JSON.stringify(vUser));
                vUser._locked = (vUser._locked? 1 : 0);
                userDest.addEntry( vUser.uid, new UserAccount(vUser));
            });



            if(userDest.size()>0){
                this._settings.save();
                this.initService(this._ctx);
            }

            Logger.raw("[AUTH SVC] Old DB has be migrated to SQLite DB");
        }catch(err){
            Logger.error(err.message,err.stack);
            throw AuthenticationException.MIGRATION_ERROR(err);
        }

    }

    /**
     * To init user database
     *
     * Only available connector can be used. It is the place
     * where connection to the database is performed.
     *
     * If the file at 'uri' is not found (1st run after install), it searchs
     * for <uri>.temp JSON file  with 1st user data.
     *
     * If the user database not exists, it is created and filled with <uri> file content
     *
     */
    loadDB( pDbSettings:any, pForce = false):void{

        if(!pForce && pDbSettings.dbms != 'sqlite'){
            throw UserServiceException.WRONG_DB_FORMAT();
        }

        if(!pForce && !_fs_.existsSync(pDbSettings.uri)){
            throw UserServiceException.MISSING_DB();
        }

        const dba:any = ConnectorFactory.getInstance().newConnector(
            pDbSettings.dbms, // inmemory / sqlite / neo4j
            null,
            {
                user: pDbSettings.user,
                pwd: pDbSettings.pwd,
                port: pDbSettings.port,
                uri: pDbSettings.uri
            }
        ) as IDatabaseAdapter;

        dba.connect(pDbSettings.uri, true);

        this._db = dba.getDB(pDbSettings.uri);

        // import temporary DB after a fresh install
        /*
        if(_fs_.existsSync(this.settings.db.uri)==false){
            if(_fs_.existsSync(this.settings.db.uri+".temp")==true){
                this.createUserDB(
                    JSON.parse(_fs_.readFileSync(this.settings.db.uri+".temp", {encoding:'utf8'}))
                );
                // during import, there is no backup of current user DB
                this.save(false);
            }else{
                throw new AuthenticationException("Authentication Service cannot be initilized : user DB is missing at "+this.settings.db.uri);
            }
        }else{
            this.importUserDB(this.settings.db.dbms);
        }*/

    }

    createSession( pAccount: UserAccount): UserSession {
        return this.sessSvc.newSession(pAccount);
    }

    openSession( pSessUID: string): UserSession {
        let sess:UserSession = this.sessSvc.getSessionByUID(pSessUID)

        if(sess.getUserAccount().isLocked())
            throw new SessionException("Session cannot be opened : account is locked", SessionCode.ACCOUNT_LOCKED)

        return sess;
    }

    /**
     * To close the session
     *
     * @param pSession
     */
    closeSession( pSession:UserSession): void {
        // close the session  and
        this.sessSvc.destroySession(pSession);
    }

    /**
     *
     * @param pSession
     */
    verifySession( pSession:UserSession):boolean {
        try{

            //Logger.info("Verify session is not null : "+JSON.stringify(pSession));
            //Logger.info("All session : "+JSON.stringify( Object.keys(this.sessSvc.listAllSession())));
            if( pSession != null && pSession.isActive()){
                return true;
            }else{
                throw SessionException.INVALID_SESSION();
            } // TODO : add expiration check
        }catch(err){
            //console.log(err.message+err.stack);
            Logger.error(err.message+"\n\t"+err.stack);
            throw SessionException.INVALID_SESSION();
        }
    }

    getActiveSessions( pAccount: UserAccount): UserSession[] {
        return this.sessSvc.getSessionsByAccount( pAccount);
    }

    getLatestActiveSession( pAccount: UserAccount): UserSession {
        const sess:UserSession[] = this.sessSvc.getSessionsByAccount( pAccount);

        if(sess.length==0)
            throw new SessionException("There is not active session for the given account", SessionCode.NO_SESSION_FOUND)

        if(sess.length==1){
            return sess[0];
        }else{
            return sess.sort(function(a,b){
                return (a._created>b._created ? -1 : 1);
            })[0];
        }
    }

    /**
     *
     * @param pLogin
     * @param pPassword
     */
    doPeerOTPAuthentication( pLogin:string, pPeerID:string): UserSession {
        /*
         * Peer authentication send a one time password to team leader or another team member.
         * The user must use this password with its login whithin the time window
         */
        return null;
    }

    /**
     *
     * @param pLogin
     * @param pPassword
     */
    do1StepPasswordAuthentication( pLogin:string, pPassword:string): UserSession {
        let sess:UserSession = null;
        const res:AuthenticationResult = this.authSvc.newPasswordAuthenticator()
                                                        .doAuthentication(pLogin,pPassword);

        if(AuthenticationResult.isSuccess(res)){
            sess = this.sessSvc.newSession(res.getAccount());
        }else{
            throw AuthenticationException.AUTHENTICATION_FAILED();
        }

        return sess;
    }

    /**
     * To create a user account and save it
     * @param pAccount
     */
    createUser( pAccount:UserAccount):boolean{
        // verify username is unique
        const users = this._db.getCollection('user',UserAccount.TYPE);
        if(users.hasEntry(pAccount.getUID())){
            throw UserServiceException.USERNAME_NOT_AVAILABLE()
        }

        users.addEntry(pAccount.getUID(), pAccount);

        return true;
    }


    /**
     * TODO : Defensive Mode :
     * Cookie name changes periodically to hide it if network is monitored
     */
    getCookieName():string {
        return 'dxc_sess';
    }

    /**
     * TODO : Defensive Mode :
     * Cookie name changes periodically to hide it if network is monitored
     */
    getQueryParam():string {
        return '_a';
    }

    getAuthenticationService(): AuthenticationService {
        return this.authSvc;
    }


    getSessionService(): SessionService {
        return this.sessSvc;
    }
}