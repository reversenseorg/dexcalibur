
// CIA
// TAMPER


import Constraint, {ConstraintType} from "./Constraint.js";

export default class SecurityConstraint extends Constraint {

    name:string;
    impl:any;

    constructor( pConfig:any = null) {
        super( ConstraintType.ANY, pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    verify( pNode:any):void {
        // todo
        if(this.impl!=null){

        }
    }
}