import Constraint, {ConstraintType} from "./Constraint.js";
import {CoreDebug} from "../../core/CoreDebug.js";

export class ConstraintMatch<T> {

    constraint:Constraint;

    el:T;

    subject:any;

    match:any;

    constructor(pConstraint:Constraint, pMatch:any, pSubject:any, pElement:T) {
        this.constraint = pConstraint;
        this.match = pMatch;
        this.subject = pSubject;
        this.el = pElement;
    }

    getType():ConstraintType {
        return this.constraint.type;
    }

    toJsonObject():any {
        const o:any = {};
        o.constraint = this.constraint.toJsonObject();
        o.match = this.match;
        o.subject = this.subject.uid;
        o.el = ((this.el as any).toJsonObject!=null)? (this.el as any).toJsonObject() : this.el;
        CoreDebug.checkJsonSerialize(o, "ConstraintMatch");
        return o;
    }
}