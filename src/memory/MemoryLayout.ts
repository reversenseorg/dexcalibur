import {MemoryBlock, MemoryBlockRef} from "./MemoryBlock.js";





/**
 * Represent a memory layout : a tree of memory blocks
 *
 * @class
 */
export class MemoryLayout {

    blocks:Record<MemoryBlockRef, MemoryBlock> = {};

    constructor() {
    }

    addBlock(pBlock:MemoryBlock):void {
        this.blocks[pBlock.getRef()] = pBlock;
    }

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

    toJsonObject() {
        let o = {blocks:{}};

        for(let ref in this.blocks){
            if(this.blocks[ref]!=null) {
                o.blocks[ref] = this.blocks[ref].toJsonObject();
            }
        }
        return o;
    }

    static fromJsonObject(pLayout: any):MemoryLayout {
        const o = new MemoryLayout();
        pLayout.blocks.map(x => {
            o.addBlock(MemoryBlock.fromJsonObject(x));
        });
        return undefined;
    }
}