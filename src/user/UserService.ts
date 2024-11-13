/**
 * Represents the component managing user authentication and session
 *
 * @class
 */
import {AuthenticationService} from "./auth/AuthenticationService.js";
import {SessionService} from "./session/SessionService.js";
import {AuthenticationSettings} from "./auth/AuthenticationSettings.js";
import {UserAccount, UserAccountType, UserAccountUUID} from "./UserAccount.js";
import {UserSession} from "./session/UserSession.js";
import {SessionCode, SessionException} from "./session/SessionException.js";
import {AuthenticationResult} from "./auth/PasswordAuthenticator.js";
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
import Role from "./acl/common/Role.js";
import AccessControl from "./acl/AccessControl.js";
import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {OrganizationAccessControl} from "./acl/rbac/OrganizationAccessContol.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {randomUUID} from "crypto";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface UserServiceMap {
    [pEngineUri:string] :UserService
}

const gInstance:UserServiceMap = {}

/**
 * Service responsible to manage users
 *
 * @class
 */
export class UserService {

    static DEFAULT_LOCAL_ADMIN_ACCOUNT = 'admin';

    //ctx:DexcaliburEngine = null;
    authSvc: AuthenticationService;
    sessSvc: SessionService;

    /**
     * @deprecated
     * @private
     */
    private _db:IDatabase = null;

    /**
     * Index from EngineDB
     * @private
     */
    private _coll:MongodbDbCollection = null;


    private _settings: AuthenticationSettings = null;


    _ctx:DexcaliburEngine = null;

    constructor(pSettings:AuthenticationSettings, pContext:DexcaliburEngine = null) {
        this._settings = pSettings;
        this._ctx = pContext;

        if(pSettings==null){
            throw UserServiceException.DB_IS_NOT_READY();
        }


        //UserAccount.TYPE.source(UserService.findUserByUID);
    }


    static findUser(pUsername:string, pEngineUID:string = null):UserAccount {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return svc.authSvc.findUser(pUsername);
    }

    /*
    static findUserByUID(pUserUID:string, pEngineUID:string = null):UserAccount {
        const svc:UserService = gInstance[pEngineUID!=null ? pEngineUID : DexcaliburEngine.DEFAULT_UID];

        if(svc==null){
            throw UserServiceException.MISSING_CONTEXT();
        }

        return svc.authSvc.findUserByUID(pUserUID);
    }*/


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

