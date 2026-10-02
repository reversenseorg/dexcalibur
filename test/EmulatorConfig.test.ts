import {expect} from 'chai';
import {EmulatorConfig} from '../src/emulator/EmulatorConfig.js';
import {MemoryAddress} from '../src/memory/MemoryAddress.js';
import {MemoryBlock} from '../src/memory/MemoryBlock.js';

describe('EmulatorConfig alignment and sessions', () => {
    it('rounds memory size outward while preserving direction', () => {
        const config = new EmulatorConfig();
        const ascending = MemoryBlock.fromAddressRange(new MemoryAddress(0x100n), new MemoryAddress(0x101n));
        const descending = MemoryBlock.fromAddressRange(new MemoryAddress(0x100n), new MemoryAddress(0xffn));
        config.addMemory(ascending, {align: 16});
        config.addMemory(descending, {align: 16});
        expect(ascending.end.address).to.equal(0x110n);
        expect(descending.end.address).to.equal(0xf0n);
    });
    it('keeps large address calculations as bigint', () => {
        const config = new EmulatorConfig();
        const size = (1n << 60n) + 1n;
        const block = MemoryBlock.fromAddressRange(new MemoryAddress(0n), new MemoryAddress(size));
        config.addMemory(block, {align: 16});
        expect(block.end.address).to.equal(((size + 15n) / 16n) * 16n);
    });
    it('retains both absolute and relative session CPU contexts', () => {
        const config = new EmulatorConfig();
        const context = [];
        config.addSession(new MemoryAddress(1n), [], context);
        config.addRelativeSession(2, [], context);
        expect(config.sessions[0].ctx).to.equal(context);
        expect(config.sessions[1].ctx).to.equal(context);
    });
});
