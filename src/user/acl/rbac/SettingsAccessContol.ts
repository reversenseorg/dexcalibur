import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access.js";
import {UserSession} from "../../session/UserSession.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import DexcaliburProject from "../../../DexcaliburProject.js";
import {UserAccount} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";


export class SettingsAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'SETT';

    static attr:AccessAttributeMap = {};

    constructor() {
        super();


    }

    boot():void{
        if(!SettingsAccessControl.ready){
            AccessControl.getInstance().assignAccess(
                AccessZone.GLOBAL,
                []
            );
            SettingsAccessControl.ready = true;
        }
    }

}

