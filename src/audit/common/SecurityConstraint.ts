
// CIA
// TAMPER


import Constraint from "./Constraint";

export default class SecurityConstraint  {

    name:string;
    impl:any;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    verify( pNode:any):void {
        // todo
        if(this.impl!=null){

        }
    }
}