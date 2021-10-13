import {DelegateAccessControl} from "../DelegateAccessControl";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute";
import {Workflow} from "../../../Workflow";
import {UserAccount} from "../../UserAccount";


export class GlobalAccessControl extends DelegateAccessControl {

    static uid:string = 'GLOB';

    static access:AccessMap = {
        GLOB_SHOW_ALL_WORKFLOWS: new Access( AccessType.READ, 'GLOB_SHOW_ALL_WORKFLOWS', 'Show all workflows for the engine instance'),
        GLOB_SHOW_OWN_WORKFLOWS: new Access( AccessType.READ, 'GLOB_SHOW_OWN_WORKFLOWS', 'Show only workflows owned by the user')
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
     * @param pAccount
     * @param pExtra
     */
    check(pAccess: Access, pAccount:UserAccount, pExtra:any = null) {
        switch (pAccess.name) {
            case 'GLOB_SHOW_ALL_WORKFLOWS':
                if(pAccount.getUserRole().hasAccess(pAccess)===false){
                    throw new AccessException("[PROJECT] Access violation, current user has not enough privilege ("+pAccess.name+") ", AccesErrCode.VIOLATION)
                }
            case 'GLOB_SHOW_OWN_WORKFLOWS':
                if(pAccount.getUserRole().hasAccess(pAccess)===false){
                    throw new AccessException("[PROJECT] Access violation, current user has not enough privilege ("+pAccess.name+") ", AccesErrCode.VIOLATION)
                }else{
                    // do attributes check to verify ownership
                    this.checkAttr( GlobalAccessControl.attr.OWNER, pAccount, pExtra);
                }
                break;
            default:
                throw new AccessException("Access unknow : rejected ", AccesErrCode.ACCESS_UNKNOWN)
        }
    }

    /**
     *
     * @param pAccess
     * @param pSession
     */
    checkAttr(pAttr: AccessAttribute, pAccount:UserAccount, pWf:Workflow = null) {
        switch (pAttr.name) {
            case 'owner':
                // verify project owner is the current user
                if(pAccount.getUID() !== pWf.getAccessAttribute(pAttr)){
                    throw new AccessException("[GLOBAL] The object is not owned by the user : rejected ", AccesErrCode.VIOLATION);
                }
                break;
            default:
                throw new AccessException("Access attribute unknow : rejected ", AccesErrCode.ATTR_UNKNOWN)
        }
    }
}

