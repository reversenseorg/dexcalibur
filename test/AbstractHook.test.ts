import {expect} from 'chai';
import DexcaliburEngine from "../src/DexcaliburEngine.js";
import DexcaliburProject from "../src/DexcaliburProject.js";
import {AbstractHook} from "../src/hook/AbstractHook.js";
import {TargetLanguage} from "../src/hook/common.js";
import HookTemplateFragment from "../src/hook/HookTemplateFragment.js";
//chai.use(sinonChai);*/

// -- App specific --

//const EOL = require('os').EOL;


describe('AbstractHook', function() {



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


*/
    describe('AbstractHook::api', function() {

        class CustomHook extends AbstractHook {
            constructor() {
                super();
            }

            build(pTargetLanguage: TargetLanguage): any {
            }

            destroy(): any {
            }

            getTarget(): any {
            }

            isTarget(pNode: any): boolean {
                return false;
            }

        }
        it('Multiple fragment removed or edited', async function() {
        
            // get hook instance by hook ID
            let hook = new CustomHook( );
            hook.appendAfter(HookTemplateFragment.fromJsonObject({
                _uid: "after_1",
                name: "after_1",
                weight: 1
            }),false);
            hook.appendAfter(HookTemplateFragment.fromJsonObject({
                _uid: "after_2",
                name: "after_2",
                weight: -1
            }),false);
            hook.appendAfter(HookTemplateFragment.fromJsonObject({
                _uid: "after_2.1",
                name: "after_2.1",
                weight: 0
            }),false);
            hook.appendAfter(HookTemplateFragment.fromJsonObject({
                _uid: "after_3",
                name: "after_3",
                weight: 5
            }),false);


            let after = hook.getAfter();

            expect(after.length).to.be.equal(4);

            expect(after[0].name).to.be.equal("after_3");
            expect(after[1].name).to.be.equal("after_1");
            expect(after[2].name).to.be.equal("after_2.1");
            expect(after[3].name).to.be.equal("after_2");

            await hook.removeFragment("after_1");

            after = hook.getAfter();

            expect(after[0].name).to.be.equal("after_3");
            expect(after[1].name).to.be.equal("after_2.1");
            expect(after[2].name).to.be.equal("after_2");



        });
    });
      
});