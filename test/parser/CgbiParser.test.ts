import * as _fs_ from "fs";
import * as _path_ from "path";
import {expect} from 'chai';
import Util from "../../src/Utils.js";
import {Cgbi} from "../../src/parser/CgbiParser.js";

describe('CgbiParser', function() {


    describe('CgbiParser::parse CGBI', function() {

        let b:Buffer;

       // @ts-ignore
        b = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/AppIcon.cgbi.png"));// _fs_.readFileSync("./files/XmlPlist.plist");

        it('Buffer is parsed', async function () {

            const parser = new Cgbi.Parser();
            const vres = await parser.fromBuffer(b, 0);

           // const pngBuffer = await (parser.parse(b, 0))


            console.log(vres.ok);
            /*_fs_.writeFileSync(

                // @ts-ignore
                _path_.join(Util.__dirname(import.meta.url),"../files/AppIcon.ok.png"),
                pngBuffer
            );*/

            //expect(vres.ok.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName).to.be.equal("AppIcon");
        });
    });

    describe('CgbiParser::encodeToPng (from CgBI)', function() {




        it('Buffer is parsed', async function () {

            const parser = new Cgbi.Parser();
            // @ts-ignore
            const out = _path_.join(Util.__dirname(import.meta.url),"../files/AppIcon.encoded.png");
            // @ts-ignore
            const input = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/AppIcon.cgbi.png"));

            if(_fs_.existsSync(out)){
                _fs_.rmSync(out);
            }

            _fs_.writeFileSync(
                out,
                parser.encodeAsPng(input,0, { print:true, encoding:"binary" }));

            //expect(vres.ok.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName).to.be.equal("AppIcon");
        });
    });

    describe('CgbiParser::parse PNG', function() {

        /*
        let b:Buffer;

        // @ts-ignore
        b = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/AppIcon.cgbi.encoded.png"));// _fs_.readFileSync("./files/XmlPlist.plist");

        let b2 = _fs_.readFileSync(
            // @ts-ignore
            _path_.join(Util.__dirname(import.meta.url),"../files/AppIcon.repaired.png"));// _fs_.readFileSync("./files/XmlPlist.plist");

        it('Buffer is parsed', async function () {

            const parser = new Cgbi.Parser();
            const vres = await parser.fromBuffer(b, 0);
            const vres2 = await parser.fromBuffer(b2, 0);

            //const pngBuffer = await (parser.encodeAsPng(b, 0))


            //console.log(vres.ok);
            console.log("---- OUTPUT ----");
            vres.ok.chunks.map(c => {
                console.log(`${c.type} ${"0x"+c.crc.toString(16)} ${c.length}`);
            });

            console.log("---- REPAIRED ----");
            vres2.ok.chunks.map(c => {
                console.log(`${c.type} ${"0x"+c.crc.toString(16)} ${c.length}`);
            })
            //expect(vres.ok.getData('CFBundleIcons').CFBundlePrimaryIcon.CFBundleIconName).to.be.equal("AppIcon");
        });*/
    });

      
});