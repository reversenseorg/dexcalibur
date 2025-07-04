import {expect} from 'chai';
import * as Path from 'path';


// -- App specific --

const TEST_CONFIG = Path.join( Util.__dirname(import.meta.url), './res/config_test.js');
const TEST_CONFIG2 = Path.join( Util.__dirname(import.meta.url), './res/config_test_2.js');


const TEST_WS:string = _path_.join(Util.__dirname(import.meta.url),'ws');
const TEST_APP = "com.yubico.yubioath"
const TEST_LIB = "libdatastore_shared_counter.so"
const TEST_ARCH = "arm64-v8a"

var CONFIG = null;

import * as Log from '../dist/src/Logger.js';
import {TestLogger} from "../dist/src/Logger.js";
import DexcaliburEngine from "../dist/src/DexcaliburEngine.js";
import DexcaliburProject from "../dist/src/DexcaliburProject.js";
import {SearchAPI} from "../dist/src/SearchAPI.js";
import Analyzer from "../dist/src/Analyzer.js";
import {HookManager} from "../dist/src/hook/HookManager.js";
import {DataAnalyzer} from "../dist/src/DataAnalyzer.js";
import AndroidAppAnalyzer from "../dist/src/AndroidAppAnalyzer.js";
import Bus from "../dist/src/Bus.js";
import GraphMaker from "../dist/src/Graph.js";
import {TestHelper} from "../dist/src/TestHelper.js";
import ProjectWorkspace from "../dist/src/ProjectWorkspace.js";
import Util from "../src/Utils.js";
import * as _path_ from "path";

let Logger:Log.TestLogger;

describe('DexcaliburProject', function() {

    let gEngine:DexcaliburEngine = null;

    before(async function(){
        gEngine = await TestHelper.getDexcaliburEngine();
    })

    beforeEach(function() {

        Logger = Log.newLogger({
            testMode: true,
            debugMode: false
        },true) as TestLogger;
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('new - default', function() {
        let p:DexcaliburProject = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);


        it('configuration path', function () {
            //c = new Configuration();
            //c.import(require("../../"));

            p = new DexcaliburProject({ uid:"owasp.mstg.uncrackable1" });
            p.setEngine(gEngine);
           
            // the flag should be 1
            expect(p.engine).to.be.an.instanceOf(DexcaliburEngine);

            // if Frida is disabled, the hook manager manager should be aware.
            expect(p.uid).to.equals("owasp.mstg.uncrackable1");
        });
    });


    describe('init()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        it('init project', function () {
            p = new DexcaliburProject({ engine:gEngine, uid:"owasp.mstg.uncrackable1" });
            p.init();


            // test context 
            expect(p.uid).to.equals("owasp.mstg.uncrackable1");
            expect(p.find).to.be.an.instanceOf(SearchAPI);
            expect(p.analyze).to.be.an.instanceOf(Analyzer);
            expect(p.hook).to.be.an.instanceOf(HookManager);
            expect(p.workspace).to.be.an.instanceOf(ProjectWorkspace);
            expect(p.dataAnalyzer).to.be.an.instanceOf(DataAnalyzer);
            expect(p.appAnalyzer).to.be.an.instanceOf(AndroidAppAnalyzer);
            expect(p.bus).to.be.an.instanceOf(Bus);
            expect(p.graph).to.be.an.instanceOf(GraphMaker);
            
        });
/*
        it('reinit project', function () {
            p = new DexcaliburProject(gEngine, "owasp.mstg.uncrackable1");

            expect(p.pkg).to.equals("owasp.mstg.uncrackable1");

            p.initDexcalibur("owasp.mstg.uncrackable2");

            expect(p.pkg).to.equals("owasp.mstg.uncrackable2");
        });*/
    });
    /*
    describe('changeProject()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

    });

    describe('getConfiguration()', function() {
        let p = new DexcaliburProject( gEngine, "owasp.mstg.uncrackable1");

        it('should return Configuration instance', function () {
            expect(p.getConfiguration()).to.be.an.instanceOf(Configuration);
            expect(p.getConfiguration().apktPath).to.be.deep.equal("/home/example/tools/apktool");
        });
    });

    describe('getDataAnalyzer()', function() {
        let p = new DexcaliburProject( gEngine, "owasp.mstg.uncrackable1");

        it('should return DataAnalyzer instance', function () {
            expect(p.getDataAnalyzer()).to.be.an.instanceOf(DataAnalyzer.Analyzer);
        });
    });

    describe('getAppAnalyzer()', function() {
        let p = new DexcaliburProject( gEngine, "owasp.mstg.uncrackable1");

        it('should return AndroidAppAnalyzer instance', function () {
            expect(p.getAppAnalyzer()).to.be.an.instanceOf(AndroidAppAnalyzer);
        });
    });

    describe('getAnalyzer()', function() {
        let p = new DexcaliburProject( gEngine, "owasp.mstg.uncrackable1");

        it('should return Analyzer instance', function () {
            expect(p.getAnalyzer()).to.be.an.instanceOf(Analyzer);
        });
    });

    describe('showAPIs()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        it('with default configurat', function () {
            p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

            expect(p.cfgpath).to.equals(TEST_CONFIG);

            expect(Logger.expect({
                type: "info",
                value: " Given configuration file loaded"
            })).to.equals(true); 

            expect(p.getConfiguration()).to.be.not.null(); 
            
        });
    });

    describe('useAPI()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        it('builtin API', function () {

            p = new DexcaliburProject(gEngine, "owasp.mstg.uncrackable1");

            p.usePlatform("sdk_androidapi_29_google");

            
        });

        // TODO custom API + downloaded API
    });
    
    describe('scan()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

       /* it('with default configurat', function () {
            p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

            expect(p.cfgpath).to.equals(TEST_CONFIG);

            expect(Logger.expect({
                type: "info",
                value: " Given configuration file loaded"
            })).to.equals(true); 

            expect(p.getConfiguration()).to.be.not.null(); 
            
        });
    });

    describe('scanForFiles()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        it('with default configurat', function () {
            // tdodo
        });
    });

    describe('fullscan()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        it('without API', function () {        
            // p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);
        });
        it('using Android API', function () {        
            // p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);
        });
        it('using Custom API', function () {        
            // TODO
            // p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);
        });
        it('using Additional Dex', function () {        
            // p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);
        });
        it('using boot.oat', function () {      
            // TODO  
            // p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);
        });
    });

    describe('trigger()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);
       // p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        it('event init', function () {
         //   p.trigger({ });

            
        });
    });

    describe('pull()', function() {
        // TODO
    });

    describe('useEmulator()', function() {
        // TODO
    });

    describe('start()', function() {
        // TODO 
    });

    /*
    describe('startWebServer()', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        it('with default port', function () {
            p = new Project("owasp.mstg.uncrackable1", TestHelper.newConfiguration(), 1);
            p.startWebserver();

            expect(p.web).to.be.a("WebServer");
            expect(p.web.port).to.equals(TestHelper.getConfiguration().web_port);
        });

        it('with custom port', function () {
            p = new Project("owasp.mstg.uncrackable1", TestHelper.newConfiguration(), 1);
            p.startWebserver(9999);

            expect(p.web).to.be.a("WebServer");
            expect(p.web.port).to.equals(9999);
        });
    });
    */
