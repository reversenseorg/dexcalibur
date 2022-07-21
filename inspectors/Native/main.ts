


// ===== INIT =====

import {INSPECTOR_TYPE} from "../../src/Inspector";
import InspectorFactory from "../../src/InspectorFactory";
import {HOOK_TYPE} from "../../src/hook/HookManager";
import BusEvent from "../../src/BusEvent";
import DexcaliburProject from "../../src/DexcaliburProject";
import ModelMethod from "../../src/ModelMethod";

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
                type: ModelMethod.TYPE,
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
            
            DXC.send({
                hid: "@@__HOOK_ID__@@",
                fid: "@@__FRAG_ID__@@",
                data: {
                    path: arg0,
                    when: 'before'
                }
            });
                    
        
            try { 
                const loaded = DEXC_MODULE.common.class.java.lang.Runtime.getRuntime().loadLibrary0(
                    DEXC_MODULE.common.class.dalvik.system.VMStack.getCallingClassLoader(), arg0); 

                if(arg0 === 'MY_LIB') { 
                
                    DXC.send({
                        hid: "@@__HOOK_ID__@@",
                        fid: "@@__FRAG_ID__@@",
                        data: {
                            path: arg0,
                            when: 'after_MY_LIB'
                        }
                    });
                } 
                return loaded; 
            } catch(ex) { 
                DXC.send({
                    hid: "@@__HOOK_ID__@@",
                    fid: "@@__FRAG_ID__@@",
                    data: {
                        err: ex,
                        when: 'error'
                    }
                });
                
                return null;
            } 
            `
            },{
                name: "load2",
                descr: "To detect loading of native library",
                search: {
                    type: ModelMethod.TYPE,
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
                
                    DXC.send({
                        hid: "@@__HOOK_ID__@@",
                        fid: "@@__FRAG_ID__@@",
                        data: {
                            path:arg0
                        },
                        msg: "@@__METHSIGN__@@"
                    });
                    /*
                    send({ 
                        id:"@@__HOOK_ID__@@", 
                        match: true, 
                        data: {path:arg0},
                        after: false, 
                        msg: "Native inspector (@@__METHSIGN__@@)", 
                        tags: [{
                            style:"success",
                            text: "native"
                        }], 
                        action:"None" 
                    });
                    */
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
