import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export enum BridgeErrorCode {
    GENERIC=100,
    ADB=200,
    SDB=300
}

export class BridgeException extends MonitoredError {


    constructor( pBridgeName:string, pMsg:string, pCode:number = null, pExtra:any = null) {
        super(pBridgeName+' BRIDGE', pMsg, pCode, pExtra);
    }
}