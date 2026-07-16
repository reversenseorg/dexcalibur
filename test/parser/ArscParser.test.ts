import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../src/Utils.js";
import {Arsc} from "../../src/parser/ArscParser.js";

describe('ArscParser', function() {

    describe('ArscParser::parse > NIB', function() {

        let binBuf:Buffer;

        // @ts-ignore
        let path = _path_.join(Util.__dirname(import.meta.url),"../files/res1.arsc");
        //let path = process.env.HOME+"/dxcws/52369832-d593-41a9-af7c-49616222719d/app/Payload/BP.app/AccountsSummary_AccountsSummary.bundle/ChooseAccountCell.nib";
        binBuf = _fs_.readFileSync(path);


        it('Buffer is parsed', async function () {

            const parser = new Arsc.Parser();
            const res = await parser.fromBuffer(binBuf,0);


            console.log(res);
        });
    });
});