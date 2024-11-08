import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {Access} from "../user/acl/Access.js";
import {UserAccount} from "../user/UserAccount.js";
import {AccessZone} from "../user/acl/Zones.js";
import {AccessAttribute} from "../user/acl/AccessAttribute.js";
import Role from "../user/acl/common/Role.js";

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

    static NOT_AUTHORIZED = (pAccess:Access, pUser:UserAccount)=>{
        return new AccessControlException(`The user  [${pUser.getUID()}] is not authorized to access/perform [${pAccess.name}]. Contact the administrator to give access to this resource`,
            ErrorCode.SECURITY_ACL + 4) };

    static INVALID_ZONE = (pZone:AccessZone)=>{
        return new AccessControlException(`The required zone [${pZone}] is not ready.`,
            ErrorCode.SECURITY_ACL + 5) };

    static UNKNOWN_ACL_ATTRIBUTE = (pAttr:AccessAttribute<any>)=>{
        return new AccessControlException(`The engine try to modify an unknown access attribute [name=${pAttr.name}]`,
            ErrorCode.SECURITY_ACL + 6) };

    static CANNOT_SETUP_ROLE = (pRole:Role)=>{
        return new AccessControlException(`The role cannot be set up [name=${pRole.getUID()}]`,
            ErrorCode.SECURITY_ACL + 7) };





    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ACL', pMsg, pCode, pExtra);
    }
}