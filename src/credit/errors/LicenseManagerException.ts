import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {SecurityZone} from "../../security/SecurityZone.js";

export enum LicenseErrCode {
    GENERIC=100,
    VOLATION=200
}

export class LicenseManagerException extends MonitoredError {

    _zone = SecurityZone.PRIVATE;

    static MISSING_PROJECT = ()=>{
        return new LicenseManagerException("The project is missing.",
            ErrorCode.LICENSE_MGT + LicenseErrCode.GENERIC + 1) };

    static LICENSE_NOT_RECOGNIZED = (pSerialNo:string)=>{
        return new LicenseManagerException(`License is not recognized [serial=${pSerialNo}]`,
            ErrorCode.LICENSE_MGT + LicenseErrCode.GENERIC + 2) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('LICENSE MGT', pMsg, pCode, pExtra);
    }
}