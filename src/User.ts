/**
 * To represent a user
 */
import DexcaliburProject from "./DexcaliburProject";
import {TerminalSession} from "./TerminalSession";
import HookSession from "./HookSession";
import {WebsocketSession} from "./WebsocketSession";

export class Team {
    name:string ='';
    color:string = 'red';
    members: User[] = [];
    owners: User[] = [];
    projects: DexcaliburProject[] = [];
}

export interface TerminalSessionMap {
    [localid:string] : TerminalSession;
}

export interface HookSessionMap {
    [localid:string] : HookSession;
}

export class User {

    private uid:string ='x-x-x-x';

    firstname: string = '';
    lastname:string = '';
    team: Team = null;

    termSessions:TerminalSessionMap = {};
    hookSessions:HookSessionMap = {};

    readonly dateCreate:string = '';
    readonly dateLastModified:string = '';

    constructor(pConfig:any) {
        for(let i in pConfig)
            if(this.hasOwnProperty(i))
                this[i] = pConfig[i];
    }

    /**
     * To compare two user
     *
     * @param pUser
     */
    is(pUser:User):boolean {
        return (this.uid == pUser.uid);
    }

    getTerminalSession( pSessID:string):void {
        let term:TerminalSession = null;

    }

    addSession( pSession:TerminalSession, pLocalID:string):void {
        this.termSessions[pLocalID] = pSession;
    }

    addHookSession( pSession:any, pLocalID:string):void {
        this.hookSessions[pLocalID] = pSession;
    }

    /**
     * To remove a session attached to this user
     *
     * @param {TerminalSession} pSession The terminal session to remove
     * @method@
     * @since 1.0.0
     */
    removeSession( pSession:TerminalSession):void {
        //let map:TerminalSessionMap = {};

        /*for(let lid in this.termSessions)
            if(this.termSessions[lid].getSessionID() !== pSession.getSessionID()) {
                map[lid] = this.termSessions[lid];
                this.termSessions[lid].closed = true;
            }*/

        //this.termSessions = map;
    }

    getSessions():TerminalSessionMap {
        return this.termSessions;
    }

    getHookSessions():HookSessionMap {
        return this.hookSessions;
    }

    getLocalIdOf( pSession:TerminalSession):string {
        for(let lid in this.termSessions){
            if(this.termSessions[lid].getSessionID() === pSession.getSessionID()){
                return lid;
            }
        }
        return null;
    }
    getLocalIdOfWS( pSession:WebsocketSession):string {
        for(let lid in this.hookSessions){
            if(this.hookSessions[lid].getSessionID() === pSession.getSessionID()){
                return lid;
            }
        }
        return null;
    }
}