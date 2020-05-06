const HOOK = require("../../src/HookManager.js");
const Inspector = require("../../src/Inspector.js");
const InspectorFactory = require("../../src/InspectorFactory.js");



// ===== INIT =====

var NativeLibraryInspector = new InspectorFactory({

    startStep: Inspector.STEP.POST_APP_SCAN,

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
        hooks: [{
            when: HOOK.BEFORE,
            method: [
                "java.lang.System.load(<java.lang.String>)<void>",
                "java.lang.System.loadLibrary(<java.lang.String>)<void>",
            ],
            onMatch: function(ctx,event){
                ctx.getInspector("NativeLibrary").emits("hook.nativelib.inject",event);
            },
            interceptReplace: `
                    send({ 
                        id:"@@__HOOK_ID__@@", 
                        match: false, 
                        data: {path:arg0},
                        after: false, 
                        msg: "Native inspector (@@__METHSIGN__@@)", 
                        tags: [{
                            style:"success",
                            text: "native"
                        }], 
                        action: "None" 
                    });
        
                    try { 
                        const loaded = DEXC_MODULE.common.class.java.lang.Runtime.getRuntime().loadLibrary0(
                            DEXC_MODULE.common.class.dalvik.system.VMStack.getCallingClassLoader(), arg0); 
        
                        if(arg0 === 'MY_LIB') { 
                            /*
                            var mylib = Module.findBaseAddress("MY_LIB.so")
                            Interceptor.attach( ptr(mylib).add(0x1000), {
                                onEnter: function(args){
                                    send("ptrace bypassed");
                                    return 0;
                                },
                                onLeave: function(args){
                                    send("ptrace called => leave");
                                    return 0;
                                }
                            });
                            */
        
                            send({ 
                                id:"@@__HOOK_ID__@@", 
                                match: false, 
                                data: "'"+arg0+"' hooked",
                                after: true, 
                                msg: "Native inspector (@@__METHSIGN__@@)", 
                                tags: [{
                                    style:"success",
                                    text: "native"
                                }], 
                                action: "None" 
                            });
                        } 
                        return loaded; 
                    } catch(ex) { 
                        console.log(ex); 
                    } 
        
                send({ 
                    id:"@@__HOOK_ID__@@", 
                    match: false, 
                    data: "An error occured",
                    after: true, 
                    msg: "Native inspector (@@__METHSIGN__@@)", 
                    tags: [{
                        style:"success",
                        text: "native"
                    }], 
                    action: "None" 
                });
        
                return null;
            `
            },{
                when: HOOK.BEFORE,
                method: [
                    "java.lang.Runtime.load(<java.lang.String>)<void>",
                    "java.lang.Runtime.loadLibrary(<java.lang.String>)<void>"
                ],
                onMatch: function(ctx,event){
                    ctx.getInspector("NativeLibrary").emits("hook.nativelib.load", event);
                },
                interceptBefore: `
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
                `
            }

        ]
    },

    eventListeners: {
        "hook.nativelib.load": function(ctx,event){
            //todo
        }
    }
});


module.exports = NativeLibraryInspector;
