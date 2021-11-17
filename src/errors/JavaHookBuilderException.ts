import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";
import {HookBuilderError} from "./HookScriptBuilderException";



export class JavaHookBuilderException extends MonitoredError {


    static ERR = {
        INVALID_DB: ErrorCode.HOOK_BUILDER + HookBuilderError.JAVA + 1,
        MISSING_TARGET: ErrorCode.HOOK_BUILDER + HookBuilderError.JAVA + 2,
    };

    static MISSING_TARGET = ()=>{ return new JavaHookBuilderException(" The hook target is missing. ",JavaHookBuilderException.ERR.MISSING_TARGET) };
    static INVALID_DB = ()=>{ return new JavaHookBuilderException(" The database cannot be null",JavaHookBuilderException.ERR.INVALID_DB) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('JAVA HOOK BUILDER', pMsg, pCode, pExtra);
    }
}