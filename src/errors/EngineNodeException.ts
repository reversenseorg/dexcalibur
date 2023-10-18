import {ErrorCode, MonitoredError} from "./MonitoredError.js";


export class EngineNodeException extends MonitoredError {


    static MAX_PORT_REACHED = ()=>{
        return new EngineNodeException("Max port number reached. Node cannot be started. ",
            ErrorCode.REMOTE_DEXCALIBUR + 401) };
    static NODE_ALREADY_RUNNING = (pMsg:string="")=>{
        return new EngineNodeException("Node is already started, settings cannot be changed ["+pMsg+"]",
            ErrorCode.REMOTE_DEXCALIBUR + 402) };
    static BUSY_NODE = (pUuid:string, pAction="")=>{
        return new EngineNodeException("Node ["+pUuid+"] is busy [action="+pAction+"]",
            ErrorCode.REMOTE_DEXCALIBUR + 403) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('[ENGINE NODE] ', pMsg, pCode, pExtra);
    }
}