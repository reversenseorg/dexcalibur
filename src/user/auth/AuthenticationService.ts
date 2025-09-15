import * as _fs_ from 'fs';
import * as _path_ from 'path';
import got, {Options} from "got";
import {AuthCode, AuthenticationException, Authenticator, AuthType} from "./AuthTypes.js";
import {AuthenticationPolicy} from "./AuthenticationPolicy.js";
import {AuthenticationResult, PasswordAuthenticator} from "./PasswordAuthenticator.js";
import {UA_UUID_SEP, UserAccount, UserAccountType, UserAccountUUID} from "../UserAccount.js";
import {AuthenticationSettings} from "./AuthenticationSettings.js";
import * as Log from "../../Logger.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {IDatabaseAdapter, IDbCollection} from "@dexcalibur/dexcalibur-orm";

import passport from "passport";
import * as _openidconnect_ from 'passport-openidconnect';


import {Application, Router} from 'express';
import {Issuer} from "openid-client";
import {Person} from "../Person.js";
import {Nullable} from "../../core/IStringIndex.js";
import {AccessControlManager} from "../acl/AccessControlManager.js";
import Util from "../../Utils.js";
import {randomUUID} from "crypto";
import {UserService} from "../UserService.js";
import * as _bodyparser_ from 'body-parser';
import {LocalStrategy} from "./passport/LocalStrategy.js";
import {OrganizationUnit, OrganizationUnitUUID} from "../../organization/OrganizationUnit.js";
import {OidcAuthModule} from "./modules/OidcAuthModule.js";
import {AuthModule, AuthModuleType} from "./AuthModule.js";
import {LocalAuthModule} from "./modules/LocalAuthModule.js";
import {AuthenticationModuleException} from "./error/AuthenticationModuleException.js";
import {AuthStrategyUUID, LoadedAuthModule} from "./modules/LoadedAuthModule.js";
import {SessionMiddleware, UnsetMode} from "../session/SessionMiddleware.js";
import {SameSite} from "../session/Cookie.js";
import {UserSession} from "../session/UserSession.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {UserServiceException} from "../../errors/UserServiceException.js";
import {Token, TokenPurpose} from "../../core/secrets/Token.js";
import {PasswordlessAuthenticator} from "./PasswordlessAuthenticator.js";
import {OrganizationEmailBuilder} from "../../organization/OrganizationEmailBuilder.js";
import {PasswordlessAuthModule} from "./modules/PasswordlessAuthModule.js";
import {CryptoUtils} from "../../CryptoUtils.js";

const GOT = got.default;
const BodyParser = (_bodyparser_ as any).default;
const PassportOIDC = _openidconnect_.default;

interface UserCache {
    [username:string] :UserAccount;
}

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface PasswordFormContext {
    replayUID: string;
    usernameField: string;
    pwdField: string;
    csrfField: string;
    csrfToken: string;
}

export interface PasswordPolicy {
    minLength: number,
    maxLength: number,
    genLength: number
}


export interface SsoOptions {
    clientId?: string;
    clientSecret?: string;
    discoverUri?: string;
}

export interface AuthRouterConfig {
    // org uuid
    uid: OrganizationUnitUUID,
    // org name
    name: string,
    // routes
    route: {
        shortform: string,
        longform: string,
    },
    mods: AuthModule[]
}

export interface AuthOrgRouting {
    // org uuid
    uid: OrganizationUnitUUID,
    // org name
    name: string,
    // routes
    loginEndpoints: {
        shortform: string,
        longform: string,
    }
}


export interface AuthModuleRouting {
    route: AuthOrgRouting,
    module:  AuthModule
}

export interface WebSocketAuthTicket{
    created: number,
    user: UserAccountUUID,
    ip?: string;
}

export class AuthenticationService {

    private _wstCache:Record<string, any>
    settings:AuthenticationSettings;

    policy:AuthenticationPolicy;

    userSvc:UserService;

    _users:IDbCollection;

    _dba:IDatabaseAdapter = null;

    // create use into local db automatically on authentication success
    private _autoCreateOnSuccess = true;

    private _ctx:DexcaliburEngine = null;
    private _sso_enabled = false;
    private _oidClientCfg:any = {};
    private _hubpage = false;
    private _strats: Record<string, string[]> = {all:[],orgs:[]};
    private _loadedModules: Record<AuthStrategyUUID, LoadedAuthModule> = {}

    constructor( pSettings:AuthenticationSettings, pUserSvc:UserService = null) {
        this.settings = pSettings;
        this._ctx = pUserSvc._ctx;
        this.userSvc = pUserSvc;
        this.policy = new AuthenticationPolicy(pSettings);

    }

    static generatePassword(pPolicy:PasswordPolicy):string {
        let pwd:string = "";

        let charset = "";
        for(let i='a'.charCodeAt(0); i<'z'.charCodeAt(0); i++) charset+=String.fromCharCode(i);
        for(let i='A'.charCodeAt(0); i<'Z'.charCodeAt(0); i++) charset+=String.fromCharCode(i);
        for(let i='0'.charCodeAt(0); i<'9'.charCodeAt(0); i++) charset+=String.fromCharCode(i);

        while(pwd.length<pPolicy.genLength){
            pwd += charset[Math.round(Math.random()*charset.length)];
        }

        return pwd;
    }
    /**
     * To init SSO
     *
     */
    async init(){

        if(this.settings.hasOidcSettings()){
            const issuer = await Issuer.discover(this.settings.getOidcDiscoverURI());

            //Logger.debugRAW(issuer);
            this._oidClientCfg = {
                issuer: issuer,
                settings: {
                    discoverUri: this.settings.getOidcDiscoverURI(),
                    client_id: this.settings.getOidcClientID(),
                    client_secret: this.settings.getOidcClientSecret(),
                    redirect_uris: this.settings.getOidcRedirectUris(),
                    post_logout_redirect_uris: this.settings.getOidcLogoutUris(),
                    response_types: this.settings.getOidcResponseType()
                }
            };

            this._sso_enabled = true;
        }
    }


