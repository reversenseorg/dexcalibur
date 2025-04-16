import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {Access} from "../user/acl/Access.js";
import {UserAccount} from "../user/UserAccount.js";
import {AccessZone} from "../user/acl/Zones.js";
import {AccessAttribute} from "../user/acl/AccessAttribute.js";
import Role, {RoleUUID} from "../user/acl/common/Role.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {UserGroup, UserGroupUUID} from "../user/acl/common/UserGroup.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

export class AccessControlException extends MonitoredError {


    static MISSING_ACL_MGR = ()=>{
        return new AccessControlException("The ACL manager is missing. Every accesses are forbidden",
            ErrorCode.SECURITY_ACL + 1) };

    static MISSING_ACL_CTRL = ()=>{
        return new AccessControlException("The ACL controller is missing. Every accesses are forbidden",
            ErrorCode.SECURITY_ACL + 2) };

    static MISSING_ACCESS = (pAccess:Access)=>{
        return new AccessControlException(`The access point [${pAccess.name}] is missing. Contact the administrator to give access to this resource`,
            ErrorCode.SECURITY_ACL + 3) };

    static NOT_AUTHORIZED = (pAccess:Access, pIssuer:UserAccount|UserGroup)=>{
        return new AccessControlException(`The user ${pIssuer.__===NodeInternalType.USER_GROUP?'group':''}  [${pIssuer.getUID()}] is not authorized to access/perform [${pAccess.name}]. Contact the administrator to give access to this resource`,
            ErrorCode.SECURITY_ACL + 4) };

    static INVALID_ZONE = (pZone:AccessZone)=>{
        return new AccessControlException(`The required zone [${pZone}] is not ready.`,
            ErrorCode.SECURITY_ACL + 5) };

    static UNKNOWN_ACL_ATTRIBUTE = (pAttr:string)=>{
        return new AccessControlException(`The engine try to modify an unknown access attribute`,
            ErrorCode.SECURITY_ACL + 6, {
                attr: pAttr
            }).zone(SecurityZone.PRIVATE) };

    static CANNOT_SETUP_ROLE = (pRole:Role)=>{
        return new AccessControlException(`The role cannot be set up [name=${pRole.getUID()}]`,
            ErrorCode.SECURITY_ACL + 7) };

    static MISSING_ACCOUNT = (pAccess:Access)=>{
        return new AccessControlException(`The user account is missing [${pAccess.name}]`,
            ErrorCode.SECURITY_ACL + 8).zone(SecurityZone.PRIVATE) };


    static NOT_AUTHORIZED_BY_GRP = (pAttr:AccessAttribute<any>[], pUser:UserAccount)=>{
        return new AccessControlException(`The user  [${pUser.getUID()}] is not authorized by attribute and user group [${pAttr.map(x => x.name).join(',')}]. Contact the administrator to give access to this resource`,
            ErrorCode.SECURITY_ACL + 9) };

    static MISSING_USER_GROUP = (pOrg:OrganizationUnitUUID, pGroup:UserGroupUUID)=>{
        return new AccessControlException(`The user group [${pGroup}] is missing in org [${pOrg}]. Contact the administrator to give access to this resource`,
            ErrorCode.SECURITY_ACL + 10) };

    static UNKNOWN_ACCESS = (pRoleUID:RoleUUID, pName:string)=>{
        return new AccessControlException(`The role [${pName},${pRoleUID}] require unknown permissions.`,
            ErrorCode.SECURITY_ACL + 11).zone(SecurityZone.PRIVATE) };

    static CHATTR_NOT_SUPPORTED_FOR_TYPE = (pType:NodeInternalType)=>{
        return new AccessControlException(`Change of attribute is not supported for this node type.`,
            ErrorCode.SECURITY_ACL + 11,{
                type: pType
            }).zone(SecurityZone.PRIVATE) };





    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ACL', pMsg, pCode, pExtra);
    }
}