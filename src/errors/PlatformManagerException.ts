/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class PlatformManagerException extends MonitoredError {


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