import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {HookErrCode} from "./HookManagerException.js";


const FRIDA_ERR_CODE = ErrorCode.HOOK_MANAGER + HookErrCode.FRIDA;

export class FridaHelperException extends MonitoredError {

    static ERR = {
        INVALID_DEVICE: FRIDA_ERR_CODE + 1,
        INVALID_FRIDA_SERVER_PATH: FRIDA_ERR_CODE + 2,
        SPAWN_FAILED: FRIDA_ERR_CODE + 3,
        LOCAL_BIN_NOT_FOUND: FRIDA_ERR_CODE + 4
    };

    static INVALID_DEVICE = ()=>{ return new FridaHelperException(" Invalid device. Please ensure the device is connected and enrolled.",FridaHelperException.ERR.INVALID_DEVICE) };
    static INVALID_FRIDA_SERVER_PATH = ()=>{ return new FridaHelperException(" Path of Frida server is not configured for the device, or not specified.",FridaHelperException.ERR.INVALID_FRIDA_SERVER_PATH) };
    static SPAWN_FAILED = (pMsg:string)=>{ return new FridaHelperException(" Spawn of frida-server failed, path seems wrong : "+pMsg,FridaHelperException.ERR.SPAWN_FAILED) };
    static LOCAL_BIN_NOT_FOUND = (pName:string)=>{ return new FridaHelperException(`Binary cannot be found locally [name=${pName}]`,FridaHelperException.ERR.LOCAL_BIN_NOT_FOUND) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('FRIDA HELPER', pMsg, pCode, pExtra);
    }
}