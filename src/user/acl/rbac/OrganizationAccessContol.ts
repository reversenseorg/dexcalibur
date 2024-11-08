import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access.js";
import {UserSession} from "../../session/UserSession.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import DexcaliburProject from "../../../DexcaliburProject.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {Nullable} from "../../../core/IStringIndex.js";
import {Auditable} from "../../../Auditable.js";
import {AccessZone} from "../Zones.js";


export class OrganizationAccessControl extends DelegateAccessControl {


    static ready = false;

    static uid:string = 'ORG';

    static attr:AccessAttributeMap = {
        ORG_MEMBER: new AccessAttribute<UserAccountUUID>( 'org_member'),
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner'),
    };

    constructor() {
        super();


    }



    boot():void{
        if(!OrganizationAccessControl.ready){
            AccessControl.getInstance().assignAccess(
                AccessZone.ORGANIZATION,
                [

                    AccessControl.access.ORG_OU_READ,
                    AccessControl.access.ORG_OU_MODIFY,
                    AccessControl.access.ORG_AU_READ,
                    AccessControl.access.ORG_AU_MODIFY
                    //AccessControl.access.ORG_AUTH_MGT,
                    //AccessControl.access.ORG_ACL_MGT
                ]
            );
            OrganizationAccessControl.ready = true;
        }
    }

}

