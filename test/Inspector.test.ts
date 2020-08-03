const chai = require('chai');
   // sinon = require('sinon'),
   // sinonChai = require('sinon-chai'),
const process = require("process");
const expect = chai.expect,
    should = chai.should();

//chai.use(sinonChai);*/

// -- App specific --

const TEST_CONFIG = process.cwd()+'/test/res/config_test.js';

var TestHelper = require('../src/TestHelper.js');
const DexcaliburProject = require('../src/DexcaliburProject.js');
const Configuration = require('../src/Configuration.js');
const Inspector = require('../src/Inspector.js');
const Utils = require("../src/Utils.js");

describe('Inspector', function() {

    // augment time limit
    this.timeout(10000);

    var PROJECT = null;
    /*
    before(function() {
        PROJECT = new Project("owasp.mstg.uncrackable1", TestHelper.newConfiguration(), 0);

        //PROJECT.useAPI('android:7.0.0')
        PROJECT.fullscan();
    });
    
    
    it('get inspector from hook ', function() {

        // get hook ID from `hook`field
        var hookID = Utils.b64_decode("Zjg3YmRjOTA3ZTVjNzdhNDIxNGM2Yzg5YTM5OGQ4N2Y=");

        // get hook instance by hook ID
        var hook = PROJECT.hook.getHookByID( hookID);
        
        // if the hook is defined into an inspector, then is contained 
        // into an HookSet with the same ID than its inspector
        var inspector = PROJECT.inspectors.get( hook.getParentID() );


        //PROJECT.hook.getHookByID("Zjg3YmRjOTA3ZTVjNzdhNDIxNGM2Yzg5YTM5OGQ4N2Y=");
    }).timeout(10000);
      */
});