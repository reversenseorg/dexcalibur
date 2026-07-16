import {expect} from 'chai';
// -- App specific --
import RadareHelper, {R2_TYPE} from "../src/R2Helper.js";
import * as _path_ from "path";
import ModelFile from "../src/ModelFile.js";
import Util from "../src/Utils.js";
import DataScope, {DataScopePpts} from "../src/DataScope.js";
import {NativeHelperCmd} from "../src/analyzer/INativeHelper.js";
import {R2CmdResult, R2Pipe} from "../src/external/R2Pipe.js";
import {NativeAnalyzerCommands} from "../src/analyzer/NativeAnalyzerCommands.js";
import {ModelFunction} from "../src/ModelFunction.js";
import NativeAnalyzer from "../src/NativeAnalyzer.js";
import {Architecture} from "../src/Architecture.js";
//chai.use(sinonChai);*/

//const EOL = require('os').EOL;

R2Pipe.R2PIPE_PATH = "r2";

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
            expect(analyzer.target.getUID()).to.be.equal(BIN_FILE.getUID());
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
                res = analyzer.start([]);
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

    describe('start local analyzer of Android lib', function() {


        let BIN_SCOPE:DataScope;
        let BIN_FILE:ModelFile;
        let analyzer:RadareHelper;
        let res:any;
        let success:boolean;

        before( function(){

            R2Pipe.setPath("r2");

            BIN_SCOPE = (new DataScope("bin")).setPpts(DataScopePpts.PATH, _path_.join(TEST_WS,TEST_APP,'apk'));
            BIN_FILE = new ModelFile({
                path: _path_.join(TEST_WS,TEST_APP,'apk','lib','armeabi','libcrackmelib.so'),
                type: 'ELF',
                name: 'libcrackmelib.so',
                scope: BIN_SCOPE
            });

            analyzer = new RadareHelper( BIN_FILE, R2_TYPE.LOCAL);

            try{
                res = analyzer.start([]);
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


    describe('runCmd :: NativeHelperCmd.LIST_FUNCS', async function() {

        this.timeout(1000000);
        it('Functions are listed', async ()=> {



            let BIN_SCOPE:DataScope;
            let BIN_FILE:ModelFile;
            let analyzer:RadareHelper;
            let res:any;
            let success:boolean;

            BIN_SCOPE = (new DataScope("bin")).setPpts(DataScopePpts.PATH, _path_.join(TEST_WS,TEST_APP,'apk'));
            BIN_FILE = new ModelFile({
                //path: _path_.join(Util.__dirname(import.meta.url),'bin','lib_arm64_obf.so'),
                path: process.env.HOME+"/dxcws/4c2e9f22-582b-4cfe-8d1a-eb831c4aaa08/apk/lib/arm64-v8a/libisar.so",
                type: 'ELF',
                name: 'lib_arm64_obf.so',
                scope: BIN_SCOPE
            });

            analyzer = new RadareHelper( BIN_FILE, R2_TYPE.LOCAL);

            let out:R2CmdResult[] = [];
            try{
                res = await analyzer.start([]);

                if(res){
                    const fns = await analyzer.runCmd([NativeHelperCmd.LIST_FUNCS]);
                    console.log(fns);
                    expect(fns[0].data.length).to.equal(14,"Function number");
                    const sections = await analyzer.runCmd([NativeHelperCmd.LIST_SECTIONS]);
                    expect(sections[0].data.length).to.equal(22,"Sections number");
                    const FN_OFFSET = 8;
                    const fnd = await analyzer.runCmd(
                        [NativeAnalyzerCommands.FUNC_CMD.DISASS], { fn: (fns[0].data[FN_OFFSET] as ModelFunction) });

                    const ctx = NativeAnalyzer.getCpuContextFor(fns[0].data[FN_OFFSET], Architecture.AARCH64);
                    console.log(Object.keys(ctx).length);

                    //console.log(NativeAnalyzer.getCpuContextFor(fns[0].data[FN_OFFSET], Architecture.AARCH64));
                }

                success = true;
                return "done";
            }catch (e) {
                console.log(e.message);
                success = false;
            }


            it('Spawn without exception', function() {
                expect(success).to.equal(true);
            });
        });


    });


    describe('runCmd :: NativeHelperCmd.LIST_SECTIONS', async function() {
        this.timeout(1000000);
        it('Sections are listed', async ()=> {
            let BIN_SCOPE:DataScope;
            let BIN_FILE:ModelFile;
            let analyzer:RadareHelper;
            let res:any;
            let success:boolean = false;

            BIN_SCOPE = (new DataScope("bin")).setPpts(DataScopePpts.PATH, _path_.join(TEST_WS,TEST_APP,'apk'));
            BIN_FILE = new ModelFile({
                path: _path_.join(Util.__dirname(import.meta.url),'bin','lib_arm64_obf.so'),
                type: 'ELF',
                name: 'lib_arm64_obf.so',
                scope: BIN_SCOPE
            });

            analyzer = new RadareHelper( BIN_FILE, R2_TYPE.LOCAL);

            try{
                res = await analyzer.start([]);

                expect(res).to.be.not.equal(null,"Radare2 instance not started");
                if(res){
                    const sections = await analyzer.runCmd([NativeHelperCmd.LIST_SECTIONS]);
                    expect(sections[0].data.length).to.equal(22,"Sections number is invalid");
                }

                success = true;
                return "done";
            }catch (e) {
                expect(success).to.be.equal(true,"Exception raised");
            }
        });
    });


    describe('runCmd :: NativeHelperCmd.LIST_SEGMENTS', async function() {
        this.timeout(1000000);
        it('Segments are listed', async ()=> {
            let BIN_SCOPE:DataScope;
            let BIN_FILE:ModelFile;
            let analyzer:RadareHelper;
            let res:any;
            let success:boolean = false;

            BIN_SCOPE = (new DataScope("bin")).setPpts(DataScopePpts.PATH, _path_.join(TEST_WS,TEST_APP,'apk'));
            BIN_FILE = new ModelFile({
                path: _path_.join(Util.__dirname(import.meta.url),'bin','lib_arm64_obf.so'),
                type: 'ELF',
                name: 'lib_arm64_obf.so',
                scope: BIN_SCOPE
            });

            analyzer = new RadareHelper( BIN_FILE, R2_TYPE.LOCAL);

            try{
                res = await analyzer.start([]);

                expect(res).to.be.not.equal(null,"Radare2 instance not started");
                if(res){
                    const segs = await analyzer.runCmd([NativeHelperCmd.LIST_SEGMENTS]);
                    expect(segs[0].data.length).to.equal(22,"Segments number is invalid");
                }

                success = true;
                return "done";
            }catch (e) {
                expect(success).to.be.equal(true,"Exception raised");
            }
        });
    });


    describe('runCmd :: NativeHelperCmd.DISASS', async function() {
        this.timeout(1000000);
        it('Sections are listed', async ()=> {
            let BIN_SCOPE:DataScope;
            let BIN_FILE:ModelFile;
            let analyzer:RadareHelper;
            let res:any;
            let success:boolean = false;

            BIN_SCOPE = (new DataScope("bin")).setPpts(DataScopePpts.PATH, _path_.join(TEST_WS,TEST_APP,'apk'));
            BIN_FILE = new ModelFile({
                path: _path_.join(Util.__dirname(import.meta.url),'bin','lib_arm64_obf.so'),
                type: 'ELF',
                name: 'lib_arm64_obf.so',
                scope: BIN_SCOPE
            });

            analyzer = new RadareHelper( BIN_FILE, R2_TYPE.LOCAL);

            try{
                res = await analyzer.start([]);

                expect(res).to.be.not.equal(null,"Radare2 instance not started");
                if(res){
                    if(res){
                        const fns = await analyzer.runCmd([NativeHelperCmd.LIST_FUNCS]);
                        expect(fns[0].data.length).to.equal(14,"Function number is invalid");

                        const FN_OFFSET = 8;
                        const fnd = await analyzer.runCmd(
                            [NativeAnalyzerCommands.FUNC_CMD.DISASS], { fn: (fns[0].data[FN_OFFSET] as ModelFunction) });

                        const func = fns[0].data[FN_OFFSET] as ModelFunction;
                        console.log(func.getDisassembly().length);
                        //expect(func.getDisassembly().length).to.equal(14,"Function number is invalid");

                        //console.log(NativeAnalyzer.getCpuContextFor(fns[0].data[FN_OFFSET], Architecture.AARCH64));
                    }
                }

                success = true;
                return "done";
            }catch (e) {
                expect(success).to.be.equal(true,"Exception raised");
            }
        });
    });
      
});