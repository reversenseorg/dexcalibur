import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";
import {MerlinRule} from "../../search/MerlinRule.js";
import {Merlin, MerlinPrimitive, MerlinType} from "../../search/Merlin.js";

export enum TestType {
    VT, // check if implemented
    PT // bypass
}

export enum AnalysisType {
    SAST, // support VT/PT
    DAST, // support VT/PT
}


export interface ControlAssessmentOpts {
    id?:string;

    name?:string;

    description?:string;

    links?:string;

    testType?:TestType;

    analType?:AnalysisType;

    rules?:(MerlinRule|MerlinSearchRequest)[];

}

/**
 * Represent a
 */
export default class ControlAssessment {

    id:string;

    name:string;

    description = "";

    links = "";

    testType:TestType = TestType.VT;

    analType:AnalysisType = AnalysisType.SAST;

    rules:MerlinPrimitive[] = [];

    matches:any[] = [];

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
                case "matches":
                    o.matches = [];
                    this.matches.map( x => {
                       // o.matches.push( x.toJsonObject());
                        if(x!=null){
                            o.matches.push( x.toJsonObject());
                        }
                    });
                    break;
                case "rules":
                    o.rules = [];
                    this.rules.map( x => {
                        if(x!=null){
                            o.rules.push( x.toJsonObject());
                        }
                    });
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        return o;
    }


    static fromJsonObject(pOpts:any):ControlAssessment {
        const a = new ControlAssessment(pOpts);

        if(a.rules.length>0){
            a.rules.map((vRule,vIndex)=>{
                if(vRule.TYPE===MerlinType.REQUEST){
                    a.rules[vIndex] = MerlinSearchRequest.fromJsonObject(vRule);
                }else{
                    a.rules[vIndex] = Merlin.fromJsonObject(vRule);
                }

            });
        }

        return a;
    }
}