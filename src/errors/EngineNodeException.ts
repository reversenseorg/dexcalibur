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
    static DOWN_NODE = (pUuid:string, pAction="")=>{
        return new EngineNodeException("Node ["+pUuid+"] is down [action="+pAction+"]",
            ErrorCode.REMOTE_DEXCALIBUR + 404) };
    static CANNOT_START_NODE = (pUuid:string, pMsg="")=>{
        return new EngineNodeException("Node ["+pUuid+"] cannot start : "+pMsg,
            ErrorCode.REMOTE_DEXCALIBUR + 405) };
    static INVALID_MASTER_URI = (pUuid:string, pMsg="")=>{
        return new EngineNodeException("Node ["+pUuid+"] has invalid master URI [action="+pMsg+"]",
            ErrorCode.REMOTE_DEXCALIBUR + 406) };
    static MISSING_UUID_HEADER = ()=>{
        return new EngineNodeException("UUID Header is missing into webhook request",
            ErrorCode.REMOTE_DEXCALIBUR + 407) };
    static INVALID_STATE = ()=>{
        return new EngineNodeException("Invalid node state",
            ErrorCode.REMOTE_DEXCALIBUR + 408) };





    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('[ENGINE NODE] ', pMsg, pCode, pExtra);
    }
}