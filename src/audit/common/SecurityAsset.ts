import Asset from "./Asset";
import SecurityConstraintModel from "./SecurityConstraintModel";
import Constraint from "./Constraint";


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