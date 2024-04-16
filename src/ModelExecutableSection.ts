import {NodeInternalType} from "./NodeInternalType.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {Nullable} from "./core/IStringIndex.js";


export interface ModelExecutableSectionOptions {
    _t?:NodeInternalType;
    paddr?:number;
    vaddr?:number;
    sz?:number;
    memsz?:number;
    perm?:string;
    name?:string;
    data?:any;
}

/**
 * Represents a section into an executable file
 * @class
 */
export default class ModelExecutableSection {

    _t:NodeInternalType = NodeInternalType.EXEC_SECTION;

    paddr:number = -1;
    vaddr:number = -1;
    sz:number = -1;
    memsz:number = -1;
    perm:string = "----";
    name:string = null;

    data:any= null;

    constructor(pConfig:Nullable<ModelExecutableSectionOptions> = null){

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }

    getVirtualAddr():number {
        return this.vaddr;
    }
    getPhysAddr():number {
        return this.vaddr;
    }
    getPermissions():string {
        return this.perm;
    }
    getName():string {
        return this.name;
    }
    getMemSize():number {
        return this.memsz;
    }
    getSize():number {
        return this.sz;
    }

    toJsonObject():any{
        const o = this;
        CoreDebug.checkJsonSerialize(o, "ModelExecutableSection");
        return o;
    }
}