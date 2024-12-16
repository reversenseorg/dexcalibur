import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class PlatformManagerException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static PLATFORM_NOT_FOUND = (pName = '<redacted>')=>{ return new PlatformManagerException("Platform is not found (locally or remotely) [name="+pName+"]", ErrorCode.PLATFORM_MANAGER + 101) };
    static PLATFORM_NOT_INSTALLED = ()=>{ return new PlatformManagerException("Platform installation failed", ErrorCode.PLATFORM_MANAGER + 102) };
    static PLATFORM_NOT_ANALYZED = (vErr = "")=>{ return new PlatformManagerException("Platform cannot be analyzed. Cause : "+vErr, ErrorCode.PLATFORM_MANAGER + 103) };
    static STUB_PLATFORM_NOT_SUPPORTED = ()=>{ return new PlatformManagerException("Stub platform not supported.", ErrorCode.PLATFORM_MANAGER + 104) };
    static STUB_PLATFORMS_NOT_AVAILABLE = ()=>{ return new PlatformManagerException("There is not stub platforms of the target device", ErrorCode.PLATFORM_MANAGER + 105) };
    static INVALID_KERNEL_VER = ()=>{ return new PlatformManagerException("The version of the kernel cannot be null. ", ErrorCode.PLATFORM_MANAGER + 201) };
    static INVALID_SYSTEM_NAME= ()=>{ return new PlatformManagerException("The name of the operating system cannot be null. ", ErrorCode.PLATFORM_MANAGER + 202) };
    static INVALID_PLATFORM= ()=>{ return new PlatformManagerException("The platform is invalid : ref is null.", ErrorCode.PLATFORM_MANAGER + 203) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DEVICE MANAGER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
        console.log(pMsg);
    }

}