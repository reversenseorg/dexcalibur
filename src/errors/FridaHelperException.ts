import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";
import {HookErrCode} from "./HookManagerException";


const FRIDA_ERR_CODE = ErrorCode.HOOK_MANAGER + HookErrCode.FRIDA;

export class FridaHelperException extends MonitoredError {

    static ERR = {
        INVALID_DEVICE: FRIDA_ERR_CODE + 1,
        INVALID_FRIDA_SERVER_PATH: FRIDA_ERR_CODE + 2,
        SPAWN_FAILED: FRIDA_ERR_CODE + 3
    };

    static INVALID_DEVICE = ()=>{ return new FridaHelperException(" Invalid device. Please ensure the device is connected and enrolled.",FridaHelperException.ERR.INVALID_DEVICE) };
    static INVALID_FRIDA_SERVER_PATH = ()=>{ return new FridaHelperException(" Path of Frida server is not configured for the device, or not specified.",FridaHelperException.ERR.INVALID_FRIDA_SERVER_PATH) };
    static SPAWN_FAILED = (pMsg)=>{ return new FridaHelperException(" Spawn of frida-server failed, path seems wrong : "+pMsg,FridaHelperException.ERR.SPAWN_FAILED) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('FRIDA HELPER', pMsg, pCode, pExtra);
    }
}