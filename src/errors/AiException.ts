import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {AnalyzerErrCode} from "./AnalyzerException.js";

export class AiException extends MonitoredError {


    static MCP_ROUTE_MISSING_PARAM_SCHEMA = (pName:string, pTool:string, pUri:string )=>{
        return new AiException("Missing schemaDoc or schema for parameter ["+pName+`] of MCP tool [${pTool}] at ${pUri}`,
            ErrorCode.AI + 1) };

    static MCP_ROUTE_MISSING_RESP_SCHEMA = (pRespN:number, pTool:string )=>{
        return new AiException("Missing schemaDoc or schema for response ["+pRespN+`] of MCP tool [${pTool}]`,
            ErrorCode.AI + 2) };

    static MCP_UNKNOW_COMP = (pFqcn:string)=>{
        return new AiException("The component '"+pFqcn+"' is not unknown.",
            ErrorCode.AI + 10) };

    static MCP_UNKNOW_COMP_PPT = (pFqcn:string, pPpt:string)=>{
        return new AiException("The property '"+pPpt+"' from component '"+pFqcn+"' is unknown.",
            ErrorCode.AI + 11) };

    static MCP_MISSING_CMP_SCHEMA = (pFqcn:string, pPpt?:string)=>{
        return new AiException(`The schema of ${pPpt? 'the property "'+pPpt+'" from "'+pFqcn : 'the component "'+pFqcn+'"' } is unknown.`,
            ErrorCode.AI + 12) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AI', pMsg, pCode, pExtra);
    }
}