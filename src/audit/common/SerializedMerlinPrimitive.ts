import {Nullable} from "../../core/IStringIndex.js";
import {
    AggregationOperationArgs,
    InnerjoinOperationArgs, NestedRequestOperationArgs,
    Operation,
    OperationType,
    SearchOperationArgs, TaintOperationArgs, TimeOperationArgs, ValidateOperationArgs, WindowingOperationArgs
} from "../../search/MerlinSearchRequest.js";
import {SearchRequestCondition} from "../../search/SearchRequestCondition.js";
import {SearchOptions} from "../../search/MerlinSearchAPI.js";


export enum MerlinType {
    REQUEST,
    RULE
}

export declare const SupportedEngine: Readonly<{
    readonly MERLIN: "MERLIN";
    readonly BUS: "BUS";
}>;

export interface SerializedSearchOperationArgs {
    pattern: string,
    options?:SearchOptions
}

export interface SerializedInnerjoinOperationArgs {
    on: string,
    cond?: string
}


export interface SerializedNestedRequestOperationArgs{
    request: SerializedSearchRequest,
    cond?: string
}

export interface SerializedTaintOperationArgs{
    request: SerializedSearchRequest[]
}

export interface SerializedMerlinOperation {
    type: OperationType,
    args:
        SerializedSearchOperationArgs |
        SerializedInnerjoinOperationArgs |
        TimeOperationArgs |
        ValidateOperationArgs |
        WindowingOperationArgs |
        SerializedNestedRequestOperationArgs |
        AggregationOperationArgs |
        SerializedTaintOperationArgs ;
}


/*
export interface SerializedMerlinPrimitive {
    _type?: MerlinType,
    engine: string,
    node: string,
    request?: string,
    i18n_request?:any;
    os: string,
    on?: Nullable<string>
    oper?: Nullable<Operation[]>, //SerializedMerlinOperation[],
    opts?: Nullable<string[]>,
    args?: Nullable<any[]>,
}*/

export interface SerializedSearchRequest {
    node: string;
    pattern: string;
    oper?: SerializedMerlinOperation[],
    opts?: Nullable<string[]>,
}

export interface SerializedMerlinPrimitive {
    _type?: MerlinType,
    engine: string,
    request?: SerializedSearchRequest,
    i18n_request?:any;
    os: string,
    on?: Nullable<string|string[]>
    args?: Nullable<any[]>
    sources?:Nullable<SerializedMerlinPrimitive[]>,
    sinks?:Nullable<SerializedMerlinPrimitive[]>,
    steps?:Nullable<SerializedMerlinPrimitive[]>
}