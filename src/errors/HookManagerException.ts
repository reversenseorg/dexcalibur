import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";



export class HookManagerException extends MonitoredError {

    static ERR = {
        EXISTING_HOOK_SET: ErrorCode.HOOK_MANAGER + 101,
        DB_NOT_INITIALIZED: ErrorCode.HOOK_MANAGER + 102,
        CANNOT_SAVE_UNRECOGNIZED_OBJ: ErrorCode.HOOK_MANAGER + 103,
        UNKNOW_HOOK_FRAGMENT_POS: ErrorCode.HOOK_MANAGER + 104,
        HOOK_FRAGMENT_NOT_FOUND: ErrorCode.HOOK_MANAGER + 105,
        HOOK_NOT_FOUND: ErrorCode.HOOK_MANAGER + 106,
    };

    static EXISTING_HOOK_SET = ()=>{ return new HookManagerException(" An hook set already exists for this ID",HookManagerException.ERR.EXISTING_HOOK_SET) };
    static UNKNOW_HOOK_FRAGMENT_POS = ()=>{ return new HookManagerException(" Invalid position for hook fragments",HookManagerException.ERR.UNKNOW_HOOK_FRAGMENT_POS) };
    static HOOK_FRAGMENT_NOT_FOUND = (vUID = "")=>{ return new HookManagerException(" No hook fragments [uid="+vUID+"] found ",HookManagerException.ERR.HOOK_FRAGMENT_NOT_FOUND) };
    static DB_NOT_INITIALIZED = ()=>{ return new HookManagerException(" Fatal error: Database is not initiliazed",HookManagerException.ERR.DB_NOT_INITIALIZED) };
    static CANNOT_SAVE_UNRECOGNIZED_OBJ = ()=>{ return new HookManagerException(" Fatal error: Save of unrecognized object failed ",HookManagerException.ERR.CANNOT_SAVE_UNRECOGNIZED_OBJ) };
    static HOOK_NOT_FOUND = (vUID:string)=>{ return new HookManagerException(" Fatal error: Hook not found : "+vUID,HookManagerException.ERR.HOOK_NOT_FOUND) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('HOOK MANAGER', pMsg, pCode, pExtra);
    }
}