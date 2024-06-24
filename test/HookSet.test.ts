import {expect} from 'chai';
import ModelMethod from "../src/ModelMethod.js";
import HookSet from "../src/HookSet.js";
import {UPGRADE_MODE} from "../src/inspector/common.js";
import {HookSetOptions} from "../src/InspectorFactory.js";



describe('HookSet', function() {


    describe('Behaviors', function() {

        describe('HookSet.upgradeOptions()', function() {

            const oldSet = {
                id: "Firebase",
                name: "Firebase",
                description: "Firebase API : auth, ...",
                prologue: `
                    function printTest(){
                        // test
                        console.log("@@__CTX__@@");
                    }
                `,
                strategies: [{

                    name: "FirebaseAuth_getInstance",
                    descr: "To hook the getter of firebase authentication instance. (see https://firebase.google.com/docs/auth/android/start)",
                    search: {
                        type: ModelMethod.TYPE.getName(),
                        req: `method("enclosingClass.name:com.google.firebase.auth.FirebaseAuth").filter("name:getInstance")`
                    },
                    autoEmit: true,
                    emitEvent: "hook.firebase.auth.get",
                    before: `
                            let msg="";    
                            if(DXC.util.isInstanceOf(arg0,"com.google.firebase.FirebaseApp"))
                                msg = arg0;
                            else
                                msg = "<unknow>";
                
                
                            DXC.send(
                                "@@__HOOK_ID__@@",
                                "@@__FRAG_ID__@@",
                                {
                                    msg: msg
                                }
                            );
                    `
                },{

                    name: "FirebaseAuth_test",
                    descr: "To hook the getter of firebase authentication instance. (see https://firebase.google.com/docs/auth/android/start)",
                    search: {
                        type: ModelMethod.TYPE.getName(),
                        req: `method("enclosingClass.name:com.google.firebase.auth.FirebaseAuth").filter("name:getInstance")`
                    }
                }]
            };


            const newSet = {
                id: "Firebase",
                name: "Firebase v2",
                description: "Firebase API : authX, ...",
                prologue: `
                    function printTest2(){
                        // test
                        console.log("@@__CTX__@@");
                    }
                `,
                strategies: [{

                    name: "FirebaseAuth_getInstance",
                    descr: "To hook the getter of firebase authentication instance. (see https://firebase.google.com/docs/auth/android/start)",
                    search: {
                        type: ModelMethod.TYPE.getName(),
                        req: `method("enclosingClass.name:com.google.firebase.auth.FirebaseAuth").filter("name:getInstance")`
                    },
                    autoEmit: true,
                    emitEvent: "hook.firebase.auth.get",
                    before: `
                            let msg="";    
                            if(DXC.util.isInstanceOf(arg0,"com.google.firebase.FirebaseApp"))
                                msg = arg0;
                            else
                                msg = "<unknow>";
                
                
                            DXC.send(
                                "@@__HOOK_ID__@@",
                                "@@__FRAG_ID__@@",
                                {
                                    msg: msg
                                }
                            );
                    `
                },
                    {

                        name: "FirebaseAuth_getInstance_2",
                        search: {
                            type: ModelMethod.TYPE.getName(),
                            uid: [
                                "java.lang.String.$init()"
                            ]
                        },
                        autoEmit: true,
                        emitEvent: "hook.firebase.auth.get2",
                        after: `
                            let msg="";    
                            if(DXC.util.isInstanceOf(arg0,"com.google.firebase.FirebaseApp"))
                                msg = arg0;
                            else
                                msg = "<unknow>";
                
                
                            DXC.send(
                                "@@__HOOK_ID__@@",
                                "@@__FRAG_ID__@@",
                                {
                                    msg: msg
                                }
                            );
                    `
                    }]
            };


            const changes = HookSet.upgradeOptions(oldSet,newSet, UPGRADE_MODE.REPLACE);

            console.log(changes.data.strategies.changes);

            it('all changes applied', async function() {
                expect(Object.keys(changes.data).length).to.be.equal(4);
            });

            it('name updated', async function() {
                expect(oldSet.name).to.be.equal(newSet.name);
            });

            it('description updated', async function() {
                expect(oldSet.description).to.be.equal(newSet.description);
            });

            it('new strategies added, and old strategies removed', async function() {
                expect(oldSet.strategies.length).to.be.equal(2);
                expect(oldSet.strategies[0].name).to.be.equal("FirebaseAuth_getInstance");
                expect(oldSet.strategies[1].name).to.be.equal("FirebaseAuth_getInstance_2");
            });

            it('prologue updated', async function() {

                expect(oldSet.prologue).to.be.equal(
                    `
                    function printTest2(){
                        // test
                        console.log("@@__CTX__@@");
                    }
                `
                );
            });


            /*const newSet2:HookSetOptions = {
                id: "Firebase",
                name: "Firebase v3",
                description: "Firebase API : authX, ...",
                prologue: `
                    function printTest2(){
                        // test
                        console.log("@@__CTX__@@");
                    }
                `,
                strategies:[]
            };

            console.log(oldSet);
            //const changes2 = HookSet.upgradeOptions(oldSet,newSet2, UPGRADE_MODE.PRESERVATIVE);
            console.log(oldSet);
            console.log(changes2);*/
        });


    });
      
});