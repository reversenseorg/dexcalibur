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
const DexcaliburWorkspace = require('../src/DexcaliburWorkspace');
const AdbWrapper = require('../src/AdbWrapper');

describe('Device Manager', function() {

    before(function(){
        TestHelper.resetDexcaliburWorkspace();
    })
    
    describe('constructor', function() {

        it('new device manager instance without config', function () {
            
            
            let dm = new DeviceManager();
            expect(dm.dxcWorkspace).to.be.an.instanceOf(DexcaliburWorkspace);

        });

    });

    describe('getInstance()', function() {

        it('new device manager instance without config', function () {
            
            
            let dm = DeviceManager.getInstance();
            expect(dm).to.be.an.instanceof(DeviceManager);
        });

    });

});