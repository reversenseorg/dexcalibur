import {expect} from 'chai';
import {MemoryAddress} from "../src/memory/MemoryAddress.js";
import {MemoryBlock} from "../src/memory/MemoryBlock.js";


describe('MemoryBlock', function() {


    describe('fromAddressRange()', function() {

        let start = new MemoryAddress(BigInt(0x010000));
        let end = new MemoryAddress(BigInt(0x010f00));

        let block = MemoryBlock.fromAddressRange(start,end);
        it('ref', async function() {
            expect(block.getRef(4)).to.be.equal("0x00010000-0x00010f00");
        });
    });

      
});