import {Kernel} from "./Kernel.js";
import {OperatingSystem} from "../../OperatingSystem.js";
import {Architecture} from "../../../Architecture.js";
import {Nullable} from "../../../core/IStringIndex.js";

let gInstance:KernelFactory = null;

interface KernelMatch {
    kernel:Kernel,
    affinity:number
}

/**
 * @class
 */
export class KernelFactory {

    static KERNELS:Kernel[] = [];


    constructor() {

    }

    /**
     * Find the better matching kernel
     *
     * @param pOS
     * @param pArch
     * @param pVersion
     */
    find(pOS:OperatingSystem, pArch:Architecture, pVersion:string):Nullable<Kernel> {
        const matches:KernelMatch[] = [];
        KernelFactory.KERNELS.map(x => {
            if(x.name!=pOS) return ;

            const match = { kernel:x, affinity:0 };
            if(x.arch===pArch) match.affinity++;
            // todo : perform semver comparison, match major (+1), match minor (+1),  match patch (+1)
            if(x.version===pVersion) match.affinity++;
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
    static getInstance():KernelFactory{
        if(gInstance!=null){
            gInstance = new KernelFactory()
        }

        return gInstance;
    }
}