import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {AuthModuleType} from "../user/auth/AuthModule.js";
import {UserGroupUUID} from "../user/acl/common/UserGroup.js";
import {UserAccountUUID} from "../user/UserAccount.js";
import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {RoleUUID} from "../user/acl/common/Role.js";



export class OrganizationManagerException extends MonitoredError {

    static CANNOT_CHECK_UUID = ()=>{
        return new OrganizationManagerException("Cannot check if an UUID exists : invalid object type",
            ErrorCode.ORGANIZATION + 1) };

    static CANNOT_CHECK_PPT_UNIQ = (pType:NodeInternalType, pPpt:string)=>{
        return new OrganizationManagerException(`Cannot check the uniqueness of property [name=${pPpt}] on collection of [node_type=${pType}] : property forbidden`,
            ErrorCode.ORGANIZATION + 2) };

    static DUPLICATED_ORG_NAME = ()=>{
        return new OrganizationManagerException(`There is always an organization with this name.`,
            ErrorCode.ORGANIZATION + 3) };

    static DUPLICATED_APP_NAME = ()=>{
        return new OrganizationManagerException(`There is always an application unit with this name.`,
            ErrorCode.ORGANIZATION + 4) };

    static INVALID_AUTH_MOD_TYPE = (pType:AuthModuleType)=>{
        return new OrganizationManagerException(`The authentication module type is not supported [type=${pType}]`,
            ErrorCode.ORGANIZATION + 5) };

    static UNKNOWN_ORG = (pUID:string)=>{
        return new OrganizationManagerException(`The organization is unknown [uuid=${pUID}]`,
            ErrorCode.ORGANIZATION + 6) };

    static INVALID_IP_ADDRESS = (pIP:string)=>{
        return new OrganizationManagerException(`IP Filtering list : invalid IP address. [ip=${pIP}]`,
            ErrorCode.ORGANIZATION + 7) };

    static INVALID_CIDR_ADDRESS = (pNetmask:string)=>{
        return new OrganizationManagerException(`IP Filtering list : invalid netmask. [mask=${pNetmask}]`,
            ErrorCode.ORGANIZATION + 8) };

    static USER_GROUP_NOT_FOUND = (pGrp:string)=>{
        return new OrganizationManagerException(`User group not found in organization [uuid=${pGrp}]`,
            ErrorCode.ORGANIZATION + 9) };

    static CANNOT_CREATE_USERGRP = (pOUID:OrganizationUnitUUID,pPGUID:UserGroupUUID)=>{
        return new OrganizationManagerException(`User group not be created [org=${pOUID}][grp=${pPGUID}]`,
            ErrorCode.ORGANIZATION + 10) };

    static CANNOT_ADD_ROLE_TO_GROUP = (pRUID:RoleUUID,pOUID:OrganizationUnitUUID,pPGUID:UserGroupUUID)=>{
        return new OrganizationManagerException(`Cannot add role to user group [org=${pOUID}][grp=${pPGUID}][role=${pRUID}]`,
            ErrorCode.ORGANIZATION + 11) };

    static CANNOT_ADD_MEMBER_TO_GROUP = (pRUID:UserAccountUUID,pOUID:OrganizationUnitUUID,pPGUID:UserGroupUUID)=>{
        return new OrganizationManagerException(`Cannot add member to user group [org=${pOUID}][grp=${pPGUID}][account=${pRUID}]`,
            ErrorCode.ORGANIZATION + 12) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ORGANIZATION', pMsg, pCode, pExtra);
    }


}