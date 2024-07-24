import {expect} from 'chai';
import {MemoryAddress} from "../src/memory/MemoryAddress.js";


describe('MemoryAddress', function() {


    describe('add()', function() {

        let addr1 = new MemoryAddress(BigInt(0x010000));

        it('add 0xff', async function() {
            expect(addr1.add(0xff).address).to.be.equal(BigInt(0x0100ff));
        });
    });

    describe('sub()', function() {

        let addr1 = new MemoryAddress(BigInt(0x010100));

        it('sub 0x100', async function() {
            expect(addr1.sub(0x100).address).to.be.equal(BigInt(0x010000));
        });
    });

    describe('toHex()', function() {

        let addr1 = new MemoryAddress(BigInt(0x09000fff));

        it('No Padding', async function() {
            expect(addr1.toHex(-1)).to.be.equal("0x9000fff");
        });

        it('4-bit padding', async function() {
            expect(addr1.toHex(4)).to.be.equal("0x09000fff");
        });

        it('Padding', async function() {
            expect(addr1.toHex(6)).to.be.equal("0x000009000fff");
            expect(addr1.toHex(8)).to.be.equal("0x0000000009000fff");
        });
    });
      
});