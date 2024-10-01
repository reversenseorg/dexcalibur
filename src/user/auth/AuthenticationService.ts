import * as _fs_ from 'fs';
import got, {Options} from "got";
const GOT = got.default;

import {AuthCode, AuthenticationException, Authenticator, AuthType} from "./AuthTypes.js";
import {AuthenticationPolicy} from "./AuthenticationPolicy.js";
import {PasswordAuthenticator} from "./Authenticator.js";
import {ConnectorFactory} from "../../ConnectorFactory.js";
import {UserAccount, UserAccountUUID} from "../UserAccount.js";
import {AuthenticationSettings} from "./AuthenticationSettings.js";
import AccessControl from "../acl/AccessControl.js";
import * as Log from "../../Logger.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {NodeProperty, IDatabase, IDatabaseAdapter, IDbCollection} from "@dexcalibur/dexcalibur-orm";

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
import {SessionStore} from "../session/SessionStore.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {UserRole} from "../acl/rbac/UserRole.js";
import {ProjectURI} from "../../project/ProjectGlobalUID.js";
import {BUILT_IN_ROLES} from "../acl/Roles.js";

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

        /*
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

        */
       // this.importUsers( this._ctx.getEngineDB().getCollectionOf(UserAccount.TYPE.getType()));
    }

    /**
     * To load user account from the default local User DB
     *
     * @param pDBMS
     */
    importUsers( pColl:IDbCollection){
        this._users = pColl;
        this._users.getAsList(-1).then((vAccounts:UserAccount[])=>{
            vAccounts.map((v) =>{

                if(v.role == null){
                    v.role = AccessControl.defaultRole;
                }

                this._cache[v.getUID()] = v;
            })
        });
        /*
        this._users.map( (o,v:UserAccount) => {

            this.wakeUpUser(v)

            if(v.role == null){
                v.role = AccessControl.defaultRole;

                // update
                Logger.debug('---- Update user role --- ');
                this._users.updateEntry(v); //.getUID(), v);
            }

            this._cache[v.getUID()] = v;

            Logger.debug('---- import next user --- ');

        });*/
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

    /**
     *
     * @param pUsername
     * @deprecated
     */
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
     * To deploy routes and middleware required to check sso token
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
                cookie: {
                  sameSite: false
                },
                store: this._ctx.getUserService().getSessionService().createSessionStore()
                // new expressSession.MemoryStore() // TODO : replace by remote store
            })
        );

        pApp.use(passport.initialize());
        pApp.use(passport.session());

        // add authentication using serialized sessions
        //pApp.use(passport.authenticate('session'));

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
                    (req, issuer, profile, verified) => {

                        Logger.info("[AUTH SERVICE] Start OIDC verifying ...");

                        console.log(profile);

                        const acc = new UserAccount({
                            _uid:profile.id,
                            _person: new Person({
                                _lastname: profile.name.familyName,
                                _firstname: profile.name.givenName,
                            }),
                            _role: AccessControl.getRole('local_admin'),
                            //_role?:UserRole,
                            // TODO : employee ID
                            // TODO : email , ...
                            _username:profile.username
                        });

                        this._ctx.getUserService().find(acc, {autoCreate:true})
                            .then((vAccount:Nullable<UserAccount>)=>{
                                console.log("OIDC Verifiying > ",vAccount);

                                if(vAccount != null){

                                    verified( null, acc);
                                /*
                                    // update sessions
                                    this._ctx.getUserService().getSessionService()
                                        .asyncGetSessionByUID( req.sessionID)
                                        .then(( vSess)=>{

                                            if(vSess !=null){
                                                if(!vSess.getUserAccount().is(vAccount)){
                                                    throw new Error("User session must be unique per user account, unauthorize access detected");
                                                }
                                                if(vSess.getUserAccount()==null){
                                                    verified(null, vAccount);
                                                }else{
                                                    this._ctx.getUserService().getSessionService().save(vSess)
                                                        .then((vSuccess)=>{
                                                            if(vSuccess){
                                                                console.log(vSess,vSess.getUserAccount().person);
                                                                Logger.success("Session updated with user account [sess="+vSess.getUID()+"] ");
                                                                verified(null, vAccount);
                                                            }else{
                                                                Logger.error("Session cannot be updated with user account [sess="+vSess.getUID()+"] ");
                                                            }

                                                        })
                                                        .catch((vErr)=>{
                                                            Logger.error("ERROR : Session cannot be updated : > "+vErr);
                                                        })
                                                }
                                            }else{
                                                Logger.error("Session not found : erroror ");
                                            }
                                        })
                                        .catch(( vErr)=>{
                                            Logger.error("Session not found : fatal error ",vErr);
                                        });*/

                                }else{
                                    Logger.error("OIDC : User account cannot be created.");
                                    verified("OIDC : User account cannot be created.",null);
                                }
                            });

                        //profile.dxcSessID = req.session;

                        //verified(null, profile, {});


                        /*

                        const userSvc = this._ctx.getUserService();
                        // file UserAccount info with data
                        const acc = new UserAccount({
                            _uid:userinfo.id,
                            _person: new Person({
                                _lastname: userinfo.name.familyName,
                                _firstname: userinfo.name.givenName,
                            }),
                            //_role?:UserRole,
                            // TODO : employee ID
                            // TODO : email , ...
                            _username:userinfo.username
                        });


                        if(userinfo.dxc == null) userinfo.dxc = {};
                        userinfo.dxcSessID = req.sessionID;


                        const account = await userSvc.find(acc, { autoCreate: true});
                        const sess = await  userSvc.getSessionService().asyncGetSessionByUID( req.sessionID)

                        if(sess!=null && account!=null){
                            sess.setUserAccount(acc);
                            const saveSuccess = true; //= await userSvc.getSessionService().save(sess);

                            if(saveSuccess){
                                Logger.success("Session updated with user account [sess="+sess.getUID()+"] ");
                            }else{
                                Logger.error("Session cannot be updated with user account [sess="+sess.getUID()+"] ");
                            }
                        }else{
                            console.log("Comething is wrong",sess,account);
                        }

                        console.log("ALL ITS DONE",userinfo);

                        return done(null, acc);
/*
                        userSvc.find(acc, { autoCreate: true});



                        // link user account to session

                        // Important : Only executed on /api-auth/cb

                        if(userinfo.dxc == null) userinfo.dxc = {};
                        userinfo.dxcSessID = req.sessionID;

                        //let sess:UserSession = null;
                        userSvc.getSessionService()
                            .asyncGetSessionByUID( req.sessionID)
                            .then(( vSess)=>{
                                sess = vSess;

                                if(sess !=null){
                                    sess.setUserAccount(acc);
                                    userSvc.getSessionService().save(sess)
                                        .then((vSuccess)=>{
                                            if(vSuccess){
                                                console.log(sess,sess.getUserAccount().person);
                                                Logger.success("Session updated with user account [sess="+sess.getUID()+"] ");
                                            }else{
                                                Logger.error("Session cannot be updated with user account [sess="+sess.getUID()+"] ");
                                            }

                                        })
                                        .catch((vErr)=>{
                                            Logger.error("ERROR : Session cannot be updated : > "+vErr);
                                        })
                                }
                            })
                            .catch(( vErr)=>{
                                Logger.error("Session not found (Promise) > ",vErr);
                            });


                        console.log("ALL ITS DONE");
                        return done(null, userinfo);


                        //userSvc.getSessionService().getSessionByUID(req)
                        /*
                        let usr:UserAccount;
                        try{
                            Logger.debug("Search logged user : "+userinfo.username);
                            usr = this.findUser(userinfo.username);

                            Logger.debug("Found user : "+usr.getUID());

                            if(userinfo.dxc == null) userinfo.dxc = {};
                            // instead, attach to default session
                            const sess =  userSvc.createSession(usr);
                            userinfo.dxcSessID = sess.getSessUID();
                            //req.dxc.sess = userSvc.createSession(usr);

                            // req.dxc.sess.addConnection( param.getName(), new ConnectionHandler(param) );


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
                        return done(null, userinfo);*/
                    }
                )
            );

            passport.serializeUser(function(vUser:UserAccount, done:any) {
                Logger.debug("[AUTH SERVICE][PASSPORT] Passport : serialize user ");
                done(null, vUser.toJsonObject());
            });

            passport.deserializeUser(function(vUser:any, done:any) {
                const user = new UserAccount(vUser);
                Logger.debug("[AUTH SERVICE][PASSPORT] Passport : deserialize user ");
                done(null, user);
            });

            const addCORS = function(req:DelegateRequest, res:DelegateResponse, next:any){

                Logger.info("[AUTH SERVICE][PIPE] Add CORS ");
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
                passport.authenticate('openidconnect', {
                    successMessage: true,
                    failureMessage:true,
                    failureRedirect: '/login',
                    successReturnToOrRedirect: '/home/', // NEW
                }),
                (req, res, next) => {


                    Logger.info("SSO : /api-auth/callback : auth callback");
                    console.log(req, (req as any).session);
                    // depend of original request
                    res.redirect('/home/');
                });

        }
    }


}