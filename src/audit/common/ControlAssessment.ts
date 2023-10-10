import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";
import {MerlinRule} from "../../search/MerlinRule.js";
import {Merlin, MerlinPrimitive, MerlinType} from "../../search/Merlin.js";
import {INode} from "../../INode.js";
import Control from "./Control.js";
import {IControl} from "./IControl.js";
import {TestType} from "./TestPlan.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {Metadata} from "./Metadata.js";
import {Nullable} from "../../core/IStringIndex.js";
import {SerializedMerlinPrimitive} from "./SerializedMerlinPrimitive.js";


export enum AnalysisType {
    SAST, // support VT/PT
    DAST, // support VT/PT
}

export interface ControlAssessmentMap {
    [key:string] :ControlAssessment;
}



export interface ControlAssessmentOpts {
    id?:string;

    name?:string;

    description?:string;

    links?:string;

    metadata?:Metadata[];

    testType?:TestType;

    analType?:AnalysisType;

    rules?:(MerlinRule|MerlinSearchRequest)[];

}

interface Match {
    ctrl: Control;
    assess: string;
    rule: MerlinRule | MerlinSearchRequest;
    match: INode | any;
}

export enum MetadataTopic {
    DFLOW_STEP="step",
    IMPACT="impact",
    CRITICITY="criticity"
}

export enum DataOperation {
    SOURCING,
    PROCESSING,
    STORING,
    SHARING,
    ENCRYPTING,
    DECRYPTING,
    HASHING
}

export enum DataOperationSource {
    UI,
    API
}


/**
 * Represent a
 */
export default class ControlAssessment implements IControl {

    id:string;

    name:string;

    description = "";

    links = "";

    metadata:Metadata[] = [];

    testType:TestType = TestType.STATIC_SCAN;

    analType:AnalysisType = AnalysisType.SAST;

    rules:MerlinPrimitive[] = [];

    matches:Match[] = [];

    constructor( pConfig:ControlAssessmentOpts = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    getRules():MerlinPrimitive[] {
        return this.rules;
    }

    addMatches(pMatch:any):void {
        this.matches.push(pMatch);
    }

    toJsonObject():any{
        const o:any = {};

        for(let i in this){
            switch (i){
                /*case "matches":
                    o.matches = [];
                    this.matches.map( x => {
                       // o.matches.push( x.toJsonObject());
                        if(x!=null){
                            o.matches.push( {
                                ctrl: x.ctrl!=null ? x.ctrl.id : null,
                                assess: x.assess!=null ?x.assess : null,
                                rule: x.rule!=null ? x.rule.toSearchString() : null,
                                match: x.match!=null ? x.match.toJsonObject() : null,
                            });
                        }
                    });
                    break;*/
                case "rules":
                    o.rules = [];
                    this.rules.map( x => {
                        if(x!=null){

                            if(x.toJsonObject!=null)
                                o.rules.push(x.toJsonObject())
                            else
                                o.rules.push(x)

                        }
                    });
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }

        CoreDebug.checkJsonSerialize(o, "ControlAssessment");

        return o;
    }


    static fromJsonObject(pOpts:any):ControlAssessment {
        const a = new ControlAssessment(pOpts);

        if(a.rules.length>0){
            a.rules.map((vRule,vIndex)=>{
                const type = vRule.TYPE!=null ? vRule.TYPE : (vRule as any)._type;

                if(type===MerlinType.REQUEST){
                    a.rules[vIndex] = MerlinSearchRequest.fromJsonObject(vRule);
                }else{
                    a.rules[vIndex] = Merlin.fromJsonObject(vRule);
                }

            });
        }

        return a;
    }

    isControlAssessment(): boolean {
        return true;
    }

    isControl(): boolean {
        return false;
    }
}