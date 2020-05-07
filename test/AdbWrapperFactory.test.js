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

    
    describe('constructor', function() {

        it('new instance', function () {
            
            let dm = new AdbWrapperFactory('/tmp/adb');
            expect(dm).to.be.an.instanceOf(AdbWrapperFactory);
            expect(dm.path).to.be.equals('/tmp/adb');
        });


    });

    describe('isReady()', function() {

        it('valid ADB path', function () {
            
            let awf = new AdbWrapperFactory(_path_.join(__dirname,'bin','adb_stub'));

            expect(awf.isReady()).to.equals(true);
        });

        it('invalid ADB path', function () {
            
            let awf = new AdbWrapperFactory(_path_.join(__dirname,'bin','adb_stub_invalid'));

            expect(awf.isReady()).to.equals(false);
        });

    });

    describe('getInstance()', function() {


        let adb_path = _path_.join(__dirname,'bin','adb_stub');
        let adb_path2 = _path_.join(__dirname,'bin','adb_stub2');
        
        it('fresh instance', function () {
            let awf = AdbWrapperFactory.getInstance(adb_path);

            expect(awf.path).to.equals(adb_path);
        });

        it('get exisitng instance', function () {
            let awf = AdbWrapperFactory.getInstance();

            expect(awf.path).to.equals(adb_path);
        });

        it('try to get new instance', function () {
            let awf = AdbWrapperFactory.getInstance(adb_path2);

            expect(awf.path).to.equals(adb_path);
            expect(awf.path).to.not.equals(adb_path2);
        });

        it('try to get new instance + override=false option', function () {
            let awf = AdbWrapperFactory.getInstance(adb_path2, false);

            expect(awf.path).to.equals(adb_path);
            expect(awf.path).to.not.equals(adb_path2);
        });


        it('override instance', function () {
            let awf = AdbWrapperFactory.getInstance(adb_path2, true);

            expect(awf.path).to.equals(adb_path2);
            expect(awf.path).to.not.equals(adb_path);
        });
    });


    describe('newGenericWrapper()', function() {
        
        let adb_path = _path_.join(__dirname,'bin','adb_stub');


        it('override instance', function () {
            let awf = AdbWrapperFactory.getInstance(adb_path, true);

            expect(awf.path).to.equals(adb_path);

            let gw = awf.newGenericWrapper();

            expect(gw.path).to.equals(adb_path);
            expect(gw).to.be.an.instanceOf(AdbWrapper);
            expect(gw.deviceID).to.be.null;
        });
    });

    describe('newSpecificWrapper()', function() {

        let adb_path = _path_.join(__dirname,'bin','adb_stub');


        it('with deviceID', function () {
            let awf = AdbWrapperFactory.getInstance(adb_path, true);

            expect(awf.path).to.equals(adb_path);

            let dev = new Device();
            dev.setUID('an_UID');

            let gw = awf.newSpecificWrapper(dev);

            expect(gw.path).to.equals(adb_path);
            expect(gw).to.be.an.instanceOf(AdbWrapper);
            expect(gw.deviceID).to.equals('an_UID');
        });
    });
});