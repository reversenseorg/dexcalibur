import * as _fs_ from "fs";
import * as _path_ from "path";
import {assert, expect} from 'chai';
import {Plist} from "../../src/parser/PlistParser.js";
import Util from "../../src/Utils.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelResource from "../../src/ModelResource";
import {PlistDocument} from "../../src/ios/PlistDocument";
import * as console from "node:console";

describe('PlistParser', function() {


    describe('PlistParser::parseBuffer > xml', function() {

        let xmlBuf:Buffer;

       // @ts-ignore
        xmlBuf = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/XmlPlist.plist"));

        it('Raw parsing', async function () {

            const parser = new Plist.Parser();
            const vres = await parser.fromBuffer(xmlBuf, -1, { encoding:'utf-8', raw:true });

            assert.isObject(vres.ok);
            assert.isOk(vres.ok);

            expect(vres.ok.__).to.be.equal(NodeInternalType.RESOURCE);
            assert.isObject((vres.ok as ModelResource<PlistDocument>).value.getData('CFBundleIcons'));
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName).to.be.equal("AppIcon");
        });

        it('Structured parsing with string indexing ', async function () {

            const parser = new Plist.Parser();
            const vres = await parser.fromBuffer(xmlBuf, -1, {
                encoding: 'binary',
                raw: false
            });


            assert.isObject(vres.ok);
            assert.isOk(vres.ok);
            assert.isArray(vres.strings);

            console.log(vres.strings);
            expect(vres.ok.__).to.be.equal(NodeInternalType.RESOURCE);
            expect(vres.strings.length).to.be.gte(1);
            assert.isObject((vres.ok as ModelResource<PlistDocument>).value.getData('CFBundleIcons'));
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName.__).to.be.equal(38);
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName._uid).to.be.equal("99e38a031da5313ce8fca26c672ff323d278c813");

        });
    });


    describe('PlistParser::parseBuffer > bin', function() {

        let binBuf:Buffer;

        // @ts-ignore
        binBuf = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/BinPlist.plist"));

        // @ts-ignore
        let bin2Buf = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/binary2.plist"));

        it('Buffer is parsed', async function () {

            const parser = new Plist.Parser();
            const vres = await parser.fromBuffer(binBuf, -1, {encoding:'binary', raw:true});

            assert.isObject(vres.ok);
            assert.isOk(vres.ok);
            assert.isNull(vres.strings);

            expect(vres.ok.__).to.be.equal(NodeInternalType.RESOURCE);
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('product-type')).to.be.equal("ios-app");
        });

        it('Buffer is parsed with OOB raw', async function () {


            // @ts-ignore
            let oobBuf = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/bp_oob.plist"));

            const parser = new Plist.Parser();
            const vres = await parser.fromBuffer(oobBuf, -1, {encoding:'binary', raw:true});

            assert.isObject(vres.ok);
            assert.isOk(vres.ok);
            assert.isNull(vres.strings);

            console.log(vres.ok);

            //expect(vres.ok.__).to.be.equal(NodeInternalType.RESOURCE);
            //expect((vres.ok as ModelResource<PlistDocument>).value.getData('product-type')).to.be.equal("ios-app");
        });


        it('Structured parsing with string indexing', async function () {

            const parser = new Plist.Parser();
            const vres = await parser.fromBuffer(binBuf, -1, {encoding:'binary', raw:false});

            const d = vres.ok.value.data;

            assert.isObject(vres.ok);
            assert.isOk(vres.ok);
            assert.isArray(vres.strings);

            expect(vres.ok.__).to.be.equal(NodeInternalType.RESOURCE);
            expect(vres.strings.length).to.be.gte(1);
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('product-type')._uid).to.be.equal("90c9cb8dce64103fe84150e5b2f437a67b73f96c");
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('product-type').__).to.be.equal(38);

        });

        it('Structured parsing with string indexing (oob)', async function () {

            const parser = new Plist.Parser();
            // @ts-ignore
            let oobBuf = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/bp_oob.plist"));
            const vres = await parser.fromBuffer(oobBuf, -1, {encoding:'binary', raw:false});

            const d = vres.ok.value.data;

            assert.isObject(vres.ok);
            assert.isOk(vres.ok);
            assert.isArray(vres.strings);

            console.log(vres);
            /*
            expect(vres.ok.__).to.be.equal(NodeInternalType.RESOURCE);
            expect(vres.strings.length).to.be.gte(1);
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('product-type')._uid).to.be.equal("90c9cb8dce64103fe84150e5b2f437a67b73f96c");
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('product-type').__).to.be.equal(38);
*/
        });
    });

    // UAInAppMessageButtonView.nib
});