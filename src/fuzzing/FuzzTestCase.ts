/**
 * Represents a test case from a fuzzing session.
 *
 *
 */
import {RuntimeEvent} from "../hook/RuntimeEvent.js";
import {HookSessionUUID} from "../HookSession.js";
import {FuzzInputValueDict, FuzzTestCaseID} from "./common.js";
import BusEvent from "../BusEvent.js";


/**
 * Options to create a new instance
 */
export interface FuzzTestCaseOpts {
    id?:FuzzTestCaseID;
    hookSession?:HookSessionUUID;
    inputValueDict:FuzzInputValueDict;
    messages?:RuntimeEvent<any>[];
    time?:number;
}

/**
 * @class
 */
export default class FuzzTestCase {

    uid:FuzzTestCaseID;
    hookSession:HookSessionUUID;
    inputValueDict:FuzzInputValueDict;
    messages:BusEvent<any>[] = [];

    /**
     * The timestamp of the fuzzing try initialization
     * @field
     */
    time: number = -1;

    /**
     *
     * @param {Nullable<FuzzSessionOpts>} pOptions Default NULL
     * @constructor
     */
    constructor(pOptions: FuzzTestCaseOpts) {
        if (pOptions != null) {
            for (let i in pOptions) {
                this[i] = pOptions[i];
            }
        }
    }

    pushEvent(pEvt:BusEvent<any>):void {
        this.messages.push(pEvt);
    }

    getUID(): FuzzTestCaseID {
        return this.uid;
    }
}