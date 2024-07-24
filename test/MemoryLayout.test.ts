import {expect} from 'chai';
import {MemoryAddress} from "../src/memory/MemoryAddress.js";
import {MemoryBlock} from "../src/memory/MemoryBlock.js";
import {MemoryLayout} from "../src/memory/MemoryLayout.js";


describe('MemoryLayout', function() {


    describe('addBlock()', function() {

        let layout = new MemoryLayout();

        let start = new MemoryAddress(BigInt(0x010000));
        let end = new MemoryAddress(BigInt(0x010f00));

        let block = MemoryBlock.fromAddressRange(start,end);

        layout.addBlock(block);

        it('ref', async function() {
            expect(layout.blocks[block.getRef()].getRef())
                .to.be.equal("0x0000000000010000-0x0000000000010f00");
        });
    });

    describe('fromAddressRange()', function() {


        let layout = new MemoryLayout();

        let block1 = MemoryBlock.fromAddressRange(
            new MemoryAddress(BigInt(0x010000)),
            new MemoryAddress(BigInt(0x010f00))
        );
        let block2 = MemoryBlock.fromAddressRange(
            new MemoryAddress(BigInt(0x70000000)),
            new MemoryAddress(BigInt(0x7fffffff))
        );
        let block3 = MemoryBlock.fromAddressRange(
            new MemoryAddress(BigInt(0x70000000)),
            new MemoryAddress(BigInt(0x70000100))
        );
        let block4 = MemoryBlock.fromAddressRange(
            new MemoryAddress(BigInt(0x020000)),
            new MemoryAddress(BigInt(0x020f00))
        );

        layout.addBlock(block1);
        layout.addBlock(block2);
        layout.addBlock(block3);
        layout.addBlock(block4);

        const blocks = layout.listBlocks();
        it('unordered and nested blocks', async function() {
            expect(blocks[0].start.address).to.be.equal(block1.start.address);
            expect(blocks[1].start.address).to.be.equal(block4.start.address);
            expect(blocks[2].end.address).to.be.equal(block3.end.address);
            expect(blocks[3].end.address).to.be.equal(block2.end.address);
        });
    });
});