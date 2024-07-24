import {ErrorCode } from "./MonitoredError.js";
import {BridgeErrorCode, BridgeException} from "./BridgeException.js";

export class AdbBridgeException extends BridgeException {


    static BRIDGE_COMMAND_FAILURE = (err)=>{ return new AdbBridgeException("ADB command failure : "+err,ErrorCode.BRIDGE + BridgeErrorCode.ADB + 1) };
    static APK_PATH_IS_NULL = ()=>{ return new AdbBridgeException("Install failed : APK path is null",ErrorCode.BRIDGE + BridgeErrorCode.ADB + 2) };
    static EOP_STRATEGY_NOT_FOUND = (pName:string)=>{ return new AdbBridgeException("Privilege Escalation failure : strategy [name="+pName+"] is not found",ErrorCode.BRIDGE + BridgeErrorCode.ADB + 3) };
    static DEFAULT_EOP_STRATEGY_UNDEFINED = ()=>{ return new AdbBridgeException("Privilege escalation cannot be done : there is not default strategy.",ErrorCode.BRIDGE + BridgeErrorCode.ADB + 4) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ADB', pMsg, pCode, pExtra);
    }
}