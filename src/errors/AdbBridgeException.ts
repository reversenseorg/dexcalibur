import {ErrorCode } from "./MonitoredError";
import {BridgeErrorCode, BridgeException} from "./BridgeException";

export class AdbBridgeException extends BridgeException {


    static BRIDGE_COMMAND_FAILURE = (err)=>{ return new AdbBridgeException("ADB command failure : "+err,ErrorCode.BRIDGE + BridgeErrorCode.ADB + 1) };
    static APK_PATH_IS_NULL = ()=>{ return new AdbBridgeException("Install failed : APK path is null",ErrorCode.BRIDGE + BridgeErrorCode.ADB + 2) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ADB', pMsg, pCode, pExtra);
    }
}