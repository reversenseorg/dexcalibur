import {ValidationCapable, ValidationRulesMap} from "./Validator.js";
import {AccessAttribute, AccessAttributeMap} from "./user/acl/AccessAttribute.js";
import {UserGroupUUID} from "./user/acl/common/UserGroup.js";
import {UserAccount} from "./user/UserAccount.js";
import {AccessControlException} from "./errors/AccessControlException.js";
import {GlobalAccessControl} from "./user/acl/rbac/GlobalAccessContol.js";


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
    setAccessAttribute<T>(pAttr: AccessAttribute<T>, pValue?:T[]|T): void {
        if(this._attr==null){
            this._attr = {};
        }

        if(this._attr[pAttr.name]==null){
            this._attr[pAttr.name] = pAttr;
        }

        if(pValue!=null){
            if(Array.isArray(pValue)){
                this._attr[pAttr.name].value = pValue;
            }else{
                this._attr[pAttr.name].value = [pValue];
            }
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
        if(this._attr==null){
            this._attr = {};
        }

        if(this._attr[pAttr.name]==null){
            this.setAccessAttribute(pAttr);
            // throw AccessControlException.UNKNOWN_ACL_ATTRIBUTE(pAttr);
        }

        this._attr[pAttr.name].append(pValue);
    }


    importAccessAttributes(pRawAttr:AccessAttributeMap): void {
        for(const n in pRawAttr){
            this._attr[n] = pRawAttr[n];
        }
    }

    protected __beforeAuthorizationCheck(pAccount:UserAccount, pAttrGrps:AccessAttribute<any>[]):boolean{
        // Nothing here
        return true;
    }


    /**
     * To check if specified user account is a member of this organization
     * and if the user is a part of some specified groups
     *
     * @param pAccount
     * @param {UserGroupUUID[]}  pGroups Required user groups
     * @returns {UserGroupUUID[]} Matching groups
     */
    /*
    isAuthorizedByAttrGrp(pAccount:UserAccount, pAttrGrps:AccessAttribute<any>[]):UserGroupUUID[]{

        if(!this.__beforeAuthorizationCheck(pAccount,pAttrGrps)){ //pAccount.isMemberOf(this.getUID())){
            // if the hook return FALSE => abort check
            return [];
        }

        this.getAccessAttribute(GlobalAccessControl.attr.ORG);
        // check groups
        //const membership = pAccount.getMembership(this.getUID());
        //if(membership.groups==null){ return []; }

        const requiredGrps:UserGroupUUID[] = [];

        // retrieve usergroup from attributes of this instance
        pAttrGrps.map(vAttr => {
            requiredGrps.push(this.getAccessAttribute(vAttr).usergroup);
        });

        // gather top-level user group and org-level user group

        // check if the user membership contains accesses to at least one of these groups

        let result:UserGroupUUID[] = [];
        membership.groups.map(vGrp => {
            if(requiredGrps.indexOf(vGrp)>-1){
                result.push(vGrp);
            }
        });

        if(result==null){
            throw AccessControlException.NOT_AUTHORIZED_BY_GRP(pAttrGrps,pAccount);
        }
        return result;
    }*/
}