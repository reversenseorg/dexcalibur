import {expect} from 'chai';
import {IomemLayoutParser} from "../src/linux/parser/IomemLayoutParser.js";


describe('IomemLayoutParser', function() {


    describe('parse()', function() {

        const file:string = `
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
        `;

        const iomemParser = new IomemLayoutParser();

        let layout = iomemParser.parse(Buffer.from(file));


        it('parse iomeme with nested regions', async function() {
            const blocks = layout.listBlocks();
            console.log(blocks);
            expect(blocks.length).to.be.equal(20);
            expect(blocks[0].getRef()).to.be.equal("0x0000000009000000-0x0000000009000fff");
            expect(blocks[0].start.address).to.be.equal(BigInt(0x9000000));
            expect(blocks[0].end.address).to.be.equal(BigInt(0x9000fff));
            expect(blocks[0].name).to.be.equal("/pl011@9000000");
            expect(blocks[20].name).to.be.equal("0000:00:0b.0");
        });
    });

});