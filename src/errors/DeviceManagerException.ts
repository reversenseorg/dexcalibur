import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {DeviceUUID} from "../Device.js";

export class DeviceManagerException extends MonitoredError {


    static ALL = {};

    static DEVICE_ID_NULL = ()=>{ return new DeviceManagerException("Device ID is null", ErrorCode.DEVICE_MANAGER + 1) };
    static DEVICE_NOT_FOUND = (pUID="N/A")=>{ return new DeviceManagerException("Device not found [uid="+pUID+"]", ErrorCode.DEVICE_MANAGER + 2) };
    static DEVICE_NOT_CONNECTED = (pUID)=>{ return new DeviceManagerException("Device [uid="+pUID+"] is not connected", ErrorCode.DEVICE_MANAGER + 3) };
    static DEVICE_NOT_ENROLLED = (pUID)=>{ return new DeviceManagerException("Device [uid="+pUID+"] is not enrolled", ErrorCode.DEVICE_MANAGER + 4) };
    static DEVICE_PROFILING_FAILED = (pUID:string,pMessage:string)=>{ return new DeviceManagerException("The profiling of the device [uid="+pUID+"] failed : "+pMessage, ErrorCode.DEVICE_MANAGER + 5) };
    static DEVICE_CANNOT_BE_REMOVED = (pUID="N/A")=>{ return new DeviceManagerException("Device cannot be removed [uid="+pUID+"]", ErrorCode.DEVICE_MANAGER + 6) };
    static DEVTPL_NOT_FOUND = (pUID="N/A")=>{ return new DeviceManagerException("Device template not found [uid="+pUID+"]", ErrorCode.DEVICE_MANAGER + 7) };
    static CANNOT_LIST_TPL = (pOUID:OrganizationUnitUUID="N/A")=>{ return new DeviceManagerException("List of device templates  from org [uid="+pOUID+"] cannot be retrieved", ErrorCode.DEVICE_MANAGER + 8) };
    static CANNOT_START_PHY_DEV = (pDUID:DeviceUUID="N/A")=>{ return new DeviceManagerException("Cannot start physical device [uuid="+pDUID+"] ", ErrorCode.DEVICE_MANAGER + 9) };
    static CANNOT_FIND_INSTANCE = (pDUID:DeviceUUID="N/A")=>{ return new DeviceManagerException("Cannot find instance for device [uuid="+pDUID+"] ", ErrorCode.DEVICE_MANAGER + 10) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DEVICE MANAGER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}