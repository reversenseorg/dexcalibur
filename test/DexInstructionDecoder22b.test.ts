import {expect} from 'chai';
import {DexStructures} from '../src/android/DexStructures.js';

describe('Dalvik 22b instruction decoding', function () {
    it('decodes the 8-bit destination, source register and signed literal', function () {
        const decoder = new DexStructures.DalvikBytecodeDecoder();
        const instruction = decoder.decode([0x23d8, 0xfe34])[0];

        expect(instruction.mnemonic).to.equal('add-int/lit8');
        expect(instruction.size).to.equal(2);
        expect(instruction.operands).to.deep.equal([
            {type: 'register', value: 0x23},
            {type: 'register', value: 0x34},
            -2,
        ]);
    });
});
