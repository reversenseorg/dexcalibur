import {KernelInfo} from "./Kernel.js";
import {OperatingSystem} from "../../OperatingSystem.js";
import {Architecture} from "../../../Architecture.js";
import {Nullable} from "../../../core/IStringIndex.js";
import {LinuxKernelInfo_aarch64_v4} from "../linux/LinuxKernel.js";

let gInstance:KernelInfoFactory = null;

interface KernelMatch {
    kernel:KernelInfo,
    affinity:number
}

/**
 * @class
 */
export class KernelInfoFactory {

    static KERNELS:KernelInfo[] = [
        LinuxKernelInfo_aarch64_v4
        // todo : add linux 6
    ];


    constructor() {

    }

    /**
     * Find the better matching kernel
     *
     * @param pOS
     * @param pArch
     * @param pVersion
     */
    static find(pOS:OperatingSystem, pArch:Architecture, pVersion:string):Nullable<KernelInfo> {
        const matches:KernelMatch[] = [];
        KernelInfoFactory.KERNELS.map(x => {
            if(x.name.indexOf(pOS)==-1) return ;

            const match = { kernel:x, affinity:0 };
            if(x.arch===pArch) match.affinity++;
            // todo : perform semver comparison, match major (+1), match minor (+1),  match patch (+1)
            if(x.version===pVersion) match.affinity++;
            matches.push(match);
        });

        if(matches.length == 0) return null;

        matches.sort((a:KernelMatch,b:KernelMatch)=>{ return (a.affinity>b.affinity)? -1 : 1; });
        return matches[0].kernel;
    }


    /**
     * To get a factory instance
     * @method
     * @static
     */
    static getInstance():KernelInfoFactory{
        if(gInstance!=null){
            gInstance = new KernelInfoFactory()
        }

        return gInstance;
    }

    static isLinuxBased(pOS:OperatingSystem):boolean {
        switch (pOS) {
            case OperatingSystem.ANDROID:
            case OperatingSystem.LINUX:
            case OperatingSystem.WEB_OS:
            case OperatingSystem.FIRE_OS:
            case OperatingSystem.TIZEN:
                return true;
            default:
                return false;
        }
    }
}