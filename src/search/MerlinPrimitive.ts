import {FinderResult} from "./FinderResult.js";
import {BusSubscriber} from "../Bus.js";
import {MerlinError} from "./MerlinSearchRequest.js";

export interface RuleOption {
    score?:number
}

export enum MerlinScopes {
    FROM_OUTSIDE,
    TO_OUTSIDE
}

export enum MerlinType {
    REQUEST,
    RULE
}

/**
 * @interface
 */
export interface MerlinPrimitive {
    TYPE: MerlinType

    execute(pContext:any):Promise<FinderResult>;

    executeSync?(pContext:any):FinderResult;

    toJsonObject():any;

    toSearchString():string;

    hasBusSubscriber():boolean;

    getSubscribeList():string[];

    toBusSubscriber(pContext:any):BusSubscriber;

    hasErrors():boolean;

    addError(pErr:MerlinError):void ;

    getErrors():MerlinError[];

    setErrors(pErrs:MerlinError[]):void;
}
