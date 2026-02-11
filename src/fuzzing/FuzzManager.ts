import DexcaliburProject from "../DexcaliburProject.js";
import {ModelUiStruct} from "../graphics/models/ModelUiStruct.js";
import {ModelUiTransition, UiTransitionHash} from "../graphics/models/ModelUiTransition.js";
import * as Log from "../Logger.js";
import {UiCmpMap, UiState, UiStateHash} from "../graphics/models/UiState.js";
import InputEvent from "../platform/InputEvent.js";
import HookSession from "../HookSession.js";
import FuzzSession, {FuzzState} from "./FuzzSession.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface FuzzManagerOpts {
    ctx?: DexcaliburProject;
    lastUiState?: ModelUiStruct;
    uiStateStructList?: ModelUiStruct[];
    transitionList?: ModelUiTransition[];
    eventsHistory?: InputEvent[];
    runtimeSessionId?: any;
}

export enum FUZZ_EVENT_TYPE {
    SUCCESS = "success",
    FAILURE = "failure",
    INFO = "info"
}


/**
 * Manager to manage Fuzzing Session.
 *
 * @class
 */
export default class FuzzManager {
    ctx: DexcaliburProject = null;
    runtimeSessionId: any;
    linkedHookSession: HookSession;


    fuzzSessions: FuzzSession[] = [];
    results: any = [];
    fuzzGenerator:FuzzGenerator;
    fuzzInputValue:any;
    initialSteps:UiState[] = [];
    lastInitialStepIndex:number = -1;
    fuzzEventResolver;


    /**
     * @constructor
     */
    constructor(pOpts: FuzzManagerOpts) {
        for (const i in pOpts) this[i] = pOpts[i];
    }

    /**
     * @method
     */
    performInitialSteps(){
        let currentUiState = this.getCurrentUiState();
        if (needHardReset || currentUiState ==null || this.initialSteps.includes(currentUiState)) {
            // reset
            // currentUiState = initialSteps[0][0];
            // this.lastCurrentUiCmp = null;
            // this.lastCurrentProgramedAction = null;
            // this.lastInitialStepIndex = 0;
        }
        this.lastInitialStepIndex += 1;
        this.performAction(this.initialSteps[this.lastInitialStepIndex])
    }

    endSession(pClues, pResult:boolean = true){
        this.fuzzSessions[-1].setState(FuzzState.DONE);
        this.results.append([this.fuzzSessions[-1].fuzzInputValue, pResult, pClues]);
        //this.fuzzSessions.pop(); delete

    }

    generateNextFuzzInputValue(){
        return this.fuzzGenerator.next();
    }

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
    }
}

export interface FuzzGenerator{
    init():void;
    next():any;
}

export class DictFuzzGenerator implements FuzzGenerator{
    dict:any[];
    index:number = 0;
    constructor(pDict:any[]){
        // read dict in a file or hard coded.
        this.dict = pDict;
    }
    init(){
        this.index = 0;
    }
    next(){
        return this.dict[this.index++];
    }
}
