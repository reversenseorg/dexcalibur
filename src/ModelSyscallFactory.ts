import {Architecture} from "./Architecture";
import {OperatingSystem} from "./OperatingSystem";
import ModelSyscall from "./ModelSyscall";
import * as LinuxAarch64Syscalls from "@reversense/interruptor/src/syscalls/LinuxAarch64Syscalls";
import * as LinuxAarch32Syscalls from "@reversense/interruptor/src/syscalls/LinuxAarch32Syscalls";
import * as LinuxX64Syscalls from "@reversense/interruptor/src/syscalls/LinuxX64Syscalls";

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