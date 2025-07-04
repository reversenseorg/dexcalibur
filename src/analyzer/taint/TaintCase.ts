import DexcaliburProject from "../../DexcaliburProject.js";
import {ModelFunction} from "../../ModelFunction.js";
import ModelInstruction from "../../ModelInstruction.js";
import ModelMethod from "../../ModelMethod.js";
import ModelField from "../../ModelField.js";
import ModelStringValue from "../../ModelStringValue.js";
import ModelClass from "../../ModelClass.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {UserAccountUUID} from "../../user/UserAccount.js";

export interface TaintStep {
    location: ModelInstruction;
    source: ModelFunction|ModelMethod|ModelField|ModelClass;
}


export interface TaintSink extends TaintStep {
}

export interface TaintSource extends TaintStep {
}

export interface  TaintCaseOpts {
    ctx: DexcaliburProject,
    source: TaintSource,
    name: string,
    description?: Nullable<string>,
    sinks?: Nullable<TaintSink[]>,
    propagators?: Nullable<TaintSink[]>,
    conds?: Nullable<TaintSink[]>,
    author?:Nullable<UserAccountUUID>,
}

export class TaintCase {

    ctx:DexcaliburProject;

    name: string;
    description: string;
    author: UserAccountUUID;

    source: TaintSource;
    sinks: TaintSink[] = [];
    propagators: TaintStep[] = [];
    conds: TaintStep[] = [];

    constructor(pOptions:TaintCaseOpts) {
        this.ctx = pOptions.ctx;
        this.source = pOptions.source;
        this.sinks = pOptions.sinks;
        if(pOptions.propagators!=null)  this.propagators = pOptions.propagators;
        if(pOptions.conds!=null)  this.conds = pOptions.conds;
    }

}