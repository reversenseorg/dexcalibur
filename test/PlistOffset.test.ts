import {expect} from 'chai';
import {readFileSync} from 'node:fs';
import {Plist} from '../src/parser/PlistParser.js';

describe('Plist buffer offsets', function () {
    const xml = Buffer.from('<?xml version="1.0"?><plist version="1.0"><dict><key>name</key><string>value</string></dict></plist>');

    it('recognizes and parses XML at a nonzero offset', async function () {
        const prefix = Buffer.alloc(250, 0x78);
        const buffer = Buffer.concat([prefix, xml]);
        const parser = new Plist.Parser();
        expect(await parser.hasSignature(buffer, prefix.length)).to.equal(true);
        const result = await parser.fromBuffer(buffer, prefix.length);
        expect(result.ok.value.getData('name')).to.equal('value');
    });

    it('recognizes and parses binary content at a nonzero offset', async function () {
        const binary = readFileSync(new URL('./files/BinPlist.plist', import.meta.url));
        const prefix = Buffer.from('prefix');
        const parser = new Plist.Parser();
        const baseline = await parser.fromBuffer(binary, 0);
        const buffer = Buffer.concat([prefix, binary]);
        expect(await parser.hasSignature(buffer, prefix.length)).to.equal(true);
        const result = await parser.fromBuffer(buffer, prefix.length);
        expect(result.ok.value.data).to.deep.equal(baseline.ok.value.data);
    });

    it('retains the legacy negative-offset convention', async function () {
        const result = await new Plist.Parser().fromBuffer(xml, -1);
        expect(result.ok.value.getData('name')).to.equal('value');
    });
});
