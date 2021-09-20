import {ErrorCode, MonitoredError} from "./MonitoredError";

export enum BridgeErrorCode {
    GENERIC=100,
    ADB=200,
    SDB=300
}

export class BridgeException extends MonitoredError {

    /*
    static EMPTY_CONN_PARAMS = ()=>{
        return new BridgeException("The connection params are not provided.",
            ErrorCode.REMOTE_DEXCALIBUR + 301) };*/

    constructor( pBridgeName:string, pMsg:string, pCode:number = null, pExtra:any = null) {
        super(pBridgeName+' BRIDGE', pMsg, pCode, pExtra);
    }
}