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

import {Nullable} from "../core/IStringIndex.js";
import {InputDeviceType} from "./kernels/common/InputDeviceType.js";
import {LinuxBusType} from "./kernels/linux/LinuxInputEventCodes.js";
import {OperatingSystem} from "@reversense/dxc-core-api";
import {KernelInfoFactory} from "./kernels/common/KernelFactory.js";


export interface InputSubsystemOptions {

    devices?: Record<string, InputDeviceType>;
}
/**
 * Represent an Input subsystem. int the kernel
 */
export default class InputSubsystem {

    devices:Record<string, InputDeviceType> = {}


    constructor( pConfig:Nullable<InputSubsystemOptions> = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];

    }


    /**
     * To get the input device type by path
     *
     * @param pPath
     */
    getDevTypeByPath(pPath:string): Nullable<InputDeviceType> {
        for(let k in this.devices){
            if(this.devices[k].matchPath(pPath)) return this.devices[k];
        }

        return null;
    }


    /**
     *
     * @param pOS
     * @param pBusType
     * @param pHandle
     */
    getInputDeviceByBusType(pOS:OperatingSystem, pBusType:number, pHandle:Nullable<string> = null): Nullable<InputDeviceType>{
        let devType:Nullable<InputDeviceType>  =null;
        if(KernelInfoFactory.isLinuxBased(pOS)){
            switch (pBusType){
                case LinuxBusType.BUS_HOST:
                case LinuxBusType.BUS_VIRTUAL:
                    devType = this.devices.event;
                    break;
                default:
                    throw new Error("There is not known InputDeviceType mapped to this bus type for this OS : bustype is unknown");
                    break;
            }
        }else{
            throw new Error("There is not known InputDeviceType mapped to this bus type for this OS : OS not supported");
        }


        return devType;
    }


    /**
     * To get the input device from the name of input handle
     *
     * @param pHandleName
     */
    getInputDeviceTypeByHandle(pHandleName:string){
        let devs:InputDeviceType[] = [];

        for(let k in this.devices){
            if(new RegExp("^"+k+"[0-9]+$","g").test(pHandleName)){
                devs.push(this.devices[k]);
            }
        }

        return devs;
    }
}