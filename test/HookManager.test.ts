import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper";
import {HookManager} from "../dist/src/HookManager";
import * as Log from "../dist/src/Logger";

let Logger:Log.TestLogger;

describe('HookManager', function() {

    before(function(){
        TestHelper.resetDexcaliburWorkspace();
    })

    beforeEach(function() {

        Logger = Log.newLogger({
            testMode: true,
            debugMode: false
        },true) as Log.TestLogger;
    });

    describe('HookManager :: Unit tests', function() {

        var context = null;


        describe('constructor', function() {

            it('frida enabled', function() {
           
                // get hook instance by hook ID
                let manager:HookManager = new HookManager( null, false);
        
                expect(manager).to.be.an.instanceOf(HookManager);
                expect(manager.isFridaDisabled()).to.equals(false);
                expect( TestHelper.checkIfModuleIsLoaded('frida') ).equals(true);
            });

            it('frida disabled', function() {
           
                // get hook instance by hook ID
                let manager:HookManager = new HookManager( null, true);
                let flag:number = 0;
        
                expect(manager).to.be.an.instanceOf(HookManager);
                expect(manager.isFridaDisabled()).to.equals(true);

                try {
                    manager.start("Java.perform()");
                }catch(err){
                    flag++;
                }
                expect(flag).to.equals(1);
            });
        
        });
/*
        describe('getHooks', function() {

            it('valid context, frida enabled', function() {
           
                // get hook instance by hook ID
                var manager = new Hook.Manager( context, 1);
        
                expect(manager).to.be.an.instanceOf(Hook.Manager);
                expect(manager.isFridaDisabled()).to.equals(false);
            });
        });

        describe('getHookByID', function() {

            it('valid ID', function() {
           
                // get hook instance by hook ID
                var manager = new Hook.Manager( context, 1);
                manager.add
        
                expect(manager).to.be.an.instanceOf(Hook.Manager);
                expect(manager.isFridaDisabled()).to.equals(false);
            });
        });
*/
    });

   /* describe('HookManager :: Integration tests', function() {

        // augment time limit
        this.timeout(10000);


        var PROJECT = null;
        let engine = DexcaliburEngine.getInstance();

        TestHelper.resetDexcaliburWorkspace();

        engine.workspace = DexcaliburWorkspace.getInstance();
        
        PROJECT = engine.getProject("owasp.mstg.uncrackable1");

        if(PROJECT===null){
            PROJECT = engine.openProject("owasp.mstg.uncrackable1");
        }
        
        
        it('[Integration] List all hooks', function() {
           
            // get hook instance by hook ID
            var flag = false;
            var hooks = PROJECT.hook.list();

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
    });*/
});