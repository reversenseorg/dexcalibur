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

import {Architecture} from "./Architecture.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import ModelSyscall from "./ModelSyscall.js";
import * as LinuxAarch64Syscalls from "@reversense/interruptor/src/syscalls/LinuxAarch64Syscalls.js";
import * as LinuxAarch32Syscalls from "@reversense/interruptor/src/syscalls/LinuxAarch32Syscalls.js";
import * as LinuxX64Syscalls from "@reversense/interruptor/src/syscalls/LinuxX64Syscalls.js";

/**
 * @class
 */
export default class ModelSyscallFactory {


    static createSyscallsFromInterruptor( pArch:Architecture, pOS:OperatingSystem, pDefines:any[]):ModelSyscall[] {
        const syscalls:ModelSyscall[] = [];
        pDefines.map( (vDef)=>{
            syscalls.push(ModelSyscall.fromInterruptorDefine(pOS,pArch,vDef));
        });
        return syscalls;
    }

    static getSyscallListFrom( pArch:Architecture, pOS:OperatingSystem):ModelSyscall[] {

        let defines:any[] = null, os:string;

        switch (pOS) {
            case OperatingSystem.LINUX:
            case OperatingSystem.TIZEN:
            case OperatingSystem.ANDROID:
            case OperatingSystem.MACOS:
            case OperatingSystem.DARWIN:
                switch(pArch){
                    case Architecture.AARCH64:
                        defines = LinuxAarch64Syscalls.SVC;
                        break;
                    case Architecture.AARCH32:
                        defines = LinuxAarch32Syscalls.SWI;
                        break;
                    case Architecture.X86_64:
                        defines = LinuxX64Syscalls.SYSC;
                        break;
                }
                break;
        }

        if(defines!=null){
            return ModelSyscallFactory.createSyscallsFromInterruptor(pArch,pOS,defines);
        }else{
            return null;
        }
    }
}