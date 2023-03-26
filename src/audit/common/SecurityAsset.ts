import Asset from "./Asset.js";
import SecurityConstraintModel from "./SecurityConstraintModel.js";
import Constraint from "./Constraint.js";


export default class SecurityAsset extends Asset {

    static CIA_MODEL:SecurityConstraintModel = new SecurityConstraintModel({
        constraints:[
            new Constraint({ name:"confidentiality"}),
            new Constraint({ name:"integrity"}),
            new Constraint({ name:"confidentiality"}),
        ]
    })
    constraints:any[];

    constructor( pConfig:any = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}