    getUserService():UserService {
        return this.userSvc;
    }



    /**
     * To save change to user db
     *
     * When the DBMS is 'inmemory', it save data into a file
     *
     * @method
     */
    save(pDoCopy:boolean = true){
        if(this.settings.db.dbms=='inmemory'){
            if(pDoCopy) {
                _fs_.copyFileSync(this.settings.db.uri, this.settings.db.uri + '.bkp');
            }
            _fs_.writeFileSync(this.settings.db.uri, JSON.stringify( this._dba.getDB().serialize()));
        }
    }

    async verifyToken(pAccount:UserAccount, pToken:string):Promise<void> {

        // validate token format
        if(!ValidationRule.base64String().test(pToken)){
            throw UserServiceException.INVALID_TOKEN_FMT();
        }

        // search user account associated to this token,
        const useraccs:UserAccount[] = await this._ctx.getEngineDB()
            .getCollectionOf(UserAccount.TYPE.getType())
            .search({filter:{ "_tokens.token": pToken, "_uid":pAccount.getUID() }}, {raw:true, merlin:false});

        if(useraccs.length<1){
            throw UserServiceException.INVALID_TOKEN('not found');
        }

        // check if token is not expired
        const token = useraccs[0].verifyToken<OrganizationUnitUUID>(pToken, TokenPurpose.ACCOUNT_PWDL_AUTH);
        if(token == null){
            // weak comparison matches undefined AND null token
            throw UserServiceException.INVALID_TOKEN('expired');
        }
    }

    /**
     *
     */
    newPasswordAuthenticator():Authenticator {
        if(!this.policy.isSupported(AuthType.PASSWORD))
            throw new AuthenticationException('Password-based authentication is not supported');

        return new PasswordAuthenticator(this);
    }

    newPasswordlessAuthenticator():Authenticator {
        return new PasswordlessAuthenticator(this);
    }

    /**
     * To search a user account by UserAccount's username in database
     *
     * @param {string} pUsername  UserAccount UUID
     * @returns {UserAccount} The user account instance
     * @deprecated
     */
    findUser( pUsername:string):UserAccount {
        let usr:UserAccount = null;

        if(pUsername==null || pUsername.length==0){
            throw new AuthenticationException("Username cannot be empty", AuthCode.EMPTY_USERNAME);
        }

        if(usr == null){
            throw new AuthenticationException("Username not found : "+pUsername, AuthCode.INVALID_USERNAME);
        }

        return usr;
    }


    /**
     * Obsolete, Must use EngineDb instead
     *
     * @param pUID
     */
    async findUserByUID( pUID:string):Promise<UserAccount> {
        let usr:UserAccount = null;

        if(pUID==null || pUID.length==0){
            throw new AuthenticationException("Username cannot be empty", AuthCode.EMPTY_USERNAME);
        }


        const user = await this._ctx.getUserService().find(new UserAccount({ _uid:pUID }), {autoCreate:false});

        //let d:string = "";
        /*
        this._users.map(function(vO, vUsr){
            //d += vUsr.username+", ";
            if((vUsr as UserAccount).getUID() === pUID){
                usr = vUsr;
            }
        });*/

        if(user == null){
            throw new AuthenticationException("Username not found : "+pUID, AuthCode.INVALID_USERNAME);
        }

        return user;
    }

    isSsoEnabled():boolean {
        console.log("isSsoEnabled > ", this._sso_enabled)
        return this._sso_enabled;
    }

    sso_need_config = true;


    /**
     * To ask to ID provider to revoke a token (prior to logout)
     *
     * @param {string} pRevokeURL
     * @param {string}pClientID
     * @param {string} pTokenID
     * @method
     */
    async revokeToken(pRevokeURL:string, pClientID:string, pRefreshToken:string):Promise<any> {


        const options:Options = {
            method: 'POST',
            headers: {
               // Authorization: 'Bearer '+pAccessToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            retry: {
                limit: 0
            },
            body: `client_id=${encodeURIComponent(pClientID)}}&refresh_token=${encodeURIComponent(pRefreshToken)}`
        };


        return await GOT(pRevokeURL, options as any);
    }


