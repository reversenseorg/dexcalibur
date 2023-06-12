import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import {OperatingSystem} from "../OperatingSystem.js";
import { FinderResult } from "./FinderResult.js";
import {  MerlinPrimitive, MerlinType} from "./Merlin.js";
import ControlAssessment from "../audit/common/ControlAssessment.js";
import {BusSubscriber} from "../Bus.js";

export enum MerlinRuleType {
    STATIC,
    DYNAMIC,
    TAINT,
    EMU,
    MIX,
    REVERSE_TAINT
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

export class MerlinRule extends MerlinSearchAPI implements MerlinPrimitive {


    TYPE = MerlinType.RULE;

    type:MerlinRuleType = MerlinRuleType.STATIC;

    emulate = false;

    request:MerlinSearchRequest|null;

    oper:Operation[] = [];

    protected _sinks:MerlinSearchRequest[] = [];
    protected _sources:MerlinSearchRequest[] = [];
    protected _steps:MerlinRule[] = [];

    protected _subs:MerlinRule[] = [];

    private _evt:string[] = []


    constructor(pTargetOS:OperatingSystem|undefined, pOpts:MerlinRuleOptions) {
        super();

        for(const i in pOpts) this[i] = pOpts[i];

        this.targetOS = pTargetOS;
    }

    execute?(pContext: any): Promise<FinderResult> {
        throw new Error("Method not implemented.");
    }

    toSearchString(): string {
        throw new Error("Method not implemented.");
    }


    /**
     * To perform request on data encapsulated into a bus event
     *
     * @param {string} pBusEventType Event type
     * @return {MerlinSearchRequest} The request instance
     * @method
     */
    on(pBusEventType:string):MerlinRule{
        this._evt.push(pBusEventType);
        return this;
    }

    /**
     *
     */
    hasBusSubscriber():boolean {
        return (this._evt.length>0);
    }

    /**
     *
     */
    getSubscribeList():string[] {
        return this._evt;
    }

    /**
     *
     * @param pAssess
     */
    toBusSubscriber(pAssess:any):BusSubscriber {
        return BusSubscriber.from( ( pEvent)=>{

        });
    }

    sources( pRules:MerlinSearchRequest):MerlinRule {
        this.type = MerlinRuleType.TAINT;
        this._sources.push(pRules);
        return this;
    }

    /**
     * Top/Down taint analysis
     * @param pRules
     */
    sink( pRules:MerlinSearchRequest):MerlinRule {
        this.type = MerlinRuleType.TAINT;
        this._sinks.push(pRules);
        return this;
    }

    /**
     * Bottom/Up taint analysis
     */
    reverseSink():MerlinRule {
        this.type = MerlinRuleType.REVERSE_TAINT;
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

    hook( pRules:MerlinSearchRequest, pHookOpts:any ):MerlinRule {
        this.type = MerlinRuleType.DYNAMIC;
        return this;
    }


    executeSync(pProject:DexcaliburProject):FinderResult {
        // update DB
        this.setDatabase(pProject.getAnalyzer().getData());
        // execute
        switch(this.type){
            case MerlinRuleType.TAINT:
                this._executeTaint(pProject);
                break;
            case MerlinRuleType.DYNAMIC:
                // hook & start
                break;
        }
        return
    }

    // private

    private async _executeTaint(pProject:DexcaliburProject):Promise<any[]> {
        let src:any[] = [] ;
        let paths:any[] = [];
        let res:FinderResult;

        for(let i=0; i<this._sources.length; i++){
            res = await this._sources[i].execute(pProject);
            src = src.concat(res.getData() as any);
        }


        return paths;
    }


    /**
     * To prepare a rule to be serialized
     *
     * @return {any} Poor JS object
     * @method
     */
    toJsonObject():any {
        return {
            TYPE: this.TYPE,
            type: this.type,
            emulate: this.emulate,
            request: this.request.toJsonObject(),
            oper: this.oper,
            _sinks: this._sinks.map(x => x.toJsonObject()),
            _sources: this._sources.map(x => x.toJsonObject()),
            _steps: this._steps.map(x => x.toJsonObject()),
            _subs: this._subs.map(x => x.toJsonObject()),
            _evt: this._evt
        };
    }
}