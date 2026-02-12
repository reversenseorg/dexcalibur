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
import {
    FuzzingResolverResult,
    FuzzInputValueDict,
    FuzzSessionUID,
    IFuzzGenerator,
    IFuzzingEvent,
    IFuzzResolver
} from "./common.js";
import {MerlinSearchRequest} from "../search/MerlinSearchRequest.js";
import {TriggerFragmentOptions} from "../hook/HookManager.js";
import {HOOK_FRAGMENT_POS} from "../hook/AbstractHook.js";
import HookTemplateFragment from "../hook/HookTemplateFragment.js";
import {MetadataTopic, MetadataType} from "../audit/common/Metadata.js";
import FuzzTestCase, {FuzzTestCaseOpts} from "./FuzzTestCase.js";
import {HookSessionUUID} from "../HookSession.js";
import BusEvent from "../BusEvent.js";
import Util from "../Utils.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;



export enum FuzzState {
    PAUSE,
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



/**
 * Options to create a new instance
 */
export interface FuzzSessionOpts {
    _uid?:string;
    message?:RuntimeEvent<any>[];
    owner?:Nullable<UserAccountUUID>;
    mgr?:FuzzManager;
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

    tags:TagUUID[] = [];

    linkedHookSession: HookSessionUUID;

    testCases:FuzzTestCase[] = [];

    results: any = [];

    paused = false;

    generators: Record<string, IFuzzGenerator> = {};

    inputValuesQueue: FuzzInputValueDict[];

    resolvers: Record<string, IFuzzResolver> = {};

    testCaseCounter: number = 0;

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

    setLinkedHookSession(pSession:HookSessionUUID){
        this.linkedHookSession = pSession;
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
        this._logState(FuzzState.DONE);
    }

    pause(){
        this._logState(FuzzState.PAUSE);
        this.paused = true;
    }

    resume(){
        this._logState(FuzzState.RESUME);
        this.paused = false;
    }


    /**
     * Generate a new input value dictionary from the current fuzz generators dictionary.
     * A generatorStrategy could be used to generate the next input values. It could be based on the current or previous testCase
     *
     * @param pOts
     */
    generateInputDict(pOts?:any): FuzzInputValueDict{
        let inputDict:FuzzInputValueDict = {};
        for (let input_label in this.generators) {
            inputDict[input_label] = this.generators[input_label].next(pOts)
        }
        return inputDict;
    }

    nextTestCase(){
        this.testCaseCounter += 1;
        let inputDict = this.getNextInputDict();
        if (inputDict == null) {
            this.stop();
            return;
        }
        let testCaseArg: FuzzTestCaseOpts = {
            id:this.testCaseCounter.toString(),
            inputValueDict:inputDict,
            hookSession:this.linkedHookSession,
            time:Util.time()
        };
        let newTestCase = new FuzzTestCase(testCaseArg);
        this.testCases.push(newTestCase);
        return newTestCase;
    }

    getNextInputDict():FuzzInputValueDict{
        if (this.inputValuesQueue.length == 0) {
            this.inputValuesQueue.push(this.generateInputDict());
        }
        let inputDict = this.inputValuesQueue.shift();
        return inputDict;
    }

    isPaused():boolean{
        return this.paused;
    }

    /**
     * Add a new event to the associated TestCase.
     * @param pEvent FuzzingEvent.STEP_END, FuzzingEvent.STEP_START, FuzzingEvent.STEP_CRASH,
     */
    resolveEvent(pEvent:BusEvent<IFuzzingEvent>){
        let testCase = this.testCases[-1];
        if (pEvent.getData().tcid) {
            testCase = this.testCases.find(tc=>tc.getUID() == pEvent.getData().tcid);
        }
        let resolver = this.findResolverForEvent(pEvent);
        if(resolver==null) {return null;}
        let res = resolver.process(testCase, pEvent);
        switch (res.flag) {
            case FuzzingResolverResult.SUCCESS:
                testCase.pushEvent(pEvent);
                this.results.push(testCase.inputValueDict, testCase);
                break;
            case FuzzingResolverResult.FAIL:
                this.nextTestCase();
                break;
            case FuzzingResolverResult.INFO:
                testCase.pushEvent(pEvent);
                break;
            case FuzzingResolverResult.DISCARD:
            default:
                break;
        }
    }

    findResolverForEvent(pEvent:BusEvent<IFuzzingEvent>): IFuzzResolver{
        return null;
    }

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
            tags:this.tags,
            history:this.history,
            termPoint: this.termPoint!=null ? this.termPoint.toJsonObject() : null,
            testCaseCounter:this.testCaseCounter,
        }
    }

}
FuzzSession.TYPE.builder(FuzzSession);
