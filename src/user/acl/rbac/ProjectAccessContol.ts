import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access.js";
import {UserSession} from "../../session/UserSession.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import DexcaliburProject from "../../../DexcaliburProject.js";
import {UserAccount} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {Nullable} from "../../../core/IStringIndex.js";


export class ProjectAccessControl extends DelegateAccessControl {

    static uid:string = 'PROJ';

    static access:AccessMap = {
        PROJ_SETTINGS_EDIT: new Access( AccessType.WRITE, 'PROJ_SETTINGS_EDIT', 'Edit project settings'),
        PROJ_SETTINGS_READ: new Access( AccessType.READ, 'PROJ_SETTINGS_READ', 'Read project settings'),
        PROJ_CHOWN: new Access( AccessType.WRITE, 'PROJ_CHOWN', 'Change project owner'),
        PROJ_OPEN_OWN: new Access( AccessType.READ, 'PROJ_OPEN_OWN', 'Open own project'),
        PROJ_OPEN_ANY: new Access( AccessType.READ, 'PROJ_OPEN_ANY', 'Open any project'),
        PROJ_CREATE_OWN: new Access( AccessType.WRITE, 'PROJ_CREATE_OWN', 'Create own project'),
        PROJ_DELETE_OWN: new Access( AccessType.WRITE, 'PROJ_DELETE_OWN', 'Delete own projects'),
        PROJ_DELETE_ANY: new Access( AccessType.WRITE, 'PROJ_DELETE_ANY', 'Delete any projects'),
        PROJ_META_READ: new Access( AccessType.WRITE, 'PROJ_META_READ', 'Read project meta data (list)'),
        PROJ_PKG_READ: new Access( AccessType.READ, 'PROJ_PKG_READ', 'Read package content'),
        PROJ_NEW_OWN_WF: new Access( AccessType.WRITE, 'PROJ_NEW_OWN_WF', 'Create new project workflow'),
        PROJ_APPDATA_READ: new Access( AccessType.READ, 'PROJ_APPDATA_READ', 'Read app data content on the device'),
        CLOSE_OWN_PROJECT: new Access( AccessType.EXE, 'CLOSE_OWN_PROJECT', 'Close the project according to owner and group attributes'),
    };

    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute( 'owner'),
        TESTER: new AccessAttribute( 'tester')
   //     GROUP: new AccessAttribute( 'group')
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
            case 'CLOSE_OWN_PROJECT':
                this.checkAttr(
                    ProjectAccessControl.attr.OWNER,
                    pAccount,
                    pExtra,
                    "Project cannot be closed. "
                );
            case 'PROJ_PKG_READ':
            case 'PROJ_SETTINGS_EDIT':
            case 'PROJ_SETTINGS_READ':
            case 'CLOSE_ANY_PROJECT':
                if(pAccount.getUserRole().hasAccess(pAccess)===false){
                    throw new AccessException("[PROJECT] Access violation, current user has not enough privilege ("+pAccess.name+") ", AccesErrCode.VIOLATION)
                }
                break;

            case 'PROJ_OPEN_OWN':
                // the role MUST have access right
                if(pAccount.getUserRole().hasAccess(pAccess)===false){
                    throw new AccessException("[PROJECT] Access violation, current user has not enough privilege ("+pAccess.name+") ", AccesErrCode.VIOLATION)
                }
                // AND user must be owner
                /*this.checkAttr(
                    ProjectAccessControl.attr.OWNER,
                    pAccount,
                    pExtra,
                    "Project cannot be opened. "
                )*/
                break;
            default:
                throw new AccessException("Access unknow : rejected ", AccesErrCode.ACCESS_UNKNOWN)
        }
    }

    /**
     * To check if an attribute of a DexcaliburProject instance satisfies some constraints
     *
     * @param pAttr
     * @param pAccount
     * @param pProject
     * @param pMessage
     * @method
     */
    checkAttr(pAttr: AccessAttribute, pAccount:UserAccount, pProject:Nullable<DexcaliburProject> = null, pMessage:string = "") {
        if(pProject==null){
            throw new AccessException("Access attribute of an undefined object cannot be verified : rejected ", AccesErrCode.MANDATORY_OBJECT_UNDEFINED)
        }

        switch (pAttr.name) {
            case 'owner':
                // verify project owner is the current user
                if(pAccount.getUID() !== pProject.getAccessAttribute(pAttr)){
                    throw new AccessException("[PROJECT] "+pMessage+" The project is not owned by the user : rejected ", AccesErrCode.VIOLATION);
                }
                break;
            case 'tester':
                // verify project owner is the current user
                if(pProject.getAccessAttribute(pAttr).indexOf(pAccount.getUID())==-1){
                    throw new AccessException("[PROJECT] "+pMessage+" The project cannot be tested by the user : rejected ", AccesErrCode.VIOLATION);
                }
                break;
            default:
                throw new AccessException("Access attribute unknow : rejected ", AccesErrCode.ATTR_UNKNOWN)
        }
    }
}

