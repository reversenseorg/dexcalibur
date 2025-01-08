import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccountUUID} from "../../UserAccount.js";

export class DeviceAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'DEV';

    static attr:AccessAttributeMap = {
        TPL_OWNER: new AccessAttribute<UserAccountUUID>( 'tpl_owner')
    };

    constructor() {
        super();
    }

    boot():void{
        if(!DeviceAccessControl.ready){
            /*AccessControl.getInstance().assignAccess(
                AccessZone.PROJECT,
                [
                    AccessControl.access.PROJ_OPEN_OWN,
                    AccessControl.access.PROJ_OPEN_ANY
                ]
            );*/
            DeviceAccessControl.ready = true;
        }
    }


}