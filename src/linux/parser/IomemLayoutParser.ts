import {MemoryLayout} from "../../memory/MemoryLayout.js";
import {MemoryBlock} from "../../memory/MemoryBlock.js";
import {MemoryAddress} from "../../memory/MemoryAddress.js";

/**
 * A class to parse and create a tree of memory regions from
 * a /pro/iomem file
 *
 * @class
 */
export class IomemLayoutParser {

    constructor() {
    }


    /*
09000000-09000fff : /pl011@9000000
  09000000-09000fff : /pl011@9000000
09010000-09010fff : /pl031@9010000
09030000-09030fff : /pl061@9030000
0a003000-0a0031ff : a003000.virtio_mmio
0a003200-0a0033ff : a003200.virtio_mmio
0a003400-0a0035ff : a003400.virtio_mmio
0a003600-0a0037ff : a003600.virtio_mmio
0a003800-0a0039ff : a003800.virtio_mmio
0a003a00-0a003bff : a003a00.virtio_mmio
0a003c00-0a003dff : a003c00.virtio_mmio
0a003e00-0a003fff : a003e00.virtio_mmio
10000000-3efeffff : /pcie@10000000
  10000000-10003fff : 0000:00:01.0
    10000000-10003fff : ICH HD audio
  10004000-10004fff : 0000:00:0b.0
3f000000-3fffffff : Configuration Space
40000000-9fffffff : System RAM
  40080000-40ae9fff : Kernel code
  40ec0000-40fecfff : Kernel data
800000000-fffffffff : /pcie@10000000
  800000000-9ffffffff : 0000:00:0b.0

     */
    parse(pBuffer:Buffer):MemoryLayout {
        const layout = new MemoryLayout();
        pBuffer.toString().split("\n").map(x => {
            const match = /\s*([0-9a-f]+)-([0-9a-f]+)\s:\s(.*)/.exec(x);
            if(match==null){
                console.log("Error : region don't match the regexp : "+x);
                return;
            }

            const block = MemoryBlock.fromAddressRange(
               new MemoryAddress(BigInt(parseInt(match[1],16))),
               new MemoryAddress(BigInt(parseInt(match[2],16)))
            );
            block.name = match[3];
            layout.addBlock(block);
        });

        return layout;
    }
}