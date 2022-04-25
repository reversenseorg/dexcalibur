import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";



export class HookManagerException extends MonitoredError {

    static ERR = {
        EXISTING_HOOK_SET: ErrorCode.HOOK_MANAGER + 101,
        DB_NOT_INITIALIZED: ErrorCode.HOOK_MANAGER + 102,
    };

    static EXISTING_HOOK_SET = ()=>{ return new HookManagerException(" An hook set already exists for this ID",HookManagerException.ERR.EXISTING_HOOK_SET) };
    static DB_NOT_INITIALIZED = ()=>{ return new HookManagerException(" Fatal error: Database is not initiliazed",HookManagerException.ERR.DB_NOT_INITIALIZED) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('HOOK MANAGER', pMsg, pCode, pExtra);
    }
}