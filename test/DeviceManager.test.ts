
import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper";
import DeviceManager from "../dist/src/DeviceManager";
import DexcaliburWorkspace from "../dist/src/DexcaliburWorkspace";

//import * from 'process';


// -- App specific --
var CONFIG = null;

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