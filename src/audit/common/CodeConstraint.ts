
// CIA
// TAMPER


import Constraint, {ConstraintOptions, ConstraintType} from "./Constraint.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";;
import {CoreDebug} from "../../core/CoreDebug.js";


export interface CodeConstraintOptions extends ConstraintOptions {
    impl?:any;

    node?:NodeInternalType;

    pattern?:string;
}

export default class CodeConstraint extends Constraint {

    name:string;

    impl:any;

    node:NodeInternalType;

    pattern:string;

    constructor( pNode:NodeInternalType, pConfig:CodeConstraintOptions = null) {
        super(ConstraintType.CODE, pConfig);

        this.node = pNode;
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    verify( pNode:any):void {
        // todo
        if(this.impl!=null){

        }
    }

    toJsonObject( pIgnoreEl = true):any{
        const o:any = {};
        for(let i in this){
            switch (i){
                case "el":
                    if(this.el==null)
                        o.el = null;
                    else
                        o.el = this.el.uid;
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "CodeConstraint");
        return o;
    }
}