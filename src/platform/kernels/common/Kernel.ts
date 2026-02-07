import ModelSyscall from "../../../ModelSyscall.js";
import {Nullable} from "../../../core/IStringIndex.js";
import InputSubsystem from "../../InputSubsystem.js";
import {PlatformManagerException} from "../../../errors/PlatformManagerException.js";
import {Architecture} from "../../../Architecture.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";

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