    async protectRoutes( pApp:Application|Router, pCfg:{sso:boolean,local:boolean} ):Promise<void> {

        const basePath = '/login';
        // session middleware
        /*pApp.use(
            expressSession({
                secret: 'another_long_secret',
                resave: false,
                saveUninitialized: true,
                cookie: {
                    sameSite: false
                },
                store: this._ctx.getUserService().getSessionService().createSessionStore()
                // new expressSession.MemoryStore() // TODO : replace by remote store
            })
        );*/
        const sessSvc = this.getUserService().getSessionService();

        pApp.use(
            SessionMiddleware.make({
                name: "connect.sid",
                secret: ["another_long_secret"],
                cookie: {
                    path: '/',
                    //domain: '127.0.0.1',
                    httpOnly: true,
                    sameSite: SameSite.LAX,
                    secure: false,
                    maxAge: sessSvc.getSettings().getMaxDuration() * 1000
                },
                store: sessSvc.createSessionStore(),
                trustProxy: false,
                rolling: false,
                resave: false,
                saveUninitialized: true,
                unset: UnsetMode.DESTROY,
                enforceSecure: false
            })
        );

        // passport init + session binding
        pApp.use(passport.initialize());
        pApp.use(passport.session());

        passport.serializeUser(function(vUser:UserAccount, done:any) {
            //Logger.info("[AUTH SERVICE][PASSPORT] Passport : serialize user ");
            done(null, vUser);//.getUID());
            //done(null, vUser.toJsonObject());
        });

        passport.deserializeUser(function(vUser:any, done:any) {
            const user = new UserAccount(vUser);
            //Logger.info("[AUTH SERVICE][PASSPORT] Passport : deserialize user ");
            done(null, user);
        });


        // search organization and authentication module from database and setup. login routes
        const orgs = await this._ctx.getOrgManager().listOrganizations(this._ctx.getInternalAcc());

        const strats = {
            all: [],
            [AuthModuleType.LOCAL_PASSWD]: [],
            [AuthModuleType.OIDC]: [],
            orgs: {}
        }

        let hasLocalAuth = false;
        let mods:AuthModule[] = [];
        let stratUID:string;
        let moduleState:LoadedAuthModule;

        for(let k=0; k<orgs.length; k++){

            hasLocalAuth = false;
            mods = orgs[k].getAuthModules();
            strats.orgs[orgs[k].getUID()] = [];

            for(let i=0; i<mods.length; i++){
                //stratUID = `${mods[i].type}_${orgs[k].getUID()}_${mods[i].getUID()}`;

                if(!mods[i].active){
                    Logger.success(`[AUTH SERVICE][type=${mods[i].type}][org=${orgs[k].getUID()}][mod=${mods[i].getUID()}] Auth module disabled. Skip it ...`);
                    continue;
                }

                try{
                    moduleState = await this.deployAuthModule(pApp, basePath, mods[i], orgs[k]);

                    if(mods[i].type===AuthModuleType.LOCAL_PASSWD){
                        hasLocalAuth = true;
                    }

                    this._loadedModules[moduleState.getUUID()] = moduleState;

                    strats.all.push(moduleState.getUUID());

                    if(strats[mods[i].type]==null){
                        strats[mods[i].type] = [];
                    }

                    strats[mods[i].type].push(moduleState.getUUID());
                    Logger.success(`[AUTH SERVICE][type=${mods[i].type}][org=${orgs[k].getUID()}][mod=${mods[i].getUID()}] Auth module deployed`);

                }catch(err){
                    Logger.error(err.stack);
                    throw AuthenticationModuleException.AUTH_MODULE_DEPLOY_FAILURE(mods[i],orgs[k]);
                }
            }

            if(strats.all.length>0){
                this.serveLoginEP(pApp, this._getOrgAuthLongLoginRoute(basePath,orgs[k]), orgs[k], hasLocalAuth);
                this.serveLoginEP(pApp, this._getOrgAuthShortLoginRoute(basePath,orgs[k]), orgs[k], hasLocalAuth);
            }
        }

        // check if there is not auth module configures (no orgs)
        if(orgs.length==0){
            // when there is not AuthModule yet configured
            this._setupNoOrgRoutes(pApp);
            // todo : add API Key auth
            this.serveHubLoginEP(pApp, basePath, pCfg.local);
        }
    }

    private _getActiveStrategies(pOrg:OrganizationUnit):string[] {
        const str:string[] = [];
        pOrg.getAuthModules().map(x => {
            if(x.active){
                str.push(`${x.type}_${pOrg.getUID()}_${x.getUID()}`)
            }
        });
        return str;
    }

    private _setupNoOrgRoutes(pApp:Application|Router) {
        // default configuration
        if(this.isSsoEnabled()){
            this._setupLegacyOidcStrategy(pApp);
        }
        if(this.settings.isLocalAuthEnabled()){
            this._setupLocalStrategy(pApp)
        }
    }


