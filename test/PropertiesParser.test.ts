import {expect} from 'chai';
import {Properties} from '../src/parser/PropertiesParser.js';

describe('Properties parser line preservation', function () {
    it('retains properties after whitespace-only lines', async function () {
        const result = await new Properties.Parser().fromBuffer(
            Buffer.from('first=one\n   \nsecond=two\n\t\nthird=three'), 0,
            {encoding: 'utf-8', raw: true, tags: [], eol: '\n'}
        );
        expect(result.ok.value.first.value).to.equal('one');
        expect(result.ok.value.second.value).to.equal('two');
        expect(result.ok.value.third.value).to.equal('three');
        expect(result.invalid).to.have.lengthOf(0);
    });

    it('decodes the selected buffer encoding', async function () {
        const result = await new Properties.Parser().fromBuffer(
            Buffer.from('name=caf\u00e9', 'latin1'), 0,
            {encoding: 'latin1', raw: true, tags: [], eol: '\n'}
        );
        expect(result.ok.value.name.value).to.equal('caf\u00e9');
    });

    it('preserves CRLF records and a nonzero start offset', async function () {
        const result = await new Properties.Parser().fromBuffer(
            Buffer.from('skip:first=one\r\n  \r\nsecond=two'), 5,
            {encoding: 'utf-8', raw: true, tags: [], eol: '\r\n'}
        );
        expect(result.ok.value.first.value).to.equal('one');
        expect(result.ok.value.second.value).to.equal('two');
        expect(result.invalid).to.have.lengthOf(0);
    });
});
