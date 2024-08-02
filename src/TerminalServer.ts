import DexcaliburEngine from "./DexcaliburEngine.js";
import {TerminalSessionMap, User} from "./User.js";
import {TerminalSession} from "./TerminalSession.js";
import * as Log from "./Logger.js";
import {Device} from "./Device.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export enum TerminalSessionType {
    SH='sh',
    DEV='dev',
    BASH='bash'
}


enum SESSION_PERM {
    NONE,
    READ,
    WRITE,
}

export class TerminalServer {

    private _engine: DexcaliburEngine = null;
    private _sessions:TerminalSession[] = [];

    constructor(pConfig:any) {
        for(let i in pConfig)
            if(this.hasOwnProperty(i))
                this[i] = pConfig[i];
    }

    sendOutput( pSession:TerminalSession, pData:any){
        pSession.getOwners().map( (pUser:User)=> {
            pSession.getSocket().sendUTF(JSON.stringify({action:'cmd', data:{
                    success: true,
                    stdout: pData,
                    localid: pUser.getLocalIdOf(pSession), //message.data.localid,
                    sessid: pSession.getSessionID()
                }}));
        })
    }

    sendError( pSession:TerminalSession, pData:any){
        pSession.getOwners().map( (pUser:any)=> {
            Logger.error(JSON.stringify(pData))
            pSession.getSocket().sendUTF(JSON.stringify({action:'err', data:{
                    success: false,
                    stderr: pData,
                    localid: pUser.getLocalIdOf(pSession), //message.data.localid,
                    sessid: pSession.getSessionID()
                }}));
        })
    }

    sendOobMsg( pSession:TerminalSession, pData:any){
        pSession.getOwners().map( (pUser:any)=> {
            if(pSession.isSocketReady()) {
                pSession.getSocket().sendUTF(JSON.stringify({
                    action: 'ext', data: {
                        payload: pData,
                        localid: pUser.getLocalIdOf(pSession), //message.data.localid,
                        sessid: pSession.getSessionID()
                    }
                }));
            }
        })
    }

    /**
     * To get a session by its Session ID
     *
     * @param {string} pSessID Session ID
     * @return {TerminalSession}
     *
     */
    getSession(pSessID:string):TerminalSession {
        let sess:TerminalSession = null;
        this._sessions.map((vSess:any)=>{
            if(vSess.getSessionID()===pSessID) sess=vSess;
        });

        return sess;
    }

    validateType(pUnsafeType:TerminalSessionType):string {
        const types=[TerminalSessionType.BASH,TerminalSessionType.DEV,TerminalSessionType.SH];

        if(types.indexOf(pUnsafeType)==-1)
            throw  new Error('Invalid terminal type. Supported : '+(types as string[]).concat(','));

        return pUnsafeType;
    }

