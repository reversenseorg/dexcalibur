


// ===== INIT =====

import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

var NativeLibraryInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    hookSet: {
        id: "NativeLibrary",
        name: "native library inspector",
        description: "Find and copy native library loaded at runtime",
        require: ["Common"],
        hookShare: {
            fd: [],
            stream: [],
            refs: {}
        },
        strategies: [{
            name: "load",
            descr: "To detect loading of native library",
            search: {
                type: ModelMethod.TYPE.getName(),
                uid: [
                    "java.lang.System.load(<java.lang.String>)<void>",
                    "java.lang.System.loadLibrary(<java.lang.String>)<void>",
                ]
            },

            autoEmit: true,
            emitEvent: "hook.nativelib.inject",
            /*
            preprocessor: ` 
                pCtx.getInspector("NativeLibrary").emits("hook.nativelib.inject",pEvent);
            `,/*
            onMatch: function(ctx:DexcaliburProject,event:Event):any{
                ctx.getInspector("NativeLibrary").emits("hook.nativelib.inject",event);
            },*/
            replace: `
            
            DXC.send(
                "@@__HOOK_ID__@@",
                "@@__FRAG_ID__@@",
                {
                    path: arg0,
                    when: 'before'
                }
            );
                    
        
            try { 
                const loaded = DXC.java().class.java.lang.Runtime.getRuntime().loadLibrary0(
                    DXC.java().class.dalvik.system.VMStack.getCallingClassLoader(), arg0); 

                if(arg0 === 'MY_LIB') { 
                
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        {
                            path: arg0,
                            when: 'after_MY_LIB'
                        }
                    );
                } 
                return loaded; 
            } catch(ex) { 
                DXC.send(
                "@@__HOOK_ID__@@",
                "@@__FRAG_ID__@@",
                    {
                        err: ex,
                        when: 'error'
                    }
                );
                
                return null;
            } 
            `
            },{
                name: "load2",
                descr: "To detect loading of native library",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: [
                        "java.lang.Runtime.load(<java.lang.String>)<void>",
                        "java.lang.Runtime.loadLibrary(<java.lang.String>)<void>"
                    ]
                },
                /*onMatch: function(ctx:DexcaliburProject,event:Event):any{
                    ctx.getInspector("NativeLibrary").emits("hook.nativelib.load", event);
                },
                preprocessor: ` 
                    pCtx.getInspector("NativeLibrary").emits("hook.nativelib.load",pEvent);
                `,*/
                autoEmit: true,
                emitEvent: "hook.nativelib.load",
                before: `
                
                    DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                        {
                            path:arg0,
                            __msg__:"@@__METHSIGN__@@"
                        }
                        
                    );
                `
            }

        ]
    },

    eventListeners: {
        "hook.nativelib.load": function(ctx:any,event:any):any{
            //todo
        }
    }
});

export  default NativeLibraryInspector;
