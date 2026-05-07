import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../src/Utils.js";
import {Axml} from "../../src/parser/AxmlDocumentParser.js";

describe('AxmlParser', function() {

    describe('AxmlParser::parse > XML', function() {

        let binBuf:Buffer;

        // @ts-ignore
        let path = _path_.join(Util.__dirname(import.meta.url),"../files/AndroidManifest.axml.xml");
        binBuf = _fs_.readFileSync(path);

        it('Buffer is parsed', async function () {

            const parser = new Axml.Parser();
            const res = await parser.fromBuffer(binBuf,0);

            console.log(res);
        });


        path = _path_.join(Util.__dirname(import.meta.url),"../files/layout.axml");
        binBuf = _fs_.readFileSync(path);

        it('Buffer is parsed', async function () {

            const parser = new Axml.Parser();
            const res1 = await parser.fromBuffer(binBuf,0);

            console.log(res1);
        });
    });
});