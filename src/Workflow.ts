import StatusMessage from "./StatusMessage";
import {TerminalSession} from "./TerminalSession";
import {TerminalSessionMap, User} from "./User";


import * as Log from "./Logger";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface WorkflowFollower {
    user: User;
    socket: any;
}

export class Workflow {

    /**
     * Workflow uid
     * @field
     * @type {string}
     */
    uid:string = "";

    /**
     * Hold status
     * @field
     * @type {StatusMessage[]}
     */
    private _s: StatusMessage[] = [];

    /**
     * Step
     */
    private _st:number = 0;

    private followers:any = []


    constructor( pConfig:any = {}) {
        for(let i in pConfig) this[i] = pConfig[i];
    }

    stepUp(pStep:number):void {
        this._st += pStep;
    }

    getUID():string {
        return this.uid;
    }

    pushStatus(pMsg:StatusMessage):void {
        this._s.push(pMsg.addProgress(this._st));
        this.sendStatusToFollowers();
    }


    getStatus():StatusMessage[] {
        return this._s;
    }

    getFirstStatus():StatusMessage {
        if(this._s.length>0)
            return this._s[0];
        else
            return null;
    }

    getLastStatus():StatusMessage {
        if(this._s.length>0)
            return this._s[this._s.length-1];
        else
            return null;
    }

    addFollower( pUser:any, pSocket:any, pOpts:any={}):void {
        // TODO : check is pUser has sufficient permission to follow this workflow

        //Logger.debug("[WORKFLOW] addFollower : "+(pUser==null? 'null' :'<user>')+" - "+(pSocket==null? 'null' :'<socket>'));
        this.followers.push({ user:pUser, socket:pSocket, opts:pOpts  });
    }

    sendStatusToFollowers():void {

        Logger.debug("[WORKFLOW] sendStatusToFollowers count : "+this.followers.length);
        for(let i=0; i<this.followers.length; i++){
            try {

                Logger.debug("[WORKFLOW] sendStatusToFollowers : ");
                //Logger.info(this.followers[i].user);
                //Logger.info(this.followers[i].socket);
                this.sendStatus( this.followers[i].user, this.followers[i].socket, this.followers[i].opts);
            }catch(e){
                Logger.error(e.message);
            }
        }
    }
    /**
     * Send latest status over websocket
     * @param pUser
     * @param pSocket
     */
    sendStatus( pUser:any, pSocket:any, pOptions:any={}):void {
        try{
            Logger.debug("[WORKFLOW] sendStatus : "+this.getLastStatus().toJsonObject());
            pSocket.sendUTF(JSON.stringify({action:'stat', data:{
                    success: true,
                    msg: this.getLastStatus().toJsonObject(),
                    localid: pOptions.localid,
                    sessid: ''
                }}));
        }catch(err){
            Logger.debug("[WORKFLOW] ERROR : sendStatus : "+err.message);
            pSocket.sendUTF(JSON.stringify({action:'stat', data:{
                    success: false,
                    msg: err.toString(),
                    localid: '',
                    sessid: ''
                }}));
        }
    }
}