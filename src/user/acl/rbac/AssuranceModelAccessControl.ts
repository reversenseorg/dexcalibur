import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {AccesErrCode, Access, AccessException, AccessMap, AccessType} from "../Access.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccount} from "../../UserAccount.js";

/**
 * Represent access control configuration for audits
 * @class
 */
export class AuditAccessControl extends DelegateAccessControl {

    static uid:string = 'AUDIT';

    static access:AccessMap = {
        GLOBAL_MODEL_EDIT: new Access( AccessType.WRITE, 'Edit AssuranceModels shared by all projects'),
        GLOBAL_MODEL_READ: new Access( AccessType.READ, 'Read AssuranceModels shared by all projects'),
        GLOBAL_MODEL_DELETE: new Access( AccessType.WRITE, 'Delete AssuranceModels shared by all projects'),
        GLOBAL_MODEL_CREATE: new Access( AccessType.WRITE, 'Create AssuranceModels shared by all projects'),

        PROJECT_MODEL_READ: new Access( AccessType.READ, 'Create AssuranceModels for a specific project'),
        PROJECT_MODEL_EDIT: new Access( AccessType.WRITE, 'Delete AssuranceModels for a specific project'),
        PROJECT_MODEL_DELETE: new Access( AccessType.WRITE, 'Delete AssuranceModels for a specific project'),
        PROJECT_MODEL_CREATE: new Access( AccessType.WRITE, 'Create AssuranceModels for a specific project')
    };


    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute( 'owner')
    };

    constructor() {
        super();

    }


    /**
     *
     * @param pAccess
     * @param pSession
     */
    check(pAccess: Access, pAccount:UserAccount, pExtra:any = null) {
        switch (pAccess.name) {
            case 'GLOBAL_MODEL_EDIT':
            case 'GLOBAL_MODEL_READ':
            case 'GLOBAL_MODEL_DELETE':
            case 'GLOBAL_MODEL_CREATE':
                if(pAccount.getUserRole().hasAccess(pAccess)===false){
                    throw new AccessException("[AUDIT] Access violation, current user has not enough privilege ("+pAccess.name+") ", AccesErrCode.VIOLATION)
                }
            case 'PROJECT_MODEL_EDIT':
            case 'PROJECT_MODEL_READ':
            case 'PROJECT_MODEL_DELETE':
            case 'PROJECT_MODEL_CREATE':
                if(pAccount.getUserRole().hasAccess(pAccess)===false){
                    throw new AccessException("[AUDIT] Access violation, current user has not enough privilege ("+pAccess.name+") ", AccesErrCode.VIOLATION)
                }else{
                    // do attributes check to verify ownership
                    this.checkAttr( AuditAccessControl.attr.OWNER, pAccount, pExtra);
                }
                break;
            default:
                throw new AccessException("Access unknow : rejected ", AccesErrCode.ACCESS_UNKNOWN)
        }
    }


    /**
     * Settings have not yet security attributes.
     *
     * @param pAttr
     * @param pAccount
     * @param pExtra
     */
    checkAttr(pAttr: AccessAttribute, pAccount:UserAccount, pExtra:any = null) {
        switch (pAttr.name) {
            case 'owner':
                // verify project owner is the current user
                if(pAccount.getUID() !== pExtra.getAccessAttribute(pAttr)){
                    throw new AccessException("[GLOBAL] The object is not owned by the user : rejected ", AccesErrCode.VIOLATION);
                }
                break;
            default:
                throw new AccessException("Access attribute unknow : rejected ", AccesErrCode.ATTR_UNKNOWN)
        }
    }
}