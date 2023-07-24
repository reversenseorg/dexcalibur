import DataProperty from "./DataProperty.js";
import Constraint, {ConstraintType} from "./Constraint.js";
import CodeConstraint from "./CodeConstraint.js";
import AssuranceModel from "./AssuranceModel.js";
import Asset from "./Asset.js";
import {CoreDebug} from "../../core/CoreDebug.js";

export interface ThreatOptions {
    id?:string;
    uid?:string ;
    name?:string;
    description?:string;
    refs?:string[];
    property?:DataProperty;
    signature?:Constraint[];
}
/**
 *
 */
export default class Threat extends Asset{

    id:string;
    uid:string ;
    name:string;
    description:string;
    property:DataProperty;
    signature:Constraint[] = [];

    refs:string[] = [];

    _codeBased = false;

    constructor( pConfig:any = null) {
        super(pConfig);
        
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    appendSignature(pConstraint:Constraint):void{
        if(pConstraint.type===ConstraintType.CODE){
            this._codeBased = true;
        }

        this.signature.push(pConstraint);
    }

    isCodeCheckable():boolean {
        return this._codeBased;
    }

    toJsonObject(pExclude:string[] = []):any{
        const o:any = {};
        for(let i in this){
            if(pExclude.indexOf(i)>-1) continue;

            switch (i){
                case "signature":
                    o.signature = [];
                    this.signature.map(x => {
                        o.signature.push(x.toJsonObject());
                    })
                    break;
                case "id":
                case "uid":
                case "name":
                case "description":
                case "refs":
                case "_codeBased":
                    o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "Threat");
        return o;
    }
}