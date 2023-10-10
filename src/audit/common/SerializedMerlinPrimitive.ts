import {Nullable} from "../../core/IStringIndex.js";


export enum MerlinType {
    REQUEST,
    RULE
}

export declare const SupportedEngine: Readonly<{
    readonly MERLIN: "MERLIN";
    readonly BUS: "BUS";
}>;

export interface SerializedMerlinOperation {
    op: string,
    req?: string
    args?: any[]
}

export interface SerializedMerlinPrimitive {
    _type?: MerlinType,
    engine: string,
    node: string,
    request?: string,
    i18n_request?:any;
    os: string,
    on?: Nullable<string>
    oper?: SerializedMerlinOperation[],
    opts?: Nullable<string[]>,
    args?: Nullable<any[]>
}