/*
        it('using custom configuration file path', function () {
            p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 0);

            // the flag should be 1
            expect(p.nofrida).to.equals(0);

            // if Frida is disabled, the hook manager manager should be aware.
            expect(p.hook.isFridaDisabled()).to.equals(false);

            // if Frida is disabled, the Frida module should not be loaded
            expect(
                Object.keys(require.cache).indexOf('frida')>-1
            ).to.equals(true);
        });

        it('default configuration path', function () {
            p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 0);
            p.nofrida

            // the flag should be 1
            expect(p.nofrida).to.equals(0);

            // if Frida is disabled, the hook manager manager should be aware.
            expect(p.hook.isFridaDisabled()).to.equals(false);

            // if Frida is disabled, the Frida module should not be loaded
            expect(
                Object.keys(require.cache).indexOf('frida')>-1
            ).to.equals(true);
        });

        it('default configuration path', function () {
            p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 0);
            p.nofrida

            // the flag should be 1
            expect(p.nofrida).to.equals(0);

            // if Frida is disabled, the hook manager manager should be aware.
            expect(p.hook.isFridaDisabled()).to.equals(false);

            // if Frida is disabled, the Frida module should not be loaded
            expect(
                Object.keys(require.cache).indexOf('frida')>-1
            ).to.equals(true);
        });

        it('application analyzer', function () {
            p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

            expect(conf.encoding).to.equals("utf8");
            expect(conf.workspacePath).to.equals( "/home/dexcalibur/workspace/");
            expect(conf.invalid_ppt).to.equals(undefined);
        });
    });

    describe('new - frida status', function() {
        let p = null; // new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        it('frida disabled', function () {
            p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

            // the flag should be 1
            expect(p.nofrida).to.equals(1);

            // if Frida is disabled, the hook manager manager should be aware.
            expect(p.hook.isFridaDisabled()).to.equals(true);

            // if Frida is disabled, the Frida module should not be loaded
            expect(
                Object.keys(require.cache).indexOf('frida')>-1
            ).to.equals(false);
        });

        it('frida enabled', function () {
            p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 0);

            // the flag should be 1
            expect(p.nofrida).to.equals(0);

            // if Frida is disabled, the hook manager manager should be aware.
            expect(p.hook.isFridaDisabled()).to.equals(false);

            // if Frida is disabled, the Frida module should not be loaded
            expect(
                Object.keys(require.cache).indexOf('frida')>-1
            ).to.equals(true);
        });

    });


    describe('configureation init', function() {
        var p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        
        
    });

    describe('scan android', function() {
        var p = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 1);

        p.useAPI(p.config.platform_target);

    });*/
});