import {expect} from 'chai';
import {DexStructures} from '../src/android/DexStructures.js';

describe('DEX 038 invocation formats', function () {
    const decoder = new DexStructures.DalvikBytecodeDecoder();

    it('decodes invoke-polymorphic 45cc as four code units with method and proto references', function () {
        const instructions = decoder.decode([0x2afa, 0x1234, 0x5678, 0x9abc, 0x0000]);
        expect(instructions.map(({mnemonic, size}) => ({mnemonic, size}))).to.deep.equal([
            {mnemonic: 'invoke-polymorphic', size: 4},
            {mnemonic: 'nop', size: 1},
        ]);
        expect(instructions[0].operands).to.deep.equal([
            [{type: 'register', value: 8}, {type: 'register', value: 7}],
            {type: 'method', value: 0x1234},
            {type: 'proto', value: 0x9abc},
        ]);
    });

    it('decodes invoke-polymorphic/range 4rcc without splitting its trailing proto index', function () {
        const instructions = decoder.decode([0x03fb, 0x2345, 0x6789, 0xabcd, 0x0000]);
        expect(instructions.map(({mnemonic, size}) => ({mnemonic, size}))).to.deep.equal([
            {mnemonic: 'invoke-polymorphic/range', size: 4},
            {mnemonic: 'nop', size: 1},
        ]);
        expect(instructions[0].operands).to.deep.equal([
            {type: 'register_range', start: 0x6789, count: 3},
            {type: 'method', value: 0x2345},
            {type: 'proto', value: 0xabcd},
        ]);
    });

    it('decodes invoke-custom call-site references in both list and range forms', function () {
        const list = decoder.decode([0x51fc, 0x2345, 0x6789, 0x0000]);
        const range = decoder.decode([0x03fd, 0x3456, 0x789a, 0x0000]);
        expect(list[0].size).to.equal(3);
        expect(list[0].operands).to.deep.equal([
            [
                {type: 'register', value: 9},
                {type: 'register', value: 8},
                {type: 'register', value: 7},
                {type: 'register', value: 6},
                {type: 'register', value: 1},
            ],
            {type: 'call_site', value: 0x2345},
        ]);
        expect(range[0].size).to.equal(3);
        expect(range[0].operands).to.deep.equal([
            {type: 'register_range', start: 0x789a, count: 3},
            {type: 'call_site', value: 0x3456},
        ]);
    });

    it('keeps the 35c register order used by standard invoke instructions', function () {
        const [instruction] = decoder.decode([0x5171, 0x2345, 0x6789]);
        expect(instruction.mnemonic).to.equal('invoke-static');
        expect(instruction.operands[0]).to.deep.equal([
            {type: 'register', value: 9},
            {type: 'register', value: 8},
            {type: 'register', value: 7},
            {type: 'register', value: 6},
            {type: 'register', value: 1},
        ]);
    });

    it('recognizes method-handle and method-type constants instead of treating them as field references', function () {
        const [handle] = decoder.decode([0x01fe, 0x2345]);
        const [methodType] = decoder.decode([0x02ff, 0x3456]);
        expect(handle.operands).to.deep.equal([{type: 'register', value: 1}, {type: 'method_handle', value: 0x2345}]);
        expect(methodType.operands).to.deep.equal([{type: 'register', value: 2}, {type: 'proto', value: 0x3456}]);
    });
});
