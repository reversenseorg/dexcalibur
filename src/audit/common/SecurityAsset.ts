import Asset from "./Asset.js";
import SecurityConstraintModel from "./SecurityConstraintModel.js";
import Constraint, {ConstraintType} from "./Constraint.js";


export default class SecurityAsset extends Asset {

    static CIA_MODEL:SecurityConstraintModel = new SecurityConstraintModel({
        constraints:[
            new Constraint(ConstraintType.ANY, { name:"confidentiality"}),
            new Constraint(ConstraintType.ANY, { name:"integrity"}),
            new Constraint(ConstraintType.ANY, { name:"confidentiality"}),
        ]
    })
    constraints:any[];

    constructor( pConfig:any = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}