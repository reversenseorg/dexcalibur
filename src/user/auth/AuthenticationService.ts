import * as _fs_ from 'fs';
import * as _path_ from 'path';
import got, {Options} from "got";
import {AuthCode, AuthenticationException, Authenticator, AuthType} from "./AuthTypes.js";
import {AuthenticationPolicy} from "./AuthenticationPolicy.js";
import {AuthenticationResult, PasswordAuthenticator} from "./PasswordAuthenticator.js";
import {UserAccount, UserAccountType} from "../UserAccount.js";
import {AuthenticationSettings} from "./AuthenticationSettings.js";
import * as Log from "../../Logger.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {IDatabaseAdapter, IDbCollection} from "@dexcalibur/dexcalibur-orm";

import passport from "passport";
import * as _openidconnect_ from 'passport-openidconnect';


import {Application, Router} from 'express';
import {Issuer} from "openid-client";
import expressSession from "express-session";
import {Person} from "../Person.js";
import {DelegateRequest, DelegateResponse} from "../../webapi/DelegateWebApi.js";
import {Nullable} from "../../core/IStringIndex.js";
import {AccessControlManager} from "../acl/AccessControlManager.js";
import Role from "../acl/common/Role.js";
import WebServer from "../../WebServer.js";
import Util from "../../Utils.js";
import {randomUUID} from "crypto";
import {RuntimeSecurityException} from "../../errors/RuntimeSecurityException.js";
import {UserService} from "../UserService.js";
import * as _bodyparser_ from 'body-parser';
import {LocalStrategy} from "./passport/LocalStrategy.js";
import AccessControl from "../acl/AccessControl.js";
import {AccessZone} from "../acl/Zones.js";

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

export class AuthenticationService {

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

    /**
     *
     */
    newPasswordAuthenticator():Authenticator {
        if(!this.policy.isSupported(AuthType.PASSWORD))
            throw new AuthenticationException('Password-based authentication is not supported');

        return new PasswordAuthenticator(this);
    }


    // todo replace

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

    protectRoutes( pApp:Application|Router, pCfg:{sso:boolean,local:boolean} ):void {

        // session middleware
        pApp.use(
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
        );

        // passport init + session binding
        pApp.use(passport.initialize());
        pApp.use(passport.session());

        passport.serializeUser(function(vUser:UserAccount, done:any) {
            Logger.debug("[AUTH SERVICE][PASSPORT] Passport : serialize user ");
            console.log("serializeUser > ",vUser);
            done(null, vUser.toJsonObject());
        });

        passport.deserializeUser(function(vUser:any, done:any) {
            const user = new UserAccount(vUser);
            Logger.debug("[AUTH SERVICE][PASSPORT] Passport : deserialize user ");
            done(null, user);
        });

        // authentication strategies
        if(this.isSsoEnabled()){
            this._setupOidcStrategy(pApp);
        }

        if(this.settings.isLocalAuthEnabled()){
            this._setupLocalStrategy(pApp)
        }

        // todo : add API Key auth

        this.serveLoginEP(pApp, pCfg.local);
    }

