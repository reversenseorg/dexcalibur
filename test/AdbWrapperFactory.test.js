const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
const expect = chai.expect,
    should = chai.should();

const _fs_ = require('fs');

chai.use(sinonChai);

// -- App specific --
var CONFIG = null;

const AdbWrapperFactory = require('../src/AdbWrapperFactory');
const AdbWrapper = require('../src/AdbWrapper');

describe('AdbWrapperFactory', function() {

    beforeEach(function() {
        
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('constructor', function() {

        it('new instance', function () {
            
            let dm = new AdbWrapperFactory('/tmp/adb');
            expect(dm).to.be.an.instanceOf(AdbWrapperFactory);
            expect(dm.path).to.be.equals('/tmp/adb');
        });

        it('new device manager instance with config', function () {

            let dm = new DeviceManager(CONFIG);

            expect(dm.config).to.not.equals(null);
            expect(dm.bridges.ADB).to.be.an.instanceOf(AdbWrapper);
        });

    });

    describe('getInstance()', function() {

        it('new device manager instance without config', function () {
            
            let dm = new DeviceManager();
            expect(dm.config).to.equals(null);
            expect(dm.bridges.ADB).to.be.undefined;
        });

        it('new device manager instance with config', function () {

            let dm = new DeviceManager(CONFIG);

            expect(dm.config).to.not.equals(null);
            expect(dm.bridges.ADB).to.be.an.instanceOf(AdbWrapper);
        });

    });


    describe('scan()', function() {
        var dm = new DeviceManager(CONFIG);

        it('single device', function () {

            let dm = new DeviceManager(CONFIG);

            //dm.Bridges.ADB = AdbWrapperMock();
            //expect(dm.Bridges.ADB.path).to.equals(CONFIG.adb);
        });
    });
});