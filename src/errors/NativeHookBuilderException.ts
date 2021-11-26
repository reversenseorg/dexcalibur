import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";
import {HookBuilderError} from "./HookScriptBuilderException";




export class NativeHookBuilderException extends MonitoredError {


    static ERR = {
        INVALID_DB: ErrorCode.HOOK_BUILDER + HookBuilderError.NATIVE + 1,
        MISSING_TARGET: ErrorCode.HOOK_BUILDER + HookBuilderError.NATIVE + 2,
    };

    static MISSING_TARGET = ()=>{ return new NativeHookBuilderException(" The hook target is missing. ",NativeHookBuilderException.ERR.MISSING_TARGET) };
    static INVALID_DB = ()=>{ return new NativeHookBuilderException(" The database cannot be null",NativeHookBuilderException.ERR.INVALID_DB) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('JAVA HOOK BUILDER', pMsg, pCode, pExtra);
    }
}