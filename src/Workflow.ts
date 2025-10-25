import StatusMessage from "./StatusMessage.js";

import * as Log from "./Logger.js";
import {GlobalAccessControl} from "./user/acl/rbac/GlobalAccessContol.js";
import {UserAccount, UserAccountUUID} from "./user/UserAccount.js";
import {Auditable} from "./Auditable.js";
import {SecurityZone} from "./security/SecurityZone.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodeType,
    SerializeOptions, TagUUID,
    ValidationRule
} from "@dexcalibur/dexcalibur-orm";
import {Subject, Subscription} from "rxjs";
import {DexcaliburProjectUUID} from "./DexcaliburProject.js";
import {EngineNodeUUID} from "./core/EngineNode.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface WorkflowFollower {
    user: UserAccount;
    socket: any;
    opts?:any;
}


export interface WorkflowOptions {
    uid?: string;
    _uid?: WorkflowUUID;
    user?: UserAccountUUID;
    project?: DexcaliburProjectUUID;
    node?: EngineNodeUUID;
    purpose?:string;

    _parent?: Nullable<INode>;
    followers?:WorkflowFollower[];
    msg?:StatusMessage[];
    activeStep?: number;
}


export interface WorkflowChange {
    type:string;
    value:any;
}


export interface WorkflowUpdate {
    wf: Workflow,
    changes: Record<string, WorkflowChange>
}

export type WorkflowUUID = string;


/**
 * Represent a workflow
 *
 * Workflow are attached to a subject, and help to follow progression
 * of an action on this subject
 *
 * @class
 */
export class Workflow extends Auditable implements INode{

    static TYPE:NodeType = (new NodeType( "workflow", NodeInternalType.WORKFLOW, [
        (new NodeProperty("_uid"))
            .type(DbDataType.STRING)
            .key(DbKeyType.PRIMARY)
            .addValidationRule(ValidationRule.uuid()),

        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        // cdx
        (new NodeProperty("msgs")).type(DbDataType.STRING).def([]),
        (new NodeProperty("activeStep")).type(DbDataType.NUMERIC).def(0),
        (new NodeProperty("node")).type(DbDataType.STRING).def(null),
        (new NodeProperty("user")).type(DbDataType.STRING).def(null),
        (new NodeProperty("project")).type(DbDataType.STRING).def(null),
        (new NodeProperty("purpose")).type(DbDataType.STRING).def(""),
        (new NodeProperty("started")).type(DbDataType.NUMERIC).def(0),
        (new NodeProperty("stoped")).type(DbDataType.NUMERIC).def(-1),

        (new NodeProperty("_d")).type(DbDataType.NUMERIC).def(0),
        (new NodeProperty("_t")).type(DbDataType.NUMERIC).def(0),
        (new NodeProperty("_m")).type(DbDataType.STRING).def(""),
        (new NodeProperty("_b")).type(DbDataType.NUMERIC).def(0),
    ])).dataSource("ENGINE_DB");

    __ = NodeInternalType.WORKFLOW;

    _uid:WorkflowUUID;

    /**
     * Workflow uid
     * @field
     * @type {string}
     */
    uid:string = "";

    user:Nullable<UserAccountUUID> = null;

    msg$:Subject<StatusMessage>;

    update$:Subject<WorkflowUpdate>;

    node:Nullable<EngineNodeUUID> = null;

    project: Nullable<DexcaliburProjectUUID> = null;

    started: number = 0;

    stoped: number = 0;

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

    private _followSubs:Nullable<Subscription> = null;

    tags:TagUUID[] = [];

    purpose:string = "";

    private _subscriptions: Record<string, Subscription> = {};

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
        return this._uid;
    }

    pushStatus(pMsg:StatusMessage):void {
        pMsg.msg = (this._m.length>0? this._m+' : ':'')+pMsg.msg;
        this.msgs.push(pMsg.addProgress(this.activeStep));

        this._t = pMsg.progress;

        this.msg$.next(pMsg.addProgress(this.activeStep));

        if(this.update$!=null){
            this.update$.next({
                wf:this,
                changes: {
                    status: {
                        type: 'new',
                        value: pMsg
                    }
                }
            });
        }

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
    changeOwner( pAccount:UserAccountUUID):Workflow {
        this.user = pAccount;
        this.setAccessAttribute(GlobalAccessControl.attr.OWNER, [pAccount]);
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

    start():void {
        this.started = (new Date()).getTime();

        this.msg$ = new Subject<StatusMessage>();
        this._followSubs =  this.msg$.subscribe(()=>{
            this.sendStatusToFollowers();
        })
    }

    isStarted():boolean{
        return (this._followSubs!=null);
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


    toJsonObject(pOptions:SerializeOptions = {}, pSecurityZone:SecurityZone = SecurityZone.PUBLIC):any {
        let o={
            _uid: this._uid,
            project: this.project,
            node: this.node,
            user: this.user,
            msg: this.msgs,
            activeStep: this.activeStep,

            _parent: null,
            followers:[],
            uid: this.uid
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

    /**
     * To subscribe to update$
     *
     * @param param
     * @method
     */
    subscribeUpdate(pName:string, pListener: ((vWfUpdate:WorkflowUpdate) => void)) {
        if(this.update$==null){
            this.update$ = new Subject<WorkflowUpdate>();
        }
        this._subscriptions[pName] = this.update$.subscribe(pListener);
    }


    /**
     *
     * @param pName
     * @method
     */
    unsubscribeUpdate(pName:string) {
        if(this._subscriptions[pName]!=null)
            this._subscriptions[pName].unsubscribe();
    }
}
Workflow.TYPE.builder(Workflow);