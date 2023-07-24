import Threat from "./Threat.js";
import {CoreDebug} from "../../core/CoreDebug.js";

export enum ConstraintType {
    CODE,
    FLOW,
    UI,
    ANY,
    PHYSICAL
}

export interface ConstraintOptions {
    type?:ConstraintType;
    name?:string;

    el?:any;
}

/**
 * Represent a constraint
 */
export default class Constraint  {

    type:ConstraintType;

    name:string;

    el:any = null;

    constructor( pType:ConstraintType, pConfig:ConstraintOptions = null) {
        this.type = pType;
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    toJsonObject():any{
        const o:any = {};
        for(let i in this){
            switch (i){
                case "el":
                    o.el = null
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "Constraint");
        return o;
    }
}