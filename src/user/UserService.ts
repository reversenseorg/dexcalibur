/**
 * Represents the component managing user authentication and session
 *
 * @class
 */
import {AuthenticationService} from "./auth/AuthenticationService";
import {SessionService} from "./session/SessionService";
import {AuthenticationSettings} from "./auth/AuthenticationSettings";
import {UserAccount} from "./UserAccount";
import {UserSession} from "./session/UserSession";
import {SessionCode, SessionException} from "./session/SessionException";
import {AuthenticationResult} from "./auth/Authenticator";
import {AuthenticationException} from "../errors/AuthenticationException";
import * as Log from '../Logger';
import {IDatabase, IDatabaseAdapter, IDbCollection} from "../persist/orm/DbAbstraction";
import {ConnectorFactory} from "../ConnectorFactory";
import SqliteConnector from "../../connectors/sqlite/adapter";
import {SqliteDb} from "../../connectors/sqlite/SqliteDb";
import * as _fs_ from "fs";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class UserService {

    authSvc: AuthenticationService;
    sessSvc: SessionService;

    private _db:IDatabase = null;
    private _requireMigrate = false;
    private _settings: AuthenticationSettings = null;

    constructor(pSettings:AuthenticationSettings) {
        this._settings = pSettings;

        this.loadDB(pSettings);

        if(_fs_.existsSync()){
            this.migrateDB(pSettings);
        }

        this.authSvc = new AuthenticationService(pSettings);
        this.authSvc.importUsers(this._db.getCollection('user', UserAccount.TYPE));

        this.sessSvc = new SessionService( pSettings.getSessionSettings());
        this.sessSvc.importSessions(this._db.getCollection('session', UserSession.TYPE));
    }



    /**
     *
     * @param pOldDB
     * @param pNewDB
     */
    migrateDB( pType:string, pURI:string){
        // TODO : add db authent
        try{
            const adapter:IDatabaseAdapter = ConnectorFactory.getInstance().newConnector(pType, null);
            const DB:SqliteDb = adapter.connect(pURI);
            const userColl = DB.getCollection( 'user', UserAccount.TYPE);

            const target:IDbCollection = this._db.getCollection('user', UserAccount.TYPE);
            this._db.getCollection( 'user', UserAccount.TYPE).map( (vUser:UserAccount)=>{
                target.addEntry( vUser.getUID(), vUser);
            });

            Logger.raw("[AUTH SVC] Old DB as be migrated to SQLite DB");
        }catch(err){
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
    loadDB( pSettings:AuthenticationSettings, pDBMS:string=null):void{

        const dba:any = ConnectorFactory.getInstance().newConnector(
            pSettings.db.dbms, // inmemory / sqlite / neo4j
            null,
            {
                user: pSettings.db.user,
                pwd: pSettings.db.pwd,
                port: pSettings.db.port,
                uri: pSettings.db.uri
            }
        ) as IDatabaseAdapter;

        dba.connect(pSettings.db.uri);

        if(pSettings.db.dbms == 'inmemory'){
            this._requireMigrate = true;
        }

        this._db = dba.getDB();
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

            Logger.info("Verify session is not null : "+JSON.stringify(pSession));
            Logger.info("All session : "+JSON.stringify( Object.keys(this.sessSvc.listAllSession())));
            if( pSession != null && pSession.isActive()){
                return true;
            }else{
                throw SessionException.INVALID_SESSION();
            } // TODO : add expiration check
        }catch(err){
            //console.log(err.message+err.stack);
            Logger.info(err.message+"\n\t"+err.stack);
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
        return false;
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