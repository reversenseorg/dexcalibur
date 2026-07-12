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

import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {UserAccountUUID} from "../../user/UserAccount.js";
import {DeviceUUID} from "../../Device.js";

/**
 * Exception class related to virtual device management
 * @class
 */
export class DeviceManagerClientException extends MonitoredError {


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