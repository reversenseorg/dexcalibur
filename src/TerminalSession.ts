import * as _fs_ from 'fs';
import {EOL} from 'os';
import Util from "./Utils";
import {User} from "./User";
import * as Log from "./Logger";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


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
    private _exited:boolean = false;
   // private _tmp_fd:any = null;
   // private _tmp_write:any = null;



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
     * To check if the instance has one or less owner
     *
     * @return {boolean} TRUE if the session has one or less owner. Else FALSE
     * @method
     * @since 1.0.0
     */
    hasSingleOwner():boolean {
        return (this._owners.length <= 1);
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

    setStdinBuffer( pPath:string):void {
        //this._tmp_write = _fs_.createWriteStream(pPath);
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
            stdio:  'pipe'
        };

        const self = this;
        this._process = Util.spawn(this._type, [], opts);

        this._process.stdout.pipe( process.stdout, {end:false});

        this._process.stdout.on('data', (vData:any)=>{
            this._stdout_fn(self, vData.toString());
        });

        this._process.stderr.on('data', (vData:any)=>{
            this._stderr_fn(self, vData.toString());
        });
/*
        this._process.on('close', (vData:any)=>{
            this._close_fn(self, {closed:true, msg:'[Process closed.]'});
           // this._stderr_fn(self,{closed:true, msg:'[Process closed.]'});
        });
*/
        this._process.on('exit', (vData:any)=>{
            this._close_fn(self, {closed:true, msg:'[Process exited.]'});
            //this._stderr_fn(self,{closed:true, msg:'[Process exited.]'});
        });

        this._process.unref();

        return this;
    }

    isSocketReady():boolean{
        return (this._socket != null);
    }

    isExited():boolean {
        return this._exited;
    }

    sendCommand( pSocket, pCmd:string):void{

        this._socket = pSocket;

        if(this._process == null) throw  new Error('Command cannot be sent. Session is not ready.');

        this._process.stdin.write(pCmd+EOL);
    }

    close(pUser:User=null){
        if(this._process != null) {
            Logger.info(`Killing child process attached to session [SESSID=${this._sessid}] : ${this._process.spawnfile}`);
            this._process.kill('SIGHUP');
            this._process = null;
        }

        this._exited = true;
        /*if(pUser!=null){
            pUser.removeSession(this);
        }*/
    }

    /**
     *
     * @param pSocket
     */
    exit(pSocket:any):void {

        this._socket = pSocket;

        this.close();
        this._owners.map((pUser:any) => {
            pUser.removeSession(this);
        });
    }


    getSocket():any {
        return this._socket;
    }

    getSessionID():string {
        return this._sessid;
    }
}