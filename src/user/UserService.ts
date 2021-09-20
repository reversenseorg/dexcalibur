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

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class UserService {

    authSvc: AuthenticationService;
    sessSvc: SessionService;


    constructor(pSettings:AuthenticationSettings) {
        this.authSvc = new AuthenticationService(pSettings);
        this.sessSvc = new SessionService( pSettings.getSessionSettings());
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