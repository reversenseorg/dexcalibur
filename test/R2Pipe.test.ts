import {expect} from 'chai';
// -- App specific --
import * as _path_ from "path";
import ModelFile from "../src/ModelFile.js";
import R2Pipe from "../src/external/R2Pipe.js";
import DataScope, {DataScopePpts} from "../dist/src/DataScope.js";
import Util from "../src/Utils.js";

const TEST_WS:string = _path_.join(Util.__dirname(import.meta.url),'ws');
const TEST_APP = "com.yubico.yubioath"
const TEST_LIB = "libdatastore_shared_counter.so"
const TEST_ARCH = "arm64-v8a"

describe('Radare2 Pipe', function() {

    describe('spawn radare2 instance', async function() {

        let BIN_SCOPE:DataScope;
        let BIN_FILE:ModelFile;



        BIN_SCOPE = (new DataScope("bin")).setPpts(DataScopePpts.PATH, _path_.join(TEST_WS,TEST_APP,'apk'));
        BIN_FILE = new ModelFile({
            path: _path_.join(TEST_WS,TEST_APP,'apk','lib',TEST_ARCH,TEST_LIB),
            type: 'ELF',
            name: TEST_LIB,
            scope: BIN_SCOPE
        });


        R2Pipe.setPath(Util.whereIs(R2Pipe.NAME));

        console.log("Start ",R2Pipe.R2PIPE_PATH);
        const instance = R2Pipe.open(BIN_FILE.getRealPath());


        const sections = await instance.runCmd("iSj");

        console.log(sections);



        /*it('is same file', async function() {
            expect(analyzer.target.getUID()).to.be.an.instanceOf(BIN_FILE.getUID());
        });*/
    });

      
});