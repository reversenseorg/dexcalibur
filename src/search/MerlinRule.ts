import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {MerlinSearchRequest, Operation, OperationType, TaintOperationArgs} from "./MerlinSearchRequest.js";
import {OperatingSystem} from "../OperatingSystem.js";
import {FinderResult} from "./FinderResult.js";
import {Merlin, MerlinPrimitive, MerlinType} from "./Merlin.js";
import {BusSubscriber} from "../Bus.js";
import {Tag} from "../tags/Tag.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {NodeInternalType, NodeInternalTypeName} from "../NodeInternalType.js";
import {CoreDebug} from "../core/CoreDebug.js";

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

    /**
     * To create a search string from a MerlinRule instance.
     * MerlinRule class has override class for each target OS,
     * So the implementation is subkject to change.
     */
    toSearchString(): string {
        let s = "";
        switch (this.targetOS){
            case OperatingSystem.ANDROID:
                s += "android()"+MerlinRule.stringify(this.getOperations(), "android()");
                break;
            case OperatingSystem.TIZEN:
                s += "tizen()"+MerlinRule.stringify(this.getOperations(), "tizen()");
                break;
            case OperatingSystem.IOS:
                s += "ios()"+MerlinRule.stringify(this.getOperations(), "ios()");
                break;
            case OperatingSystem.MACOS:
                s += "macos()"+MerlinRule.stringify(this.getOperations(), "macos()");
                break;
        }

        return s;
    }

    static  stringify(pOperations:Operation[], pSuffix = ""):string {
        let s = "";
        let type:any;
        pOperations.map((vOpe)=>{
            switch (vOpe.type){
                case OperationType.TAINT_SRC:
                    type = (vOpe.args as TaintOperationArgs).request.getNode();
                    if(typeof type!=="string"){
                        type = MerlinSearchAPI.getMethodFromNodeType((type as NodeType).getType());
                    }

                    s += `.sources(${pSuffix+MerlinSearchRequest.stringify(
                        (vOpe.args as TaintOperationArgs).request.getOperations(), type)})`;
                    break;
                case OperationType.TAINT_SINK:
                    type = (vOpe.args as TaintOperationArgs).request.getNode();
                    if(typeof type!=="string"){
                        type = MerlinSearchAPI.getMethodFromNodeType((type as NodeType).getType());
                    }

                    s += `.sink(${pSuffix+MerlinSearchRequest.stringify(
                        (vOpe.args as TaintOperationArgs).request.getOperations(), type )})`;
                    break;
                case OperationType.TAINT_STEP:
                    s += `.step(${pSuffix+MerlinRule.stringify( (vOpe.args as TaintOperationArgs).request.getOperations() )})`;
                    break;
            }
        });
        return s;
    }

    getOperations():Operation[] {
        return this.oper;
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
        this.oper.push({
            type: OperationType.TAINT_SRC,
            args: {
                request: pRules
            }
        });
        return this;
    }

    /**
     * Top/Down taint analysis
     * @param pRules
     */
    sink( pRules:MerlinSearchRequest):MerlinRule {
        this.type = MerlinRuleType.TAINT;
        this._sinks.push(pRules);
        this.oper.push({
            type: OperationType.TAINT_SINK,
            args: {
                request: pRules
            }
        });
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
    override toJsonObject():any {

        let o = super.toJsonObject();


        CoreDebug.checkJsonSerialize(o,"MerlinRule (super)");

        const v = {
            o,
            TYPE: this.TYPE,
            type: this.type,
            emulate: this.emulate,
            request: null,
            //oper: this.oper,
            _sinks: this._sinks.map(x => x.toJsonObject()),
            _sources: this._sources.map(x => x.toJsonObject()),
            _steps: this._steps.map(x => x.toJsonObject()),
            _subs: this._subs.map(x => x.toJsonObject()),
            _evt: this._evt
        };

        if(this.request!=null){
            v.request = this.request.toJsonObject();
        }

        CoreDebug.checkJsonSerialize(v,"MerlinRule");
        return v;
    }

    static fromJsonObject(pObject:any):MerlinRule{
        const o = new MerlinRule(pObject.targetOS, pObject);

        o._sinks.map((vReq, vI)=>{
            //o._sinks[vI] = MerlinSearchRequest.fromJsonObject();
        });
        o._sources.map((vReq, vI)=>{
           // o._sources[vI] = MerlinSearchRequest.fromJsonObject();
        });
        o._steps.map((vReq, vI)=>{
            o._steps[vI] = Merlin.fromJsonObject(vReq);
        });
        o._subs.map((vReq, vI)=>{
            o._subs[vI] = Merlin.fromJsonObject(vReq);
        });
        return o;
    }
}