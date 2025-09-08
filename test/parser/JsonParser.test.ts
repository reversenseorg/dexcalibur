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
    });
});