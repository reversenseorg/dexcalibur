
// CIA
// TAMPER


import Constraint from "./Constraint";
import SecurityConstraintModel from "./SecurityConstraintModel";

export const CIA_SECURITY_CONSTRAINTS = new SecurityConstraintModel({
    name:"CIA",
    constraints:[
        new Constraint({ name:"confidentiality"}),
        new Constraint({ name:"integrity"}),
        new Constraint({ name:"confidentiality"})
    ]
});


export const TAMPER_SECURITY_CONSTRAINTS = new SecurityConstraintModel({
    name:"TAMPER",
    constraints:[
        new Constraint({ name:"tampering"}),
        new Constraint({ name:"authenticity"}),
        new Constraint({ name:"confidentiality"})
    ]
});