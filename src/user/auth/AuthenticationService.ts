import * as _fs_ from 'fs';
import got, {Options} from "got";
const GOT = got.default;

import {AuthCode, AuthenticationException, Authenticator, AuthType} from "./AuthTypes.js";
import {AuthenticationPolicy} from "./AuthenticationPolicy.js";
import {PasswordAuthenticator} from "./Authenticator.js";
import {ConnectorFactory} from "../../ConnectorFactory.js";
import {UserAccount} from "../UserAccount.js";
import {AuthenticationSettings} from "./AuthenticationSettings.js";
import AccessControl from "../acl/AccessControl.js";
import {IDatabase, IDatabaseAdapter, IDbCollection, IDbIndex} from "../../persist/orm/DbAbstraction.js";
import * as Log from "../../Logger.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {NodeProperty} from "../../persist/orm/NodeProperty.js";
import passport from "passport";
import * as _openidconnect_ from 'passport-openidconnect';


import {Application, Router} from 'express';
import {Issuer} from "openid-client";
import expressSession from "express-session";
import {Person} from "../Person.js";
import {ConnectionHandler} from "../../remote/ConnectionHandler.js";
import {DelegateRequest, DelegateResponse} from "../../webapi/DelegateWebApi.js";
import {UserSession} from "../session/UserSession.js";
import {Nullable} from "../../core/IStringIndex.js";

const PassportOIDC = _openidconnect_.default;

interface UserCache {
    [username:string] :UserAccount;
}

let Logger:Log.Logger = Log.newLogger() as Log.Logger;



export class AuthenticationService {

    settings:AuthenticationSettings;

    policy:AuthenticationPolicy;

    _users:IDbCollection;
    _cache:UserCache = {};
    _dba:IDatabaseAdapter = null;

    // create use into local db automatically on authentication success
    private _autoCreateOnSuccess = true;

    private _ctx:DexcaliburEngine = null;
    private _sso_enabled = false;
    private _oidClientCfg:any = {};

    constructor( pSettings:AuthenticationSettings, pContext:DexcaliburEngine = null) {
        this.settings = pSettings;
        this._ctx = pContext;
        this.policy = new AuthenticationPolicy(pSettings);

        // make it dependent of settings : local user DB vs remote ID provide
        this.initUserDB();

    }

