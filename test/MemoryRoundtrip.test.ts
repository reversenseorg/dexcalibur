import { strict as assert } from 'node:assert';
import { MemoryAddress } from '../src/memory/MemoryAddress.js';
import { MemoryBlock, MemoryBlockPermission } from '../src/memory/MemoryBlock.js';
import { MemoryLayout } from '../src/memory/MemoryLayout.js';

describe('Memory layout roundtrip and permission flags', function () {
    it('returns the reconstructed layout and its blocks', function () {
        const layout = new MemoryLayout();
        layout.addBlock(MemoryBlock.fromAddressRange(new MemoryAddress(16n), new MemoryAddress(32n)));
        const restored = MemoryLayout.fromJsonObject(layout.toJsonObject());
        assert.ok(restored instanceof MemoryLayout);
        assert.deepEqual(restored.toJsonObject(), layout.toJsonObject());
    });

    it('disables an existing permission and keeps repeated disable idempotent', function () {
        const block = new MemoryBlock();
        block.perm = MemoryBlockPermission.READ | MemoryBlockPermission.WRITE;
        block.changeReadable(false);
        assert.equal(block.perm, MemoryBlockPermission.WRITE);
        block.changeReadable(false);
        assert.equal(block.perm, MemoryBlockPermission.WRITE);
        block.changeExecutable(true);
        block.changeExecutable(false);
        assert.equal(block.perm, MemoryBlockPermission.WRITE);
    });
});
