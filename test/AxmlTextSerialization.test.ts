import {expect} from 'chai';
import {XMLParser} from 'fast-xml-parser';
import {AxmlDocument} from '../src/android/AxmlDocument.js';
import {AndroidBinary} from '../src/android/AndroidBinaryResourceUtils.js';

describe('AXML text serialization', function () {
    it('escapes text while retaining its decoded value', function () {
        const doc = new AxmlDocument(new AndroidBinary.ResChunkHeader());
        doc.rootNode = {
            type: 'element', name: 'root', children: [{
                type: 'element', name: 'value', children: [{
                    type: 'text', text: 'left < middle & right > "quoted"'
                }]
            }]
        };
        const xml = doc.toXmlString(0);
        expect(xml).to.include('left &lt; middle &amp; right &gt; &quot;quoted&quot;');
        expect(new XMLParser().parse(xml).value).to.equal('left < middle & right > "quoted"');
    });

    it('retains plain text and formatting', function () {
        const doc = new AxmlDocument(new AndroidBinary.ResChunkHeader());
        doc.rootNode = {type: 'element', name: 'root', children: [
            {type: 'element', name: 'value', children: [{type: 'text', text: 'plain'}]}
        ]};
        expect(doc.toXmlString()).to.equal('<?xml version="1.0" encoding="utf-8"?>\n<value>\n  plain\n</value>\n');
    });
});
