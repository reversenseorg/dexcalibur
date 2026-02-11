/**
 * Represents a session of fuzzing.
 *
 *
 */
import * as Log from '../Logger.js';
import {INode, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import FuzzManager, {FUZZ_EVENT_TYPE} from "./FuzzManager.js";
import {UserAccountUUID} from "../user/UserAccount.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {RuntimeEvent} from "../hook/RuntimeEvent.js";
import {FuzzSessionUID, IFuzzGenerator} from "./common.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export enum FuzzState {
    OFF = 0,
    PAUSE,
    PERFORM,
    RESET,
    SETUP,
    RUNNING,
    DONE
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
    fuzzManager?:FuzzManager;
    time?:number;
    fuzzStartTime?:number;
    state:FuzzState;
}


export interface RuntimeEventFilter {
    fragUID?:string;
    hookUID?:string;
    tagUUIDs?:number[];
    tagNames?:string[];
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
    fuzzManager:FuzzManager = null;

    /**
     * The timestamp of the fuzzing session initialization
     * @field
     */
    time:number = -1;

    /**
     * The timestamp from the running of the fuzzing session.
     * @field
     */
    fuzzStartTime:number = -1;

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

    setFuzzManager(pFM:FuzzManager){
        this.fuzzManager = pFM;
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

    start(){}
    stop(){}
    pause(){
        this.paused = true;
    }

    isPaused():boolean{
        return this.paused;
    }

    resume(){
        this.paused = false;
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

    toJsonObject():any {
        return {
            _uid:this._uid,
            owner:this.owner,
            message:this.message,
            fuzzManager:this.fuzzManager,
            time:this.time,
            fuzzStartTime:this.fuzzStartTime,
            state:this.state,
            tags:this.tags,
            devUID:this.devUID,
        }
    }

}
FuzzSession.TYPE.builder(FuzzSession);
