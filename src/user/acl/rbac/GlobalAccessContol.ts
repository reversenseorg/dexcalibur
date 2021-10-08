import {DelegateAccessControl} from "../DelegateAccessControl";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access";
import {UserSession} from "../../session/UserSession";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute";
import {Workflow} from "../../../Workflow";


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
     * @param pSession
     */
    check(pAccess: Access, pSession: UserSession, pExtra:any = null) {
        switch (pAccess.name) {
            case 'GLOB_SHOW_ALL_WORKFLOWS':
                if(pSession.getUserAccount().getUserRole().hasAccess(pAccess)===false){
                    throw new AccessException("[PROJECT] Access violation, current user has not enough privilege ("+pAccess.name+") ", AccesErrCode.VIOLATION)
                }
            case 'GLOB_SHOW_OWN_WORKFLOWS':
                if(pSession.getUserAccount().getUserRole().hasAccess(pAccess)===false){
                    throw new AccessException("[PROJECT] Access violation, current user has not enough privilege ("+pAccess.name+") ", AccesErrCode.VIOLATION)
                }else{
                    // do attributes check to verify ownership
                    this.checkAttr( GlobalAccessControl.attr.OWNER, pSession, pExtra);
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
    checkAttr(pAttr: AccessAttribute, pSession: UserSession, pWf:Workflow = null) {
        switch (pAttr.name) {
            case 'owner':
                // verify project owner is the current user
                if(pSession.getUserAccount().getUID() !== pWf.getAccessAttribute(pAttr.name).value){
                    throw new AccessException("[GLOBAL] The object is not owned by the user : rejected ", AccesErrCode.VIOLATION);
                }
                break;
            default:
                throw new AccessException("Access attribute unknow : rejected ", AccesErrCode.ATTR_UNKNOWN)
        }
    }
}