    /**
     *
     * @param pUser
     * @param pSocket
     * @param pData
     */
    async processCommand( pUser:User, pSocket:any, pData:string):Promise<any>{
        let message:any, type:string = null, sess:TerminalSession=null, dev:Device=null;
        try{
            message = JSON.parse(pData);
            if(message.action=="new"){

                if(message.data.localid == null){
                    throw new Error('Invalid local ID');
                }

                // if a valid session ID is provided, the user is added to
                // owners of this session. TODO : add auditors group
                if(message.data.sessid != null){
                    sess = this.getSession(message.data.sessid);

                    if(sess != null && sess.isExited()==false){
                        // check permissions inside
                        sess.addOwner(pUser, message.data.localid);
                    }else{
                        sess = null;
                    }
                }

                if(message.data.type==TerminalSessionType.DEV) {
                    dev = this._engine.getDeviceManager().getDevice(message.data.opts.target);
                }


                // if session id not provided or session is invalid
                if(sess == null){

                    if(message.data.type==TerminalSessionType.DEV){

                        // else, create a new session
                        try{
                            sess = await this.newDeviceSession(
                                dev,
                                message.data.opts.hasOwnProperty('priv') ? message.data.opts.priv : false);

                            sess.addOwner(pUser, message.data.localid);
                        }catch (err1){
                            Logger.error(err1.message);
                            Logger.error(err1.stack);
                        }


                    }else{
                        // else, create a new session
                        sess = await this.newLocalSession(
                            this.validateType(message.data.type)
                            // , pUser.getACL(TERMINAL_NEW_LOCAL)
                        );

                        sess.addOwner(pUser, message.data.localid);

                    }



                }


                if(sess != null){


                    if(dev!==null){
                        sess.setDevice(
                            dev,
                            message.data.hasOwnProperty('privileged') ? message.data.privileged : null
                        );
                    }

                    Logger.info('[WEBSOCKET] Sending new session data [SESSID=',sess.getSessionID(),']');
                    pSocket.sendUTF(JSON.stringify({action:'new', data:{
                            success: true,
                            msg: 'Session opened :)',
                            localid: message.data.localid,
                            sessid: sess.getSessionID()
                        }}));
                }else{
                    Logger.error('[WEBSOCKET] Session not initialized.')
                }

            }
            else if(message.action=="cmd"){
                sess = this.getSession(message.data.sessid);
                if(sess == null)
                    throw new Error('Session not found');

                if(sess.isExited())
                    throw new Error('Session has been closed');

                if(message.data.stdin == null)
                    throw new Error('Command cannot be empty');

                sess.sendCommand(pSocket, message.data.stdin);
            }
            else if(message.action=="exit"){
                sess = this.getSession(message.data.sessid);
                if(sess == null)
                    throw new Error('Session not found');

                if(sess.isExited())
                    throw new Error('Session has been closed');

                sess.exit(pSocket);
            }
            else if(message.action=="init"){
                let sessions:TerminalSessionMap = pUser.getSessions();
                let s:any = [];

                for(let lid in sessions){
                    if(sessions[lid].isExited()==false)
                        s.push({ localid:lid, sessid:sessions[lid].getSessionID() });
                }

                pSocket.sendUTF(JSON.stringify({ action:'init', data:{ sess: s }}));
            }
        }catch(err){
            Logger.error(err.message);
            Logger.error(err.stack);
            pSocket.sendUTF(JSON.stringify({action:'err', data:{
                msg: err.toString()
            }}));
        }
    }

    processData( pUser:User, pSocket:any, pData:any):void{

    }


    /**
     * To create a new session.
     *
     * It creates a child process and pipe its stdio with instance's streams.
     * A session can have multiple owner, it allows several user to share the same terminal I/Os
     *
     * @param {string} pType The type of terminal. It depends of OS and user preferences
     * @param {number} pPerm Permission of the session
     * @return {Promise<TerminalSession>}
     * @async
     * @method
     * @since 1.0.0
     */
    async newLocalSession( pType:string, pPerm:number = SESSION_PERM.READ|SESSION_PERM.WRITE):Promise<TerminalSession> {
        const sess = new TerminalSession();

        /*sess.setStdinBuffer(
            this._engine.getWorkspace().createTempFile('xterm_', true)
        );*/

        sess.onStdOut(this.sendOutput);
        sess.onStdErr(this.sendError);
        sess.onClose(this.sendOobMsg);

        await sess.createLocalSession(pType);
        this._sessions.push(sess);
        return sess;
    }

    /**
     * To create a new session for a given device
     *
     * It creates a child process and pipe its stdio with instance's streams.
     * A session can have multiple owner, it allows several user to share the same terminal I/Os
     *
     * @param pDevice
     * @param {number} pPerm Permission of the session
     * @return {Promise<TerminalSession>}
     * @async
     * @method
     * @since 1.0.0
     */
    async newDeviceSession( pDevice:Device, pPrivileged:boolean, pPerm:number = SESSION_PERM.READ|SESSION_PERM.WRITE):Promise<TerminalSession> {
        const sess = new TerminalSession();

        /*sess.setStdinBuffer(
            this._engine.getWorkspace().createTempFile('xterm_', true)
        );*/

        sess.onStdOut(this.sendOutput);
        sess.onStdErr(this.sendError);
        sess.onClose(this.sendOobMsg);

        await sess.createDeviceSession(pDevice, pPrivileged);
        this._sessions.push(sess);
        return sess;
    }

    /**
     * To close all sessions held by only the given user
     *
     * @param {User} pUser The user account which lost/close the connection
     * @param {any} pSocket The socket used to communicate with the user which initiate the close.
     * @method
     * @since 1.0.0
     */
    close( pUser:User, pSocket:any):void {
        this._sessions.map( (pSess:TerminalSession) => {
            if(pSess.isOwner(pUser) && pSess.hasSingleOwner())
                pSess.close();
        });

        pSocket.sendUTF(
            JSON.stringify({action:'err', data:{
                msg: 'Connection closed (!)'
            }})
        );

    }
}
