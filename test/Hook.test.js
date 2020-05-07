const chai = require('chai');
const process = require("process");
const expect = chai.expect;

//chai.use(sinonChai);*/

// -- App specific --

const TEST_CONFIG = process.cwd()+'/test/res/config_test.js';

var TestHelper = require('../src/TestHelper.js');
const DexcaliburProject = require('../src/DexcaliburProject.js');
const DexcaliburEngine = require('../src/DexcaliburEngine.js');

const Hook = require("../src/HookManager.js");


describe('Hook', function() {

    let gEngine = null;
    let gProject = null;

    before(function(){
        gEngine = DexcaliburEngine.getInstance();

        gProject = gEngine.getProject("owasp.mstg.uncrackable1");

        if(gProject===null){
            gProject = gEngine.openProject("owasp.mstg.uncrackable1");
        }
    })


    describe('constructor', function() {

        it('valid context', function() {
        
            // get hook instance by hook ID
            var hook = new Hook.Hook( gProject);
    
            expect(manager).to.be.an.instanceOf(Hook.Manager);
        });
    });
      
});