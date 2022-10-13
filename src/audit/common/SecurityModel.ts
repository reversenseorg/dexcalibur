import AssuranceModel from "./AssuranceModel";
import SecurityConstraintModel from "./SecurityConstraintModel";



export default class SecurityModel extends AssuranceModel {

    dataConstraints:SecurityConstraintModel;

    constructor( pConfig:any = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}