import {expect} from 'chai';
import {Smali} from '../src/parser/SmaliParser.js';

describe('Smali initial values', function () {
    const parse = (value: string) => Smali.OpcodeParser.prototype.parseInitialValue(value);

    it('retains quoted string values before numeric classification', function () {
        for (const value of ['hello', '1.2', 'E', '']) {
            expect(parse(JSON.stringify(value))).to.deep.equal({kind: 'constant', value});
        }
    });

    it('retains existing numeric, boolean and null handling', function () {
        expect(parse('1.25')).to.deep.equal({kind: 'constant', value: 1.25});
        expect(parse('1e3')).to.deep.equal({kind: 'constant', value: 1000});
        expect(parse('0xFE')).to.deep.equal({kind: 'constant', value: 254});
        expect(parse('42L')).to.deep.equal({kind: 'constant', value: 42});
        expect(parse('false')).to.deep.equal({kind: 'constant', value: false});
        expect(parse('null')).to.deep.equal({kind: 'null'});
    });
});