    /**
     *
     * @private
     */
    private async _setupOidcStrategy(pApp:Application|Router, pBasePath:string, pAuthModule:OidcAuthModule, pOrg:OrganizationUnit, pState:Nullable<LoadedAuthModule>=null):Promise<LoadedAuthModule>{

        let state = pState;

        if(state==null){
            state = new LoadedAuthModule(pAuthModule,pOrg);
            state.updateGateEndpoint(this._getOrgAuthEndpointRoute(pOrg));
            state.updateGateFailure(this._getOrgAuthLongLoginRoute(pBasePath,pOrg));
            state.updateGateSuccess(this._getOrgHomeLongRoute(pBasePath,pOrg));
            state.updateExtra({
                discoverUri: pAuthModule.getDiscoverUri(),
                callbackURI: pAuthModule.getCallbackURL('/api-auth/cb',pOrg),
                clientID: pAuthModule.getClientID(),
            });
        }else {
            // trigger update
        }

        try{
            // TODO : only if discover URI is set
            const issuer = await Issuer.discover( state.getExtra().discoverUri);

            state.updateExtra({
                authorizationURL: issuer.authorization_endpoint,
                tokenURL: issuer.token_endpoint,
                userInfoURL: issuer.userinfo_endpoint,
                passReqToCallback: true
            });

            const cfg ={
                issuer: state.getExtra().discoverUri,

                // credentials
                clientID: state.getExtra().clientID,
                clientSecret: pAuthModule.getClientSecret(),

                // provider API endepoints
                authorizationURL: state.getExtra().authorizationURL,
                tokenURL: state.getExtra().tokenURL ,
                userInfoURL: state.getExtra().userInfoURL,

                // callback URI must be unique for org and auth module
                callbackURL: state.getExtra().callbackURI,

                passReqToCallback: true
            };


            // this creates the strategy toi authenticate using oidc
            passport.use(state.getUUID(),
                new PassportOIDC(
                    cfg,
                    (vReq, issuer, profile, verified) => {

                        Logger.info(`[AUTH SERVICE][type=${pAuthModule.type}][org=${pOrg.getUID()}][mod=${pAuthModule.getUID()}] Start OIDC verifying ...`);

                        const acc = new UserAccount({
                            _uid: pOrg.getUID()+UA_UUID_SEP+profile.id,
                            _person: new Person({
                                _lastname: profile.name.familyName,
                                _firstname: profile.name.givenName,
                            }),
/*
                            _role: this._ctx.getAclManager().getRole(
                                AccessControlManager.BUILT_IN_DEFAULT_ROLE
                            ),
                            _roles: [AccessControlManager.BUILT_IN_DEFAULT_ROLE],*/
                            // TODO : employee ID
                            // TODO : email , ...
                            _username: profile.username
                        });

                        acc.addMembership(pOrg.getUID(), {
                            activated: false,
                            _activateDate: -1,
                            locked: false,
                            _lockDate: -1,
                            preferences: {},
                            roles: []
                        });

                        this._ctx.getUserService().find(acc, {
                            autoCreate: true,
                            type: UserAccountType.FEDERATED,
                            org: pOrg
                        }).then((vAccount: Nullable<UserAccount>) => {
                            Logger.info(`[AUTH SERVICE][type=${pAuthModule.type}][org=${pOrg.getUID()}][mod=${pAuthModule.getUID()}] Account verified ... `);


                            if (vAccount != null) {
                                (vReq.session as UserSession).setUserAccount(vAccount);
                                (vReq.session as UserSession).passport.user = vAccount;
                                (vReq.session as UserSession).addData('org',pOrg.getUID());
                                (vReq.session as UserSession).save(()=>{
                                    verified(null, vAccount);
                                });
                                //verified(null, vAccount);
                            } else {
                                Logger.error(`[AUTH SERVICE][type=${pAuthModule.type}][org=${pOrg.getUID()}][mod=${pAuthModule.getUID()}] User account cannot be found and or created.`);
                                verified("OIDC : User account cannot be created.", null);
                            }
                        });
                    }
                )
            );


            (pApp as Application).get(state.getExtra().callbackURI,
                passport.authenticate(state.getUUID(), {
                    successMessage: true,
                    failureMessage:true,
                    failureRedirect: state.getFailureEndpoint(),
                    successReturnToOrRedirect: state.getSuccessEndpoint()
                }));
        }catch(err){
            Logger.error(`[AUTH SERVICE][type=${pAuthModule.type}][org=${pOrg.getUID()}][mod=${pAuthModule.getUID()}] Cannot setup strategy ${state.getUUID()}`);
            Logger.error(err.stack)
        }

        return state;
    }



    /**
     *
     * @private
     */
    private _setupLegacyOidcStrategy(pApp:Application|Router){
        if(this.sso_need_config) {
            this.sso_need_config = false;

            // this creates the strategy toi authenticate using oidc
            passport.use(
                new PassportOIDC(
                    {
                        issuer: this._oidClientCfg.settings.discoverUri,
                        authorizationURL: this._oidClientCfg.issuer.authorization_endpoint,
                        tokenURL: this._oidClientCfg.issuer.token_endpoint,
                        userInfoURL: this._oidClientCfg.issuer.userinfo_endpoint,
                        clientID: this._oidClientCfg.settings.client_id,
                        clientSecret: this._oidClientCfg.settings.client_secret,
                        callbackURL: this._oidClientCfg.settings.redirect_uris[0],
                        passReqToCallback: true
                    },
                    (req, issuer, profile, verified) => {

                        Logger.info("[AUTH SERVICE] Start OIDC verifying ...");


                        const acc = new UserAccount({
                            _uid: profile.id,
                            _person: new Person({
                                _lastname: profile.name.familyName,
                                _firstname: profile.name.givenName,
                            }),

                            _role: this._ctx.getAclManager().getRole(
                                AccessControlManager.BUILT_IN_DEFAULT_ROLE
                            ),
                            _roles: [AccessControlManager.BUILT_IN_DEFAULT_ROLE],
                            // TODO : employee ID
                            // TODO : email , ...
                            _username: profile.username
                        });

                        this._ctx.getUserService().find(acc, {
                            autoCreate: true,
                            type: UserAccountType.FEDERATED
                        }).then((vAccount: Nullable<UserAccount>) => {
                            Logger.debug("OIDC Verifiying > ", vAccount!=null?vAccount.getUID():'null');

                            if (vAccount != null) {
                                verified(null, acc);
                            } else {
                                Logger.error("OIDC : User account cannot be found and or created.");
                                verified("OIDC : User account cannot be created.", null);
                            }
                        });
                    }
                )
            );


            (pApp as Application).get('/api-auth/cb',
                passport.authenticate('openidconnect', {
                    successMessage: true,
                    failureMessage:true,
                    failureRedirect: '/login',
                    successReturnToOrRedirect: '/home/', // NEW
                })/*,
                (req, res, next) => {


                    Logger.info("SSO : /api-auth/callback : auth callback");
                    // depend of original request
                    res.redirect('/home/');
                }*/);

        }
    }

