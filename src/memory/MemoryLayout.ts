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