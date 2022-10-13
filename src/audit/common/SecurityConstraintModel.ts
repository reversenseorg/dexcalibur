
// CIA
// TAMPER


import Constraint from "./Constraint";

export default class SecurityConstraintModel  {

    name:string;
    constraints:Constraint[];

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}