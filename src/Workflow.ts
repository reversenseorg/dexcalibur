import StatusMessage from "./StatusMessage";
import {User} from "./User";


import * as Log from "./Logger";
import {IAuditableAccess} from "./user/acl/IAuditableAccess";
import {AccessAttribute, AccessAttributeMap} from "./user/acl/AccessAttribute";
import {GlobalAccessControl} from "./user/acl/rbac/GlobalAccessContol";
import {UserAccount} from "./user/UserAccount";
import AccessControl from "./user/acl/AccessControl";
import {AccessZone} from "./user/acl/Zones";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface WorkflowFollower {
    user: User;
    socket: any;
}

export class Workflow  implements IAuditableAccess {


    /**
     * List of attributes involved into security controls
     * @type AccessAttributeMap
     * @field
     */
    _attr:AccessAttributeMap = {};


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

    /**
     * Max bound for progress of the current step
     * @private
     */
    private _b:number =0;

    /**
     * Delta : New Max bound - Last Max bound
     * @private
     */
    private _d:number =0;

    private _t:number =0;

    private _m:string = "";

    constructor( pConfig:any = {}) {
        for(let i in pConfig) this[i] = pConfig[i];
        this.initAccessAttributes();
    }


    setStep(pStr:string, pProgressBound:number ){
        this._m = pStr;
        if(this._b>0){
            this._d = pProgressBound - this._b;
            this._b = pProgressBound;
        }else{
            this._d = this._b = pProgressBound;
        }
    }

    computeStepUp(pEntries:number){
        this._st = this._d / pEntries;
    }

    /**
     * To init access attributes of the instance.
     *
     * See Access Controls.
     *
     * @method
     * @since 1.0.0
     */
    initAccessAttributes(){
        for(const k in GlobalAccessControl.attr){
            this._attr[k] = GlobalAccessControl.attr[k].clone();
        }
    }

    stepUp(pStep:number):void {
        this._st += pStep;
    }

    getUID():string {
        return this.uid;
    }

    pushStatus(pMsg:StatusMessage):void {
        pMsg.msg = (this._m.length>0? this._m+' : ':'')+pMsg.msg;
        this._s.push(pMsg.addProgress(this._st));
        this._t = pMsg.progress;
        this.sendStatusToFollowers();
    }

    /**
     * Direct messages are not cached
     *
     * @param pMsg
     */
    pushDirectStatus(pMsg:string):void {
        const m:StatusMessage = StatusMessage.newDirect((this._m.length>0? this._m+' : ':'')+pMsg);
        if(this._st>-1){
            this._t = m.progress = this._t + this._st;
        }else{
            m.progress = this._t;
        }
        this.sendStatusToFollowers(m.toJsonObject());
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

    /**
     * To change workflow owner
     *
     * @param {UserAccount} pAccount
     * @return {Workflow} This instance
     * @method
     */
    changeOwner( pAccount:UserAccount):Workflow {
        this._attr.OWNER.value = pAccount.getUID();
        return this;
    }

    /**
     * To define workflow owner
     *
     * The owner is also a follower
     *
     * @param pUser
     * @param pSocket
     * @param pOpts
     */
    declarOwner( pUser:UserAccount, pSocket:any, pOpts:any={}):void {
        this._attr.OWNER.value = pUser.getUID();
        this.addFollower(pUser,pSocket,pOpts);
    }

    /**
     *
     * @param pUser
     * @param pSocket
     * @param pOpts
     */
    addFollower( pUser:any, pSocket:any, pOpts:any={}):void {
        // TODO : check is pUser has sufficient permission to follow this workflow
        // TODO : implement custom-control for add follower access attr
        //Logger.debug("[WORKFLOW] addFollower : "+(pUser==null? 'null' :'<user>')+" - "+(pSocket==null? 'null' :'<socket>'));
        this.followers.push({ user:pUser, socket:pSocket, opts:pOpts  });
    }

    /**
     *
     * @param pDirectOpts
     */
    sendStatusToFollowers( pDirectOpts:any = null):void {

        Logger.debug("[WORKFLOW] sendStatusToFollowers count : "+this.followers.length);
        for(let i=0; i<this.followers.length; i++){
            try {

                Logger.debug("[WORKFLOW] sendStatusToFollowers : ");
                //Logger.info(this.followers[i].user);
                //Logger.info(this.followers[i].socket);
                this.sendStatus( this.followers[i].user, this.followers[i].socket, this.followers[i].opts, pDirectOpts);
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
    sendStatus( pUser:any, pSocket:any, pOptions:any={}, pDirectOpts:any=null):void {
        try{
            Logger.debug("[WORKFLOW] sendStatus : "+this.getLastStatus().toJsonObject());
            pSocket.sendUTF(JSON.stringify({action:'stat', data:{
                    success: true,
                    msg: pDirectOpts!=null ? pDirectOpts : this.getLastStatus().toJsonObject(),
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


    /**
     * To get access attribute by its name
     *
     * @param {string} pName Attribute name
     * @return {AccessAttribute}
     */
    getAccessAttribute(pName: string): AccessAttribute {
        return this._attr[pName];
    }
}