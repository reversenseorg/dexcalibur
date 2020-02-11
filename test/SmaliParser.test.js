var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
var expect = chai.expect,
    should = chai.should();

chai.use(sinonChai);

// --- App specific ---

var Configuration = require('../src/Configuration.js');
var Platform = require('../src/Platform.js');

const CONFIG = require('./res/config.js');;
const CONFIG_PATH = './test/res/config.js';
const PKG_NAME = "unit.test";



describe('SmaliParser', function() {

    beforeEach(function() {
        //console.log(process.cwd());
        //sinon.spy(console, 'log');
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('import', function() {
        
     


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
            conf.import(CONFIG);
            expect(conf.dexcaliburPath).to.equals( "/home/dexcalibur/dexcalibur/src/");

            conf.import(CONFIG_2, false, true);
            expect(conf.dexcaliburPath).to.equals("/home/test/dexcalibur/src/");
        });


        it('import config forced with override', function () {
            let conf = new Configuration();
            conf.import(CONFIG);
            expect(conf.dexcaliburPath).to.equals( "/home/dexcalibur/dexcalibur/src/");

            conf.import(CONFIG_FAIL, true, true);
            expect(conf.dexcaliburPath).to.equals("/home/test/dexcalibur/src/");
            expect(conf.invalid_ppt).to.equals("invalid_value");
        });

    });

    describe('get target platform', function() {
        
        it('default platform', function () {
            let conf = new Configuration();
            conf.import(CONFIG);

            expect(conf.platform_target).to.equals("android:7.0.0");
            expect(conf.platform_available[conf.platform_target]).to.instanceOf(Platform)
            expect(conf.getTargetPlatformPath()).to.equals("/home/dexcalibur/dexcalibur/APIs/android_24")
        });

        it('custom platform', function () {
            let conf = new Configuration();
            conf.import(CONFIG);

            conf.platform_target = "custom:vendor1";
            expect(conf.platform_available["custom:vendor1"]).to.instanceOf(Platform)
            expect(conf.getTargetPlatformPath()).to.equals("/tmp/android_custom/")
        });
    });
});