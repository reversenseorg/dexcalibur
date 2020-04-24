var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
    Path = require('path');
var expect = chai.expect,
    should = chai.should();
const fs = require("fs");

chai.use(sinonChai);

// --- App specific ---
var Logger = require("../src/Logger.js")({
    testMode: true,
    debugMode: false
}, true);


var Configuration = require('../src/Configuration.js');
var Platform = require('../src/Platform.js');

const CONFIG = require('./res/config.js');  
const CONFIG_TEST = require('./res/config_test.js');  
const CONFIG_TEST_2 = require('./res/config_test_2.js');  
const CONFIG_2 = require('./res/config2.js');
const CONFIG_FAIL = require('./res/config_fail.js');
const CONFIG_PATH = './test/res/config.js';
const PKG_NAME = "unit.test";


describe('Configuration component', function() {

    before(function(){
        try{
            fs.unlinkSync("./tmp/config.json");
        }catch(ex){
            // ignore
        }
    });

    beforeEach(function() {

        //console.log(process.cwd());
        //sinon.spy(console, 'log');
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('import', function() {
        
        it('encoding', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);

            expect(conf.encoding).to.equals("utf8");
        });

        it('workspace path', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);

            expect(conf.workspacePath).to.equals( "/home/dexcalibur/workspace/");
        });

        it('android SDK path', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);

            expect(conf.androidSdkPath).to.equals("/home/dexcalibur/platform-tools/");
        });

        it('ADB path', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);

            expect(conf.adbPath).to.equals("/home/dexcalibur/platform-tools/platform-tools/adb");
        });


        it('apktool path', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);

            expect(conf.apktPath).to.equals("/usr/local/bin/apktool");        
        });

        it('temp dir path', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);
            
            expect(conf.tmpDir).to.equals("/tmp/");
        });


        it('default webserver port', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);

            expect(conf.web_port).to.equals(8055);
        });

        it('dexcalibur path', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);

            expect(conf.dexcaliburPath).to.equals("/home/dexcalibur/dexcalibur/src/");
        });

        it('android platforms', function () {
            let conf = new Configuration();

            conf.import(CONFIG_TEST);

            expect(conf.platform_target).to.equals("android:7.0.0");
        });


        it('import config no force, no override (default) with invalid value', function () {
            let conf = new Configuration();
            conf.import(CONFIG_FAIL);

            expect(conf.encoding).to.equals("utf8");
            expect(conf.workspacePath).to.equals( "/home/dexcalibur/workspace/");
            expect(conf.invalid_ppt).to.equals(undefined);
        });


        it('import config forced, no override with invalid value', function () {
            let conf = new Configuration();
            conf.import(CONFIG_FAIL, true);

            expect(conf.encoding).to.equals("utf8");
            expect(conf.workspacePath).to.equals( "/home/dexcalibur/workspace/");
            expect(conf.invalid_ppt).to.equals("invalid_value");
        });


        it('import config no forced with override', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);
            expect(conf.dexcaliburPath).to.equals( "/home/dexcalibur/dexcalibur/src/");

            conf.import(CONFIG_2, false, true);
            expect(conf.dexcaliburPath).to.equals("/home/test/dexcalibur/src/");
        });


        it('import config forced with override', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);
            expect(conf.dexcaliburPath).to.equals( "/home/dexcalibur/dexcalibur/src/");

            conf.import(CONFIG_FAIL, true, true);
            expect(conf.dexcaliburPath).to.equals("/home/test/dexcalibur/src/");
            expect(conf.invalid_ppt).to.equals("invalid_value");
        });

    });

    describe('get target platform', function() {
        
        it('default platform', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.platform_target).to.equals("android:7.0.0");
            expect(conf.platform_available[conf.platform_target]).to.instanceOf(Platform)
            expect(conf.getTargetPlatformPath()).to.equals( Path.join( __dirname, "../APIs/android_24"));
        });

        it('custom platform', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            conf.platform_target = "custom:vendor1";
            expect(conf.platform_available["custom:vendor1"]).to.instanceOf(Platform)
            expect(conf.getTargetPlatformPath()).to.equals("/tmp/android_custom/")
        });
    });

    describe('serialize', function() {
        
        it('toJsonObject()', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.toJsonObject()).to.deep.equals({
                encoding: "utf8",
                dexcaliburPath: "/home/dexcalibur/dexcalibur/src/",
                workspacePath: "/home/dexcalibur/workspace/", 
                adbPath: "/home/dexcalibur/platform-tools/platform-tools/adb",
                androidSdkPath: "/home/dexcalibur/platform-tools/",
                apktPath: "/usr/local/bin/apktool",
                sdbPath: null,
                javaBinPath: "java",
                deviceId: null,
                useEmulator: false,
                tmpDir: "/tmp/",
                bridge: "adb",
                web_port: 8055,
                platform_target: "android:7.0.0",
                platform_available: {
                    "android:7.0.0": {
                        name: "android",
                        version : "7.0.0",
                        apiVersion: 24,
                        binaryPath: Path.join( __dirname, "../APIs/android_24")
                    },
            
                    "custom:vendor1": {
                        apiVersion: null,
                        name: "android",
                        version : "1.2.0",
                        binaryPath: "/tmp/android_custom/"
                    }
                }
            });
        });

            it('exportTo()', function () {
                let conf = new Configuration();
                conf.import(CONFIG_TEST);

                conf.exportTo("./test/tmp/config.json");

                let ctn = fs.readFileSync("./test/tmp/config.json");


                expect(JSON.parse(ctn)).to.deep.equals({
                    encoding: "utf8",
                    dexcaliburPath: "/home/dexcalibur/dexcalibur/src/",
                    workspacePath: "/home/dexcalibur/workspace/", 
                    adbPath: "/home/dexcalibur/platform-tools/platform-tools/adb",
                    androidSdkPath: "/home/dexcalibur/platform-tools/",
                    apktPath: "/usr/local/bin/apktool",
                    sdbPath: null,
                    javaBinPath: "java",
                    deviceId: null,
                    useEmulator: false,
                    tmpDir: "/tmp/",
                    bridge: "adb",
                    web_port: 8055,
                    platform_target: "android:7.0.0",
                    platform_available: {
                        "android:7.0.0": {
                            name: "android",
                            version : "7.0.0",
                            apiVersion: 24,
                            binaryPath: Path.join( __dirname, "../APIs/android_24")
                        },
                        "custom:vendor1": {
                            name: "android",
                            version : "1.2.0",
                            binaryPath: "/tmp/android_custom/",
                            apiVersion: null
                        }
                    }
                });
            });
        });


    //});

    describe('read properties', function() {        
        

        it('getDexcaliburPath', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getDexcaliburPath()).to.equals("/home/dexcalibur/dexcalibur/src/");
        });


        it('getLocalbinPath', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getLocalBinPath()).to.equals("/home/dexcalibur/dexcalibur/bin");
        });

        it('getJavaBin', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getJavaBin()).to.equals("java");
        });

        it('getWorkspaceDir', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getWorkspaceDir()).to.equals("/home/dexcalibur/workspace/");
        });

        it('getAndroidSdkDir', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getAndroidSdkDir()).to.equals("/home/dexcalibur/platform-tools/");
        });


        it('getApktoolPath', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getApktoolPath()).to.equals("/usr/local/bin/apktool");
        });

        it('getAdbPath', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getAdbPath()).to.equals("/home/dexcalibur/platform-tools/platform-tools/adb");
        });

        it('getTmpDir', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getTmpDir()).to.equals("/tmp/");
        });

        it('getWebPort', function () {
            let conf = new Configuration();
            conf.import(CONFIG_TEST);

            expect(conf.getWebPort()).to.equals(8055);
        });
    });
});