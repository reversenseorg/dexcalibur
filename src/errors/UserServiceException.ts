import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue.js";
import {A} from "@reversense/interruptor/src/syscalls/LinuxX64Syscalls.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";



export class UserServiceException extends MonitoredError {

    _zone = SecurityZone.PRIVATE;

    static ERR = {
        WRONG_DB_FORMAT: ErrorCode.USER_SERVICE + 101,
        MISSING_DB: ErrorCode.USER_SERVICE + 102,
        INCONSISTENT_DB: ErrorCode.USER_SERVICE + 103,
        DB_IS_NOT_READY: ErrorCode.USER_SERVICE + 104,
        EMPTY_USER_DB: ErrorCode.USER_SERVICE + 105,
        UNRECOVERABLE_USER_DB: ErrorCode.USER_SERVICE + 106,
        MISSING_CONTEXT: ErrorCode.USER_SERVICE + 107,
        USERNAME_NOT_AVAILABLE: ErrorCode.USER_SERVICE + 108,
        AUTH_IS_NOT_READY: ErrorCode.USER_SERVICE + 109,
        USER_NOT_FOUND: ErrorCode.USER_SERVICE + 110,
        USERS_NOT_SAME_ORG: ErrorCode.USER_SERVICE + 111,
        ACCESS_DENIED_USER_PROFILE: ErrorCode.USER_SERVICE + 112,
        CANNOT_UPDATE_ACCOUNT: ErrorCode.USER_SERVICE + 113,
        INVALID_USER_UUID_FMT: ErrorCode.USER_SERVICE + 114,
        INVALID_TOKEN_FMT: ErrorCode.USER_SERVICE + 115,
        INVALID_TOKEN: ErrorCode.USER_SERVICE + 116,
        MISSING_MEMBERSHIP: ErrorCode.USER_SERVICE + 117,
        CANNOT_GRANT_TO_LOCAL_ADMIN: ErrorCode.USER_SERVICE + 118,
        ACCOUNT_NOT_ELIGIBLE_PWDL: ErrorCode.USER_SERVICE + 119
    };

    static WRONG_DB_FORMAT = ()=>{ return new UserServiceException(" User DB format is invalid",UserServiceException.ERR.WRONG_DB_FORMAT) };
    static MISSING_DB = ()=>{ return new UserServiceException(" User DB is missing",UserServiceException.ERR.MISSING_DB) };
    static INCONSISTENT_DB = ()=>{ return new UserServiceException(" User DB is inconsistent",UserServiceException.ERR.INCONSISTENT_DB) };
    static DB_IS_NOT_READY = ()=>{ return new UserServiceException(" User DB is not ready",UserServiceException.ERR.DB_IS_NOT_READY) };
    static AUTH_IS_NOT_READY = ()=>{ return new UserServiceException(" Authentication is not ready.",UserServiceException.ERR.AUTH_IS_NOT_READY) };


    static EMPTY_USER_DB = ()=>{ return new UserServiceException(" User DB is empty",UserServiceException.ERR.EMPTY_USER_DB) };
    static UNRECOVERABLE_USER_DB = ()=>{ return new UserServiceException(" User DB is not recoverable : db is empty and initial file removed",UserServiceException.ERR.UNRECOVERABLE_USER_DB) };
    static MISSING_CONTEXT = ()=>{ return new UserServiceException(" Context is missing, some data cannot be retrieved",UserServiceException.ERR.MISSING_CONTEXT) };

    static USERNAME_NOT_AVAILABLE = ()=>{ return new UserServiceException(" Username not available",UserServiceException.ERR.USERNAME_NOT_AVAILABLE) };
    static USER_NOT_FOUND = ()=>{ return new UserServiceException(" Username not found",UserServiceException.ERR.USER_NOT_FOUND) };
    static USERS_NOT_SAME_ORG = (pAcc1:UserAccount, pAcc2:UserAccount)=>{ return new UserServiceException(` Users [${pAcc1.getUID()}] and [${pAcc2.getUID()}] don't share the same organization.`,UserServiceException.ERR.USERS_NOT_SAME_ORG) };

    static ACCESS_DENIED_USER_PROFILE = ()=>{ return new UserServiceException(" Access denied to user profile : insufficient permissions",UserServiceException.ERR.ACCESS_DENIED_USER_PROFILE) };
    static CANNOT_UPDATE_ACCOUNT = (pAcc:UserAccountUUID)=>{ return new UserServiceException("Cannot update user account [uuid="+pAcc+"]",UserServiceException.ERR.CANNOT_UPDATE_ACCOUNT) };

    static INVALID_USER_UUID_FMT = (pAcc:UserAccountUUID)=>{ return new UserServiceException(`Invalid user account UUID format [uuid=${pAcc}]`,UserServiceException.ERR.CANNOT_UPDATE_ACCOUNT).zone(SecurityZone.PRIVATE) };

    static INVALID_TOKEN_FMT = ()=>{
        return new UserServiceException(`Invalid token format.`,
            UserServiceException.ERR.INVALID_TOKEN_FMT).zone(SecurityZone.PUBLIC) };

    static INVALID_TOKEN = (pCause:string)=>{
        return new UserServiceException(`Invalid token [cause=${pCause}]`,
            UserServiceException.ERR.INVALID_TOKEN).zone(SecurityZone.PRIVATE) };

    static MISSING_MEMBERSHIP = (pUUID:UserAccountUUID, pOUID:OrganizationUnitUUID, pWhere:string)=>{
        return new UserServiceException(`Missing membership [user=${pUUID}][org=${pOUID}][where=${pWhere}]`,
            UserServiceException.ERR.MISSING_MEMBERSHIP).zone(SecurityZone.PRIVATE) };

    static CANNOT_GRANT_TO_LOCAL_ADMIN = (pUUID:UserAccountUUID, pOUID:OrganizationUnitUUID, pTarget:UserAccountUUID)=>{
        return new UserServiceException(`Cannot grant user to local admin [user=${pUUID}][org=${pOUID}][target_user=${pTarget}]`,
            UserServiceException.ERR.CANNOT_GRANT_TO_LOCAL_ADMIN) };


    static ACCOUNT_NOT_ELIGIBLE_PWDL = (pUUID:UserAccountUUID, pCause:string)=>{
        return new UserServiceException(`Passwordless authentication failed for this account : ${pCause}`,
            UserServiceException.ERR.ACCOUNT_NOT_ELIGIBLE_PWDL,
            {
                user: pUUID,
                cause: pCause
            }) };



    static is(pErrCode:number, pError:number):boolean {
        return ((pError as any).code!=null && (pError as any).code==pErrCode);
    }

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('USER SERVICE', pMsg, pCode, pExtra);
    }
}