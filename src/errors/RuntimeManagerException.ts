import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {ScriptCompilerOutput} from "../hook/HookWorkspace.js";

export enum HookErrCode {
    GENERIC=100,
    FRIDA=200,
    MESSAGE=300
}

export class RuntimeManagerException extends MonitoredError {

    static ERR = {
        NO_DEVICE_SELECTED: ErrorCode.RT_MANAGER +  1
    };

    static NO_DEVICE_SELECTED = ()=>{
        return new RuntimeManagerException("There is no device selected.",RuntimeManagerException.ERR.NO_DEVICE_SELECTED) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('RUNTIME MANAGER', pMsg, pCode, pExtra);
    }
}