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

import ModelSyscall from "../../../ModelSyscall.js";
import {Nullable} from "../../../core/IStringIndex.js";
import InputSubsystem from "../../InputSubsystem.js";
import {PlatformManagerException} from "../../../errors/PlatformManagerException.js";
import {Architecture} from "../../../Architecture.js";
import {OperatingSystem} from "@reversense/dxc-core-api";

export interface KernelOptions {
    name?:OperatingSystem[];
    version?:string;
    arch?:Architecture;
    inputSubsystem?:InputSubsystem;
    _syscalls?:ModelSyscall[];
}

/**
 * Represent a particular version of linux kernel
 * @class
 */
export class KernelInfo {

    name:OperatingSystem[] = [];

    arch:Architecture;

    version:string;

    inputSubsystem:Nullable<InputSubsystem> = null;

    private _syscalls:ModelSyscall[] = [];


    constructor(pOptions:Nullable<KernelOptions>) {
        if(pOptions!=null){
            for(let k in pOptions){
                this[k] = pOptions[k];
            }
        }
    }

    /**
     * Get kernel uid
     */
    getUID():string {

        if(this.name==null){
            throw PlatformManagerException.INVALID_SYSTEM_NAME();
        }
        if(this.version==null){
            throw PlatformManagerException.INVALID_KERNEL_VER();
        }
        
        return `${this.name.join(',')}:${this.version}:${this.arch}`;
    }

    addSystemCall(pSyscall:ModelSyscall):void{
        this._syscalls[pSyscall.getUID()] = pSyscall;
    }

    addInputSubsystem(pSub:InputSubsystem):void{
        this.inputSubsystem = pSub;
    }

    /**
     * To get a syscal by its number
     * @param {number} pNum
     */
    getSyscall(pNum: number):Nullable<ModelSyscall> {
        return this._syscalls.find(s => (s.sysnum===pNum));
    }
}