import {NodeType} from "./NodeType";

/**
 * Represents a section into an executable file
 * @class
 */
export default class ModelExecutableSection {

    _t:NodeType = NodeType.EXEC_SECTION;

    paddr:number = -1;
    vaddr:number = -1;
    sz:number = -1;
    memsz:number = -1;
    perm:string = "----";
    name:string = null;

    data:any= null;

    constructor(pConfig:any = null){

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
        return this;
    }
}