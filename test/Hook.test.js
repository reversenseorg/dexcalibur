const chai = require('chai');
const process = require("process");
const expect = chai.expect;

//chai.use(sinonChai);*/

// -- App specific --

const EOL = require('os').EOL;
const TestHelper = require('../src/TestHelper.js');
const DexcaliburProject = require('../src/DexcaliburProject.js');
const DexcaliburEngine = require('../src/DexcaliburEngine.js');

const Hook = require("../src/HookManager.js");


describe('Hook', function() {

    let gEngine = null;
    let gProject = null;

    before(async function(){
        gEngine = DexcaliburEngine.getInstance();

        TestHelper.interceptExec( function(x){
            return (x.indexOf("adb devices")>-1);
        }, `package:com.android.cts.priv.ctsshim${EOL}package:com.google.android.youtube${EOL}package:com.google.android.ext.services${EOL}package:com.android.providers.telephony`);


        gProject = await gEngine.getProject("owasp.mstg.uncrackable1");

        if(gProject===null){
            gProject = await gEngine.openProject("owasp.mstg.uncrackable1");
        }
    })


    describe('constructor', function() {

        it('valid context', async function() {
        
            // get hook instance by hook ID
            var hook = new Hook.Hook( await gProject);
    
            expect(hook.context).to.be.an.instanceOf(DexcaliburProject);
        });
    });
      
});