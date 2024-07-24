
import {AbstractHook} from "./hook/AbstractHook.js";
import HookTemplateFragment from "./hook/HookTemplateFragment.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {INode} from "./INode.js";
import ModelFile from "./ModelFile.js";

export enum DataLocationType {
    FILE,
    BYTECODE,
    HOOK,
    MEMORY,
    COMM,
    LOGICAL_ANAL,
    CHIP_DUMP,
    JTAG
}

export interface DataLocationFileSource {
    file:ModelFile;
    offset:number;
}

export interface DataLocationFsSource {
    path:string;
    offset:number;
}


export interface DataLocationBytecodeSource {
    nodeType:NodeInternalType;
    node:INode;
    bbOffset:number;
    insOffset:number;
}

export interface DataLocationHookSource {
    hook:AbstractHook;
    frag:HookTemplateFragment;
}

export interface DataLocationMemorySource {
    range:any;
    offset:number;
}

export interface DataLocationCommSource {
    protocol:any;
    request:number;
    time?:number;
}

export type DataLocationSource =
    DataLocationFileSource
    | DataLocationBytecodeSource
    | DataLocationHookSource
    | DataLocationCommSource
    | DataLocationFsSource
    | DataLocationMemorySource;

export class DataLocation {
    _uid:string = null;
    type: DataLocationType;
    source: DataLocationSource;


    constructor(pConfig:any) {
        if(pConfig !== null)
            for(const i in pConfig)
                this[i] = pConfig[i];
    }

    getUID():string{
        if(this._uid == null){
            let source:any = null;
            this._uid = this.type+':';
            switch (this.type){
                case DataLocationType.BYTECODE:
                    source = (this.source as DataLocationBytecodeSource);
                    this._uid += source.nodeType+':'+source.node.getUID()+':'+source.bbOffset+':'+source.insOffset;
                    break;
            }
        }

        return this._uid;
    }
}