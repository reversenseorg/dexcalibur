import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {AnalyzerErrCode} from "../../errors/AnalyzerException.js";


export class MerlinSearchRequestException extends MonitoredError {

    static ERR = {
        MISSING_NODE_TYPE: ErrorCode.ANALYZER_SEARCH + 1,
    };

    static MISSING_NODE_TYPE = (pStr:string)=>{ return new MerlinSearchRequestException(`The node type cannot be retrieved from node name : ${pStr}`,MerlinSearchRequestException.ERR.MISSING_NODE_TYPE) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('MERLIN SEARCH REQUEST', pMsg, pCode, pExtra);
    }
}