const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
const expect = chai.expect,
    should = chai.should();

chai.use(sinonChai);

// -- App specific --
var CONFIG = null;

const TestHelper = require('../src/TestHelper.js');
const DeviceManager = require('../src/DeviceManager.js');
const AdbWrapper = require('../src/AdbWrapper');

describe('Device Manager', function() {

    beforeEach(function() {
        CONFIG = TestHelper.newConfiguration();
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('constructor', function() {

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