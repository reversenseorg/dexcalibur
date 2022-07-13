import {ErrorCode, MonitoredError} from "./MonitoredError";

export class DeviceManagerException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static DEVICE_ID_NULL = ()=>{ return new DeviceManagerException("Device ID is null", ErrorCode.DEVICE_MANAGER + 1) };
    static DEVICE_NOT_FOUND = ()=>{ return new DeviceManagerException("Device not found", ErrorCode.DEVICE_MANAGER + 2) };
    static DEVICE_NOT_CONNECTED = (pUID)=>{ return new DeviceManagerException("Device [uid="+pUID+"] is not connected", ErrorCode.DEVICE_MANAGER + 3) };
    static DEVICE_NOT_ENROLLED = (pUID)=>{ return new DeviceManagerException("Device [uid="+pUID+"] is not enrolled", ErrorCode.DEVICE_MANAGER + 4) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DEVICE MANAGER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}