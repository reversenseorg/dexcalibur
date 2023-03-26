
// CIA
// TAMPER


import Constraint from "./Constraint.js";

export default class DataProperty  {

    name:string;
    desc:any;
    tag:number[];

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}