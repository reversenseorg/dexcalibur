import {ErrorCode, MonitoredError} from "./MonitoredError";
import {AnalyzerErrCode} from "./AnalyzerException";

export class SearchEngineException extends MonitoredError {


    static ANALYSIS_UNIT_NOT_READY = (pAUName:string)=>{
        return new SearchEngineException("The analyzer unit '"+pAUName+"' is ready for search through Search API.",
            ErrorCode.ANALYZER_SEARCH + 101) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('SEARCH', pMsg, pCode, pExtra);
    }
}