import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {AnalyzerErrCode} from "./AnalyzerException.js";

export class DataParserException extends MonitoredError {


    static XML_PARSING_FAILURE = (pPath:string, pMsg:string)=>{
        return new DataParserException("Parsing of [file="+pPath+"] as XML failed : "+pMsg,
            ErrorCode.ANALYZER + AnalyzerErrCode.GENERIC + 1) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DATA PARSER', pMsg, pCode, pExtra);
    }
}