export enum FuzzingEvent {
    STEP_START= "fuzzing.step.start",
    STEP_END= "fuzzing.step.end",
    STEP_CRASH= "fuzzing.step.crash",
    START= "fuzzing.action.start",
    STOP= "fuzzing.action.stop",
    PAUSE= "fuzzing.action.pause",
    RESUME= "fuzzing.action.resume"
}

export type FuzzSessionUID = string;

export type FuzzerTestCaseID = string;

export interface IFuzzingEvent{
    fsid?:FuzzSessionUID,
    tcid?:FuzzerTestCaseID
}

export interface IFuzzGenerator{
    init():void;
    next():any;
}