        this.authSvc = new AuthenticationService(this._settings, this);
        try{
            await this.authSvc.init();
        }catch (err){

            // if SSO settings exists, then the remote server is unreachable
            // as alternative way, check if local authentication is allowed
            if(this._settings.isLocalAuthEnabled()){
                // TODO : later add API Key auth check and more
                // continue
            }else{
                // there is not alternative, engine cannot start
                throw UserServiceException.AUTH_IS_NOT_READY();
            }
        }finally {
            this.sessSvc = new SessionService( this._settings.getSessionSettings(),pContext);
            this.sessSvc.setBackendCollection(
                pContext.getEngineDB().getCollectionOf(UserSession.TYPE.getType()) as MongodbDbCollection
            );
        }
    }


    /**
     *
     * @param pRoles
     */
    async createLocalUser(pUID:string, pRoles:Role[], pUsername:Nullable<string> = null):Promise<UserAccount> {
        let clearPwd = AuthenticationService.generatePassword({
            minLength: 12,
            maxLength: 255,
            genLength: 12
        });

        const user = new UserAccount({
            _uid: pUID,
            _username: (pUsername!=null ? pUsername : UserAccount.generateUsername()),
            _type: UserAccountType.LOCAL
        });

        pRoles.map(x => user.addRole(x));

        this._settings.getAuthorizedIPs().map( vIP => {
            user.addAuthorizedIP(vIP);
        });

        user.newPassword(clearPwd);

        Logger.success(`
+---[ IMPORTANT ]------------------------------
| New local administrator created. Please note username and password
|
| Username: ${user.username}
| Password: ${clearPwd}
+----------------------------------------------
        `);


        this._ctx.getEngineDB().save(user);

        return  null;
    }

    static getCommonOrganizations( pAccount1:UserAccount, pAccount2:UserAccount, ):OrganizationUnitUUID[] {
        let same:OrganizationUnitUUID[] = [];
        pAccount1.getOrgUnits().map(x => {
            if(pAccount2.getOrgUnits().indexOf(x)>-1){
                same.push(x);
            }
        });

        return same;
    }

    /**
     * deprecated ?
     * @param pAccount
     */
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
    async do1StepPasswordAuthentication( pLogin:string, pPassword:string): Promise<UserSession> {
        let sess:UserSession = null;
        const res:AuthenticationResult = await this.authSvc.newPasswordAuthenticator()
                                                        .doAuthentication(pLogin,pPassword);

        if(AuthenticationResult.isSuccess(res)){
            sess = this.sessSvc.newSession(res.getAccount());
        }else{
            throw AuthenticationException.AUTHENTICATION_FAILED();
        }

        return sess;
    }


    async isUuidFree(pType:NodeInternalType, pUUID:string):Promise<boolean> {

        let coll:Nullable<IDbCollection> = null;
        switch (pType){
            case NodeInternalType.USER_ACCOUNT:
                coll = await (this._ctx.getEngineDB().getCollectionOf(pType) as MongodbDbCollection);
                break;
        }

        if(coll==null){
            throw OrganizationManagerException.CANNOT_CHECK_UUID();
        }


        const res = await (coll as MongodbDbCollection).asyncGetEntry({ uuid:pUUID });
        return (res == null);
    }

    /**
     * To create a user account and save it
     * @param pAccount
     */
    async createUser( pAccount:UserAccount):Promise<UserAccount>{

        let candidateUUID:UserAccountUUID;
        do{
            candidateUUID = randomUUID();
        }while( (await this.isUuidFree(UserAccount.TYPE.getType(),candidateUUID))===false);

        pAccount.setUID(candidateUUID);
        pAccount.init(candidateUUID);

        return await this._coll.asyncAddEntry(pAccount.getUID(), pAccount);;
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

    async find(pAccount: UserAccount, pOptions: { autoCreate: boolean, type?:UserAccountType }):Promise<Nullable<UserAccount>> {
        let user = await this._coll.asyncGetEntry({
            [UserAccount.TYPE.getPrimaryKey().getName()] : pAccount.getUID()
        });

        if(user != null) {
            Logger.success("[AUTH SERVICE] Find user : account found");
            return user;
        }else{
            if(pOptions.autoCreate == true){
                user.setType(pOptions.type);
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

    async listLocalAccounts():Promise<UserAccount[]> {
        return  await this._coll.search({ _type: UserAccountType.LOCAL }) as UserAccount[];
    }

    /**
     *
     * Part of Public API
     *
     * @param pUserAccount
     * @param pUUID
     */
    async getAccount(pUserAccount:UserAccount, pUUID:UserAccountUUID):Promise<UserAccount> {
        if(pUserAccount.uuidEquals(pUUID)){
            return await this.find(new UserAccount({ uuid:pUserAccount.getUID() }), { autoCreate:false });
        }else{
            // check basic perm
            AccessControl.isAuthorized(
                AccessControl.access.ORG_USER_READ,
                pUserAccount
            );

            // check i
            let user = await this.find(new UserAccount({ uuid:pUUID }), { autoCreate:false });

            if(user==null){
                throw UserServiceException.USER_NOT_FOUND();
            }

            const sameOrgs = UserService.getCommonOrganizations(pUserAccount, user);

            // verify user is a part of issuer org
            if(sameOrgs.length==0){
                throw UserServiceException.USERS_NOT_SAME_ORG(pUserAccount, user);
            }

            try{
                // check if the current user, is authorized to read profile of found user
                // he must be a part of target user organization and be a part of OWNER or ORG_MEMBER
                // org attribute
                AccessControl.isAuthorized(
                    AccessControl.access.ORG_USER_READ,
                    pUserAccount,
                    await this._ctx.getOrgManager().getOrganization(pUserAccount, sameOrgs[0]),
                    [
                        OrganizationAccessControl.attr.OWNER,
                        OrganizationAccessControl.attr.ORG_MEMBER
                    ]
                );

                return user;
            }catch (err){

            }


            throw UserServiceException.ACCESS_DENIED_USER_PROFILE();
        }

    }
}