    _getOrgAuthEndpointBaseRoute(pOrg:OrganizationUnit):string {
        return  `/auth/login/${pOrg.getUID()}/`;
    }

    _getOrgAuthEndpointRoute(pOrg:OrganizationUnit):string {
        return  `/auth/login/${pOrg.getUID()}/:antiReplayID`;
    }

    _getOrgAuthVerifyRoute(pOrg:OrganizationUnit):string {
        return  `/auth/verify/${pOrg.getUID()}`;
    }

    _generateOrgAuthFormRoute(pOrg:OrganizationUnit, pAntiReplayToken:string):string {
        return  (process.env.DXC_REL_PATH!=undefined&&process.env.DXC_REL_PATH!="" ? process.env.DXC_REL_PATH : '')+`/auth/login/${pOrg.getUID()}/${pAntiReplayToken}`;
    }


    _getOrgAuthLongLoginRoute(pBase:string, pOrg:OrganizationUnit):string {
        return pBase+'/org/'+pOrg.getUID();
    }

    _getOrgAuthShortLoginRoute(pBase:string, pOrg:OrganizationUnit):string {
        return pBase+'/'+pOrg.name;
    }


    _getOrgHomeLongRoute(pBase:string, pOrg:OrganizationUnit):string {
        return  `/home/?org=${pOrg.getUID()}`;
    }


    /**
     * Setup local authentication, and authentication endpoint
     *
     * @param pApp
     * @param pCfg
     * @private
     */
    private _setupLocalAuthStrategy(pApp:Application|Router, pBasePath:string, pModule:AuthModule, pOrg:OrganizationUnit, pState:Nullable<LoadedAuthModule> = null):LoadedAuthModule {

        let state = pState;

        if(state==null){
            state = new LoadedAuthModule(pModule,pOrg);
            state.updateGateEndpoint(this._getOrgAuthEndpointRoute(pOrg));
            state.updateGateFailure(this._getOrgAuthLongLoginRoute(pBasePath,pOrg));
            state.updateGateSuccess(this._getOrgHomeLongRoute(pBasePath,pOrg));
        }else {
            // trigger update
        }


        const str = new LocalStrategy(
            {
                passReqToCallback: true
            },
            (vReq, vUsername:string, vPasswd:string, vVerifiedCB:any)=> {
                ((this.newPasswordAuthenticator()
                    .doAuthentication(vUsername,vPasswd,pOrg.getUID()))  as Promise<AuthenticationResult>)
                    .then((vAuthRes)=>{
                        if(vAuthRes._success){
                            (vReq.session as UserSession).setUserAccount(vAuthRes.getAccount());
                            (vReq.session as UserSession).passport.user = vAuthRes.getAccount();
                            (vReq.session as UserSession).addData('org',pOrg.getUID());
                            (vReq.session as UserSession).save(()=>{
                                vVerifiedCB.apply(null, [null, vAuthRes.getAccount(), vAuthRes]);
                            });
                            //vVerifiedCB.apply(null, [null, vRes.getAccount(), vRes]);
                        }else{
                            vVerifiedCB.apply(null, [null, null, vAuthRes]);
                        }
                    },(err)=>{
                        vVerifiedCB.apply(null, [err, null, null]);
                    }).catch((err)=>{
                    vVerifiedCB.apply(null, [err, null, null]);
                })
            }
        );
        passport.use(state.getUUID(), str);

        (pApp as Application).post(
            state.getAuthEndpoint(),
            BodyParser.urlencoded({ extended: false }),
            passport.authenticate(state.getUUID(), {
                successMessage: true,
                failureMessage:true,
                failureRedirect: state.getFailureEndpoint(),
                successReturnToOrRedirect: state.getSuccessEndpoint(),
            })
        );

        Logger.info(`[AUTH SERVICE][org=${pOrg.getUID()}][mod=${pModule.getUID()}] Serve local auth over ${state.getAuthEndpoint()}`);

        return state;
    }


