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
import {OrganizationManager} from "../../../organization/OrganizationManager.js";
import {UserServiceException} from "../../../errors/UserServiceException.js";


export class OrganizationAccessControl extends DelegateAccessControl {


    static ready = false;

    static uid:string = 'ORG';

    static attr:AccessAttributeMap = {
        ORG_MEMBER: new AccessAttribute<UserAccountUUID>( 'org_member'),
        APP_MEMBER: new AccessAttribute<UserAccountUUID>( 'app_member'),
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner'),
    };

    constructor() {
        super();


    }

    static getOwnerFilter(pUserAccountUID:UserAccountUUID):any {

        if(!UserAccount.VALIDATE._uid.test(pUserAccountUID)){
            throw UserServiceException.INVALID_USER_UUID_FMT(pUserAccountUID);
        }

        const filter:any = {
            '$or':[]
        };

        filter['$or'].push({ ['_attr.'+OrganizationAccessControl.attr.OWNER.name+'._v']: { $all: [ pUserAccountUID ] }});

        return filter;
    }

    static getAppMembersFilter(pUserAccountUID:UserAccountUUID):any {

        const filter:any = OrganizationAccessControl.getOwnerFilter(pUserAccountUID);

        filter['$or'].push({ ['_attr.'+OrganizationAccessControl.attr.APP_MEMBER.name+'._v']: { $all: [ pUserAccountUID ] }});

        return filter;
    }

    static getOrgMembersFilter(pUserAccountUID:UserAccountUUID):any {

        const filter:any = OrganizationAccessControl.getOwnerFilter(pUserAccountUID);

        filter['$or'].push({ ['_attr.'+OrganizationAccessControl.attr.ORG_MEMBER.name+'._v']: { $all: [ pUserAccountUID ] }});
        return filter;
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

