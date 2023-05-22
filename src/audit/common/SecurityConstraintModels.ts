
// CIA
// TAMPER


import Constraint, {ConstraintType} from "./Constraint.js";
import SecurityConstraintModel from "./SecurityConstraintModel.js";

export const CIA_SECURITY_CONSTRAINTS = new SecurityConstraintModel({
    name:"CIA",
    constraints:[
        new Constraint(ConstraintType.ANY, { name:"confidentiality"}),
        new Constraint(ConstraintType.ANY, { name:"integrity"}),
        new Constraint(ConstraintType.ANY, { name:"confidentiality"})
    ]
});


export const TAMPER_SECURITY_CONSTRAINTS = new SecurityConstraintModel({
    name:"TAMPER",
    constraints:[
        new Constraint(ConstraintType.ANY, { name:"tampering"}),
        new Constraint(ConstraintType.ANY, { name:"authenticity"}),
        new Constraint(ConstraintType.ANY, { name:"confidentiality"})
    ]
});