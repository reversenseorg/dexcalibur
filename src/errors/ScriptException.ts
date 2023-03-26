import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {AnalyzerErrCode} from "./AnalyzerException.js";

export class ScriptException extends MonitoredError {


    static EMPTY_SCRIPT = ()=>{
        return new ScriptException("The code source of the script is empty",
            ErrorCode.ANALYZER + AnalyzerErrCode.SCRIPT + 1) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('SCRIPT_MANAGER', pMsg, pCode, pExtra);
    }
}