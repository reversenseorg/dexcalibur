import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../src/Utils.js";
import {Nib} from "../../src/parser/NibParser.js";

describe('NibParser', function() {



    describe('NibParser::parseHeader > NIB', function() {

        let binBuf:Buffer;

        // @ts-ignore
        //let path = _path_.join(Util.__dirname(import.meta.url),"../files/UAInAppMessageButtonView.nib");
        let path = "/Users/georges.michel/dxcws/52369832-d593-41a9-af7c-49616222719d/app/Payload/BP.app/AccountsSummary_AccountsSummary.bundle/ChooseAccountCell.nib";
        binBuf = _fs_.readFileSync(path);


        it('Buffer is parsed', async function () {

            const parser = new Nib.Parser();
            const dnib = await parser.fromBuffer(binBuf,0, true);


            //console.log(dnib.ok);
        });
    });
});