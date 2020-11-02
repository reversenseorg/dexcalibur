import DexcaliburEngine from "./DexcaliburEngine";
import {User} from "./User";
import {TerminalSession} from "./TerminalSession";
import * as Log from "./Logger";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

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
            pSession.getSocket().sendUTF(JSON.stringify({action:'ext', data:{
                    closed: true,
                    msg: pData,
                    localid: pUser.getLocalIdOf(pSession), //message.data.localid,
                    sessid: pSession.getSessionID()
                }}));
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

    validateType(pUnsafeType:string):string {
        const types=['bash'];

        if(types.indexOf(pUnsafeType)==-1)
            throw  new Error('Invalid terminal type. Supported : '+types.concat(','));

        return pUnsafeType;
    }

    async processCommand( pUser:User, pSocket:any, pData:string):Promise<any>{
        let message:any, type:string = null, sess:TerminalSession=null;
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
                    if(sess != null){
                        // check permissions inside
                        sess.addOwner(pUser, message.data.localid);
                    }
                }

                // if session id not provided or session is invalid
                if(sess == null){
                    // else, create a new session
                    sess = await this.newLocalSession(
                        this.validateType(message.data.type)
                        // , pUser.getACL(TERMINAL_NEW_LOCAL)
                    );

                    sess.addOwner(pUser, message.data.localid);
                }


                if(sess != null){

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

                if(message.data.stdin == null)
                    throw new Error('Command cannot be empty');

                sess.sendCommand(pSocket, message.data.stdin);
            }
        }catch(err){
            console.log(err);
            pSocket.sendUTF(JSON.stringify({action:'err', data:{
                msg: err.toString()
            }}));
        }
    }

    processData( pUser:User, pSocket:any, pData:any):void{

    }


    /**
     *
     * @param pUser
     * @param pPerm
     */
    async newLocalSession( pType:string, pPerm:number = SESSION_PERM.READ|SESSION_PERM.WRITE):Promise<TerminalSession> {
        const sess = new TerminalSession();

        sess.onStdOut(this.sendOutput);
        sess.onStdErr(this.sendError);
        sess.onClose(this.sendOobMsg);

        await sess.createLocalSession(pType);
        this._sessions.push(sess);
        return sess;
    }

    /**
     *
     * @param pSocket
     */
    close( pUser:User, pSocket:any):void {
        pSocket.sendUTF(
            JSON.stringify({action:'err', data:{
                msg: 'Connection closed (!)'
            }})
        );

    }
}
