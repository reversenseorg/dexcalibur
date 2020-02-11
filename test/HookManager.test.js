const chai = require('chai');
   // sinon = require('sinon'),
   // sinonChai = require('sinon-chai'),
const process = require("process");
const expect = chai.expect,
    should = chai.should();

//chai.use(sinonChai);*/

// -- App specific --

const TEST_CONFIG = process.cwd()+'/test/res/config_test.js';

//const Configuration = require('../src/Configuration.js');
const Project = require('../src/Project.js');

describe('HookManager', function() {

    var HookManager = null;

    before(function() {
        
        //console.log(process.cwd());
        var project_instance = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 0);
        HookManager = project_instance.hook;
    });
    
    /*
    it('#normalizeNodeModName', function() {
        
        let normalizedName = HookManager.normalizeNodeModName("frida-fs");

        expect(normalizedName).to.equal("fridaFs");

        normalizedName = HookManager.normalizeNodeModName("-_ThisIsOk_--fs");

        expect(normalizedName).to.equal("ThisIsOkFs");

        normalizedName = HookManager.normalizeNodeModName("!ThisIsNOk_#fs");

        expect(normalizedName).to.equal("ThisIsNOkfs");

        // invalid module name
        expect(HookManager.normalizeNodeModName("----")).to.throw()
    });*/
});