    /**
     *
     * @private
     */
    private _setupOidcStrategy(pApp:Application|Router){
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
                            console.log("OIDC Verifiying > ", vAccount);

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
                            vVerifiedCB.apply(null, [null, vRes.getAccount(), vRes]);
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
            '/auth/login/:antiReplayID',
            BodyParser.urlencoded({ extended: false }),
            passport.authenticate('local', {
                successMessage: true,
                failureMessage:true,
                failureRedirect: '/login',
                successReturnToOrRedirect: '/home/', // NEW
            })
        );
    }

    /**
     * To deploy routes and middleware required to check sso token
     *
     * This method is called only whe an OIDC client is configured
     *
     * @param pApp
     * @method
     */
    serveLoginEP( pApp:Application|Router, pLocalAuth:boolean):void {

        (pApp as Application).get('/login',
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


    serveLoginPage( vReq:any, vRes:any, vNext:any):void {


        let page = _fs_.readFileSync(
            _path_.join(
                Util.__dirname(import.meta.url),'..','..','..', 'assets', 'login', 'index.html'
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
            csrfToken: randomUUID()
        };

        if((vReq as any).session.forms==null){
            (vReq as any).session.forms = {};
        }

        (vReq as any).session.forms[context.replayUID] = context;

        // replace tokens in page chunk
        page = page.replaceAll('@@_ANTI_REPLAY_ENDPOINT_@@',context.replayUID);
        page = page.replaceAll('@@_FORM_USERNAME_@@',context.usernameField);
        page = page.replaceAll('@@_FORM_PASSWORD_@@',context.pwdField);
        page = page.replaceAll('@@_CSRF_TOKEN_NAME_@@',context.csrfField);
        page = page.replaceAll('@@_CSRF_TOKEN_VAL_@@',context.csrfToken);


        vRes.status(200);
        vRes.write(page, ()=>{
            vRes.send();
            return;
        });
        return;
    }


    /**
     * To serve an endpoint to receive password-based authentication
     * @param pEndpointURI
     */
    servePasswordAuthEP(pApp:Application, pEndpointURI:string):void {



        (pApp as Application).post(
            pEndpointURI+'/:antiReplayID',
            BodyParser.urlencoded({ extended: false }),
            passport.authenticate('local', {
                successMessage: true,
                failureMessage:true,
                failureRedirect: '/login',
                successReturnToOrRedirect: '/home/', // NEW
            })/*,
            (req, res, next) => {


                Logger.info("Local auth : authentication success");
                // depend of original request
                res.redirect('/home/');
            })*/);
            /*
            async (vReq, vRes, vNext):Promise<void>=>{

                Logger.info(` [AUTH SERVICE][LOGIN][path=${vReq.path}][ip=${vReq.ip}] Receipt `);

                try{
                    if((vReq as any).session==null || (vReq as any).session.forms==null){
                        throw RuntimeSecurityException.BROKEN_LOGIN_WORKFLOW();
                    }

                    const formCtx = (vReq as any).session.forms[vReq.params['antiReplayID']] as PasswordFormContext;

                    delete (vReq as any).session.forms[vReq.params['antiReplayID']];

                    // check anti-replay token
                    if(formCtx==null){
                        throw RuntimeSecurityException.AUTH_REPLAY_DETECTED(/^[a-f0-9-]+$/.test(vReq.params['antiReplayID'])?vReq.params['antiReplayID']:"...");
                    }


                    // check CSRF token
                    const csrfToken = (vReq as any).body[formCtx.csrfField];
                    if(csrfToken==null){
                        throw RuntimeSecurityException.CSRF_TOKEN_IS_EMPTY("/auth/login/...");
                    }
                    if(csrfToken!==formCtx.csrfToken){
                        throw RuntimeSecurityException.CSRF_TOKEN_IS_WRONG("/auth/login/...");
                    }

                    // perform authentication
                    const authRes = await this.newPasswordAuthenticator().doAuthentication(
                        (vReq as any).body[formCtx.usernameField],
                        (vReq as any).body[formCtx.pwdField]
                    );

                    console.log(authRes);
                    if(authRes._success){

                        // recreate session
                        (vReq as any).session.regenerate((err:any)=>{
                            (vReq as any).session.user = authRes.getAccount();
                        });
                        //(vReq as any).session = new
                        //((vReq as any).session as ExpressSess.destroy();

                        vRes.redirect('/home/');
                    }else{
                        vRes.redirect('/login');
                    }
                    return;
                }catch (err){
                    Logger.error(err.message,err.stack);
                    vRes.redirect('/login');
                    return;
                }

            }*/
    }


    exposeLoginAuthentication(){

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
            console.log(err.message,err.stack);
            res.msg = err.message;
            res.success = false;
        }

        return res;
    }

}