    /**
     * Setup local authentication, and authentication endpoint
     *
     * @param pApp
     * @param pCfg
     * @private
     */
    private _setupPasswordlessAuthStrategy(pApp:Application|Router, pBasePath:string, pModule:AuthModule, pOrg:OrganizationUnit, pState:Nullable<LoadedAuthModule> = null):LoadedAuthModule {

        let state = pState;

        if(state==null){
            state = new LoadedAuthModule(pModule,pOrg);
            state.updateGateEndpoint(this._getOrgAuthEndpointRoute(pOrg));
            state.updateGateFailure(this._getOrgAuthLongLoginRoute(pBasePath,pOrg));
            state.updateGateSuccess(this._getOrgHomeLongRoute(pBasePath,pOrg));
        }else {
            // trigger update
        }


        const str = new LocalStrategy(
            {
                passReqToCallback: true
            },
            (vReq, vUsername:string, vPasswd:string, vVerifiedCB:any)=> {
                ((this.newPasswordAuthenticator()
                    .doAuthentication(vUsername,vPasswd,pOrg.getUID()))  as Promise<AuthenticationResult>)
                    .then((vAuthRes)=>{
                        if(vAuthRes._success){
                            (vReq.session as UserSession).setUserAccount(vAuthRes.getAccount());
                            (vReq.session as UserSession).passport.user = vAuthRes.getAccount();
                            (vReq.session as UserSession).addData('org',pOrg.getUID());
                            (vReq.session as UserSession).save(()=>{
                                vVerifiedCB.apply(null, [null, vAuthRes.getAccount(), vAuthRes]);
                            });
                            //vVerifiedCB.apply(null, [null, vRes.getAccount(), vRes]);
                        }else{
                            vVerifiedCB.apply(null, [null, null, vAuthRes]);
                        }
                    },(err)=>{
                        vVerifiedCB.apply(null, [err, null, null]);
                    }).catch((err)=>{
                    vVerifiedCB.apply(null, [err, null, null]);
                })
            }
        );
        passport.use(state.getUUID(), str);

        (pApp as Application).post(
            state.getAuthEndpoint(),
            BodyParser.urlencoded({ extended: false }),
            passport.authenticate(state.getUUID(), {
                successMessage: true,
                failureMessage:true,
                failureRedirect: state.getFailureEndpoint(),
                successReturnToOrRedirect: state.getSuccessEndpoint(),
            })
        );

        Logger.info(`[AUTH SERVICE][org=${pOrg.getUID()}][mod=${pModule.getUID()}] Serve local auth over ${state.getAuthEndpoint()}`);

        return state;
    }


    /**
     * Setup local authentication, and authentication endpoint
     *
     * @param pApp
     * @param pCfg
     * @private
     */
    private _setupLocalStrategy(pApp:Application|Router):void {

        passport.use(new LocalStrategy(
            {
                passReqToCallback: true
            },
            (vReq, vUsername:string, vPasswd:string, vVerifiedCB:any)=> {
                ((this.newPasswordAuthenticator()
                    .doAuthentication(vUsername,vPasswd))  as Promise<AuthenticationResult>)
                    .then((vRes)=>{
                        if(vRes._success){
                            (vReq.session as UserSession).setUserAccount(vRes.getAccount());
                            (vReq.session as UserSession).save((err)=>{
                                if(!err){
                                    vVerifiedCB.apply(null, [null, vRes.getAccount(), vRes]);
                                }else{
                                    vVerifiedCB.apply(null, [err, null, null]);
                                }
                            })
                        }else{
                            vVerifiedCB.apply(null, [null, null, vRes]);
                        }
                    },(err)=>{
                        vVerifiedCB.apply(null, [err, null, null]);
                    }).catch((err)=>{
                    vVerifiedCB.apply(null, [err, null, null]);
                })
            }
        ));

        (pApp as Application).post(
            '/auth/hub/login/:antiReplayID',
            BodyParser.urlencoded({ extended: false }),
            passport.authenticate('local', {
                successMessage: true,
                failureMessage:true,
                failureRedirect: '/login',
                successReturnToOrRedirect: '/home/', // NEW
            })
        );
    }



    hasHubLoginPage():boolean {
        return this._hubpage;
    }

    /**
     * To deploy routes and middleware required to check sso token
     *
     * This method is called only whe an OIDC client is configured
     *
     * @param pApp
     * @method
     */
    serveLoginEP( pApp:Application|Router, pRoute:string, pOrg:Nullable<OrganizationUnit>, pLocalAuth:boolean):void {


        Logger.info(`[AUTH SERVICE][org=${pOrg.getUID()}] Serve login page over ${pRoute}`);
        (pApp as Application).get(pRoute,
            (kReq:any,kRes:any,kNext:any)=>{
                if(kReq.session !=null){
                    const o = (kReq.session as UserSession).getData('org');
                    if(o != null && OrganizationUnit.VALIDATE.uuid.test(o)){
                        kRes.status(200).redirect((process.env.DXC_REL_PATH!=null?process.env.DXC_REL_PATH:'')+`/home/?org=${o}`);
                        return;
                    }
                }

                kNext.apply(null);
            },
            (req, res, next) => {

                // TODO : make CORS parameter as env var
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS, PUT');
                res.set('Access-Control-Allow-Headers', 'Content-Type, authorization');

                let mode = null;
                if(req.query.mode!=null){
                    mode = req.query.mode;
                }

                if((req as any).dxc==null){
                    (req as any).dxc = {};
                }
                (req as any).dxc.org = pOrg;

                Logger.info(`[AUTH SERVICE][PIPE][${req.path}][ip=${req.ip}][mode=${mode}][org=${pOrg.getUID()}] /login `);
                 // check if there are local active user account with authorized IPs
                 // Home page should display : username/passwd based auth or SSO auth
                 // check if SSO is configured

                if(mode=='sso'){
                    //if(this.isSsoEnabled){
                        passport.authenticate(this._getActiveStrategies(pOrg))(req,res,next);
                    /*}else{
                        res.status(200);
                        res.send("Access denied");
                        return;
                    }*/

                }else{

                    if((pOrg.hasLocalAuth() || this.settings.isLocalAuthEnabled()  || pLocalAuth)
                            && this.settings.getAuthorizedIPs().indexOf(req.ip)>-1){
                        this.serveLoginPage(req,res,next);
                        return;
                    }

                    // else check if there
                    // check if it comes from globally authorized IPs
                    /*if((this.settings.isLocalAuthEnabled() || pLocalAuth)
                        && this.settings.getAuthorizedIPs().indexOf(req.ip)>-1){
                        this.serveLoginPage(req,res,next);
                        return;
                    }*/
                    else if(this.isSsoEnabled()){
                        passport.authenticate(this._getActiveStrategies(pOrg))(req,res,next);
                    }else{
                        res.status(200);
                        res.send("Access denied");
                        return;
                    }
                }
            });
    }


