import {SessionSettings} from "./SessionSettings";
import {UserAccount} from "../UserAccount";
import {UserSession} from "./UserSession";
import Util from "../../Utils";
import {SessionCode, SessionException} from "./SessionException";

/**
 * Represents the map session ID / session object
 *
 * @interface
 */
export interface UserSessionMap {
    [sessUID:string] :UserSession
}


/**
 * Represents the component managing session at runtime
 *
 * @class
 */
export class SessionService {

    private _settings:SessionSettings;

    private _sess: UserSessionMap = {};

    constructor( pSettings:SessionSettings) {
        this._settings = pSettings;
        this._settings.save();
    }

    getSettings():SessionSettings {
        return this._settings;
    }

    /**
     * To generate a free session ID
     *
     * @return {string} Session id
     * @private
     */
    private _generateSessID():string {
        let sessid:string;
        do {
            sessid = Util.randString( 16, Util.ALPHANUM);
        }while( this._sess.hasOwnProperty(sessid));
        return sessid;
    }

    /**
     * To create a new session and return it
     * @param pAccount
     */
    newSession( pAccount:UserAccount):UserSession {
        if(pAccount.isLocked()) // TODO : add bypass for admin role
            throw new SessionException("Account is locked", SessionCode.ACCOUNT_LOCKED);

        let sess:UserSession = new UserSession(this._generateSessID(), pAccount);

        // TODO !: create folder
        if(this._settings.isFsBased()){

        }

        // add session to active list
        this._sess[sess.getSessUID()] = sess;


        return sess;
    }


    removeSessionFiles( pSessUID:string):boolean {
        return true;
    }

    listAllSession(): UserSessionMap {
        return this._sess;
    }


    /**
     * To trigger destroy procedure and remove from active session list
     *
     * @param pSession
     */
    destroySession( pSession:UserSession):boolean {

        // remove data associated to the session such as temporary files
        pSession.destroy();

        // remove session from active sessions list
        this._sess[pSession.getSessUID()] = null;

        // remove session file if session management uses FS
        if(this._settings.isFsBased()){
            this.removeSessionFiles(pSession.getSessUID());
        }

        return true;
    }


    /**
     * To retrieve a session by its uid
     *
     * @param pSessUID
     */
    getSessionByUID( pSessUID:string):UserSession {

        // TODO ACL : check current users can retrieve session of other users
        // TODO ACL : check current users can retrieve session of other users from the team


        const sess:UserSession = this._sess[pSessUID];

        if(sess==null)
            throw new SessionException("There is not session with the given Session UID", SessionCode.INVALID_SESSID)

        return sess;
    }

    /**
     * To retrieve a session by its uid
     *
     * @param pSessUID
     */
    getSessionsByAccount( pAccount:UserAccount, pOnlyActive:boolean = true):UserSession[] {

        // TODO ACL : check current users can retrieve session of other users
        // TODO ACL : check current users can retrieve session of other users from the team

        let sess:UserSession[] = [];
        for(let sid in this._sess){
            if(this._sess[sid]==null)
                continue;

            if(this._sess[sid].isOwnedBy(pAccount)){
                if(pOnlyActive){
                    if(this._sess[sid].isActive())
                        sess.push(this._sess[sid]);
                }else{
                    sess.push(this._sess[sid]);
                }
            }
        }


        return sess;
    }

    flush(): void {
        for(let i in this._sess)
            this._sess[i].destroy();

        this._sess = null;
        this._sess = {};
    }
}