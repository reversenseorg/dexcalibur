import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {OrganizationUnitUUID} from "../../../organization/OrganizationUnit.js";
import {ApplicationUnitUUID} from "../../../organization/ApplicationUnit.js";


export class GlobalAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'GLOB';

    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner', [], NodeInternalType.USER_ACCOUNT),
        ORG: new AccessAttribute<OrganizationUnitUUID>( 'org_unit', [], NodeInternalType.ORG_UNIT),
        APP: new AccessAttribute<ApplicationUnitUUID>( 'app_unit', [], NodeInternalType.APP_UNIT),
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

