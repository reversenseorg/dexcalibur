import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export enum HookErrCode {
    GENERIC=100,
    FRIDA=200,
    MESSAGE=300
}

export class HookManagerException extends MonitoredError {

    static ERR = {
        EXISTING_HOOK_SET: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 1,
        DB_NOT_INITIALIZED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 2,
        CANNOT_SAVE_UNRECOGNIZED_OBJ: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 3,
        UNKNOW_HOOK_FRAGMENT_POS: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 4,
        HOOK_FRAGMENT_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 5,
        HOOK_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 6,
        FRIDA_DEVICE_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 7,
        HOOK_SESSION_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 8,
        HOOK_FRAGMENT_CANNOT_BE_REMOVED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 9,
        FRAGMENT_UID_IS_MANDATORY: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 10,
        OPTION_NOT_SUPPORTED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 11,
        SCRIPT_COMPILATION_FAILED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 12,
        SCRIPT_SYNTAX_ERROR: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 13,
        COMPILER_INPUT_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 14
    };

    static EXISTING_HOOK_SET = ()=>{ return new HookManagerException(" An hook set already exists for this ID",HookManagerException.ERR.EXISTING_HOOK_SET) };
    static UNKNOW_HOOK_FRAGMENT_POS = ()=>{ return new HookManagerException(" Invalid position for hook fragments",HookManagerException.ERR.UNKNOW_HOOK_FRAGMENT_POS) };
    static HOOK_FRAGMENT_NOT_FOUND = (vUID = "")=>{ return new HookManagerException(" No hook fragments [uid="+vUID+"] found ",HookManagerException.ERR.HOOK_FRAGMENT_NOT_FOUND) };
    static DB_NOT_INITIALIZED = ()=>{ return new HookManagerException(" Fatal error: Database is not initiliazed",HookManagerException.ERR.DB_NOT_INITIALIZED) };
    static CANNOT_SAVE_UNRECOGNIZED_OBJ = ()=>{ return new HookManagerException(" Fatal error: Save of unrecognized object failed ",HookManagerException.ERR.CANNOT_SAVE_UNRECOGNIZED_OBJ) };
    static HOOK_NOT_FOUND = (vUID:string)=>{ return new HookManagerException(" Fatal error: Hook not found : "+vUID,HookManagerException.ERR.HOOK_NOT_FOUND) };
    static FRIDA_DEVICE_NOT_FOUND = (vUID:string)=>{ return new HookManagerException(" Fatal error: device not found by frida : "+vUID,HookManagerException.ERR.FRIDA_DEVICE_NOT_FOUND) };
    static HOOK_SESSION_NOT_FOUND = ()=>{ return new HookManagerException(" Fatal error: hook session not found",HookManagerException.ERR.HOOK_SESSION_NOT_FOUND) };
    static HOOK_FRAGMENT_CANNOT_BE_REMOVED= (vUID = "", vExtra:string="")=>{ return new HookManagerException(" The fragment [uid="+vUID+"] cannot be removed : "+vExtra,HookManagerException.ERR.HOOK_FRAGMENT_CANNOT_BE_REMOVED) };
    static FRAGMENT_UID_IS_MANDATORY = (pContext:string="")=>{ return new HookManagerException(" The fragment UID is mandatory [context="+pContext+"]",HookManagerException.ERR.FRAGMENT_UID_IS_MANDATORY) };
    static OPTION_NOT_SUPPORTED = (pName:string)=>{ return new HookManagerException(" The global hook option [name="+pName+"] is not supported",HookManagerException.ERR.OPTION_NOT_SUPPORTED) };
    static SCRIPT_COMPILATION_FAILED = (pName:string)=>{ return new HookManagerException(" The script compiling failed.",HookManagerException.ERR.SCRIPT_COMPILATION_FAILED) };
    static SCRIPT_SYNTAX_ERROR = (pLang:string, pMessage:string="")=>{ return new HookManagerException(" [targetLang="+pLang+"] The built script contains syntax errors : "+pMessage,HookManagerException.ERR.SCRIPT_SYNTAX_ERROR) };
    static COMPILER_INPUT_NOT_FOUND = ()=>{ return new HookManagerException(" Input file of TS compiler not found. ",HookManagerException.ERR.COMPILER_INPUT_NOT_FOUND) };





    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('HOOK MANAGER', pMsg, pCode, pExtra);
    }
}