import {ErrorCode } from "./MonitoredError";
import {BridgeErrorCode, BridgeException} from "./BridgeException";

export class AdbBridgeException extends BridgeException {


    static BRIDGE_COMMAND_FAILURE = (err:string="")=>{
        return new AdbBridgeException("ADB command failure : "+err,
            ErrorCode.BRIDGE + BridgeErrorCode.ADB + 1) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ADB', pMsg, pCode, pExtra);
    }
}