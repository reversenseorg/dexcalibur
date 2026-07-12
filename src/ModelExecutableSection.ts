
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

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "./core/CoreDebug.js";
import {Nullable} from "./core/IStringIndex.js";
import {MemoryBlock} from "./memory/MemoryBlock.js";
import {MemoryAddress} from "./memory/MemoryAddress.js";
import AiHelper from "./core/ai/AiHelper.js";

export enum SectionType {
    SECTION = 'st',
    SEGMENT = 'sg',
}

export interface ModelExecutableSectionOptions {
    _t?:NodeInternalType;
    type?:SectionType;
    paddr?:number;
    vaddr?:number;
    sz?:number;
    memsz?:number;
    perm?:string;
    name?:string;
    data?:any;
    flags?:any;
}

/**
 * Represents a section into an executable file
 * @class
 */
export default class ModelExecutableSection {

    static MCP_Info = AiHelper.getInstance().registerExtraComponent({
        name: "sections from an executable file or process",
        fqcn: "ModelExecutableSection",
        descr: "Represents a section from a file such as an ELF or a memory segments in memory",
        properties:[
            { name:"type", schema:{ type:"string", enum:Object.values(SectionType) }, descr:"Package identifier"},
            { name:"paddr", schema:{ type:"number"}, descr:"Physical address of the section. Only for ELF files. For memory segments, this value is always -1."},
            { name:"vaddr", schema:{ type:"number"}, descr:"Virtual address of the section"},
            { name:"sz", schema:{ type:"number"}, descr:"Size of the section physically"},
            { name:"memsz", schema:{ type:"number"}, descr:"Size of the section in memory"},
            { name:"perm", schema:{ type:"string"}, descr:"Permission of the section. Example: -rwx"},
            { name:"name", schema:{ type:"string"}, descr:"Name of the section"},
            { name:"flag", schema:{ type:"string"}, descr:"TODO"},
            { name:"data", schema:{ type:"object"}, descr:"Buffer or object representing the section content"},
        ]
    })

    _t:NodeInternalType = NodeInternalType.EXEC_SECTION;

    type:SectionType = SectionType.SECTION;
    paddr:number = -1;
    vaddr:number = -1;
    sz:number = -1;
    memsz:number = -1;
    perm:string = "----";
    name:string = null;
    flags: string = null;
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

    toMemoryBlock(pBaseAddress:MemoryAddress, pDirUp = 1):MemoryBlock{
        const blk = MemoryBlock.fromAddressRange(
            pBaseAddress.add(this.vaddr),
            pBaseAddress.add(this.vaddr+(pDirUp*this.memsz))
        );

        blk.name = this.name;
        blk.perm = (this.perm[1]==='r'?0o4:0)+(this.perm[2]==='w'?0o2:0)+(this.perm[3]==='x'?0o1:0);

        return blk;
    }

    toJsonObject():any{
        const o = this;
        CoreDebug.checkJsonSerialize(o, "ModelExecutableSection");
        return o;
    }
}