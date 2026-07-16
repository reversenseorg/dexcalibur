import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../src/Utils.js";
import {Dex} from "../../src/parser/DexParser.js";

describe('DexParser', function() {

    describe('DexParser::parse > ', async function() {

        let binBuf:Buffer;

        // @ts-ignore
        //let path = _path_.join(Util.__dirname(import.meta.url),"../files/classes2.dex");
        let path:string;
        let max = 2;


        for(let i=1;i<max;i++){
            path = _path_.join(`/Users/${USERNAME}/dxcws/24ef628e-8485-4307-9def-c45ffe6a84b0/tmp/apk/classes${i==1?'':i}.dex`);
            binBuf = _fs_.readFileSync(path);


            const parser = new Dex.Parser();
            const res = await parser.fromBuffer(binBuf,0);

            //console.log(`classes${i}.dex\t`,res.ok.ppts.dexFile);
        }



    });
});