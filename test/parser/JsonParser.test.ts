import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../src/Utils.js";
import {Json} from "../../src/parser/JsonParser.js";

describe('JsonParser', function() {



    describe('JsonParser::fromBuffer', function() {

        let binBuf:Buffer;

        // @ts-ignore
        let path = _path_.join(Util.__dirname(import.meta.url),"../files/App.json");
        binBuf = _fs_.readFileSync(path);


        it('Buffer is parsed', async function () {

            const parser = new Json.Parser();
            const res = await parser.fromBuffer(binBuf,0);

            console.log(res);
        });

        //
        it('JSON string starting by \\uFEFF', async function () {

            const parser = new Json.Parser();
            const hexBuf = Buffer.from(
                "efbbbf7b0a202022636f64655265746f7572223a202244454d4f31363634222c0a2020226d657373616765223a2022436574746520666f6e6374696f6e6e616c6974c3a9206e276573742070617320646973706f6e69626c6520656e206d6f64652064c3a96d6f6e7374726174696f6e222c0a20202273657276696365223a202264656d6f220a7d",
                "hex"
            );

            const res = await parser.fromBuffer(hexBuf,0);

            console.log(res);
        });
    });

});