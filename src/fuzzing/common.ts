import FuzzTestCase from "./FuzzTestCase.js";

export enum FuzzingEvent {
    STEP_START= "fuzz.step.start",
    STEP_END= "fuzz.step.end",
    STEP_CRASH= "fuzz.step.crash",
    START= "fuzz.action.start",
    STOP= "fuzz.action.stop",
    PAUSE= "fuzz.action.pause",
    RESUME= "fuzz.action.resume"
}

export enum FuzzingResolverResult {
    SUCCESS,
    FAIL,
    INFO,
    DISCARD
}

export type FuzzSessionUID = string;

export type FuzzTestCaseID = string;

export type FuzzInputValue = any;
// FuzzInputValueDict associate a label with a FuzzInputValue
export type FuzzInputValueDict = Record<string, FuzzInputValue>;

export interface IFuzzingEvent{
    fsid?:FuzzSessionUID,
    tcid?:FuzzTestCaseID
}

export interface IFuzzGenerator{
    init():void;
    next(pOts?:any):FuzzInputValue;
}

export interface IFuzzResolver{
    init(pOptions:any):void;
    process(pTestCase:FuzzTestCase, pValue:any):any;
}