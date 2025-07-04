import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {AnalyzerErrCode} from "../../errors/AnalyzerException.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";


export class MerlinSearchRequestException extends MonitoredError {

    static ERR = {
        MISSING_NODE_TYPE: ErrorCode.ANALYZER_SEARCH + 1,
        MISSING_INVALID_PPT: ErrorCode.ANALYZER_SEARCH + 2,
        INVALID_PATTERN_NO_FIELD: ErrorCode.ANALYZER_SEARCH + 3
    };

    static MISSING_NODE_TYPE = (pStr:string)=>{ return new MerlinSearchRequestException(`The node type cannot be retrieved from node name : ${pStr}`,MerlinSearchRequestException.ERR.MISSING_NODE_TYPE) };

    static INVALID_NODE_PPT = (pName:string,pNode:NodeType)=>{
        return new MerlinSearchRequestException(`The property not exists in this node type`,
            MerlinSearchRequestException.ERR.MISSING_INVALID_PPT, {type:pNode.getType(), ppt:pName}) };


    static INVALID_PATTERN_NO_FIELD = (pPattern:string)=>{
        return new MerlinSearchRequestException(`Invalid search pattern : field is mandatory bu empty`,
            MerlinSearchRequestException.ERR.INVALID_PATTERN_NO_FIELD, {pattern:pPattern}) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('MERLIN SEARCH REQUEST', pMsg, pCode, pExtra);
    }
}