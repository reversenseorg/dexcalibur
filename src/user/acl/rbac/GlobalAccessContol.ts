import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {Workflow} from "../../../Workflow.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";


export class GlobalAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'GLOB';

    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner'),
        ORG: new AccessAttribute<any>( 'org_unit'),
        APP: new AccessAttribute<any>( 'app_unit'),
    };

    constructor() {
        super();


    }



    boot():void{
        if(!GlobalAccessControl.ready){
            AccessControl.getInstance().assignAccess(
                AccessZone.GLOBAL,
                [
                    AccessControl.access.GLOB_SHOW_OWN_WORKFLOWS
                ]
            );
            GlobalAccessControl.ready = true;
        }
    }

}

