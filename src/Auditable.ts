import {ValidationCapable, ValidationRulesMap} from "./Validator.js";
import {AccessAttribute, AccessAttributeMap} from "./user/acl/AccessAttribute.js";

export abstract class Auditable extends ValidationCapable{

    _attr: AccessAttributeMap = {};

    constructor( pValidationRules:ValidationRulesMap) {
        super(pValidationRules);

        this.initAccessAttributes();
    }

    abstract initAccessAttributes();

    /**
     * To get access attribute by its name
     *
     * @param {string} pName Attribute name
     * @return {AccessAttribute}
     */
    getAccessAttribute(pAttr: AccessAttribute): any {
        return this._attr[pAttr.name];
    }

    /**
     * To get access attribute by its name
     *
     * @param {string} pName Attribute name
     * @return {AccessAttribute}
     */
    setAccessAttribute(pAttr: AccessAttribute, pValue:any): void {
        this._attr[pAttr.name] = pValue;
    }


    importAccessAttributes(pRawAttr:any): void {
        for(const n in pRawAttr){
            this._attr[n] = pRawAttr[n];
        }
    }
}