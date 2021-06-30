import * as _fs_ from 'fs';

import {Authenticator, AuthType, AuthenticationException} from "./AuthTypes";
import {Settings} from "../../Settings";
import AuthenticationSettings = Settings.AuthenticationSettings;
import {AuthenticationPolicy} from "./AuthenticationPolicy";
import {PasswordAuthenticator} from "./Authenticator";
import {ConnectorFactory, IDatabaseAdapter, IDbIndex} from "../../ConnectorFactory";
import {UserAccount} from "../UserAccount";
import {User} from "../../User";

export class AuthenticationService {

    settings:AuthenticationSettings;
    policy:AuthenticationPolicy;


    private _users:IDbIndex;
    private _dba:IDatabaseAdapter = null;


    constructor( pSettings:AuthenticationSettings) {
        this.settings = pSettings;
        this.policy = new AuthenticationPolicy(pSettings);

        this.initUserDB();
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
    initUserDB():void{

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
        this._dba.connect()

        if(_fs_.existsSync(this.settings.db.uri)==false){
            if(_fs_.existsSync(this.settings.db.uri+".temp")==true){
                this.createUserDB(
                    JSON.parse(_fs_.readFileSync(this.settings.db.uri+".temp", {encoding:'utf8'}))
                );
                this.save();
            }else{
                throw new AuthenticationException("Authentication Service cannot be initilized : user DB is missing at "+this.settings.db.uri);
            }
        }else{
            this._dba.getDB().unserialize(_fs_.readFileSync(this.settings.db.uri, {encoding:'utf8'}));
        }

    }

    /**
     * To create and init the User DB with
     *
     * @param pRawData
     */
    createUserDB( pRawData:any):void {
        this._users = this._dba.getDB().newIndex('users');
        this._users.addEntry( new UserAccount({
            username: pRawData.login,
            password: pRawData.pwd,
            salt: pRawData.s,
            padding: pRawData.p,
            time: pRawData.time,
            locked: false
        }));
    }

    /**
     * To save change to user db
     *
     * When the DBMS is 'inmemory', it save data into a file
     *
     * @method
     */
    save(){
        if(this.settings.db.dbms=='inmemory'){
            _fs_.copyFileSync(this.settings.db.uri,this.settings.db.uri+'.bkp');
            _fs_.writeFileSync(this.settings.db.uri, this._dba.getDB().serialize());
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

    findUser( pUsername:string):UserAccount {
        let usr:UserAccount = null;

        if(pUsername==null || pUsername.length==0){
            throw new AuthenticationException("Username cannot be empty");
        }

        this._users.map( vUsr => {
            if(vUsr.username === pUsername){
                usr = vUsr;
            }
        })

        if(usr == null){
            throw new AuthenticationException("Username not found");
        }

        return usr;
    }
}