import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {NativeBackend} from "../types/common.js";


export class NativeAnalyzerException extends MonitoredError {

    static ERR = {
        MISSING_FUNC: ErrorCode.ANALYZER_NATIV + 101,
        UNKNOW_FUNC: ErrorCode.ANALYZER_NATIV + 102,
        CANNOT_DISASS_VOLATILE: ErrorCode.ANALYZER_NATIV + 103,
        MISSING_FILE: ErrorCode.ANALYZER_NATIV + 104,
        ANALYSIS_REQUIRED: ErrorCode.ANALYZER_NATIV + 105,
        INVALID_FUNC_SIGN: ErrorCode.ANALYZER_NATIV + 106,
        ALIAS_CONFLICT: ErrorCode.ANALYZER_NATIV + 107,
        ALIAS_MUST_DIFFERS_FROM_NAME: ErrorCode.ANALYZER_NATIV + 108,
        BACKEND_NOT_SUPPORTED: ErrorCode.ANALYZER_NATIV + 109,
        NOT_READY_TO_EMULATE: ErrorCode.ANALYZER_NATIV + 110
    };

    static UNKNOW_FUNC = ()=>{ return new NativeAnalyzerException(" Native function is unknow",NativeAnalyzerException.ERR.UNKNOW_FUNC) };
    static MISSING_FUNC = ()=>{ return new NativeAnalyzerException(" Function is missing",NativeAnalyzerException.ERR.MISSING_FUNC) };
    static MISSING_FILE = (file = 'null')=>{ return new NativeAnalyzerException(" File is missing : "+file,NativeAnalyzerException.ERR.MISSING_FILE) };
    static ANALYSIS_REQUIRED = (file = "null")=>{ return new NativeAnalyzerException(" File must be analyzed first : "+file,NativeAnalyzerException.ERR.ANALYSIS_REQUIRED) };
    static CANNOT_DISASS_VOLATILE = ()=>{ return new NativeAnalyzerException(" Volatile function cannot be disassembled",NativeAnalyzerException.ERR.CANNOT_DISASS_VOLATILE) };
    static INVALID_FUNC_SIGN = ()=>{ return new NativeAnalyzerException(" Signature of native function is invalid or missing",NativeAnalyzerException.ERR.INVALID_FUNC_SIGN) };
    static ALIAS_CONFLICT = ()=>{ return new NativeAnalyzerException(" Two native functions from same file cannot have same alias",NativeAnalyzerException.ERR.ALIAS_CONFLICT) };
    static ALIAS_MUST_DIFFERS_FROM_NAME = ()=>{ return new NativeAnalyzerException("Ignoreed : alias MUST differs from native function name",NativeAnalyzerException.ERR.ALIAS_MUST_DIFFERS_FROM_NAME) };
    static BACKEND_NOT_SUPPORTED = (pBackend:NativeBackend)=>{ return new NativeAnalyzerException(`Native backend '${pBackend}' is not supported`,NativeAnalyzerException.ERR.BACKEND_NOT_SUPPORTED) };
    static NOT_READY_TO_EMULATE = (pMsg:string,pSign="")=>{ return new NativeAnalyzerException(`Code emulation [${pSign}]: ${pMsg}`,NativeAnalyzerException.ERR.NOT_READY_TO_EMULATE) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('NATIVE ANALYZER', pMsg, pCode, pExtra);
    }

}