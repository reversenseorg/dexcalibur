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

import {Architecture} from "../../Architecture.js";
import {OperatingSystem} from "@reversense/dxc-core-api";
import {ABI, InstructionSet} from "../../binary/ABI.js";
import {Profile} from "./Profile.js";
import {Nullable} from "../../core/IStringIndex.js";
import {KernelInfo} from "../../platform/kernels/common/Kernel.js";
import {KernelInfoFactory} from "../../platform/kernels/common/KernelFactory.js";
import {SerializeOptions} from "@reversense/dexcalibur-orm";

/**
 *
 * @class
 * @author Georges-B MICHEL
 */
export abstract class GenericSystemProfile extends  Profile
{

    uid = "Generic_System";

    /**
     * To handle the case where the final user specify this device is emulated
     */
    emulated = false;

    arch:Architecture = null;

    os:OperatingSystem = null;

    version:string = null;

    kInfo:Nullable<KernelInfo> = null;
    nosy = false;


    isNosy(): boolean {
        return this.nosy;
    }

    abstract is(pData:any):boolean;

    abstract getISAs():InstructionSet[];

    abstract getOperatingSystem(pUpdate?:boolean):OperatingSystem ;

    abstract getABI():ABI;

    getClosestKernelInfo():Nullable<KernelInfo> {
        if(this.kInfo==null){
            this.kInfo = KernelInfoFactory.find(this.os, this.arch, this.version);
        }

        return this.kInfo;
    }

    /**
     * To get ABI
     *
     * @method
     */
    abstract getABIlist(pAddrSize?:number):ABI[];

    /**
     * To get SDK version
     *
     * @method
     */
    abstract getSdkVersion():string;

    /**
     * To get device architecture
     * @method
     */
    abstract getArchitecture(pUpdate?:boolean):Architecture;


    /**
     * To check from props if the device is an emulator r
     */
    isEmulator():boolean {
        return this.emulated;
    }

    toJsonObject(pOptions: SerializeOptions = {exclude: {}}): any {
        return super.toJsonObject( { exclude:{ kInfo:true, onAfter:true } });
    }
}