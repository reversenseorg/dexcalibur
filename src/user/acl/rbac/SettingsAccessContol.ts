import {DelegateAccessControl} from "../DelegateAccessControl";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access";
import {UserSession} from "../../session/UserSession";


export class SettingsAccessControl extends DelegateAccessControl {

    static uid:string = 'GLOB';

    static access:AccessMap = {
        GLOBAL_SETTINGS_EDIT: new Access( AccessType.WRITE, 'Edit global settings'),
        GLOBAL_SETTINGS_READ: new Access( AccessType.READ, 'Read global settings'),
        SERVER_RESTART: new Access( AccessType.EXE, 'Restart server'),
        SERVER_STOP: new Access( AccessType.EXE, 'Stop server')
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

