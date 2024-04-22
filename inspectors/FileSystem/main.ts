

// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import ModelMethod from "../../src/ModelMethod.js";

var FileSystemInspector:InspectorFactory = new InspectorFactory({

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

export default FileSystemInspector;