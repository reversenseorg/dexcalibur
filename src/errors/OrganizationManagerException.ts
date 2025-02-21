import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {AuthModuleType} from "../user/auth/AuthModule.js";
import {UserGroupUUID} from "../user/acl/common/UserGroup.js";
import {UserAccountUUID} from "../user/UserAccount.js";
import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {RoleUUID} from "../user/acl/common/Role.js";
import {ConnectionUUID} from "../organization/conn/Connection.js";
import {SecretUUID} from "../core/secrets/Secret.js";
import {DeviceUUID} from "../Device.js";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {ApplicationUnitUUID} from "../organization/ApplicationUnit.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {AssuranceModelUUID} from "../audit/common/AssuranceModel.js";
import {ProductType} from "../billing/Purchase.js";


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

    static INVALID_USER_ACCOUNTS_LIST = ()=>{
        return new OrganizationManagerException(`The list of user account is invalid, some user account UUID are not UUID.`,
            ErrorCode.ORGANIZATION + 13) };

    static CONN_ALREADY_EXISTS = (pName:string)=>{
        return new OrganizationManagerException(`A connection already exists with this uuid [uuid=${pName}]`,
            ErrorCode.ORGANIZATION + 14) };

    static CANNOT_UPDATE_CONNECTION = (pOUID:OrganizationUnitUUID, pName:string)=>{
        return new OrganizationManagerException(`Cannot update connections with this uuid [org=${pOUID}][uuid=${pName}]`,
            ErrorCode.ORGANIZATION + 15) };

    static CANNOT_REMOVE_CONNECTION = (pOUID:OrganizationUnitUUID, pName:string)=>{
        return new OrganizationManagerException(`Cannot remove connections with this uuid [org=${pOUID}][uuid=${pName}]`,
            ErrorCode.ORGANIZATION + 16) };

    static CONNECTION_NOT_FOUND = (pUUID:ConnectionUUID)=>{
        return new OrganizationManagerException(`Connection cannot be found with this uuid [uuid=${pUUID}]`,
            ErrorCode.ORGANIZATION + 17) };

    static SECRET_NOT_FOUND = (pUUID:SecretUUID)=>{
        return new OrganizationManagerException(`Secret cannot be found with this uuid [uuid=${pUUID}]`,
            ErrorCode.ORGANIZATION + 18) };

    static CANNOT_UPDATE_SECRET = (pOUID:OrganizationUnitUUID, pUUID:SecretUUID)=>{
        return new OrganizationManagerException(`Cannot update secret with this uuid [org=${pOUID}][uuid=${pUUID}]`,
            ErrorCode.ORGANIZATION + 19) };

    static CANNOT_REMOVE_SECRET = (pOUID:OrganizationUnitUUID, pUUID:SecretUUID)=>{
        return new OrganizationManagerException(`Cannot remove secret with this uuid [org=${pOUID}][uuid=${pUUID}]`,
            ErrorCode.ORGANIZATION + 20) };

    static SECRET_ALREADY_EXISTS = (pOUID:OrganizationUnitUUID,pUUID:SecretUUID)=>{
        return new OrganizationManagerException(`A secret already exists with this uuid  [org=${pOUID}][uuid=${pUUID}]`,
            ErrorCode.ORGANIZATION + 21) };

    static UNKNOWN_APP = (pUUID:string)=>{
        return new OrganizationManagerException(`The application cannot be read [uuid=${pUUID}]`,
            ErrorCode.ORGANIZATION + 22) };

    static CANNOT_ATTACH_DEV = (pOUID:OrganizationUnitUUID,pUUID:DeviceUUID)=>{
        return new OrganizationManagerException(`The application cannot be attached [org=${pOUID}][uuid=${pUUID}]`,
            ErrorCode.ORGANIZATION + 23) };

    static CANNOT_DETACH_DEV = (pOUID:OrganizationUnitUUID,pUUID:DeviceUUID)=>{
        return new OrganizationManagerException(`The application cannot be detached [org=${pOUID}][uuid=${pUUID}]`,
            ErrorCode.ORGANIZATION + 24) };

    static CANNOT_ATTACH_PROJ = (pAUID:ApplicationUnitUUID,pPUID:DexcaliburProjectUUID)=>{
        return new OrganizationManagerException(`The project  cannot be attached to application unit [app=${pAUID}][uuid=${pPUID}]`,
            ErrorCode.ORGANIZATION + 25) };

    static DEVICE_NOT_FOUND_IN_ORG = (pOUID:OrganizationUnitUUID,pDUID:DeviceUUID)=>{
        return new OrganizationManagerException(`Device not found in organization unit [org=${pOUID}][dev=${pDUID}]`,
            ErrorCode.ORGANIZATION + 26).zone(SecurityZone.PRIVATE) };

    static CANNOT_ASSIGN_DEV = (pAUID:ApplicationUnitUUID,pDUID:DeviceUUID)=>{
        return new OrganizationManagerException(`The device cannot be assigned to application unit [app=${pAUID}][dev=${pDUID}]`,
            ErrorCode.ORGANIZATION + 27) };

    static CANNOT_DEASSIGN_DEV = (pAUID:ApplicationUnitUUID,pDUID:DeviceUUID)=>{
        return new OrganizationManagerException(`The device cannot be deassigned from application unit [app=${pAUID}][uuid=${pDUID}]`,
            ErrorCode.ORGANIZATION + 28) };

    static INVALID_ORG_UUID_FMT = (pOUID:OrganizationUnitUUID)=>{
        return new OrganizationManagerException(`Invalid format for organization UUID [uuid=${pOUID}]`,
            ErrorCode.ORGANIZATION + 29) };

    static INVALID_APP_UUID_FMT = (pAUID:ApplicationUnitUUID)=>{
        return new OrganizationManagerException(`Invalid format for application UUID [uuid=${pAUID}]`,
            ErrorCode.ORGANIZATION + 30) };

    static MISSING_BUSINESS_PLAN = (pOUID:OrganizationUnitUUID)=>{
        return new OrganizationManagerException(`Business plan is missing for organization UUID [uuid=${pOUID}]`,
            ErrorCode.ORGANIZATION + 31) };

    static INVALID_BUSINESS_PLAN = (pOUID:OrganizationUnitUUID)=>{
        return new OrganizationManagerException(`Business plan has invalid type for organization UUID [uuid=${pOUID}]`,
            ErrorCode.ORGANIZATION + 32) };

    static BUSINESS_PLAN_NOT_SCAN_PLAN = (pOUID:OrganizationUnitUUID)=>{
        return new OrganizationManagerException(`Business plan for organization UUID [uuid=${pOUID}] is not a scan plan`,
            ErrorCode.ORGANIZATION + 33) };

    static BUSINESS_PLAN_NOT_SUBS_PLAN = (pOUID:OrganizationUnitUUID)=>{
        return new OrganizationManagerException(`Business plan for organization UUID [uuid=${pOUID}] is not a subscription plan`,
            ErrorCode.ORGANIZATION + 34) };

    static NO_SCAN_SLOT_AVAILABLE = (pOUID:OrganizationUnitUUID)=>{
        return new OrganizationManagerException(`There is not more available free scan slot in organization UUID [uuid=${pOUID}]. Please purchase more.`,
            ErrorCode.ORGANIZATION + 35) };

    static NO_APP_SLOT_AVAILABLE = (pOUID:OrganizationUnitUUID)=>{
        return new OrganizationManagerException(`There is not more available free app slot in organization UUID [uuid=${pOUID}]. Please purchase more.`,
            ErrorCode.ORGANIZATION + 36) };

    static CANNOT_VERIFY_SCAN_BALANCE = (pCause:string)=>{
        return new OrganizationManagerException(`Scan balance cannot be verified. Cause: ${pCause}`,
            ErrorCode.ORGANIZATION + 37) };

    static SCAN_LICENSE_VIOLATION = (pOUID:OrganizationUnitUUID, pMUID:AssuranceModelUUID)=>{
        return new OrganizationManagerException(`Business plan not allow the organization [org=${pOUID}] to scan with model [model=${pMUID}].`,
            ErrorCode.ORGANIZATION + 38).zone(SecurityZone.PRIVATE) };

    static PRODUCT_NOT_SUPPORTED = (pType:ProductType)=>{
        return new OrganizationManagerException(`License activation : Product type not supported [type=${pType}].`,
            ErrorCode.ORGANIZATION + 39).zone(SecurityZone.PRIVATE) };

    static CANNOT_UPDATE_BUSINESSPLAN = (pOUID:OrganizationUnitUUID)=>{
        return new OrganizationManagerException(`Cannot update business plan of [org=${pOUID}]`,
            ErrorCode.ORGANIZATION + 40) };

    static CANNOT_CREATE_FEDERATED_USR = (pUsername: UserAccountUUID, pOUID: OrganizationUnitUUID) =>{
        return new OrganizationManagerException(`Cannot create federated user account [user=${pUsername}][org=${pOUID}]`,
            ErrorCode.ORGANIZATION + 41) };

    static NOT_A_MEMBER = (pUsername: UserAccountUUID, pOUID: OrganizationUnitUUID) => {
        return new OrganizationManagerException(`The user is not a member of the organization [user=${pUsername}][org=${pOUID}]`,
            ErrorCode.ORGANIZATION + 42) };

    static CANNOT_UPDATE_FEDERATED_USR = (pUsername: UserAccountUUID, pOUID: OrganizationUnitUUID) =>{
        return new OrganizationManagerException(`Cannot update federated user account [user=${pUsername}][org=${pOUID}]`,
            ErrorCode.ORGANIZATION + 43) };

    static INVALID_USER_EMAIL = (pUsername: UserAccountUUID, pOpeMsg = "") =>{
        return new OrganizationManagerException(`Email address of user account is invalid [user=${pUsername}]. ${pOpeMsg} `,
            ErrorCode.ORGANIZATION + 44) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ORGANIZATION', pMsg, pCode, pExtra);
    }



}