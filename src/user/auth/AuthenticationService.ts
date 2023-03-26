import * as _fs_ from 'fs';

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

    private _ctx:DexcaliburEngine = null;



    constructor( pSettings:AuthenticationSettings, pContext:DexcaliburEngine = null) {
        this.settings = pSettings;
        this._ctx = pContext;
        this.policy = new AuthenticationPolicy(pSettings);

        this.initUserDB();
    }

    /*
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

        console.log(db);

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
     * To load user account from the default User DB
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
                this._users.setEntry(v.getUID(), v);
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
}