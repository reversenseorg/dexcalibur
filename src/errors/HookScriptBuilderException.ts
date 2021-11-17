import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";

export enum HookBuilderError {
    GENERIC = 100,
    JAVA = 200,
    NATIVE = 300,
    OBJC = 400,
    CMOD = 500,
    JS = 600
}


export class HookScriptBuilderException extends MonitoredError {

    static ERR = {
        UNTARGETABLE_NATIVE_HOOK: ErrorCode.HOOK_BUILDER + HookBuilderError.GENERIC + 1,
        UNTARGETABLE_JAVA_HOOK: ErrorCode.HOOK_BUILDER + HookBuilderError.GENERIC + 2
    };

    static UNTARGETABLE_NATIVE_HOOK = ()=>{ return new HookScriptBuilderException(" The hook target cannot be targeted into script. ",HookScriptBuilderException.ERR.UNTARGETABLE_NATIVE_HOOK) };
    static UNTARGETABLE_JAVA_HOOK = ()=>{ return new HookScriptBuilderException(" The hook target cannot be targeted into script. ",HookScriptBuilderException.ERR.UNTARGETABLE_JAVA_HOOK) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('GLOBAL HOOK BUILDER', pMsg, pCode, pExtra);
    }
}