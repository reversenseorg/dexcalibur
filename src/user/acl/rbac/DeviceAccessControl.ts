import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccountUUID} from "../../UserAccount.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

export class DeviceAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'DEV';

    static attr:AccessAttributeMap = {
        TPL_OWNER: new AccessAttribute<UserAccountUUID>( 'tpl_owner', [], NodeInternalType.USER_ACCOUNT)
    };

    constructor() {
        super();
    }

    boot():void{
        if(!DeviceAccessControl.ready){
            DeviceAccessControl.ready = true;
        }
    }


}