import {AccessAttribute, AccessAttributeMap} from "./AccessAttribute";

export interface IAuditableAccess {

    _attr:AccessAttributeMap;

    getAccessAttribute(pAttr:AccessAttribute):any;
}