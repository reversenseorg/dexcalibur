import {AssetOptions} from "./Asset.js";
import {MerlinSearchRequest} from "../../search/MerlinSearchRequest.js";

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

    rules?:MerlinSearchRequest[];

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

    rules:MerlinSearchRequest[] = [];

    matches:any[] = [];

    constructor( pConfig:ControlAssessmentOpts = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    getRules():MerlinSearchRequest[] {
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
                        o.matches.push( x.toJsonObject());
                    });
                    break;
                case "rules":
                    o.rules = [];
                    this.rules.map( x => {
                       o.rules.push( x.toJsonObject());
                    });
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        return o;
    }
}