import AssuranceModel from "./AssuranceModel.js";
import SecurityConstraintModel from "./SecurityConstraintModel.js";



export default class SecurityModel extends AssuranceModel {

    dataConstraints:SecurityConstraintModel;

    constructor( pConfig:any = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}