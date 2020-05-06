const chai = require('chai');
const process = require("process");
const expect = chai.expect;

//chai.use(sinonChai);*/

// -- App specific --

const TEST_CONFIG = process.cwd()+'/test/res/config_test.js';

var TestHelper = require('../src/TestHelper.js');
const Project = require('../src/Project.js');
const Configuration = require('../src/Configuration.js');
const Inspector = require('../src/Inspector.js');
const Utils = require("../src/Utils.js");
const Hook = require("../src/HookManager.js");


describe('Hook', function() {

    describe('Hook :: Unit tests', function() {

        var context = null;

        before(function(){
            context = new Project("owasp.mstg.uncrackable1", TestHelper.newConfiguration(), 0);
        });

        describe('constructor', function() {

            it('valid context, frida enabled', function() {
           
                // get hook instance by hook ID
                var manager = new Hook.Manager( context, 1);
        
                expect(manager).to.be.an.instanceOf(Hook.Manager);
            });
        });

    
    });
      
});