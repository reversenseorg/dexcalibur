import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {UserAccountUUID} from "../../user/UserAccount.js";
import {DeviceUUID} from "../../Device.js";
import {Architecture} from "../../Architecture.js";
import {EmulatorOptionID} from "../maker/EmulatorOption.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {DeviceTemplateUUID} from "../template/DeviceTemplate.js";

/**
 * Exception class related to virtual device management
 * @class
 */
export class DeviceManagerClientException extends MonitoredError {

    code:number;
    extra:any;

    _zone = SecurityZone.PRIVATE;

    static ALL = {};

    static CANNOT_INIT_SSH = ()=>{
        return new DeviceManagerClientException("Cannot init SSH connection to remote device manager",
            ErrorCode.DEVICE_MGR_REMOTE + 1) };

    static ANDROID_API_VERSION_MISSING = (pAccount:UserAccountUUID,pDUID:DeviceUUID)=>{
        return new DeviceManagerClientException("Target version of Android API not supported by Android Android VDF [dev="+pDUID+"][user="+pAccount+"]",
            ErrorCode.DEVICE_MGR_REMOTE + 2) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('VDF', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }

}