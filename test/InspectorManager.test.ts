import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper.js";
import InspectorFactory from "../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../src/Inspector.js";
import ModelMethod from "../src/ModelMethod.js";
import InspectorManager from "../src/InspectorManager.js";
import DexcaliburEngine from "../src/DexcaliburEngine.js";

describe('Inspector Manager', function() {

    // augment time limit
    //this.timeout(10000);

    let ENGINE = null;
    let PROJECT = null;

    before(async function() {
        //ENGINE = await TestHelper.getDexcaliburEngine()
        //PROJECT = TestHelper.getDexcaliburProject();
    });

    describe('constructor', function() {
        it('new instance', function () {
            let im:InspectorManager = new InspectorManager(null);
            expect(im.engine).to.be.null;
            im = new InspectorManager(ENGINE);
            expect(im.engine).to.be.an.instanceOf(DexcaliburEngine);
        });
    });

    describe('getInstance', function() {
        it('fresh', function (){
            let im:any = InspectorManager.getInstance(ENGINE);
            im.test = true;
            expect(im).to.be.an.instanceOf(InspectorManager);
        });
        it('old', function (){
            let im:any = InspectorManager.getInstance();
            expect(im).to.be.an.instanceOf(InspectorManager);
            expect(im.test).to.equals(true);
        });
    });

    describe('enumerate', function() {
        it('default', async function () {
            let im:InspectorManager = new InspectorManager(ENGINE);

            await im.enumerate();// todo
        });
    });



    describe('Upgrade of inspector', function() {


        const oldFactory = new InspectorFactory({

            startStep: INSPECTOR_TYPE.POST_APP_SCAN,

            useGUI: true,

            version: "1.0.0",
            hookSet: {
                id: "FileSystem",
                name: "File system inspector",
                description: "Track access to FS, data read/wrote and most of usages.",
                hookShare: {
                    fd: [],
                    stream: [],
                    refs: {}
                },
                strategies: [
                    {
                        name: "File_new_2",
                        descr: "To detect new File instance (2)",
                        search: {
                            type: ModelMethod.TYPE.getName(),
                            uid: [
                                "java.io.File.<init>(<java.io.File><java.lang.String>)<void>",
                                "java.io.File.<init>(<java.lang.String><java.lang.String>)<void>",
                            ]
                        },
                        autoEmit: true,
                        emitEvent: "hook.file.new",
                        before: `
                
                    let msg:any ={ arg0:"<null>", arg1:"<null>" }; 
            
                    if(arg0!=null){ 
                        if(DXC.util.isInstanceOf(arg0, "java.io.File")){
                            msg.arg0 = (arg0 as any).getAbsolutePath();
                        }
                        else if(DXC.util.isInstanceOf(arg0, "java.net.URI"))
                            msg.arg0 = arg0.toString();
                        else
                            msg.arg0 = arg0;
            
                    }
                    if(arg1!=null){
                        msg.arg1 = arg1;
                    }
            
                     DXC.send(
                         "@@__HOOK_ID__@@",
                         "@@__FRAG_ID__@@",
                          msg
                      );
                `
                    },{
                        name: "File_new_1",
                        descr: "To detect new File instance (1)",
                        search: {
                            type: ModelMethod.TYPE.getName(),
                            uid: [
                                "java.io.File.<init>(<java.lang.String>)<void>",
                                "java.io.File.<init>(<java.net.URI>)<void>"
                            ]
                        },
                        autoEmit: true,
                        emitEvent: "hook.file.new",
                        before: `
                
                    let msg:any ={ arg0:"<null>", arg1:"" }; 
            
                    if(arg0!=null){ 
                        if(DXC.util.isInstanceOf(arg0, "java.net.URI"))
                            msg.arg0 = arg0.toString();
                        else
                            msg.arg0 = arg0;
            
                    }
            
                     DXC.send(
                         "@@__HOOK_ID__@@",
                         "@@__FRAG_ID__@@",
                          msg
                      );
                `
                    }
                ]
            },

            eventListenerSources: {
                "dxc.fullscan.post_deploy": {
                    description: "Search any method/class/field from app code performing action with FS and tag it",
                    lang: "ts",
                    source: `
                const pCtx = pEvent.getContext();
                const hm = pEvent.getContext().getHookManager();
                const startName = "Custom_ClassLoaders";
                const dlInsp = pCtx.getInspector("DynamicLoader");
                let strat:HookStrategy;
                
                if(dlInsp!=null && dlInsp.getHookSet()!=null){
                    strat = dlInsp.getHookSet().getStrategyByName(startName);
                }
                
            `
                }
            }
        });


        const newFactory = new InspectorFactory({

            startStep: INSPECTOR_TYPE.POST_APP_SCAN,

            useGUI: true,

            version: "1.0.1",
            hookSet: {
                id: "FileSystem",
                name: "File system inspector : and more ...",
                description: "Track access to FS, data read/wrote and most of usages.",
                hookShare: {
                    fd: [],
                    stream: [],
                    xtra: {},
                },
                strategies: [
                    {
                        name: "File_new_1",
                        descr: "To detect new File instance",
                        search: {
                            type: ModelMethod.TYPE.getName(),
                            uid: [
                                "java.io.File.<init>(<java.lang.String>)<void>",
                                "java.io.File.<init>(<java.net.URI>)<void>",
                                "java.io.File.<init>(<java.net.URL>)<void>"
                            ]
                        },
                        autoEmit: true,
                        emitEvent: "hook.file.new",
                        before: `
                
                    let msg:any ={ arg0:"<null>", arg1:"" }; 
            
                    if(arg0!=null){ 
                        if(DXC.util.isInstanceOf(arg0, "java.net.URI"))
                            msg.arg0 = arg0.toString();
                        else
                            msg.arg0 = arg0;
            
                    }
            
                     DXC.send(
                         "@@__HOOK_ID__@@",
                         "@@__FRAG_ID__@@",
                          msg
                      );
                `
                    }
                ]
            },

            eventListenerSources: {
                "dxc.fullscan.post_deploy": {
                    description: "Search any method/class/field from app code performing action with FS and tag it",
                    lang: "ts",
                    source: `
                        const pCtx = pEvent.getContext();
                        const hm = pEvent.getContext().getHookManager();
                        const startName = "Custom_ClassLoaders";
                        const dlInsp = pCtx.getInspector("DynamicLoader");
                        let strat:HookStrategy;
                        
                        if(dlInsp!=null && dlInsp.getHookSet()!=null){
                            strat = dlInsp.getHookSet().getStrategyByName(startName);
                        }
                        
            `
                }
            }
        })

        let im:InspectorManager = new InspectorManager(null);

        let changes = im.upgradeFactory(oldFactory, newFactory);

        console.log(changes);
        it('default', async function () {
            expect(changes.factory._changes.length>0).to.equal(true);
        });
    });

});