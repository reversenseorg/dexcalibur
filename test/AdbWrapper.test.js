const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
const expect = chai.expect,
    should = chai.should();

chai.use(sinonChai);

const _path_ = require('path');
const EOL = require('os').EOL;


const TestHelper = require('../src/TestHelper.js');
const AdbWrapper = require('../src/AdbWrapper.js');
const AppPackage = require('../src/AppPackage');
const {AdbWrapperError} = require('../src/Errors');
const Device = require('../src/Device.js')

describe('ADB Wrapper', function() {

    let VALID_ADB_PATH = _path_.join(__dirname, 'ws', '.dxc', 'bin', 'platform-tools', 'adb');
    let INVALID_ADB_PATH = _path_.join(__dirname, 'ws', '.dxc', 'bin', 'platform-tools', 'invalid_adb');

    beforeEach(function() {
        TestHelper.clearInterceptors();
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('new ADB Wrapper', function() {

        it('new without device id', function () {
            
            let adbw = new AdbWrapper(VALID_ADB_PATH);

            expect(adbw.path).to.equals(VALID_ADB_PATH);

        });

        it('new with device id', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH, "1a2b3c4d5e6f");

            expect(adbw.path).to.equals(VALID_ADB_PATH);
            expect(adbw.deviceID).to.equals("1a2b3c4d5e6f");
        });

    });


    describe('isReady( )', function() {

        it('valid ADB binary path', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);
            expect(adbw.isReady()).to.equals(true);
        });

        it('invalid ADB binary path', function () {

            let adbw = new AdbWrapper(INVALID_ADB_PATH);
            expect(adbw.isReady()).to.equals(false);
        });
    });

    describe('setTransport(transport_type)', function() {

        it('USB transport', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);
            adbw.setTransport(AdbWrapper.USB_TRANSPORT);

            expect(adbw.transport).to.equals(AdbWrapper.USB_TRANSPORT);
        });

        it('TCP transport', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);
            adbw.setTransport(AdbWrapper.TCP_TRANSPORT);

            expect(adbw.transport).to.equals(AdbWrapper.TCP_TRANSPORT);

        });
    });

    describe('setup( [deviceID = null])', function() {
        
        it('with no device ID', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);
            let cmd = adbw.setup();

            expect(cmd).to.equals(VALID_ADB_PATH);
        });

        it('the wrapper initialized with default device ID ', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH, "1a2b3c4d5e6f");
            let cmd = adbw.setup();

            expect(cmd).to.equals(VALID_ADB_PATH+" -s 1a2b3c4d5e6f");
        });

        it('device ID specified, but the wrapper initialized without default device ID', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);
            let cmd = adbw.setup("aabbcceeff");

            expect(cmd).to.equals(VALID_ADB_PATH+" -s aabbcceeff");
        });

        it('device ID specified, but the wrapper initialized with default device ID', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH, "1a2b3c4d5e6f");
            let cmd = adbw.setup("aabbcceeff");

            expect(cmd).to.equals(VALID_ADB_PATH+" -s aabbcceeff");
        });
    });


    describe('parseDeviceList( )', function() {

        it('single device (#1)', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);

            let output = `${EOL}List of devices attached${EOL}02581073e1c3398f       device usb:338755584X product:bullhead model:Nexus_5X device:bullhead transport_id:69`;

            let result = adbw.parseDeviceList(output);

            expect(result).to.be.an('array');
            expect(result.length).to.equals(1);
            expect(result[0]).to.be.an.instanceOf(Device);
            expect(result[0].id).to.equals("02581073e1c3398f");
            
        });

       it('single device (#2)', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);

            let output = `${EOL}List of devices attached${EOL}0a1b2c3d4e5f6e7d device product:bullhead model:Nexus_5X device:bullhead transport_id:22`;

            let result = adbw.parseDeviceList(output);


            expect(result).to.be.an('array');
            expect(result.length).to.equals(1);
            expect(result[0]).to.be.an.instanceOf(Device);
            expect(result[0].id).to.equals("0a1b2c3d4e5f6e7d");
        });

        

        it('multiple device', function () {
            
            let adbw = new AdbWrapper(VALID_ADB_PATH);

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
            
            let adbw = new AdbWrapper(VALID_ADB_PATH);

            let output = `${EOL}List of devices attached${EOL}`;

            let result = adbw.parseDeviceList(output);


            expect(result).to.be.an('array');
            expect(result.length).to.equals(0);
        });
    });

    /*
    describe('pull(remote_path, local_path, deviceID=null)', function() {

        it('pull existing file', function(){
            let flag = 0, ret=null;
            let adbw = new AdbWrapper(VALID_ADB_PATH);

            TestHelper.interceptExec( function(x){
                return (x.indexOf("pull /data/app/com.test/base.apk ")>-1);
            }, `package:/data/app/com.whatsapp-2/base.apk`);

            
            try{
                ret = adbw.pull("/data/app/com.test/base.apk", "/tmp/test");
            }catch(err){
                flag++;
            }
    
            expect(flag).to.equals(0);
            expect(ret).to.equals("/data/app/com.whatsapp-2/base.apk");
        });
    });*/

    describe('getPackagePath(packageIdentifier, deviceId=null)', function() {

            it('single file', function(){
                let flag = 0, ret=null;
                let adbw = new AdbWrapper(VALID_ADB_PATH);

                TestHelper.interceptExec( function(x){
                    return (x.indexOf("shell pm path com.whatsapp")>-1);
                }, `package:/data/app/com.whatsapp-2/base.apk`);

                
                try{
                    ret = adbw.getPackagePath(`com.whatsapp`);
                }catch(err){
                    flag++;
                }
        
                expect(flag).to.equals(0);
                expect(ret).to.equals("/data/app/com.whatsapp-2/base.apk");
            });

            

            it('single file, custom deviceID (false)', function(){
                let flag = 0, ret=null;
                let adbw = new AdbWrapper(VALID_ADB_PATH);
                let expectedDeviceId = "aabbccddeeff";
                let dev = false;

                TestHelper.interceptExec( function(x){
                    if(x.indexOf("shell pm path com.whatsapp")>-1){
                        dev = (x.indexOf(expectedDeviceId)> -1);
                        return true;
                    }else{
                        dev = false;
                        return false;
                    }
                }, `package:/data/app/com.whatsapp-2/base.apk`);

                
                try{
                    ret = adbw.getPackagePath(`com.whatsapp`, "a1a2a3a4a5a6");
                }catch(err){
                    flag++;
                }
        
                expect(flag).to.equals(0);
                expect(dev).to.equals(false);
                expect(ret).to.equals("/data/app/com.whatsapp-2/base.apk");
            });

            it('single file, default deviceID', function(){
                let flag = 0, ret=null;
                let adbw = new AdbWrapper(VALID_ADB_PATH, "a1a2a3a4a5a6a7");
                let dev = false;

                TestHelper.interceptExec( function(x){
                    if(x.indexOf("shell pm path com.whatsapp")>-1){
                        dev = (x.indexOf("a1a2a3a4a5a6a7")> -1);
                        return true;
                    }else{
                        dev = false;
                        return false;
                    }
                }, `package:/data/app/com.whatsapp-2/base.apk`);

                
                try{
                    ret = adbw.getPackagePath(`com.whatsapp`);
                }catch(err){
                    flag++;
                }
        
                expect(flag).to.equals(0);
                expect(dev).to.equals(true);
                expect(ret).to.equals("/data/app/com.whatsapp-2/base.apk");
            });

            it('multiple files', function(){
                let flag = 0, ret=null;
                let adbw = new AdbWrapper(VALID_ADB_PATH);

                // mock child_process.execSync()
                TestHelper.interceptExec( function(x){
                    return (x.indexOf("shell pm path com.whatsapp")>-1);
                }, `package:/data/app/com.whatsapp-2/base.apk${EOL}package:/data/app/com.test/base.apk`);


                try{
                    ret = adbw.getPackagePath(`com.whatsapp`);
                }catch(err){
                    flag++;
                }
        
                expect(flag).to.equals(0);
                expect(ret).to.equals("/data/app/com.whatsapp-2/base.apk");
            });
    });



    // error: no devices/emulators found

    describe('parsePackageList( pPackageListStr)', function() {

        it('valid ADB output', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);
            let ret = null;
            let flag = 0;

            try{
                ret = adbw.parsePackageList(`package:com.android.cts.priv.ctsshim${EOL}package:com.google.android.youtube${EOL}package:com.google.android.ext.services${EOL}package:com.android.providers.telephony`);
            }catch(err){
                console.log("exception:",err);
                flag++;
            }

            expect(flag).to.equals(0);
            expect(ret).to.be.an('array');
            expect(ret.length).to.equals(4);
            expect(ret[0].packageIdentifier).to.equals("com.android.cts.priv.ctsshim");
            expect(ret[0]).to.be.an.instanceOf(AppPackage);
            expect(ret[1].packageIdentifier).to.equals("com.google.android.youtube");
            expect(ret[1]).to.be.an.instanceOf(AppPackage);
            expect(ret[2].packageIdentifier).to.equals("com.google.android.ext.services");
            expect(ret[2]).to.be.an.instanceOf(AppPackage);
            expect(ret[3].packageIdentifier).to.equals("com.android.providers.telephony");
            expect(ret[3]).to.be.an.instanceOf(AppPackage);

        });

        it('invalid ADB output : device/emulators not found', function () {

            let adbw = new AdbWrapper(process.cwd()+"/test/invalide_adb_path");
            let f = 0;

            try{
                adbw.parsePackageList("error: no devices/emulators found");
                f++;
            }catch(err){
                expect(err).to.be.an.instanceOf(AdbWrapperError);
                expect(err.code).to.equals(AdbWrapperError.DEVICE_NOT_FOUND);
            }

            expect(f).to.equals(0);
        });
    });

    describe('listPackages(deviceId = null)', function() {

        it('list packages', function () {

            let adbw = new AdbWrapper(VALID_ADB_PATH);
            let f = 0, ret=null;

            // mock "shell pm list packages" output
            TestHelper.interceptExec( function(x){
                return (x.indexOf("shell pm list packages")>-1);
            }, `package:com.android.cts.priv.ctsshim${EOL}package:com.google.android.youtube${EOL}package:com.google.android.ext.services${EOL}package:com.android.providers.telephony`);

            try{
                ret = adbw.listPackages();
            }catch(err){
                f++;
            }

            expect(f).to.equals(0);
            expect(ret).to.be.an('array');
            expect(ret.length).to.equals(4);
            expect(ret[0].packageIdentifier).to.equals("com.android.cts.priv.ctsshim");
            expect(ret[0]).to.be.an.instanceOf(AppPackage);
            expect(ret[1].packageIdentifier).to.equals("com.google.android.youtube");
            expect(ret[1]).to.be.an.instanceOf(AppPackage);
            expect(ret[2].packageIdentifier).to.equals("com.google.android.ext.services");
            expect(ret[2]).to.be.an.instanceOf(AppPackage);
            expect(ret[3].packageIdentifier).to.equals("com.android.providers.telephony");
            expect(ret[3]).to.be.an.instanceOf(AppPackage);
        });

        // TODO
    });

    describe('push(local_path, remote_path, deviceID=null)', function() {

        it('push file, no default device, no specific device', function(){
            let flag = 0, ret=null, f=false;
            let adbw = new AdbWrapper(VALID_ADB_PATH);

            // assert is done by intercepting command 
            TestHelper.interceptExec( function(x){
                if(x.indexOf("push /tmp/test_file /data/local/tmp/test_file")>-1){
                    f = "push /tmp/test_file /data/local/tmp/test_file";
                }else{
                    f = x;
                }
                return f;
            }, `package:/data/app/com.whatsapp-2/base.apk`); // todo

            
            try{
                ret = adbw.push("/tmp/test_file", "/data/local/tmp/test_file");
            }catch(err){
                flag++;
            }
    
            expect(flag).to.equals(0);
            expect(f).to.equals("push /tmp/test_file /data/local/tmp/test_file");
        });
    });
});