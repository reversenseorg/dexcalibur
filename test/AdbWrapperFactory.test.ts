import * as chai from 'chai';
import * as _path_ from 'path';
import AdbWrapperFactory from "../dist/src/AdbWrapperFactory.js";
import AdbWrapper from "../dist/src/AdbWrapper.js";
import {Device} from "../dist/src/Device.js";
import {IBridge} from "../dist/src/Bridge.js";
import Util from "../src/Utils.js";

const expect = chai.expect;


// -- App specific --


let VALID_ADB_PATH:string = _path_.join(Util.__dirname(import.meta.url), 'ws', '.dxc', 'bin', 'platform-tools', 'adb');
let VALID_ADB_PATH2:string = _path_.join(Util.__dirname(import.meta.url), 'bin', 'adb_stub');
let INVALID_ADB_PATH:string = _path_.join(Util.__dirname(import.meta.url), 'ws', '.dxc', 'bin', 'platform-tools', 'invalid_adb');

describe('AdbWrapperFactory', function() {

    
    describe('constructor', function() {

        it('new instance', function () {
            
            let dm:AdbWrapperFactory = new AdbWrapperFactory(VALID_ADB_PATH);
            expect(dm).to.be.an.instanceOf(AdbWrapperFactory);
            expect(dm.path).to.be.equals(VALID_ADB_PATH);
        });


    });

    describe('isReady()', function() {

        it('valid ADB path', function () {
            
            let awf:AdbWrapperFactory = new AdbWrapperFactory(VALID_ADB_PATH);

            expect(awf.isReady()).to.equals(true);
        });

        it('invalid ADB path', function () {
            
            let awf:AdbWrapperFactory= new AdbWrapperFactory(INVALID_ADB_PATH);

            expect(awf.isReady()).to.equals(false);
        });

    });

    describe('getInstance()', function() {


        let adb_path:string = _path_.join(Util.__dirname(import.meta.url),'bin','adb_stub');
        let adb_path2:string = _path_.join(Util.__dirname(import.meta.url),'bin','adb_stub2');
        
        it('fresh instance', function () {
            let awf:AdbWrapperFactory = AdbWrapperFactory.getInstance(VALID_ADB_PATH);

            expect(awf.path).to.equals(VALID_ADB_PATH);
        });

        it('get exisitng instance', function () {
            let awf:AdbWrapperFactory = AdbWrapperFactory.getInstance();

            expect(awf.path).to.equals(VALID_ADB_PATH);
        });

        it('try to get new instance', function () {
            let awf:AdbWrapperFactory = AdbWrapperFactory.getInstance(VALID_ADB_PATH2);

            expect(awf.path).to.equals(VALID_ADB_PATH);
            expect(awf.path).to.not.equals(VALID_ADB_PATH2);
        });

        it('try to get new instance + override=false option', function () {
            let awf:AdbWrapperFactory = AdbWrapperFactory.getInstance(VALID_ADB_PATH2, false);

            expect(awf.path).to.equals(VALID_ADB_PATH);
            expect(awf.path).to.not.equals(VALID_ADB_PATH2);
        });


        it('override instance', function () {
            let awf:AdbWrapperFactory = AdbWrapperFactory.getInstance(VALID_ADB_PATH2, true);

            expect(awf.path).to.equals(VALID_ADB_PATH2);
            expect(awf.path).to.not.equals(VALID_ADB_PATH);
        });
    });


    describe('newGenericWrapper()', function() {
        


        it('override instance', function () {
            let awf:AdbWrapperFactory = AdbWrapperFactory.getInstance(VALID_ADB_PATH, true);

            expect(awf.path).to.equals(VALID_ADB_PATH);

            let gw:IBridge = awf.newGenericWrapper();

            expect(gw).to.be.an.instanceOf(AdbWrapper);
            expect(gw.getDeviceID()).to.be.null;
        });
    });

    describe('newSpecificWrapper()', function() {


        it('with deviceID', function () {
            let awf:AdbWrapperFactory = AdbWrapperFactory.getInstance(VALID_ADB_PATH, true);

            expect(awf.path).to.equals(VALID_ADB_PATH);

            let dev:Device = new Device();
            let b:AdbWrapper = new AdbWrapper(VALID_ADB_PATH, 'an_UID');
            b.shortname = 'adb+usb';
            dev.addBridge(b);
            dev.setDefaultBridge('adb+usb');

            let gw:IBridge = awf.newSpecificWrapper(dev);

            expect(gw).to.be.an.instanceOf(AdbWrapper);
            expect(gw.getDeviceID()).to.equals('an_UID');
        });
    });
});