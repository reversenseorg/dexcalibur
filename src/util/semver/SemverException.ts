import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {AnalyzerErrCode} from "../../errors/AnalyzerException.js";


export class SemverException extends MonitoredError {


    static INVALID_FORMAT = (pVersion:string)=>{
        return new SemverException("The version '"+pVersion+"' has invalid format and cannot be parsed. Please, fill an issue.",
            ErrorCode.GENERIC + AnalyzerErrCode.NATIV + 100) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('SEMVER', pMsg, pCode, pExtra);
    }
}