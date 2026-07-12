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

export class AdbWrapperError extends Error
{
    static DEVICE_NOT_FOUND:number = 1;

    name:string;
    code:number|string;

    constructor(pCode:number|string, pMessage:string) {
        super(pMessage);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        this.code = pCode;
        Error.captureStackTrace(this, this.constructor);
    }

    static newDeviceNotFound( pMessage:string = ""){
        return new AdbWrapperError( AdbWrapperError.DEVICE_NOT_FOUND, pMessage);
    }
}

export class DeviceBridgeError extends Error
{
    name:string;

    constructor(message:string) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
