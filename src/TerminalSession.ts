import Util from "./Utils";
import {User} from "./User";
import * as _child_process_ from "child_process";
import {promisify} from 'util';
import * as stream from "stream";

const asyncSpawn = promisify(_child_process_.spawn);


const gUIDs = [];

/**
 * This class represents a terminal session and controls child process.
 *
 * @class
 * @since 1.0.0
 * @author Georges-Bastien MICHEL
 */
export class TerminalSession {

    private _socket:any = null;
    private _sessid:string = null;
    private _owners: User[] = [];
    private _process:any = null;
    private _type:string = null;
    private _stdout_fn:any = null;
    private _stderr_fn:any = null;
    private _close_fn:any = null;



    /**
     * To generate a valid unique session id
     *
     * TODO : use UUID instead of randString()
     *
     * @
     * @since 1.0.0
     */
    static generateSessID():string{
        let uuid:string = null;
        do{
            uuid = Util.randString( 16, Util.ALPHANUM);
        }while(gUIDs.indexOf(uuid)>-1);
        return uuid;
    }

    constructor() {
        this._sessid = TerminalSession.generateSessID();
    }


    // ---------- Authentication -------------

    /**
     * To check if authentication is required
     *
     * @return {boolean}
     * @method
     * @since 1.0.0
     */
    isRequireAuthentication():boolean{
        return (this._owners.length > 0);
    }

    /**
     * To check if the given user is an owner or not
     *
     * @param {User} pUser The user to verify
     * @return {boolean}
     * @method
     * @since 1.0.0
     */
    isOwner(pUser:User):boolean{
        let f:boolean = false;
        this._owners.map( (vOwner:User)=>{
            if(vOwner.is(pUser)) f=true;
        });
        return f;
    }

    /**
     * To bind this session to the given user
     * Once a session has one or more owner, authentication is required.
     * TODO : add permissions
     *
     * @param {User} pUser Owner of the session
     * @method
     * @since 1.0.0
     */
    addOwner(pUser:User, pLocalId:string):void {
        this._owners.push(pUser);
        pUser.addSession(this, pLocalId);
    }

    getOwners():User[] {
        return this._owners;
    }

    onStdOut(pObserver:any):void {
        this._stdout_fn = pObserver;
    }

    onStdErr(pObserver:any):void {
        this._stderr_fn = pObserver;
    }

    onClose(pObserver:any):void {
        this._close_fn = pObserver;
    }

    /**
     *
     */
    async createLocalSession(pType:string='default'):Promise<TerminalSession>{
        this._type = pType;
        return this._reinitProcess();
    }

    private _reinitProcess():any{
        const opts = {
            shell: (this._type==='default'),
            env: process.env,
            //detached: true,
            stdio:  'pipe'
        };

        const self = this;
        this._process = Util.spawn(this._type, [], opts);

        this._process.stdout.on('data', (vData:any)=>{
            console.log('child stdout > ',vData);
            this._stdout_fn(self, vData.toString());
        });

        this._process.stderr.on('data', (vData:any)=>{
            console.log('child stderr > ',vData);
            this._stderr_fn(self, vData.toString());
        });

        this._process.on('close', (vData:any)=>{
            this._close_fn(self, vData);
        });

        this._process.unref();

        return this;
    }

    sendCommand( pSocket, pCmd:string):void{

        this._socket = pSocket;

        if(this._process == null) throw  new Error('Command cannot be sent. Session is not ready.');

        this._process.stdin.write(pCmd);
        this._process.stdin.end();

        this._reinitProcess();
    }

    close(){

        if(this._process == null) throw  new Error('Command cannot be exited. Session is not ready.');

        this._process.kill('SIGHUP');
    }

    getSocket():any {
        return this._socket;
    }

    getSessionID():string {
        return this._sessid;
    }
}