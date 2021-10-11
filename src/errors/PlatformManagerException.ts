import {ErrorCode, MonitoredError} from "./MonitoredError";

export class PlatformManagerException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static PLATFORM_NOT_FOUND = ()=>{ return new PlatformManagerException("Platform is not found (locally or remotely)", ErrorCode.PLATFORM_MANAGER + 101) };
    static PLATFORM_NOT_INSTALLED = ()=>{ return new PlatformManagerException("Platform installation failed", ErrorCode.PLATFORM_MANAGER + 102) };
    static PLATFORM_NOT_ANALYZED = (vErr:string = "")=>{ return new PlatformManagerException("Platform cannot be analyzed. Cause : "+vErr, ErrorCode.PLATFORM_MANAGER + 103) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DEVICE MANAGER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}