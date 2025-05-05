/**
 * Represents the component managing user authentication and session
 *
 * @class
 */
import {AuthenticationService} from "./auth/AuthenticationService.js";
import {SessionService} from "./session/SessionService.js";
import {AuthenticationSettings} from "./auth/AuthenticationSettings.js";
import {UA_UUID_SEP, UserAccount, UserAccountType, UserAccountUUID} from "./UserAccount.js";
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
import {IDatabase, IDatabaseAdapter, IDbCollection, ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {Nullable} from "../core/IStringIndex.js";
import Role, {RoleUUID} from "./acl/common/Role.js";
import AccessControl from "./acl/AccessControl.js";
import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {OrganizationAccessControl} from "./acl/rbac/OrganizationAccessContol.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {randomUUID} from "crypto";
import {Person} from "./Person.js";
import {Token, TokenOptions, TokenPurpose} from "../core/secrets/Token.js";
import Util from "../Utils.js";
import {RoleUpdate} from "../organization/OrganizationManager.js";
import {AccessControlManager} from "./acl/AccessControlManager.js";
import {UserGroupUUID} from "./acl/common/UserGroup.js";
import {AuthCode} from "./auth/AuthTypes.js";
import {CryptoUtils} from "../CryptoUtils.js";
import {EmailSender} from "../core/email/EmailSender.js";

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

    emailSender:EmailSender;

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

        if(this._ctx!=null){
            this.emailSender = new EmailSender(this._ctx);
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
            // USELESS, DEPRECATED, REPLACED BY ORG AND AUTH MODULES
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
    async createLocalUser(pUID:string, pRoles:Role[], pUsername:Nullable<string> = null, pPerson:Nullable<Person> = null, pPrint = false):Promise<UserAccount> {
        let clearPwd = AuthenticationService.generatePassword({
            minLength: 12,
            maxLength: 255,
            genLength: 12
        });

        const user = new UserAccount({
            _uid: pUID,
            _username: (pUsername!=null ? pUsername : UserAccount.generateUsername()),
            _type: UserAccountType.LOCAL,
            _person: (pPerson!=null ? pPerson : null)
        });

        pRoles.map(x => user.addRole(x));

        this._settings.getAuthorizedIPs().map( vIP => {
            user.addAuthorizedIP(vIP);
        });

        user.newPassword(clearPwd);

        if(pPrint){
            Logger.success(`
    +---[ IMPORTANT ]------------------------------
    | New local administrator created. Please note username and password
    |
    | Username: ${user.username}
    | Password: ${clearPwd}
    +----------------------------------------------
            `);
        }

        return  await this._ctx.getEngineDB().save(user) as UserAccount;
    }

    /**
     *
     * @param pAccount1
     * @param pAccount2
     */
    static getCommonOrganizations( pAccount1:UserAccount, pAccount2:UserAccount):OrganizationUnitUUID[] {
        let same:OrganizationUnitUUID[] = [];
        const mss1 = pAccount1.getMemberships();
        const mss2 = pAccount2.getMemberships();

        for(let oid in mss1) {
            if(mss1[oid].activated && !mss1[oid].locked){
                if(mss2[oid]!=null && mss2[oid].activated  && !mss2[oid].locked){
                    same.push(oid);
                }
            }
        }

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
    verifySession( pSession:UserSession, pLocation = "unknown"):boolean {
        try{

            //Logger.debug("Verify session is not null : "+JSON.stringify(pSession));
            //Logger.debug("All session : "+JSON.stringify( Object.keys(this.sessSvc.listAllSession())));

            if( pSession != null && pSession.isActive()){
                return true;
            }else{
                throw SessionException.INVALID_SESSION();
            } // TODO : add expiration check
        }catch(err){
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
    async createUser( pAccount:UserAccount, pOrg?:OrganizationUnit):Promise<UserAccount>{

        let candidateUUID:UserAccountUUID;
        do{
            candidateUUID = (pOrg!=null?pOrg.getUID()+UA_UUID_SEP:'')+randomUUID();
        }while( (await this.isUuidFree(UserAccount.TYPE.getType(),candidateUUID))===false);

        pAccount.setUID(candidateUUID);
        pAccount.init(candidateUUID);

        if(pOrg!=null){
            pAccount.addMembership(pOrg.getUID(), {
                activated: false,
                _activateDate: -1,
                locked: false,
                _lockDate: -1,
                preferences: {},
                roles: []
            });
        }

        let acc:UserAccount;
        try{
            acc = await this._coll.asyncAddEntry(pAccount.getUID(), pAccount);
        }catch (e){
            console.log(e,e.code);
            throw e;
        }

        return acc;
    }

    /**
     * To create a user account and save it
     * @param pAccount
     */
    async dropUser( pAccount:UserAccount):Promise<boolean>{
        return await this._coll.asyncRemoveEntry(pAccount);
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

    async findByUsername(pAccount: UserAccount, pOptions: { autoCreate: boolean, type?:UserAccountType, org?:OrganizationUnit }):Promise<Nullable<UserAccount>> {


        if(pAccount.username==null
            || pAccount.username.length==0
            || typeof pAccount.username !== 'string'
            || /^[\s\t]*$/.test(pAccount.username)){
            throw new AuthenticationException("Invalid username", AuthCode.EMPTY_USERNAME);
        }

        if(!UserAccount.VALIDATE._username.test(pAccount.username)){
            throw new AuthenticationException("Invalid username (#2)", AuthCode.EMPTY_USERNAME);
        }


        let user = await this._coll.asyncGetEntry({
            _username: pAccount.username
        });

        if(user != null) {
            //Logger.success("[AUTH SERVICE] Find user : account found");
            return user;
        }else{
            if(pOptions.autoCreate === true){

                pAccount.setType(pOptions.type);

                user = await this.createUser(pAccount, pOptions.org);
                /*user = await this._coll.asyncAddEntry(
                    {
                        [UserAccount.TYPE.getPrimaryKey().getName()] : pAccount.getUID()
                    },
                    pAccount);*/

                Logger.debug("[AUTH SERVICE] Find user : account not found but created accordingly to 'autoCreate' option");

                return user;
            }else{
                throw new AuthenticationException("Invalid username", AuthCode.INVALID_USERNAME);
            }
        }
    }

    async find(pAccount: UserAccount, pOptions: { autoCreate: boolean, type?:UserAccountType, org?:OrganizationUnit }):Promise<Nullable<UserAccount>> {

        let user = await this._coll.asyncGetEntry({
            [UserAccount.TYPE.getPrimaryKey().getName()] : pAccount.getUID()
            //_username: pAccount.username
        });

        if(user != null) {
            //Logger.success("[AUTH SERVICE] Find user : account found");
            return user;
        }else{
            if(pOptions.autoCreate === true){

                pAccount.setType(pOptions.type);

                user = await this.createUser(pAccount, pOptions.org);
                /*user = await this._coll.asyncAddEntry(
                    {
                        [UserAccount.TYPE.getPrimaryKey().getName()] : pAccount.getUID()
                    },
                    pAccount);*/

                Logger.debug("[AUTH SERVICE] Find user : account not found but created accordingly to 'autoCreate' option");

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
     * To retrieve an UserAccount from its UUID
     * It includes several permissions check to verify :
     * - requester has succifient permissions to read info about other account
     * - requested account is a part of one org of requester
     *
     * Part of Public API
     *
     * @param pUserAccount
     * @param pUUID
     */
    async getAccount(pUserAccount:UserAccount, pUUID:UserAccountUUID):Promise<UserAccount> {
        if(pUserAccount.uuidEquals(pUUID)){
            return await this.find(new UserAccount({ _uid:pUserAccount.getUID() }), { autoCreate:false });
        }else{
            // check basic perm
            AccessControl.isAuthorized(
                AccessControl.access.ORG_USR_READ,
                pUserAccount
            );

            // check i
            let user = await this.find(new UserAccount({ _uid:pUUID }), { autoCreate:false });

            if(user==null){
                throw UserServiceException.USER_NOT_FOUND();
            }


            const sameOrgs = UserService.getCommonOrganizations(pUserAccount, user);

            // verify user is a part of issuer org
            if(sameOrgs.length==0){
                try{
                    AccessControl.isAuthorized(
                        AccessControl.access.SRV_INSTANCE_MGT,
                        pUserAccount);

                    return user;

                }catch (er){
                    throw UserServiceException.USERS_NOT_SAME_ORG(pUserAccount, user);
                }
            }

            try{
                // check if the current user, is authorized to read profile of found user
                // he must be a part of target user organization and be a part of OWNER or ORG_MEMBER
                // org attribute
                AccessControl.isAuthorized(
                    AccessControl.access.ORG_USR_READ,
                    pUserAccount,
                    await this._ctx.getOrgManager().getOrganization(pUserAccount, sameOrgs[0]),
                    [
                        OrganizationAccessControl.attr.OWNER,
                        OrganizationAccessControl.attr.MEMBER_GRP
                    ]
                );

                return user;
            }catch (err){

            }


            throw UserServiceException.ACCESS_DENIED_USER_PROFILE();
        }

    }


    /**
     *
     * Part of Public API
     *
     * @param pUserAccount
     * @param pUUID
     */
    async updateAccountWithUnsafe(pUserAccount:UserAccount, pTargetAccount:UserAccountUUID, pUnsafeData:any):Promise<UserAccount> {


        if(!pUserAccount.uuidEquals(pTargetAccount)){
            // check basic perm
            AccessControl.isAuthorized(
                AccessControl.access.ORG_USR_MGT,
                pUserAccount
            );
        }

        // retrieve target account (include permission check and org check)
        const targetAcc = await this.getAccount(pUserAccount, pTargetAccount);

        // validate every data and update account instance, this method returns
        // the list of updated fields
        const changes = targetAcc.updateUnsafe(pUnsafeData);

        if(changes.length==0){
            throw new Error("No changes");
        }


        if(await (this._ctx.getEngineDB().getCollectionOf(UserAccount.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry( targetAcc, {replace:false, $set:changes })){

            return targetAcc;
        }else{
            throw UserServiceException.CANNOT_UPDATE_ACCOUNT(pTargetAccount);
        }
    }

    /**
     * To activate the account and return a target page where the user
     * will be redirected
     *
     * @param {string} pToken
     * @returns {string} Target page after activat (probably login page or password  reset)
     */
    async activateAccount(pToken:string):Promise<string> {
        // validate token format
        if(!ValidationRule.base64String().test(pToken)){
            throw UserServiceException.INVALID_TOKEN_FMT();
        }

        // search user account associated to this token,
        const useraccs:UserAccount[] = await this._ctx.getEngineDB()
            .getCollectionOf(UserAccount.TYPE.getType())
            .search({filter:{ "_tokens.token": pToken }}, {raw:true, merlin:false});

        if(useraccs.length<1){
            throw UserServiceException.INVALID_TOKEN('not found');
        }

        // check if token is not expired
        const token = useraccs[0].verifyToken<OrganizationUnitUUID>(pToken, TokenPurpose.ACCOUNT_VERIFY);
        if(token == null){
            // weak comparison matches undefined AND null token
            throw UserServiceException.INVALID_TOKEN('expired');
        }

        // unlock account
        useraccs[0].unlock();
        await this._ctx.getEngineDB().save(useraccs[0]);

        // if the token is related to an organization, the target url use it
        if(OrganizationUnit.VALIDATE.uuid.test(token.extra)){

            const ms = useraccs[0].getMembership(token.extra);
            if(ms != null){
                ms.locked = false;
                ms._lockDate = -1;
                ms.activated = true;
                ms._activateDate = Util.time();
            }

            useraccs[0].unlock();
            await this._ctx.getEngineDB().save(useraccs[0]);

            // redirect
            return `${process.env.DXC_SCHEMA}://${process.env.DXC_HOSTNAME}/login/org/${token.extra}`;
        }else{

            useraccs[0].unlock();
            await this._ctx.getEngineDB().save(useraccs[0]);

            // redirect
            return `${process.env.DXC_SCHEMA}://${process.env.DXC_HOSTNAME}/login`;
        }
    }

    async checkUsernameIsFree(pUsername:string):Promise<void> {
        const x = await this._coll.search({  filter:{ "_username": pUsername}}, {raw:true});

        if(x.length>0){
            throw UserServiceException.USERNAME_NOT_AVAILABLE();
        }
    }

    async addVerifyToken(pUserAccount: UserAccount, pTokenOpts:TokenOptions<any>):Promise<boolean> {
        pUserAccount.addVerifyToken({
            token: pTokenOpts.token,
            purpose: pTokenOpts.purpose,
            ttl: pTokenOpts.ttl
        },pTokenOpts.extra);

        return await this._coll.asyncUpdateEntry(pUserAccount, { replace:false, $set:['_tokens']});
    }

    /**
     *
     * @param pUserAccount
     * @param pTokenOpts
     */
    async createAccountToken(pUserAccount: UserAccount, pTokenOpts:TokenOptions<any>):Promise<string> {

        // clone options and generate token
        const opts = JSON.parse(JSON.stringify(pTokenOpts));
        opts.token = Buffer.from(CryptoUtils.randomChunk(256)).toString('base64');

        if(this.addVerifyToken(pUserAccount, opts)){
            return opts.token;
        }else{
            throw new Error('Cannot generate token');
        }
    }


    async addMembership(pUserAccount: UserAccount, pOrg: OrganizationUnit, pActivated = true) {
        const grp = pOrg.getAccessAttribute<UserGroupUUID>(OrganizationAccessControl.attr.MEMBER_GRP).value[0];

        pUserAccount.addMembership(pOrg.getUID(), {
            activated: pActivated,
            _activateDate: -1,
            locked: true,
            _lockDate: Util.time(),
            preferences: {},
            roles: [],
            groups: [grp]
        });

        return await this._coll.asyncUpdateEntry(pUserAccount, { replace:false, $set:['_membership']});
    }

    async dropMembership(pUserAccount: UserAccount, pOrg: OrganizationUnit, pActivated = true) {

        pUserAccount.removeMembership(pOrg.getUID());
        return await this._coll.asyncUpdateEntry(pUserAccount, { replace:false, $set:['_membership']});
    }

    async deactivate(pUserAccount: UserAccount, pOrg: Nullable<OrganizationUnit> = null) {

        if(pOrg!=null){
            const ms = pUserAccount.getMembership(pOrg.getUID());

            if(ms!=null){
                ms.locked = true;
                ms._lockDate = Util.time();
                ms.roles = [];
                ms.groups = [];
            }else{
                pUserAccount.addMembership(pOrg.getUID(),{
                    activated: false,
                    _activateDate: -1,
                    locked: true,
                    _lockDate: Util.time(),
                    preferences: {},
                    roles:[],
                    groups: []
                })
            }
        }

        await this._coll.asyncUpdateEntry(pUserAccount, {replace:false, $set:['_membership','_locked','_activated']});
    }

    /**
     * To set organisation roles (intermediate level)
     *
     * Org-specific but attribute-free
     *
     * @param pIssuer
     * @param pOrg
     * @param pTargetAcc
     * @param pRoles
     */
    async updateOrgRoles(pIssuer: UserAccount, pOrg:OrganizationUnitUUID,
                         pTargetAcc:UserAccountUUID, pRoles:RoleUUID[]):Promise<boolean> {


        // check if the target user is a part of the target organization
        const target = await this.getAccount(pIssuer, pTargetAcc);

        if(!target.isMemberOf(pOrg)){
            throw OrganizationManagerException.NOT_A_MEMBER(pTargetAcc, pOrg);
        }

        const requestPerms = AccessControl.mergePermissions(pRoles);

        // IMPORTANT :
        // check if issuer has higher role
        if(requestPerms[AccessControl.access.SRV_INSTANCE_MGT.getUID()]!=null){
            throw UserServiceException.CANNOT_GRANT_TO_LOCAL_ADMIN(pIssuer.getUID(), pOrg, pTargetAcc)
        }

        target.updateMembershipRoles(pOrg, pRoles);

        // save
        if(await this._coll.asyncUpdateEntry(
            target, { replace:false, $set:['_membership']}
        )){
            return true;
        }else{
            return false;
        }
    }

    /**
     * To set Global role (highest level)
     *
     * Cross-organization and attribute-free
     *
     * @param pIssuer
     * @param pOrg
     * @param pTargetAcc
     * @param pRoles
     */
    async updateGlobalRoles(pIssuer: UserAccount, pOrg:OrganizationUnitUUID,
                         pTargetAcc:UserAccountUUID, pRoles:RoleUUID[]):Promise<boolean> {

        // the issuer MUST be internal dxengine account or server admin
        if(!this._ctx.getInternalAcc().uuidEquals(pIssuer.getUID())){
            AccessControl.isAuthorized(
                AccessControl.access.SRV_INSTANCE_MGT,
                pIssuer
            );
        }

        // check if the target user is a part of the target organization
        const target = await this.getAccount(pIssuer, pTargetAcc);

        if(!target.isMemberOf(pOrg)){
            throw OrganizationManagerException.NOT_A_MEMBER(pTargetAcc, pOrg);
        }

        const requestPerms = AccessControl.mergePermissions(pRoles);

        // change global roles
        target.updateRoles(pRoles);

        // save
        if(await this._coll.asyncUpdateEntry(
            target, { replace:false, $set:['_roles']}
        )){
            return true;
        }else{
            return false;
        }
    }

    /**
     *
     * @param pIssuer
     * @param pTargetAcc
     * @param pCurrent
     * @param pNew
     * @param pOrg
     * @param pCSRF
     */
    async changeUserPwd(pIssuer: UserAccount, pTargetAcc: UserAccountUUID,
                        pCurrent:string, pNew:string,
                        pOrg:Nullable<OrganizationUnit>, pCSRF:string = ""):Promise<boolean> {

        if(pOrg!=null){
            AccessControl.isAuthorized(
                AccessControl.access.ORG_USR_MGT,
                pIssuer,
                pOrg,
                [
                    OrganizationAccessControl.attr.OWNER,
                    OrganizationAccessControl.attr.MEMBER_GRP,
                ]
            );
        }else{
            AccessControl.isAuthorized(
                AccessControl.access.SRV_INSTANCE_MGT,
                pIssuer
            );
        }

        const target = await this.getAccount(pIssuer, pTargetAcc);

        if(pOrg!=null){
            if(!target.isMemberOf(pOrg.getUID())){
                throw OrganizationManagerException.NOT_A_MEMBER(target.username,pOrg.getUID());
            }
        }

        // authenticate issuer with current
        const authResult = await this.getAuthenticationService()
            .newPasswordAuthenticator()
            .doAuthentication(pIssuer.username, pCurrent);

        if(!AuthenticationResult.isSuccess(authResult)){
            throw AuthenticationException.AUTHENTICATION_FAILED();
        }

        // change target passwd & save
        return await this._updatePassword(target, pNew);
    }

    /**
     *
     * @param {UserAccount} pOwner
     * @param {string} pCurrent Current password
     * @param {string} pNew New password
     * @param {string} pCSRF
     */
    async changeOwnPwd(pOwner: UserAccount,
                        pCurrent:string, pNew:string, pCSRF:string = ""):Promise<boolean> {

        // authenticate issuer with current
        const authResult = await this.getAuthenticationService()
            .newPasswordAuthenticator()
            .doAuthentication(pOwner.username, pCurrent);

        if(!AuthenticationResult.isSuccess(authResult)){
            throw AuthenticationException.AUTHENTICATION_FAILED();
        }

        // change target passwd & save
        return await this._updatePassword(pOwner, pNew);
    }

    /**
     *
     * @param pAccount
     * @param pClearPassword
     */
    private async _updatePassword(pAccount:UserAccount, pClearPassword:string):Promise<boolean>{

        // TODO : add password policy check

        // change user password;
        pAccount.newPassword(pClearPassword);

        // save changes
        return await this._coll.asyncUpdateEntry(pAccount,{ replace:false, $set:['_padding','_salt','_password']});
    }

    async updateMembership(pAccount: UserAccount, pOrg:OrganizationUnit, pUpdatedUser: UserAccount) {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pAccount,
            pOrg
        );

        await this._coll.asyncUpdateEntry(pUpdatedUser, {replace:false, $set:['_membership']})
    }


    async updateTokens(pAccount: UserAccount) {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pAccount
        );

        await this._coll.asyncUpdateEntry(pAccount, {replace:false, $set:['_tokens']})
    }


    async restoreSocketSessions():Promise<any>{
        return [];
    }
}