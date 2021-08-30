import {DelegateAccessControl} from "../DelegateAccessControl";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access";
import {UserSession} from "../../session/UserSession";


export class ProjectAccessControl extends DelegateAccessControl {

    static uid:string = 'PROJ';

    static access:AccessMap = {
        PROJ_SETTINGS_EDIT: new Access( AccessType.WRITE, 'PROJ_SETTINGS_EDIT', 'Edit project settings'),
        PROJ_SETTINGS_READ: new Access( AccessType.READ, 'PROJ_SETTINGS_READ', 'Read project settings'),
        PROJ_OPEN_OWN: new Access( AccessType.READ, 'PROJ_OPEN_OWN', 'Open own project'),
        PROJ_OPEN_ANY: new Access( AccessType.READ, 'PROJ_OPEN_ANY', 'Open any project'),
        PROJ_CREATE_OWN: new Access( AccessType.WRITE, 'PROJ_CREATE_OWN', 'Create own project'),
        PROJ_DELETE_OWN: new Access( AccessType.WRITE, 'PROJ_DELETE_OWN', 'Delete own projects'),
        PROJ_DELETE_ANY: new Access( AccessType.WRITE, 'PROJ_DELETE_ANY', 'Delete any projects'),
        PROJ_META_READ: new Access( AccessType.WRITE, 'PROJ_META_READ', 'Read project meta data (list)'),
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
            default:
                throw new AccessException("Access unknow : rejected ", AccesErrCode.ACCESS_UNKNOWN)
        }
    }
}

