/**
 * Represents a session of fuzzing.
 *
 *
 */
import * as Log from '../Logger.js';
import {WebsocketSession} from "../WebsocketSession.js";
import {INode, TagUUID} from "@dexcalibur/dexcalibur-orm";
import FuzzManager from "./FuzzManager.js";
import {UserAccountUUID} from "../user/UserAccount.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {RuntimeEvent} from "../hook/RuntimeEvent.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


enum FuzzState {
    OFF = 0,
    PAUSE,
    PERFORM,
    RESET,
    SETUP,
    RUNNING,
    DONE
}

export type FuzzSessionUUID = string;

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
export default class FuzzUseCase  {


    public _uid: number = null;



    message: RuntimeEvent<any>[] = [];

    /**
     * The associated FuzzManager
     * @field
     */
    fuzzManager: FuzzManager = null;

    /**
     * The timestamp of the fuzzing try initialization
     * @field
     */
    time: number = -1;


    state: FuzzState;

    tags:TagUUID[] = [];

    /**
     * Device UID
     */
    devUID: string = null;


    extra: any = {};

    /**
     *
     * @param {Nullable<FuzzSessionOpts>} pOptions Default NULL
     * @constructor
     */
    constructor(pOptions: Nullable<FuzzSessionOpts> = null) {

        if (pOptions != null) {
            for (let i in pOptions) {
                this[i] = pOptions[i];
            }
        }
    }

    setFuzzManager(pFM: FuzzManager) {
        this.fuzzManager = pFM;
    }


    getUID(): number {
        return this._uid;
    }

    toJsonObject():any {
        return {
            _uid:this._uid,
            message:this.message,
            fuzzManager:this.fuzzManager,
            state:this.state,
            tags:this.tags,
            devUID:this.devUID,
            time:this.time
        }
    }
}