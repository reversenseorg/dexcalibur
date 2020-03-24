const chai = require('chai');
const expect = chai.expect;

//chai.use(sinonChai);*/

// -- App specific --

var TestHelper = require('../src/TestHelper.js');
const Project = require('../src/Project.js');
const Utils = require("../src/Utils.js");
const Hook = require("../src/HookManager.js");


describe('HookManager', function() {

    describe('HookManager :: Unit tests', function() {

        var context = null;

        beforeEach(function(){
            context = new Project("owasp.mstg.uncrackable1", TestHelper.newConfiguration(), 0);
        });

        describe('constructor', function() {

            it('valid context, frida enabled', function() {
           
                // get hook instance by hook ID
                var manager = new Hook.Manager( context, 1);
        
                expect(manager).to.be.an.instanceOf(Hook.Manager);
            });
        
    
    
        });

        describe('list()', function() {

            it('no hook ', function() {
           
                var manager = new Hook.Manager( context, 1);
                var hooks = manager.list();
    
                expect(hooks.length).to.equals(0);
            });
        
            /*it('several hook ', function() {
           
                var manager = new DBI.HookManager( context, 1);
                var hooks = manager.list();
    
                expect(hooks.length).to.equals(0);
            });*/
    
    
        });

    });

    describe('HookManager :: Integration tests', function() {

        // augment time limit
        this.timeout(10000);

        var PROJECT = null;
        
        // Create a valid context
        //before(function() {
            PROJECT = new Project("owasp.mstg.uncrackable1", TestHelper.newConfiguration(), 0);
            PROJECT.fullscan();
        //});
        
        it('[Integration] List all hooks', function() {
           
            // get hook instance by hook ID
            var flag = false;
            var hooks = PROJECT.hook.list();
            
            console.log(hooks);

            for(let i=0; i<hooks.length; i++){
                expect(hooks[i].id).to.be.not.null;
            }
            //PROJECT.hook.getHookByID("Zjg3YmRjOTA3ZTVjNzdhNDIxNGM2Yzg5YTM5OGQ4N2Y=");
        });

        it('[Integration] Get inspector by hook ID', function() {
           
            // "Class.forName()" hook ID
            var hookID = Utils.b64_decode("Zjg3YmRjOTA3ZTVjNzdhNDIxNGM2Yzg5YTM5OGQ4N2Y=");

            // get hook instance by hook ID
            var hook = PROJECT.hook.getHookByID( hookID);
            
            // if the hook is defined into an inspector, then is contained 
            // into an HookSet with the same ID than its inspector
            var inspector = PROJECT.inspectors.get( hook.getParentID() );

            expect(inspector.id).to.equals("DynamicLoader");
        });
    });
});