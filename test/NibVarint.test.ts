import {expect} from 'chai';
import {Nib} from '../src/parser/NibParser.js';

describe('Nib variable integer consumption', function () {
    it('includes the terminal byte in every supported integer width', function () {
        const parser = new Nib.Parser();
        expect(parser.readVarint(Buffer.from([0x81]))).to.deep.equal({value: 1, bytesRead: 1});
        expect(parser.readVarint(Buffer.from([0, 0x81]))).to.deep.equal({value: 128, bytesRead: 2});
        expect(parser.readVarint(Buffer.from([0, 0, 0x81]))).to.deep.equal({value: 16384, bytesRead: 3});
        expect(parser.readVarint(Buffer.from([0, 0, 0, 0x81]))).to.deep.equal({value: 2097152, bytesRead: 4});
    });

    it('advances object table fields past multibyte integers', function () {
        const parser = new Nib.Parser();
        const table = parser.parseObjects(Buffer.from([0, 0x81, 0x82, 0x83]), 0, 1, 4);
        expect(table.res).to.deep.equal([{classIndex: 128, valueStart: 2, valueCount: 3}]);
        expect(table.offset).to.equal(4);
    });

    it('retains truncated-integer errors', function () {
        expect(() => new Nib.Parser().readVarint(Buffer.from([0]))).to.throw('Unexpected end of buffer');
    });
});
