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
import {ConnectorFactory} from "../ConnectorFactory.js";
import * as _fs_ from "fs";
import {UserServiceException} from "../errors/UserServiceException.js";
import {MonitoredError} from "../errors/MonitoredError.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {SessionData} from "./session/SessionData.js";
import {IDatabase, IDatabaseAdapter, IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {Nullable} from "../core/IStringIndex.js";

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
    private _coll:MongodbDbCollection = null;

    private _settings: AuthenticationSettings = null;


    _ctx:DexcaliburEngine = null;

    constructor(pSettings:AuthenticationSettings, pContext:DexcaliburEngine = null) {
        this._settings = pSettings;
        this._ctx = pContext;

        if(pSettings==null){
            throw UserServiceException.DB_IS_NOT_READY();
        }


        UserAccount.TYPE.source(UserService.findUserByUID);
        // SessionData.TYPE.source(UserService.findAllSessionData);
        // UserSession.TYPE.subscribe('save_data', UserService.saveSessionData);

        //this.initService(pContext);
    }


    static findUser(pUsername:string, pEngineUID:string = null):UserAccount {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return svc.authSvc.findUser(pUsername);
    }

    static findUserByUID(pUserUID:string, pEngineUID:string = null):UserAccount {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return svc.authSvc.findUserByUID(pUserUID);
    }



    /*static findAllSessionData( pSession:UserSession, pEngineUID:string = null):SessionData[] {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return UserService.findSessionData({ session:pSession, _name:null},pEngineUID);
    }*/

/*
    static findSessionData( pData:any, pEngineUID:string = null):SessionData[] {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return svc.sessSvc.findSessionData(pData.session, pData._name);
    }*/


    /*static saveSessionData(pSessionData:SessionData, pEngineUID:string = null):boolean {

        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }


        return svc.sessSvc.updateSessionData(pSessionData);
    }*/

    /**
     *
     */
    async initService(pContext:DexcaliburEngine):Promise<void> {

        gInstance[pContext.UID] = this;

        this._coll = pContext.getEngineDB().getCollectionOf(UserAccount.TYPE.getType()) as MongodbDbCollection;

        this.authSvc = new AuthenticationService(this._settings, pContext);
        await this.authSvc.init();

        this.sessSvc = new SessionService( this._settings.getSessionSettings(),pContext);
        this.sessSvc.setBackendCollection(
            pContext.getEngineDB().getCollectionOf(UserSession.TYPE.getType()) as MongodbDbCollection
        );
    }


    createSession( pAccount: UserAccount): UserSession {
        return this.sessSvc.newSession(pAccount);
    }

    openSession( pSessUID: string): UserSession {
        let sess:any = this.sessSvc.asyncGetSessionByUID(pSessUID); //getSessionByUID(pSessUID)

        if(sess.getUserAccount().isLocked())
            throw new SessionException("Session cannot be opened : account is locked", SessionCode.ACCOUNT_LOCKED)

        return sess;
    }

    async asyncOpenSession( pSessUID: string): Promise<UserSession> {
        /*let sess:UserSession = await this.sessSvc.asyncGetSessionByUID(pSessUID); //getSessionByUID(pSessUID)

        if(sess.getUserAccount().isLocked())
            throw new SessionException("Session cannot be opened : account is locked", SessionCode.ACCOUNT_LOCKED)*/

        return await this.sessSvc.asyncGetSessionByUID(pSessUID);
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

            //Logger.debug("Verify session is not null : "+JSON.stringify(pSession));
            //Logger.debug("All session : "+JSON.stringify( Object.keys(this.sessSvc.listAllSession())));
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

    async getActiveSessions( pAccount: UserAccount): Promise<UserSession[]> {
        return await this.sessSvc.getSessionsByAccount( pAccount);
    }

    async getLatestActiveSession( pAccount: UserAccount): Promise<UserSession> {
        const sess:UserSession[] = await this.sessSvc.getSessionsByAccount( pAccount);

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

    /*
     *Peer authentication send a one time password to team leader or another team member.
     * The user must use this password with its login whithin the time window
     *
     * @param pLogin
     * @param pPassword
     *
    doPeerOTPAuthentication( pLogin:string, pPeerID:string): UserSession {
        return null;
    }*/

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

    async find(pAccount: UserAccount, pOptions: { autoCreate: boolean }):Promise<Nullable<UserAccount>> {
        let user = await this._coll.asyncGetEntry({
            [UserAccount.TYPE.getPrimaryKey().getName()] : pAccount.getUID()
        });

        if(user != null) {
            Logger.success("[AUTH SERVICE] Find user : account found");
            return user;
        }else{
            if(pOptions.autoCreate == true){
                user = await this._coll.asyncAddEntry(
                    {
                        [UserAccount.TYPE.getPrimaryKey().getName()] : pAccount.getUID()
                    },
                    pAccount);

                Logger.success("[AUTH SERVICE] Find user : account not found but created accordingly to 'autoCreate' option");

                return user;
            }else{
                return null;
            }
        }
    }
}