
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

import {AbstractHook} from "./hook/AbstractHook.js";
import HookTemplateFragment from "./hook/HookTemplateFragment.js";

import {NodeInternalType, Nullable} from "@reversense/dxc-core-api";
import {INode, INodeRef} from "./INode.js";
import ModelFile from "./ModelFile.js";
import {IJsonSerializable, NodeUtils, SerializeOptions} from "@reversense/dexcalibur-orm";

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

export interface DataLocationNodeRef {
    ref?: INodeRef
}
export interface DataLocationFileSource extends DataLocationNodeRef {
    file?:ModelFile|INodeRef;
    fileUID?:any;

    offset:number;
}

export interface DataLocationFsSource  extends DataLocationNodeRef {
    path:string;
    offset:number;
}


export interface DataLocationBytecodeSource  extends DataLocationNodeRef {
    nodeType:NodeInternalType;
    node:INode;
    bbOffset:number;
    insOffset:number;
}

export interface DataLocationHookSource  extends DataLocationNodeRef {
    hook:AbstractHook;
    frag:HookTemplateFragment;
}

export interface DataLocationMemorySource  extends DataLocationNodeRef {
    range:any;
    offset:number;
}

export interface DataLocationCommSource  extends DataLocationNodeRef {
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

export class DataLocation implements IJsonSerializable {
    _uid:string = null;
    type: DataLocationType;
    source: DataLocationSource;


    constructor(pConfig:any) {
        if(pConfig !== null)
            for(const i in pConfig)
                this[i] = pConfig[i];
    }

    static fromFile(pFile:Nullable<ModelFile>, pOffset:number):DataLocation{
        return new DataLocation({
            type: DataLocationType.FILE,
            source: {
                res: (pFile ? NodeUtils.asNodeRef(pFile) : null),
                file: pFile,
                offset: pOffset
            }
        });
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

    toJsonObject(pOption?: SerializeOptions): any {
        const o:any = {
            _uid: this._uid,
            type: this.type,
            source: null
        };

        if(this.source !=null){
            switch (this.type){
                case DataLocationType.FILE:
                    const s = (this.source as DataLocationFileSource);
                    o.source = {
                        offset: s.offset,
                        ref: s.ref
                    };

                    if(s.file!=null && s.ref==null){
                        if(!NodeUtils.isNodeRef(s.file)){
                            o.source.ref = {
                                __: ModelFile.TYPE.getType(),
                                _uid: (s.file as ModelFile).getUID()
                            }
                        }
                    }
                    break;
                case DataLocationType.HOOK:
                    o.source = {
                        hook: (this.source as DataLocationHookSource).hook?.getGUID(),
                        frag: (this.source as DataLocationHookSource).frag?.getUID()
                    }
                    break;
                case DataLocationType.BYTECODE:
                    if((this.source as DataLocationBytecodeSource).ref!=null){
                        o.source = {
                            ref:(this.source as DataLocationBytecodeSource).ref,
                            bbOffset:(this.source as DataLocationBytecodeSource).bbOffset,
                            insOffset:(this.source as DataLocationBytecodeSource).insOffset
                        }
                    }else{
                        o.source = {
                            // todo : deprecated : retrrocompatibility
                            nodeType:(this.source as DataLocationBytecodeSource).nodeType,
                            node:(this.source as DataLocationBytecodeSource).node.getUID(),
                            bbOffset:(this.source as DataLocationBytecodeSource).bbOffset,
                            insOffset:(this.source as DataLocationBytecodeSource).insOffset
                        }
                    }

                    break;
                default:
                    o.source = this.source;
                    break;
            }
        }

        return o;
    }
}