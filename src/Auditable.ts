import {ValidationCapable, ValidationRulesMap} from "./Validator.js";
import {AccessAttribute, AccessAttributeMap} from "./user/acl/AccessAttribute.js";
import {AccessControlException} from "./errors/AccessControlException.js";


/**
 * Represent a Node with Limited Accesses verified by
 * AccessControl at runtime
 *
 * @extends {ValidationCapable}
 * @abstract
 * @class
 */
export abstract class Auditable extends ValidationCapable{

    /**
     * The map of access attribute for this instance
     * @type {AccessAttributeMap}
     * @field
     */
    protected _attr: AccessAttributeMap = {};

    constructor( pValidationRules:ValidationRulesMap) {
        super(pValidationRules);

        this.initAccessAttributes();
    }

    abstract initAccessAttributes();

    /**
     * To remove an access attribute
     *
     * It must recreated immediately after, else an exception will be throw
     * at first check
     *
     * @param {AccessAttribute} pAttr Definittion of attribute to remove from current instance
     * @return {void}
     * @method
     */
    removeAccessAttribute(pAttr: AccessAttribute<any>):void {
        delete this._attr[pAttr.name];
    }

    /**
     * To get access attribute by its name
     *
     * Should be a list user UUIDs
     *
     * @param {AccessAttribute<T>} pAttr Attribute name
     * @return {AccessAttribute<T>}
     */
    getAccessAttribute<T>(pAttr: AccessAttribute<T>): AccessAttribute<T> {
        return this._attr[pAttr.name];
    }

    /**
     * To set access attribute of this instance
     *
     * @param {AccessAttribute<T>} pAttr Attribute name
     * @param {T[]} pValue Optional. Attribute initial value
     * @return {void}
     * @method
     */
    setAccessAttribute<T>(pAttr: AccessAttribute<T>, pValue?:T[]): void {
        if(this._attr[pAttr.name]==null){
            this._attr[pAttr.name] = pAttr;
        }

        if(pValue!=null){
            this._attr[pAttr.name].value = pValue;
        }
    }

    /**
     * To append a value to an attribute of the current instance
     *
     * @param {AccessAttribute<T>} pAttr
     * @param {T} pValue
     * @return {void}
     * @method
     */
    appendToAccessAttribute<T>(pAttr:AccessAttribute<T>, pValue:T): void {
        if(this._attr[pAttr.name]==null){
            throw AccessControlException.UNKNOWN_ACL_ATTRIBUTE(pAttr);
        }

        this._attr[pAttr.name].append(pValue);
    }


    importAccessAttributes(pRawAttr:AccessAttributeMap): void {
        for(const n in pRawAttr){
            this._attr[n] = pRawAttr[n];
        }
    }
}