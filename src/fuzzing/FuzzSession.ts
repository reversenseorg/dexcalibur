/**
 * Represents a session of fuzzing.
 *
 *
 */
import * as Log from '../Logger.js';
import {INode, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import FuzzManager from "./FuzzManager.js";
import {UserAccountUUID} from "../user/UserAccount.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {RuntimeEvent} from "../hook/RuntimeEvent.js";
import {FuzzSessionUID, IFuzzGenerator} from "./common.js";
import {MerlinSearchRequest} from "../search/MerlinSearchRequest.js";
import {TriggerFragmentOptions} from "../hook/HookManager.js";
import {HOOK_FRAGMENT_POS} from "../hook/AbstractHook.js";
import HookTemplateFragment from "../hook/HookTemplateFragment.js";
import HookPrologue from "../HookPrologue.js";
import {MetadataTopic, MetadataType} from "../audit/common/Metadata.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;



export enum FuzzState {
    OFF = 0,
    PAUSE,
    PERFORM,
    RESET,
    SETUP,
    RUNNING,
    DONE,
    // resume after PAUSE
    RESUME
}


export type ProgramedAction = {
    //wait action
    //click UI action etc
    // adb actions
}

export type FuzzInputValue = any;


/**
 * Options to create a new instance
 */
export interface FuzzSessionOpts {
    _uid?:string;
    message?:RuntimeEvent<any>[];
    owner?:Nullable<UserAccountUUID>;
    mgr?:FuzzManager;
    state?:FuzzState;
    devUID?:string;
    history?:FuzzSessionStateChange[];
    termPoint?:MerlinSearchRequest;
}


export interface RuntimeEventFilter {
    fragUID?:string;
    hookUID?:string;
    tagUUIDs?:number[];
    tagNames?:string[];
}

export interface FuzzSessionStateChange {
    time: number,
    state: FuzzState
}

/**
 * @class
 */
export default class FuzzSession implements INode
{
    static TYPE:NodeType = new NodeType( "fuzz_session", NodeInternalType.FUZZ_SESS,
        []);
    __:NodeInternalType = NodeInternalType.FUZZ_SESS;

    public _uid:FuzzSessionUID = null;

    /**
     * The owner of this session
     */
    owner:Nullable<UserAccountUUID> = null;

    /**
     * The stack containing the received message
     * @field
     */
    message:RuntimeEvent<any>[] = [];

    /**
     * The associated FuzzManager
     * @field
     */
    mgr:Nullable<FuzzManager> = null;


    state:FuzzState = FuzzState.OFF;

    tags:TagUUID[] = [];

    /**
     * Device UID
     */
    devUID:string = null;

    fuzzInputValue:FuzzInputValue = null;


    extra:any = {};

    paused = false;

    fuzzGenerator: Record<string, IFuzzGenerator> = {};

    history:FuzzSessionStateChange[] = [];

    termPoint:Nullable<MerlinSearchRequest> = null;

    /**
     *
     * @param {Nullable<FuzzSessionOpts>} pOptions Default NULL
     * @constructor
     */
    constructor(pOptions: Nullable<FuzzSessionOpts> = null) {

        if(pOptions!=null){
            for (let i in pOptions){
                this[i] = pOptions[i];
            }
        }
    }

    setUID(pUID:FuzzSessionUID):void{
        this._uid = pUID;
    }

    setFuzzManager(pFM:FuzzManager){
        this.mgr = pFM;
    }

    private async _createTriggerFragment(pNode:INode, pTriggerOpts:TriggerFragmentOptions):Promise<void>{

        // create of get hook
        let hooks = this.mgr.ctx.getHookManager().findHookByNode(pNode);
        if(hooks.length==0){
            // the target node is not hooked
            hooks = [await this.mgr.ctx.getHookManager().createHookFromNode(pNode, pTriggerOpts.hookOpts, pTriggerOpts.keypoint)];
        }
        if(hooks.length>1){
            throw new Error(`[FuzzSession] Multiple hooks found for node ${pNode.getUID()} : add filters to avoid this error.`);
        }

        // check if a fuzzer fragment is set for session
        if(!hooks[0].hasFuzzerFragment(this._uid)){
            hooks[0].addExtraFragment(
                HOOK_FRAGMENT_POS.BEFORE,
                new HookTemplateFragment({
                    name: `fuzzer-trigger`,
                    description: `Fuzzer session ${this._uid}`,
                    template: `DXC.fuzz.trigger(@@__HOOK_ID__@@, @@__FRAG_ID__@@, @@__FUZZ_CASEID__@@);`,
                    metadata: [{
                        type: MetadataType.ANY,
                        key:  MetadataTopic.FUZZ,
                        value: {
                            fsid: this._uid
                        }
                    }]
                })
            )
        }


    }

    /**
     * Terminal point can be :
     * - a method call (a hook)
     * - a bus event (host-side)
     * - a side event (device-side such as logcat, network, kernel driver events, ...)
     * - an app crash
     *
     * @param pRequest
     * @param pTriggerOpts
     */
    async setTerminalPoint(pRequest:MerlinSearchRequest, pTriggerOpts:any):Promise<void> {
        // update request
        this.termPoint = pRequest;
        // gather terminal nodes
        try{
            // search nodes
            const nodes = (await this.termPoint.executePDB(this.mgr.ctx)).list();

            // create fragments from nodes
            for(let i=0;i<nodes.length;i++){
                await this._createTriggerFragment(nodes[i], pTriggerOpts);
            }

            // add prologue to configure Fuzzer helper
            // this.mgr.ctx.getHookManager().addPrologue(new HookPrologue({ }))


        }catch (e){

        }
    }

    async addTerminalPoint(pType:string, pOpts:RuntimeEventFilter):Promise<void>{

    }


    getUID():FuzzSessionUID {
        return this._uid;
    }

    /**
     * to get the UID of the device that triggered the session
     *
     * @returns {string} The device UID or null
     * @method
     */
    getDeviceUID():string {
        return this.devUID;
    }

    private _logState(pState:FuzzState){
        this.history.push({
            time: (new Date()).getTime(),
            state: pState
        });
        Logger.debug(`[FUZZ SESSION][${this._uid}] State change: ${pState}`);
    }

    // ---- STATE CHANGES

    start(){
        this._logState(FuzzState.RUNNING);
    }

    stop(){
        this._logState(FuzzState.RUNNING);}

    pause(){
        this._logState(FuzzState.PAUSE);
        this.paused = true;
    }

    resume(){
        this._logState(FuzzState.RESUME);
        this.paused = false;
    }

    isPaused():boolean{
        return this.paused;
    }

    pushEvent(pEvt:RuntimeEvent<any>):void {
        this.message.push(pEvt);
    }


    /*
    resolveEvent(pData){
        this.fuzzSessions[-1].pushEvent(pData);
        if (pData.type == FUZZ_EVENT_TYPE.SUCCESS || pData.type == FUZZ_EVENT_TYPE.FAILURE) {
            this.endSession(pData.eventType == FUZZ_EVENT_TYPE.SUCCESS, pData.result);
        }
        else {
            let dataResolved = this.fuzzEventResolver.resolve(pData);
            if (dataResolved) {

            }
        }
    }*/

    async save(pUpdatedPpts:string[]):Promise<void> {
        if(pUpdatedPpts.length==0) return;

        await this.mgr.ctx.getProjectDB().save(this,{
            [FuzzSession.TYPE.getPrimaryKey().getName()]: this._uid
        },pUpdatedPpts);
    }

    toJsonObject():any {
        return {
            _uid:this._uid,
            owner:this.owner,
            message:this.message,
            mgr:this.mgr,
            state:this.state,
            tags:this.tags,
            devUID:this.devUID,
            history:this.history,
            termPoint: this.termPoint!=null ? this.termPoint.toJsonObject() : null
        }
    }

}
FuzzSession.TYPE.builder(FuzzSession);
