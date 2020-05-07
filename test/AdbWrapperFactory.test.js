const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
const expect = chai.expect,
    should = chai.should();

const _path_ = require('path');    
const _fs_ = require('fs');

chai.use(sinonChai);

// -- App specific --
var CONFIG = null;

const AdbWrapperFactory = require('../src/AdbWrapperFactory');
const AdbWrapper = require('../src/AdbWrapper');
const Device = require('../src/Device');

describe('AdbWrapperFactory', function() {

    let VALID_ADB_PATH = _path_.join(__dirname, 'ws', '.dxc', 'bin', 'platform-tools', 'adb');
    let VALID_ADB_PATH2 = _path_.join(__dirname, 'bin', 'adb_stub');
    let INVALID_ADB_PATH = _path_.join(__dirname, 'ws', '.dxc', 'bin', 'platform-tools', 'invalid_adb');
    
    describe('constructor', function() {

        it('new instance', function () {
            
            let dm = new AdbWrapperFactory(VALID_ADB_PATH);
            expect(dm).to.be.an.instanceOf(AdbWrapperFactory);
            expect(dm.path).to.be.equals(VALID_ADB_PATH);
        });


    });

    describe('isReady()', function() {

        it('valid ADB path', function () {
            
            let awf = new AdbWrapperFactory(VALID_ADB_PATH);

            expect(awf.isReady()).to.equals(true);
        });

        it('invalid ADB path', function () {
            
            let awf = new AdbWrapperFactory(INVALID_ADB_PATH);

            expect(awf.isReady()).to.equals(false);
        });

    });

    describe('getInstance()', function() {


        let adb_path = _path_.join(__dirname,'bin','adb_stub');
        let adb_path2 = _path_.join(__dirname,'bin','adb_stub2');
        
        it('fresh instance', function () {
            let awf = AdbWrapperFactory.getInstance(VALID_ADB_PATH);

            expect(awf.path).to.equals(VALID_ADB_PATH);
        });

        it('get exisitng instance', function () {
            let awf = AdbWrapperFactory.getInstance();

            expect(awf.path).to.equals(VALID_ADB_PATH);
        });

        it('try to get new instance', function () {
            let awf = AdbWrapperFactory.getInstance(VALID_ADB_PATH2);

            expect(awf.path).to.equals(VALID_ADB_PATH);
            expect(awf.path).to.not.equals(VALID_ADB_PATH2);
        });

        it('try to get new instance + override=false option', function () {
            let awf = AdbWrapperFactory.getInstance(VALID_ADB_PATH2, false);

            expect(awf.path).to.equals(VALID_ADB_PATH);
            expect(awf.path).to.not.equals(VALID_ADB_PATH2);
        });


        it('override instance', function () {
            let awf = AdbWrapperFactory.getInstance(VALID_ADB_PATH2, true);

            expect(awf.path).to.equals(VALID_ADB_PATH2);
            expect(awf.path).to.not.equals(VALID_ADB_PATH);
        });
    });


    describe('newGenericWrapper()', function() {
        


        it('override instance', function () {
            let awf = AdbWrapperFactory.getInstance(VALID_ADB_PATH, true);

            expect(awf.path).to.equals(VALID_ADB_PATH);

            let gw = awf.newGenericWrapper();

            expect(gw.path).to.equals(VALID_ADB_PATH);
            expect(gw).to.be.an.instanceOf(AdbWrapper);
            expect(gw.deviceID).to.be.null;
        });
    });

    describe('newSpecificWrapper()', function() {


        it('with deviceID', function () {
            let awf = AdbWrapperFactory.getInstance(VALID_ADB_PATH, true);

            expect(awf.path).to.equals(VALID_ADB_PATH);

            let dev = new Device();
            dev.setUID('an_UID');

            let gw = awf.newSpecificWrapper(dev);

            expect(gw.path).to.equals(VALID_ADB_PATH);
            expect(gw).to.be.an.instanceOf(AdbWrapper);
            expect(gw.deviceID).to.equals('an_UID');
        });
    });
});