    /**
     * To init SSO
     *
     */
    async init(){

        if(this.settings.hasOidcSettings()){
            const issuer = await Issuer.discover(this.settings.getOidcDiscoverURI());

            Logger.debugRAW(issuer);
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
    /*
     * To init (local sqlite-based) user database
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
    initUserDB():void{

        if(this.settings==null || this.settings.db ==null){
            throw new AuthenticationException("Authentication is not configured", AuthCode.NOT_CONFIGURED)
        }

        this._dba = ConnectorFactory.getInstance().newConnector(
            this.settings.db.dbms, // inmemory / sqlite / neo4j
            null,
            {
                user: this.settings.db.user,
                pwd: this.settings.db.pwd,
                port: this.settings.db.port,
                uri: this.settings.db.uri
            }
        ) as IDatabaseAdapter;

        let db:IDatabase;
        try{
            this._dba.connect(this.settings.db.uri);
            db = this._dba.getDB();
        }catch(e){
            console.log(e.message,e.stack);
        }


        // import temporary DB after a fresh install
        if(_fs_.existsSync(this.settings.db.uri)==false){
            if(_fs_.existsSync(this.settings.db.uri+".temp")==true){
               console.log(
                    JSON.parse(_fs_.readFileSync(this.settings.db.uri+".temp", {encoding:'utf8'}))
                );
                // during import, there is no backup of current user DB
                this.save(false);
            }else{
                // create en empty DB
                this._users = db.newCollection('users', UserAccount.TYPE);
                this.save(false);
            }
        }else{
            this.importUsers(db.getCollection('user', UserAccount.TYPE));
        }

    }

    /**
     * To load user account from the default local User DB
     *
     * @param pDBMS
     */
    importUsers( pColl:IDbCollection){
        this._users = pColl;
        this._users.map( (o,v:UserAccount) => {

            Logger.info('---- Wakeup user --- ');
            this.wakeUpUser(v)

            if(v.role == null){
                v.role = AccessControl.defaultRole;

                // update
                Logger.debug('---- Update user role --- ');
                this._users.updateEntry(v); //.getUID(), v);
            }

            this._cache[v.getUID()] = v;

            Logger.debug('---- import next user --- ');

            /*
            if(this._dba.getType()=='inmemory'){
                this._users.setEntry(o, new UserAccount(v));
            }else{
                this._users.update(o, new UserAccount(v));
            }*/
        });
    }

    wakeUpUser(pUser:UserAccount):void {
        const ppt:NodeProperty[] = UserAccount.TYPE.getProperties();
        ppt.map( vP => {
      //      if(vP.hasWakeUp()){
    //            pUser[vP.getName()] = vP.doWakeUp({ p:pUser[vP.getName()], self:pUser, ctx:this._ctx });
        //    }
        })
    }



    sleepUser(pData:any):any {
        const ppt:NodeProperty[] = UserAccount.TYPE.getProperties();
        ppt.map( vP => {
       //     if(vP.hasSleep()){
         //       pData[vP.getName()] = vP.doSleep({ p:pData[vP.getName()], self:pData, ctx:this._ctx });
           // }
        })
    }

    getUserIndex():IDbCollection {
        return this._users;
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

    flushCache(){
        this._cache = {};
    }

    // todo replace

    findUser( pUsername:string):UserAccount {
        let usr:UserAccount = null;

        if(pUsername==null || pUsername.length==0){
            throw new AuthenticationException("Username cannot be empty", AuthCode.EMPTY_USERNAME);
        }

        if(this._cache[pUsername]!=null){
            return this._cache[pUsername];
        }

        //let d:string = "";
        this._users.map(function(vO, vUsr){
            //d += vUsr.username+", ";
            if(vUsr.hasUsername(pUsername)){
                usr = vUsr;
            }
        });

        if(usr == null){
            throw new AuthenticationException("Username not found : "+pUsername, AuthCode.INVALID_USERNAME);
        }

        return usr;
    }


    findUserByUID( pUID:string):UserAccount {
        let usr:UserAccount = null;

        if(pUID==null || pUID.length==0){
            throw new AuthenticationException("Username cannot be empty", AuthCode.EMPTY_USERNAME);
        }

        if(this._cache[pUID]!=null){
            return this._cache[pUID];
        }

        //let d:string = "";
        this._users.map(function(vO, vUsr){
            //d += vUsr.username+", ";
            if((vUsr as UserAccount).getUID() === pUID){
                usr = vUsr;
            }
        });

        if(usr == null){
            throw new AuthenticationException("Username not found : "+pUID, AuthCode.INVALID_USERNAME);
        }

        return usr;
    }

    isSsoEnbaled():boolean {
        console.log("isSsoEnbaled > ", this._sso_enabled)
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
    /**
     * To deploy routes and middleware resuired to check sso token
     *
     * This method is called only whe an OIDC client is configured
     *
     * @param pApp
     * @method
     */
    protectRoutesWithSSO( pApp:Application|Router):void {

        pApp.use(
            expressSession({
                secret: 'another_long_secret',
                resave: false,
                saveUninitialized: true,
                store: new expressSession.MemoryStore() // TODO : replace by remote store
            })
        );


        pApp.use(passport.initialize());
        pApp.use(passport.session());

        // add authentication using serialized sessions
        pApp.use(passport.authenticate('session'));

        if(this.sso_need_config){
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
                        callbackURL:  this._oidClientCfg.settings.redirect_uris[0],
                        passReqToCallback: true
                    },
                    (req, v, userinfo, done) => {


                        // Important : Only executed on /api-auth/cb

                        const userSvc = this._ctx.getUserService();
                        let usr:UserAccount;
                        try{
                            Logger.debug("Search logged user : "+userinfo.username);
                            usr = this.findUser(userinfo.username);

                            Logger.debug("Found user : "+usr.getUID());

                            if(userinfo.dxc == null) userinfo.dxc = {};
                            const sess =  userSvc.createSession(usr);
                            userinfo.dxcSessID = sess.getSessUID();
                            //req.dxc.sess = userSvc.createSession(usr);

                            // req.dxc.sess.addConnection( param.getName(), new ConnectionHandler(param) );

                            /*res.cookie(
                                $.context.getUserService().getCookieName(),
                                req.dxc.sess.getSessUID(),
                                { maxAge: 7*24*60 } //, expires: new Date().  }
                            );*/

                            /*if(req.c){
                                // usr is already authenticated on another computer/browser
                            }else{
                                if(req.dxc==null) req.dxc = {};
                                req.dxc.sess = userSvc.createSession(usr);
                            }*/

                            // TODO : update with local project
                        }catch(err){
                            Logger.error(err);
                            if(this._autoCreateOnSuccess){

                                Logger.debug("Creating local account for logged user");
                                const prs = new Person();
                                prs.firstname = userinfo.name.givenName;
                                prs.lastname = userinfo.name.familyName;

                                usr = new UserAccount({
                                    _uid: userinfo.id,
                                    _username: userinfo.username,
                                    _person: prs,
                                    _password: "-",
                                    _salt: "-",
                                    _padding: "-"
                                });

                                this._users.setEntry(usr.getUID(), usr);
                                this.save(false);

                                // userSvc.createSession(usr);
                                //if(req.dxc==null) req.dxc = {};
                                //req.dxc.sess = userSvc.createSession(usr);

                                if(userinfo.dxc == null) userinfo.dxc = {};
                                const sess =  userSvc.createSession(usr);
                                userinfo.dxcSessID = sess.getSessUID();

                            }else{
                                throw new Error("Authenticated user has not acccess to private instance. Private instance must locally authorize remote user");
                            }
                        }


                        // Logique pour vérifier et traiter le token OIDC ici
                        return done(null, userinfo);
                    }
                )
            );

            passport.serializeUser(function(user, done) {
                done(null, user);
            });

            passport.deserializeUser(function(user, done) {
                done(null, user);
            });

            const addCORS = function(req:DelegateRequest, res:DelegateResponse, next:any){

                // TODO : make CORS parameter as env var
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS, PUT');
                res.set('Access-Control-Allow-Headers', 'Content-Type, authorization');

                if(req.url.startsWith('/api/')){
                    res.set('Content-Type', 'text/json');
                }

                req.dxc = {};

                next();
            };


            (pApp as Application).get('/login', addCORS, passport.authenticate('openidconnect'));

            (pApp as Application).get('/api-auth/cb',
                passport.authenticate('openidconnect', { successMessage: true, failureMessage:true, failureRedirect: '/login'}),
                (req, res, next) => {

                    Logger.debugRAW("SSO : /api-auth/callback : auth callback",req, (req as any).session);
                    // depend of original request
                    res.redirect('/home/');
                });

        }
    }


}