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
import {Architecture} from "../../Architecture.js";
import {EmulatorOptionID} from "../maker/EmulatorOption.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {DeviceTemplateUUID} from "../template/DeviceTemplate.js";

/**
 * Exception class related to virtual device management
 * @class
 */
export class VirtualDeviceFactoryException extends MonitoredError {


    _zone = SecurityZone.PRIVATE;

    static ALL = {};

    static OS_NOT_SUPPORTED = (pAccount:UserAccountUUID,pOS:string)=>{
        return new VirtualDeviceFactoryException("Target Operating System [os="+pOS+"] not supported by VDF [user="+pAccount+"]",
            ErrorCode.DEVICE_VDEV + 1) };

    static ANDROID_API_VERSION_MISSING = (pAccount:UserAccountUUID,pDUID:DeviceUUID)=>{
        return new VirtualDeviceFactoryException("Target version of Android API not supported by Android Android VDF [dev="+pDUID+"][user="+pAccount+"]",
            ErrorCode.DEVICE_VDEV + 2) };

    static ANDROID_IMG_TYPE_MISSING = (pAccount:UserAccountUUID,pDUID:DeviceUUID)=>{
        return new VirtualDeviceFactoryException("Target image type not supported by Android VDF [dev="+pDUID+"][user="+pAccount+"]",
            ErrorCode.DEVICE_VDEV + 3) };

    static ANDROID_ARCH_NOT_SUPPORTED = (pAccount:UserAccountUUID,pDUID:DeviceUUID,pArch:Architecture)=>{
        return new VirtualDeviceFactoryException("Target Architecture [arch="+pArch+"] not supported by Android VDF [dev="+pDUID+"][user="+pAccount+"]",
            ErrorCode.DEVICE_VDEV + 4) };

    static AVD_RUNTIME_NOT_FOUND = (pRuntime:string)=>{
        return new VirtualDeviceFactoryException("Runtime of Android Virtual Device manager (AVD) not found [path="+pRuntime+"]",
            ErrorCode.DEVICE_VDEV + 5) };

    static AEMU_RUNTIME_NOT_FOUND = (pRuntime:string)=>{
        return new VirtualDeviceFactoryException("Runtime of Android emulator not found [path="+pRuntime+"]",
            ErrorCode.DEVICE_VDEV + 6) };

    static QEMU_RUNTIME_NOT_FOUND = (pRuntime:string)=>{
        return new VirtualDeviceFactoryException("Runtime of QEMU not found [path="+pRuntime+"]",
            ErrorCode.DEVICE_VDEV + 7) };

    static INVALID_DEVICE_UUID_FMT = (pDUID:DeviceUUID)=>{
        return new VirtualDeviceFactoryException("Invalid DeviceUUID format [uuid="+pDUID+"]",
            ErrorCode.DEVICE_VDEV + 8) };

    static OPTION_CANNOT_BE_VALIDATED = (pName:EmulatorOptionID)=>{
        return new VirtualDeviceFactoryException("Option cannot be validated [optID="+pName+"]",
            ErrorCode.DEVICE_VDEV + 9) };

    static OPTION_VALUE_IS_INVALID = (pName:EmulatorOptionID)=>{
        return new VirtualDeviceFactoryException("Option value is invalid [optID="+pName+"]",
            ErrorCode.DEVICE_VDEV + 10) };

    static CANNOT_ENROLL_VDEV = (pDevUUID:DeviceUUID)=>{
        return new VirtualDeviceFactoryException("Cannot enroll virtual device [uuid="+pDevUUID+"]",
            ErrorCode.DEVICE_VDEV + 11) };

    static OPTION_NOT_SUPPORTED = (pOS:OperatingSystem,pName:EmulatorOptionID)=>{
        return new VirtualDeviceFactoryException("Option not supported [os="+pOS+"][optID="+pName+"]",
            ErrorCode.DEVICE_VDEV + 12) };

    static MISSING_ANDROID_IMAGE = (pTemplateUID:DeviceTemplateUUID)=>{
        return new VirtualDeviceFactoryException("Android image is missing in device template  [tpl="+pTemplateUID+"]",
            ErrorCode.DEVICE_VDEV + 13) };

    static MISSING_ANDROID_SYSDIR = (pTemplateUID:DeviceTemplateUUID, pImageID:string)=>{
        return new VirtualDeviceFactoryException("Android sysdir is missing in device template  [tpl="+pTemplateUID+"][imageID="+pImageID+"]",
            ErrorCode.DEVICE_VDEV + 14) };

    static ANDROID_NO_FREE_PORT = ()=>{
        return new VirtualDeviceFactoryException("There is not enough free port to map to device console and ADB to start connect a device",
            ErrorCode.DEVICE_VDEV + 15) };

    static WRONG_ANDROID_HOME = (pHome:string)=>{
        return new VirtualDeviceFactoryException(`The Android Home is wrong [home=${pHome}]`,
            ErrorCode.DEVICE_VDEV + 16) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('VDF', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }

}