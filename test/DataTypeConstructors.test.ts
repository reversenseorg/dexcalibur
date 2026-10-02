import {expect} from 'chai';
import {ArrayType, IntType, NativeBackend, PointerType} from '../src/types/common.js';
import {CTypeEmitter, DalvikDescriptorEmitter} from '../src/types/exports.js';

describe('Data type constructor fields', function () {
    it('retains integer names', function () {
        const type = new IntType(NativeBackend.DEX, 32, true, 'int');
        expect(type.getName()).to.equal('int');
        expect(type.accept(new CTypeEmitter())).to.equal('int32_t');
    });

    it('retains pointer pointees', function () {
        const target = new IntType(NativeBackend.BUILTIN, 8, false, 'byte');
        const pointer = new PointerType(target, 64);
        expect(pointer.pointee).to.equal(target);
        expect(pointer.ptrBits).to.equal(64);
        expect(pointer.accept(new CTypeEmitter())).to.equal('uint8_t*');
    });

    it('retains array elements and supplied lengths', function () {
        const target = new IntType(NativeBackend.DEX, 32, true, 'int');
        for (const length of [-1, 0, 3]) {
            const array = new ArrayType(target, length, NativeBackend.DEX);
            expect(array.element).to.equal(target);
            expect(array.length).to.equal(length);
            expect(array.bitSize).to.equal(length === -1 ? null : 32 * length);
            expect(array.accept(new DalvikDescriptorEmitter())).to.equal('[I');
        }
    });
});
