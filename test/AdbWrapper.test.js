const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
const expect = chai.expect,
    should = chai.should();

chai.use(sinonChai);

const EOL = require('os').EOL;

// -- App specific --
var CONFIG = null;

const TestHelper = require('../src/TestHelper.js');
const Configuration = require('../src/Configuration.js');
const AdbWrapper = require('../src/AdbWrapper.js');
const Device = require('../src/Device.js')

describe('ADB Wrapper', function() {

    beforeEach(function() {
        CONFIG = TestHelper.newConfiguration();
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('new ADB Wrapper', function() {

        it('new without device id', function () {
            
            let adbw = new AdbWrapper(CONFIG.getAdbPath());

            expect(adbw.path).to.equals(CONFIG.getAdbPath());

        });

        it('new with device id', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath(), "1a2b3c4d5e6f");

            expect(adbw.path).to.equals(CONFIG.getAdbPath());
            expect(adbw.deviceID).to.equals("1a2b3c4d5e6f");
        });

    });


    describe('isReady( )', function() {

        it('valid ADB binary path', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath());
;
            expect(adbw.isReady()).to.equals(true);
        });

        it('invalid ADB binary path', function () {

            let adbw = new AdbWrapper(process.cwd()+"/test/invalide_adb_path");

            expect(adbw.isReady()).to.equals(false);
        });
    });


    describe('setup( [deviceID = null])', function() {
        
        it('with no device ID', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath());
            let cmd = adbw.setup();

            expect(cmd).to.equals(CONFIG.getAdbPath());
        });

        it('the wrapper initialized with default device ID ', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath(), "1a2b3c4d5e6f");
            let cmd = adbw.setup();

            expect(cmd).to.equals(CONFIG.getAdbPath()+" -s 1a2b3c4d5e6f");
        });

        it('device ID specified, but the wrapper initialized without default device ID', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath());
            let cmd = adbw.setup("aabbcceeff");

            expect(cmd).to.equals(CONFIG.getAdbPath()+" -s aabbcceeff");
        });

        it('device ID specified, but the wrapper initialized with default device ID', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath(), "1a2b3c4d5e6f");
            let cmd = adbw.setup("aabbcceeff");

            expect(cmd).to.equals(CONFIG.getAdbPath()+" -s aabbcceeff");
        });
    });


    describe('parseDeviceList( )', function() {

        it('single device (#1)', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath());

            let output = `${EOL}List of devices attached${EOL}02581073e1c3398f       device usb:338755584X product:bullhead model:Nexus_5X device:bullhead transport_id:69`;

            let result = adbw.parseDeviceList(output);

            expect(result).to.be.an('array');
            expect(result.length).to.equals(1);
            expect(result[0]).to.be.an.instanceOf(Device);
            expect(result[0].id).to.equals("02581073e1c3398f");
            
        });

       it('single device (#2)', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath());

            let output = `${EOL}List of devices attached${EOL}0a1b2c3d4e5f6e7d device product:bullhead model:Nexus_5X device:bullhead transport_id:22`;

            let result = adbw.parseDeviceList(output);


            expect(result).to.be.an('array');
            expect(result.length).to.equals(1);
            expect(result[0]).to.be.an.instanceOf(Device);
            expect(result[0].id).to.equals("0a1b2c3d4e5f6e7d");
        });

        

        it('multiple device', function () {
            
            let adbw = new AdbWrapper(CONFIG.getAdbPath());

            let output = `${EOL}List of devices attached${EOL}0a1b2c3d4e5f6e7d device product:bullhead model:Nexus_5X device:bullhead transport_id:22${EOL}aabbccddeeff unauthorized product:bullhead model:Nexus_10X device:bullhead transport_id:18`;

            let result = adbw.parseDeviceList(output);


            expect(result).to.be.an('array');
            expect(result.length).to.equals(2);

            expect(result[0]).to.be.an.instanceOf(Device);
            expect(result[0].id).to.equals("0a1b2c3d4e5f6e7d");

            expect(result[1]).to.be.an.instanceOf(Device);
            expect(result[1].id).to.equals("aabbccddeeff");
            expect(result[1].authorized).to.equals(false);
        });

        it('on ADB error', function () {
            
            let adbw = new AdbWrapper(CONFIG.getAdbPath());

            let output = `${EOL}List of devices attached${EOL}`;

            let result = adbw.parseDeviceList(output);


            expect(result).to.be.an('array');
            expect(result.length).to.equals(0);
        });
    });

    describe('getPackagePath(packageIdentifier, deviceId=null)', function() {

       // to do
    });

    // error: no devices/emulators found

    describe('parsePackageList( pPackageListStr)', function() {

        it('valid ADB output', function () {

            let adbw = new AdbWrapper(CONFIG.getAdbPath());
            let ret = null;
            let flag = 0;

            try{
                ret = adbw.parsePackageList(`package:com.android.cts.priv.ctsshim${EOL}package:com.google.android.youtube${EOL}package:com.google.android.ext.services${EOL}package:com.android.providers.telephony`);
                
            }catch(err){
                flag++;
            }

            expect(flag).to.equals(0);
            expect(ret).to.be.an('array');
            expect(ret.length).to.equals(4);
            expect(ret[0].packageIdentifier).to.equals("com.android.cts.priv.ctsshim");
            expect(ret[0].packagePath).to.equals(null);
            expect(ret[1].packageIdentifier).to.equals("com.google.android.youtube");
            expect(ret[1].packagePath).to.equals(null);
            expect(ret[2].packageIdentifier).to.equals("com.google.android.ext.services");
            expect(ret[2].packagePath).to.equals(null);
            expect(ret[3].packageIdentifier).to.equals("com.android.providers.telephony");
            expect(ret[3].packagePath).to.equals(null);
        });

        it('invalid ADB output : device/emulators not found', function () {

            let adbw = new AdbWrapper(process.cwd()+"/test/invalide_adb_path");
            let f = 0;

            try{
                adbw.parsePackageList("error: no devices/emulators found");
                f++;
            }catch(err){
                expect(err).to.be.not.undefined;
            }

            expect(f).to.equals(0);
        });
    });

    describe('listPackages(deviceId = null)', function() {

        // TODO
    });
});