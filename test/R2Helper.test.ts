import {expect} from 'chai';
// -- App specific --
import *  as R2Helper from "../src/R2Helper";
import RadareHelper, {R2_TYPE} from "../src/R2Helper.js";
import * as _path_ from "path";
import ModelFile from "../src/ModelFile.js";
import DataScope, {DataScopePpts} from "../dist/src/DataScope.js";
import {NativeAnalyzerProfile} from "../src/NativeAnalyzer.js";
import Util from "../src/Utils.js";
//chai.use(sinonChai);*/

const EOL = require('os').EOL;

const TEST_WS:string = _path_.join(Util.__dirname(import.meta.url),'ws');
const TEST_APP = "eshard_test"

describe('Radare2 Helper', function() {




    describe('new local instance', function() {

        let BIN_SCOPE:DataScope;
        let BIN_FILE:ModelFile;
        let analyzer:RadareHelper;

        before( function(){

            BIN_SCOPE = (new DataScope("bin")).setPpts(DataScopePpts.PATH, _path_.join(TEST_WS,TEST_APP,'apk'));
            BIN_FILE = new ModelFile({
                path: _path_.join(TEST_WS,TEST_APP,'apk','lib','armeabi','libcrackmelib.so'),
                type: 'ELF',
                name: 'libcrackmelib.so',
                scope: BIN_SCOPE
            });

            analyzer = new RadareHelper( BIN_FILE, R2_TYPE.LOCAL);

        });



        it('is same file', async function() {
            expect(analyzer.target.getUID()).to.be.an.instanceOf(BIN_FILE.getUID());
        });
    });

    describe('start local analyzer of Android lib', function() {


        let BIN_SCOPE:DataScope;
        let BIN_FILE:ModelFile;
        let analyzer:RadareHelper;
        let res:any;
        let success:boolean;

        before( function(){

            BIN_SCOPE = (new DataScope("bin")).setPpts(DataScopePpts.PATH, _path_.join(TEST_WS,TEST_APP,'apk'));
            BIN_FILE = new ModelFile({
                path: _path_.join(TEST_WS,TEST_APP,'apk','lib','armeabi','libcrackmelib.so'),
                type: 'ELF',
                name: 'libcrackmelib.so',
                scope: BIN_SCOPE
            });

            analyzer = new RadareHelper( BIN_FILE, R2_TYPE.LOCAL);

            try{
                res = analyzer.start(NativeAnalyzerProfile.ANDROID_LIB);
                success = true;
            }catch (e) {
                console.log(e.message);
                success = false;
            }
        });




        it('Spawn without exception', async function() {
            expect(success).to.equal(true);
        });
    });
      
});