    /**
     * To deploy routes and middleware required to check sso token
     *
     * This method is called only whe an OIDC client is configured
     *
     * @param pApp
     * @method
     */
    serveHubLoginEP( pApp:Application|Router, pRoute:string, pLocalAuth:boolean):void {

        this._hubpage = true;

        (pApp as Application).get(pRoute,
            (req, res, next) => {

                // TODO : make CORS parameter as env var
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS, PUT');
                res.set('Access-Control-Allow-Headers', 'Content-Type, authorization');

                let mode = null;
                if(req.query.mode!=null){
                    mode = req.query.mode;
                }

                if((req as any).dxc==null){
                    (req as any).dxc = {};
                }

                Logger.info(`[AUTH SERVICE][PIPE][${req.path}][ip=${req.ip}][mode=${mode}] /login `);
                // check if there are local active user account with authorized IPs
                // Home page should display : username/passwd based auth or SSO auth
                // check if SSO is configured

                if(mode=='sso'){
                    if(this.isSsoEnabled()){
                        passport.authenticate('openidconnect')(req,res,next);
                    }else{
                        res.status(200);
                        res.send("Access denied");
                        return;
                    }

                }else{
                    // else check if there
                    // check if it comes from globally authorized IPs
                    if((this.settings.isLocalAuthEnabled() || pLocalAuth)
                        && this.settings.getAuthorizedIPs().indexOf(req.ip)>-1){
                        this.serveLoginPage(req,res,next);
                        return;
                    }
                    else if(this.isSsoEnabled()){
                        passport.authenticate('openidconnect')(req,res,next);
                    }else{
                        res.status(200);
                        res.send("Access denied");
                        return;
                    }
                }
            });
    }


    async isOrgSupportsPasswordless(pOUID:OrganizationUnitUUID):Promise<boolean> {

        const org = await this.userSvc._ctx.getOrgManager()
                                                .getOrganization(this.userSvc._ctx.getInternalAcc(), pOUID);
        const am = org.getAuthModuleByType(AuthModuleType.PASSWORDLESS);

        return (am!=null) && (am.active);
    }

    serveLoginPage( pReq:any, pRes:any, pNext:any):void {

        ( async ( vReq:any, vRes:any, vNext:any)=>{

            let loginPage = 'index.html';
            let passwordless = false;

            if((vReq as any).dxc.org!=null){

                if(await this.isOrgSupportsPasswordless((vReq as any).dxc.org.getUID())){
                    loginPage = 'index_pwdl.html';
                    passwordless = true;
                }

            }

            let page = _fs_.readFileSync(
                _path_.join(
                    Util.__dirname(import.meta.url),'..','..','..', 'assets', 'login', loginPage
                ), {
                    encoding: 'utf-8'
                }
            ).toString();

            // context
            const context:PasswordFormContext = {
                replayUID: randomUUID(),
                usernameField: randomUUID(),
                pwdField: randomUUID(),
                csrfField: randomUUID(),
                csrfToken: randomUUID(),
            };

            const sess:UserSession = (vReq as any).session;
            let forms:Record<string, any> = sess.getData('forms');

            if(forms==null){
                forms = {};
            }

            forms[context.replayUID] = context;

            ((vReq as any).session as UserSession).addData('forms',forms);

            // replace tokens in page chunk
            page = page.replaceAll('@@_ANTI_REPLAY_ENDPOINT_@@',context.replayUID);
            if((vReq as any).dxc.org!=null){
                page = page.replaceAll('@@_AUTH_FORM_ENDPOINT_@@', this._generateOrgAuthFormRoute((vReq as any).dxc.org, context.replayUID)+(passwordless?'/pwdl':''));
            }else{
                page = page.replaceAll('@@_AUTH_FORM_ENDPOINT_@@', (process.env.DXC_REL_PATH!=undefined&&process.env.DXC_REL_PATH!="" ? process.env.DXC_REL_PATH : '')+'/auth/hub/login/'+context.replayUID);
            }
            page = page.replaceAll('@@_FORM_USERNAME_@@',context.usernameField);
            page = page.replaceAll('@@_FORM_PASSWORD_@@',context.pwdField);
            page = page.replaceAll('@@_CSRF_TOKEN_NAME_@@',context.csrfField);
            page = page.replaceAll('@@_CSRF_TOKEN_VAL_@@',context.csrfToken);


            vRes.setHeader('content-type', 'text/html; charset=utf-8');
            vRes.status(200);
            vRes.write(page, ()=>{
                vRes.send();
                return;
            });
            return;
        })(pReq,pRes,pNext);

    }


