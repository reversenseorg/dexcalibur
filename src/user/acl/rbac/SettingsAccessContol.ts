import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access.js";
import {UserSession} from "../../session/UserSession.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import DexcaliburProject from "../../../DexcaliburProject.js";
import {UserAccount} from "../../UserAccount.js";


export class SettingsAccessControl extends DelegateAccessControl {

    static uid:string = 'GLOB';

    static access:AccessMap = {
        GLOBAL_SETTINGS_EDIT: new Access( AccessType.WRITE, 'Edit global settings'),
        GLOBAL_SETTINGS_READ: new Access( AccessType.READ, 'Read global settings'),
        SERVER_RESTART: new Access( AccessType.EXE, 'Restart server'),
        SERVER_STOP: new Access( AccessType.EXE, 'Stop server')
    };


    static attr:AccessAttributeMap = {};

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
            default:
                throw new AccessException("Settings : Access unknow => rejected ", AccesErrCode.ACCESS_UNKNOWN)
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
        throw new AccessException("Settings : Access attribute unknow => rejected ", AccesErrCode.ATTR_UNKNOWN);
    }
}

