import {expect} from 'chai';
import DexcaliburEngine from "../src/DexcaliburEngine.js";
import DexcaliburProject from "../src/DexcaliburProject.js";
//chai.use(sinonChai);*/

// -- App specific --

//const EOL = require('os').EOL;


describe('Hook', function() {

    let gEngine:DexcaliburEngine = null;
    let gProject:DexcaliburProject = null;

    /*before(async function(){
        TestHelper.interceptExec( function(x){
            return (x.indexOf("adb devices")>-1);
        }, `List of devices attached${EOL}01020304050607       device usb:330102034X product:bullhead model:Nexus_5X device:bullhead transport_id:1`);


        gEngine = TestHelper.getDexcaliburEngine(true);
       

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
    });*/
      
});