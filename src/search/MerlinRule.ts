import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import {OperatingSystem} from "../OperatingSystem.js";
import { FinderResult } from "./FinderResult.js";

export enum MerlinRuleType {
    STATIC,
    DYNAMIC,
    TAINT,
    EMU,
    MIX
}




export interface SearchOptions {
    query_string?:boolean;

    regexp?:boolean;

    range?:string[];

    not: boolean;

    copyTo?:any;

    strict?:boolean;
}

export interface MerlinRuleOptions {
    type?:MerlinRuleType;
    emulate?:boolean;
    request?:MerlinSearchRequest;
    _sinks?:MerlinRule[];
    _sources?:MerlinRule[];
    _steps?:MerlinRule[];
}

export class MerlinRule extends MerlinSearchAPI {


    type:MerlinRuleType = MerlinRuleType.STATIC;

    emulate = false;

    request:MerlinSearchRequest|null;

    oper:Operation[] = [];

    protected _sinks:MerlinSearchRequest[] = [];
    protected _sources:MerlinSearchRequest[] = [];
    protected _steps:MerlinRule[] = [];

    protected _subs:MerlinRule[] = [];


    constructor(pTargetOS:OperatingSystem|undefined, pOpts:MerlinRuleOptions) {
        super();

        for(const i in pOpts) this[i] = pOpts[i];

        this.targetOS = pTargetOS;
    }


    sources( pRules:MerlinSearchRequest):MerlinRule {
        this.type = MerlinRuleType.TAINT;
        this._sources.push(pRules);
        return this;
    }

    sink( pRules:MerlinSearchRequest):MerlinRule {
        this.type = MerlinRuleType.TAINT;
        this._sinks.push(pRules);
        return this;
    }

    steps( pRules:MerlinRule):MerlinRule {
        this._steps.push(pRules);
        return this;
    }

    allowEmulator(pConfig:any):MerlinRule {
        this.emulate = true;
        return this;
    }


    execute(pProject:DexcaliburProject):FinderResult {
        // update DB
        this.setDatabase(pProject.getAnalyzer().getData());
        // execute
        return
    }
}