import * as _fs_ from "fs";
import {Zip} from "../../src/parser/ZipParser.js";

describe('ZipParser', function() {



    describe('ZipParser::parseHeader > ZIP', function() {

        let binBuf:Buffer;

        // @ts-ignore
        //let path = _path_.join(Util.__dirname(import.meta.url),"../files/UAInAppMessageButtonView.nib");
        let path = "/Users/georges.michel/dxcws/79e817cf-b109-4c57-b372-dc5a14ce52f6/inputs/main.bin";
        let path2 = "/Users/georges.michel/dxcws/79e817cf-b109-4c57-b372-dc5a14ce52f6/inputs/extra.bin";
        binBuf = _fs_.readFileSync(path);


        it('Buffer is parsed', async function () {

            const parser = new Zip.Parser();
            const zip = await parser.fromBuffer(binBuf,0);


            console.log(zip);
        });
    });
});