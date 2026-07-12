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

import {MemoryBlock, MemoryBlockRef} from "./MemoryBlock.js";





/**
 * Represent a memory layout : a tree of memory blocks
 *
 * @class
 */
export class MemoryLayout {

    /**
     * An hashmap where each MemoryBlock of the layout is index by own ref
     *
     */
    blocks:Record<MemoryBlockRef, MemoryBlock> = {};

    constructor() {
    }

    addBlock(pBlock:MemoryBlock):void {
        this.blocks[pBlock.getRef()] = pBlock;
    }

    /**
     * To get the list of memory clock contained into this layout
     *
     * @returns {MemoryBlock[]} A list of memory blocks
     * @method
     */
    listBlocks():MemoryBlock[] {
        let blocks = Object.values(this.blocks);
        return blocks.sort((blockA,blockB)=>{
            if(blockA.start.address > blockB.start.address){
                return 1;
            }else if(blockA.start.address == blockB.start.address){
                if(blockA.end.address > blockB.end.address){
                    return 1;
                }else{
                    return -1;
                }
            }else{
                return -1;
            }
        })
    }

    /**
     * To flatten the instance to a poor object ready to be serialized
     *
     * @returns {any} a poor js object
     * @method
     */
    toJsonObject() {
        let o = {blocks:{}};

        for(let ref in this.blocks){
            if(this.blocks[ref]!=null) {
                o.blocks[ref] = this.blocks[ref].toJsonObject();
            }
        }
        return o;
    }

    /**
     * To create an instance of MemoryLayout from serialized object
     *
     * @param {any} pLayout Serialized memory layout
     * @return {MemoryLayout} A layout instance
     * @static
     */
    static fromJsonObject(pLayout: any):MemoryLayout {
        const o = new MemoryLayout();
        if(pLayout!=null && pLayout.blocks!=null){
            for(let ref in pLayout.blocks){
                o.addBlock(MemoryBlock.fromJsonObject(pLayout.blocks[ref]));
            }
        }

        return undefined;
    }
}