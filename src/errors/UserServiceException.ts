import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue.js";



export class UserServiceException extends MonitoredError {

    static ERR = {
        WRONG_DB_FORMAT: ErrorCode.USER_SERVICE + 101,
        MISSING_DB: ErrorCode.USER_SERVICE + 102,
        INCONSISTENT_DB: ErrorCode.USER_SERVICE + 103,
        DB_IS_NOT_READY: ErrorCode.USER_SERVICE + 104,
        EMPTY_USER_DB: ErrorCode.USER_SERVICE + 105,
        UNRECOVERABLE_USER_DB: ErrorCode.USER_SERVICE + 106,
        MISSING_CONTEXT: ErrorCode.USER_SERVICE + 107,
        USERNAME_NOT_AVAILABLE: ErrorCode.USER_SERVICE + 108,
    };

    static WRONG_DB_FORMAT = ()=>{ return new UserServiceException(" User DB format is invalid",UserServiceException.ERR.WRONG_DB_FORMAT) };
    static MISSING_DB = ()=>{ return new UserServiceException(" User DB is missing",UserServiceException.ERR.MISSING_DB) };
    static INCONSISTENT_DB = ()=>{ return new UserServiceException(" User DB is inconsistent",UserServiceException.ERR.INCONSISTENT_DB) };
    static DB_IS_NOT_READY = ()=>{ return new UserServiceException(" User DB is not ready",UserServiceException.ERR.DB_IS_NOT_READY) };
    static EMPTY_USER_DB = ()=>{ return new UserServiceException(" User DB is empty",UserServiceException.ERR.EMPTY_USER_DB) };
    static UNRECOVERABLE_USER_DB = ()=>{ return new UserServiceException(" User DB is not recoverable : db is empty and initial file removed",UserServiceException.ERR.UNRECOVERABLE_USER_DB) };
    static MISSING_CONTEXT = ()=>{ return new UserServiceException(" Context is missing, some data cannot be retrieved",UserServiceException.ERR.MISSING_CONTEXT) };

    static USERNAME_NOT_AVAILABLE = ()=>{ return new UserServiceException(" Username not available",UserServiceException.ERR.USERNAME_NOT_AVAILABLE) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('USER SERVICE', pMsg, pCode, pExtra);
    }
}