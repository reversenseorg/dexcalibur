import StatusMessage from "./StatusMessage.js";
import {User} from "./User.js";


import * as Log from "./Logger.js";
import {GlobalAccessControl} from "./user/acl/rbac/GlobalAccessContol.js";
import {UserAccount} from "./user/UserAccount.js";
import {Auditable} from "./Auditable.js";
import {SecurityZone} from "./security/SecurityZone.js";
import {Access} from "./user/acl/Access.js";
import AccessControl from "./user/acl/AccessControl.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {INode} from "@dexcalibur/dexcalibur-orm";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface WorkflowFollower {
    user: UserAccount;
    socket: any;
    opts?:any;
}


export interface WorkflowOptions {
    uid?: string;
    _parent?: Nullable<INode>;
    followers?:WorkflowFollower[];
    msg?:StatusMessage[];
    activeStep?: number;
}



/**
 * Represent a workflow
 *
 * Workflow are attached to a subject, and help to follow progression
 * of an action on this subject
 *
 * @class
 */
export class Workflow extends Auditable {

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
    private msgs: StatusMessage[] = [];

    /**
     * Step
     */
    private activeStep:number = 0;

    /**
     *
     * @private
     */
    private followers:WorkflowFollower[] = []

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

    /**
     * Active step
     * @private
     */
    private _m:string = "";

    private _parent:Nullable<INode> = null;

    constructor( pConfig:WorkflowOptions = {}) {
        super(null);

        for(let i in pConfig) this[i] = pConfig[i];
    }

    /**
     *
     * @param pStr
     * @param pProgressBound
     */
    setStep(pStepName:string, pProgressBound:number ){
        this._m = pStepName;
        if(this._b>0){
            this._d = pProgressBound - this._b;
            this._b = pProgressBound;
        }else{
            this._d = this._b = pProgressBound;
        }
    }

    computeStepUp(pEntries:number){
        this.activeStep = this._d / pEntries;
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
        this.setAccessAttribute(GlobalAccessControl.attr.OWNER);
    }

    stepUp(pStep:number):void {
        this.activeStep += pStep;
    }

    getUID():string {
        return this.uid;
    }

    pushStatus(pMsg:StatusMessage):void {
        pMsg.msg = (this._m.length>0? this._m+' : ':'')+pMsg.msg;
        this.msgs.push(pMsg.addProgress(this.activeStep));
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
        if(this.activeStep>-1){
            this._t = m.progress = this._t + this.activeStep;
        }else{
            m.progress = this._t;
        }
        this.sendStatusToFollowers(m.toJsonObject());
    }


    /**
     * To retrieve the list of status message
     */
    getStatus():StatusMessage[] {
        return this.msgs;
    }

    /**
     * To get the first message issued
     *
     * @returns {StatusMessage}
     * @method
     */
    getFirstStatus():StatusMessage {
        if(this.msgs.length>0)
            return this.msgs[0];
        else
            return null;
    }

    /**
     * To get the last message issued
     *
     * @returns {StatusMessage}
     * @method
     */
    getLastStatus():StatusMessage {
        if(this.msgs.length>0)
            return this.msgs[this.msgs.length-1];
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
        this.setAccessAttribute(GlobalAccessControl.attr.OWNER, [pAccount.getUID()]);
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
    declareOwner( pUser:UserAccount, pSocket:any, pOpts:any={}):void {
        //this._attr.OWNER.value = pUser.getUID();
        this.setAccessAttribute(GlobalAccessControl.attr.OWNER, [pUser.getUID()] );
        this.addFollower(pUser,pSocket,pOpts);
    }

    /**
     *
     * @param pUser
     * @param pSocket
     * @param pOpts
     */
    addFollower( pUser:UserAccount, pSocket:any, pOpts:any={}):void {

        // TODO : implement custom-control for add follower access attr
        /*AccessControl.isAuthorizedByAttr(
            GlobalAccessControl.attr.OWNER,
            this,
            pUser
        );*/

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

    setParent(pParent:INode):void {
        this._parent = pParent;
    }

    /**
     * Send latest status over websocket
     *
     * @param pUser
     * @param {any} pSocket A socket where progress will be wrote
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


    toJsonObject(pSecurityZone:SecurityZone):any {
        let o={
            uid: this.uid,
            _parent: null,
            msg: this.msgs,
            followers:[],
            activeStep: this.activeStep
        };

        this.followers.map(x => {
            o.followers.push({
                user: x.user.getUID(),
                socket: null,
                opts: x.opts
            })
        });

        return o;
    }
}