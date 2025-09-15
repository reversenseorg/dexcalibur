import * as _fs_ from "fs";
import * as _path_ from "path";
import {assert, expect} from 'chai';
import {Plist} from "../../src/parser/PlistParser.js";
import Util from "../../src/Utils.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelResource from "../../src/ModelResource";
import {PlistDocument} from "../../src/ios/PlistDocument";

describe('PlistParser', function() {


    describe('PlistParser::parseBuffer > xml', function() {

        let xmlBuf:Buffer;

       // @ts-ignore
        xmlBuf = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/XmlPlist.plist"));

        it('Raw parsing', async function () {

            const parser = new Plist.Parser();
            const vres = await parser.fromBuffer(xmlBuf, -1);

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

            expect(vres.ok.__).to.be.equal(NodeInternalType.RESOURCE);
            assert.isObject((vres.ok as ModelResource<PlistDocument>).value.getData('CFBundleIcons'));
            expect((vres.ok as ModelResource<PlistDocument>).value.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName).to.be.equal("AppIcon");
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
            const vres = await parser.fromBuffer(binBuf, -1);
            const vres2 = await parser.fromBuffer(bin2Buf, -1);

            const d = vres.ok.value.data;
            for(let k in d){
                if(d[k].__ === NodeInternalType.STRING){
                    console.log(k+' => (string) '+d[k].value);
                }else{
                    console.log(k+' => '+d[k]);
                }
            }
            //expect(vres.ok.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName).to.be.equal("AppIcon");
        });
    });


    describe('PlistParser::parseBuffer > NIB', function() {

        let binBuf:Buffer;

        // @ts-ignore
        binBuf = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/UAInAppMessageButtonView.nib"));


        it('Buffer is parsed', async function () {

            const parser = new Plist.Parser();
            const dnib = await parser.fromBuffer(binBuf, -1);

            console.log(dnib.ok);
            /*
            const d = vres.ok.data;
            for(let k in d){
                if(d[k].__ === NodeInternalType.STRING){
                    console.log(k+' => (string) '+d[k].value);
                }else{
                    console.log(k+' => '+d[k]);
                }
            }*/
            //expect(vres.ok.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName).to.be.equal("AppIcon");
        });
    });

    // UAInAppMessageButtonView.nib
});