import {AccessAttribute, AccessAttributeMap} from "./AccessAttribute.js";

export interface IAuditableAccess {

    _attr:AccessAttributeMap;

    getAccessAttribute(pAttr:AccessAttribute):any;
}