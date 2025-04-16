import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";
import {UserServiceException} from "../../../errors/UserServiceException.js";
import {UserGroupUUID} from "../common/UserGroup.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {ValidationRule} from "../../../Validator.js";
import {AccessControlException} from "../../../errors/AccessControlException.js";


export class OrganizationAccessControl extends DelegateAccessControl {


    static ready = false;

    static uid:string = 'ORG';

    static attr:AccessAttributeMap = {
        ORG_MEMBER: new AccessAttribute<UserAccountUUID>( 'org_member',[], NodeInternalType.USER_ACCOUNT),
        APP_MEMBER: new AccessAttribute<UserAccountUUID>( 'app_member',[], NodeInternalType.USER_ACCOUNT),
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner',[], NodeInternalType.USER_ACCOUNT),

        MEMBER_GRP: new AccessAttribute<UserGroupUUID>( 'members', [], NodeInternalType.USER_GROUP),
        APP_MEMBER_GRP: new AccessAttribute<UserGroupUUID>( 'app_grp',[], NodeInternalType.USER_GROUP),
    };

    constructor() {
        super();
    }

    static override getAttr<T>(pName:string):AccessAttribute<T> {

        if(ValidationRule.newPinklistAssert([
            OrganizationAccessControl.attr.APP_MEMBER_GRP.name,
            OrganizationAccessControl.attr.APP_MEMBER.name,
            OrganizationAccessControl.attr.ORG_MEMBER.name,
            OrganizationAccessControl.attr.MEMBER_GRP.name,
            OrganizationAccessControl.attr.OWNER.name,
        ]).test( pName)==false){
            throw AccessControlException.UNKNOWN_ACL_ATTRIBUTE(pName)
        }

        return Object.values(OrganizationAccessControl.attr).find(x => x.name==pName);
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

    /**
     * To get MongoDB filter to apply in order to filter document by document owned by AppUnit members only
     *
     * @param pUserAccountUID
     */
    static getAppMembersFilter(pUserAccountUID:UserAccountUUID):any {

        const filter:any = OrganizationAccessControl.getOwnerFilter(pUserAccountUID);

        filter['$or'].push({ ['_attr.'+OrganizationAccessControl.attr.APP_MEMBER.name+'._v']: { $all: [ pUserAccountUID ] }});

        return filter;
    }

    static getOrgMembersFilter(pUserAccountUID:UserAccountUUID):any {

        const filter:any = OrganizationAccessControl.getOwnerFilter(pUserAccountUID);

        filter['$or'].push({ ['_attr.'+OrganizationAccessControl.attr.MEMBER_GRP.name+'._v']: { $all: [ pUserAccountUID ] }});
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