    serveLoginSsoOnlyPage( vReq:any, vRes:any, vNext:any):void {


        let page = _fs_.readFileSync(
            _path_.join(
                Util.__dirname(import.meta.url),'..','..','..', 'assets', 'login', 'index_noauth.html'
            ), {
                encoding: 'utf-8'
            }
        ).toString();


        // replace tokens in page chunk
        //page = page.replaceAll('@@_CSRF_TOKEN_VAL_@@',context.csrfToken);


        vRes.status(200);
        vRes.write(page, ()=>{
            vRes.send();
            return;
        });
        return;
    }



    async testSsoConnection( pConnSettings:SsoOptions):Promise<any> {
        let res:any = {success:false, msg:null};
        try {
            const issuer = await Issuer.discover(pConnSettings.discoverUri);

            //Logger.debugRAW(issuer);
            const _oidClientCfg = {
                issuer: issuer,
                settings: {
                    discoverUri: pConnSettings.discoverUri,
                    client_id: pConnSettings.clientId,
                    client_secret: pConnSettings.clientSecret,
                    redirect_uris: this.settings.getOidcRedirectUris(),
                    post_logout_redirect_uris: this.settings.getOidcLogoutUris(),
                    response_types: this.settings.getOidcResponseType()
                },
                extra: {
                    authorizationURL: issuer.authorization_endpoint,
                    tokenURL: issuer.token_endpoint,
                    userInfoURL: issuer.userinfo_endpoint
                }
            };

            res.success = (issuer!=null)
                            && (_oidClientCfg.extra.authorizationURL!=null)
                            && (_oidClientCfg.extra.tokenURL!=null)
                            && (_oidClientCfg.extra.userInfoURL!=null);

        }catch(err){
            Logger.error(err.stack);
            res.msg = err.message;
            res.success = false;
        }

        return res;
    }

    /**
     * To deploy or redeploy dynamically an auth module after changes
     *
     * Only active module can be deployed.
     *
     * @param {AuthModule} pModule
     */
    async deployAuthModule(pApp:Application|Router, pBasePath:string, pModule:AuthModule,pOrg:OrganizationUnit):Promise<LoadedAuthModule> {

        let currState:Nullable<LoadedAuthModule> = null;

        if(pModule.active!==true){
            throw  AuthenticationModuleException.MODULE_NOT_ACTIVE(pModule,pOrg);
        }

        // check if the module is currently loaded
        currState = this._loadedModules[LoadedAuthModule.generateStratUUID(pModule,pOrg)];
        /*if(currState==null){
            currState = new LoadedAuthModule(pModule,pOrg);
        }*/

        switch (pModule.type) {
            case AuthModuleType.LOCAL_PASSWD:
                currState = this._setupLocalAuthStrategy(pApp, pBasePath, pModule as LocalAuthModule, pOrg, currState);
                break;
            case AuthModuleType.OIDC:
                currState = await this._setupOidcStrategy(pApp, pBasePath, pModule as OidcAuthModule, pOrg, currState);
                break;
            case AuthModuleType.PASSWORDLESS:
                currState = (pModule as PasswordlessAuthModule).setupAuthStrategy(this, pApp,pBasePath, pOrg, currState);
                //currState = await this._setupOidcStrategy(pApp, pBasePath, pModule as OidcAuthModule, pOrg, currState);
                break;
            /*case AuthModuleType.APIKEY:
                currState = await this._setupOidcStrategy(pApp, pBasePath, pModule as OidcAuthModule, pOrg, currState);
                break;
            case AuthModuleType.PASSWORDLESS:
                currState = await this._setupOidcStrategy(pApp, pBasePath, pModule as OidcAuthModule, pOrg, currState);
                break;*/
            default:
                throw  AuthenticationModuleException.MODULE_NOT_SUPPORTED(pModule,pOrg);
        }

        return currState;
    }

    async sendPasswordlessAuthMail(
                    pAccount: UserAccount, pVerifiedEmail:string,
                    pOrg:OrganizationUnitUUID,  pToken: string,
                    pTokenTTL:number, pAntiReplayID:string):Promise<boolean> {

        const link = `${process.env.DXC_SCHEMA!=null?process.env.DXC_SCHEMA:'http'}://${process.env.DXC_HOSTNAME!=null?process.env.DXC_HOSTNAME:'127.0.0.1:8080'}/auth/verify/${pOrg}?token=${encodeURIComponent(pToken)}&ar=${pAntiReplayID}`;

        return await this.getUserService().emailSender.sendPreparedMail(
            pVerifiedEmail,
            OrganizationEmailBuilder.buildPasswordlessAuthEmail(pAccount, link, pTokenTTL)
        );
    }

    /**
     *
     * @param user
     * @param ip
     */
    async generateWsAuthTicket(user: UserAccount, ip: string):Promise<string> {
        const tok = await this.getUserService().createAccountToken(user, {
            ttl: 24*60*60*1000,
            purpose: TokenPurpose.WS_AUTH_TICKET,
            token: Buffer.from(CryptoUtils.randomChunk(64)).toString('base64')
        });

        await this.getUserService().updateTokens(user);

        this._ctx.getWebsocketServer().addSession(user.getUID(), tok);
        return tok;
    }

}