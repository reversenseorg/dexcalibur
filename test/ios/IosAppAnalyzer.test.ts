import IosAppAnalyzer from "../../src/ios/IosAppAnalyzer.js";
import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../src/Utils.js";
import {Plist} from "../../src/parser/PlistParser.js";


describe('IosAppAnalyzer', function() {



    describe('extractTransportInfo', async function() {

        const analyzer = new IosAppAnalyzer(null);
        // @ts-ignore
        const xmlBuf = _fs_.readFileSync(_path_.join(Util.__dirname(import.meta.url),"../files/XmlPlist.plist"));
        const parser = new Plist.Parser();

        const data = analyzer._extractTransportsInfo((await parser.fromBuffer(xmlBuf,0)).ok);

        console.log(data);

        it('app name is detected', async function() {


        });
    });


});