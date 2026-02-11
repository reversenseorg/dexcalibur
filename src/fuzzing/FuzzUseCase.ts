/**
 * Represents a session of fuzzing.
 *
 *
 */
import * as Log from '../Logger.js';
import {WebsocketSession} from "../WebsocketSession.js";
import {INode} from "@dexcalibur/dexcalibur-orm";
import FuzzManager from "./FuzzManager.js";
import {UserAccountUUID} from "../user/UserAccount.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {RuntimeEvent} from "../hook/RuntimeEvent.js";
import {UiStateHash} from "../graphics/models/UiState.js";
import {UiCmpHash} from "../graphics/models/ModelUiCmp.js";
import {createNormalizedUrl} from "typedoc/dist/lib/utils/index.js";


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
export default class FuzzUseCase extends WebsocketSession implements INode {
    public _uid: FuzzSessionUUID = null;


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

    tags = [];

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
        super();

        if (pOptions != null) {
            for (let i in pOptions) {
                this[i] = pOptions[i];
            }
        }
    }

    setFuzzManager(pFM: FuzzManager) {
        this.fuzzManager = pFM;
    }


    getUID(): FuzzSessionUUID {
        return this._uid;
    }
}