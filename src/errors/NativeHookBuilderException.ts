import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";
import {HookBuilderError} from "./HookScriptBuilderException";




export class NativeHookBuilderException extends MonitoredError {


    static ERR = {
        INVALID_DB: ErrorCode.HOOK_BUILDER + HookBuilderError.NATIVE + 1,
        MISSING_TARGET: ErrorCode.HOOK_BUILDER + HookBuilderError.NATIVE + 2,
        TYPE_READER_IS_NOT_FRIDA_OK: ErrorCode.HOOK_BUILDER + HookBuilderError.NATIVE + 3,
    };

    static MISSING_TARGET = ()=>{ return new NativeHookBuilderException(" The hook target is missing. ",NativeHookBuilderException.ERR.MISSING_TARGET) };
    static INVALID_DB = ()=>{ return new NativeHookBuilderException(" The database cannot be null",NativeHookBuilderException.ERR.INVALID_DB) };
    static TYPE_READER_IS_NOT_FRIDA_OK = (vType:string)=>{ return new NativeHookBuilderException(" The type ["+vType+"] has not code to read it from Frida",NativeHookBuilderException.ERR.TYPE_READER_IS_NOT_FRIDA_OK) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('NATIVE HOOK BUILDER', pMsg, pCode, pExtra);
    }
}