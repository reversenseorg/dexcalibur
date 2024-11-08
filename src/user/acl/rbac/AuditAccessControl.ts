import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {AccesErrCode, Access, AccessException, AccessMap, AccessType} from "../Access.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";

/**
 * Represent access control configuration for audits
 * @class
 */
export class AuditAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'AUDIT';

    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner')
    };

    constructor() {
        super();



    }

    boot():void{
        if(!AuditAccessControl.ready){
            AccessControl.getInstance().assignAccess(
                AccessZone.AUDIT,
                [
                    AccessControl.access.PROJECT_MODEL_EDIT,
                    AccessControl.access.PROJECT_MODEL_READ,
                    AccessControl.access.PROJECT_MODEL_DELETE,
                    AccessControl.access.PROJECT_MODEL_CREATE
                ]
            );
            AuditAccessControl.ready = true;
        }
    }

}