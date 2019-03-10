const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js")
const EventType = require("../../src/Event.js").TYPE;
const Logger = require("../../src/Logger.js");
const ut = require("../../src/Utils.js");


// ===== INIT =====

var NativeLibraryInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "NativeLibrary",
        name: "native library inspector",
        description: "Find and copy native library loaded at runtime"
    })
});


// == hook
NativeLibraryInspector.hookSet.require("Common");

// Define a shared struct s(between hooksFileDescriptorInspector of this hookset)
NativeLibraryInspector.hookSet.addHookShare({
    fd: [],
    stream: [],
    refs: {}
});

// prologue module
// FileDescriptorInspector.hookSet.require("Reflect");
// FileDescriptorInspector.hookSet.require("Common");


// add a hook intercepting the java.io.File constructors
NativeLibraryInspector.hookSet.addIntercept({
    when: HOOK.BEFORE,
    method: [
        "java.lang.System.load(<java.lang.String>)<void>",
        "java.lang.System.loadLibrary(<java.lang.String>)<void>",
    ],
    onMatch: function(ctx,event){
        NativeLibraryInspector.emits("hook.nativelib.inject",event);
    },
    interceptReplace: `
            send({ 
                id:"@@__HOOK_ID__@@", 
                match: false, 
                data: {path:arg0},
                after: false, 
                msg: "Native inspector (@@__METHSIGN__@@)", 
                action: "None" 
            });

            try { 
                const loaded = DEXC_MODULE.common.class.java.lang.Runtime.getRuntime().loadLibrary0(
                    DEXC_MODULE.common.class.dalvik.system.VMStack.getCallingClassLoader(), arg0); 

                if(arg0 === 'scm') { 
                    var libscm = Module.findBaseAddress("libscm.so")
                    Interceptor.attach( ptr(libscm+0x1180e68), {
                        onEnter: function(args){
                            send("ptrace bypassed");
                            return 0;
                        },
                        onLeave: function(args){
                            send("ptrace called => leave");
                            return 0;
                        }
                    });

                    send({ 
                        id:"@@__HOOK_ID__@@", 
                        match: false, 
                        data: "'"+arg0+"' hooked",
                        after: true, 
                        msg: "Native inspector (@@__METHSIGN__@@)", 
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
            action: "None" 
        });

        return null;
    `
});

NativeLibraryInspector.hookSet.addIntercept({
    when: HOOK.BEFORE,
    method: [
        "java.lang.Runtime.load(<java.lang.String>)<void>",
        "java.lang.Runtime.loadLibrary(<java.lang.String>)<void>"
    ],
    onMatch: function(ctx,event){
        NativeLibraryInspector.emits("hook.nativelib.load", event);
    },
    interceptBefore: `
        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: {path:arg0},
            after: false, 
            msg: "Native inspector (@@__METHSIGN__@@)", 
            action:"None" 
        });
    `
});



NativeLibraryInspector.on("hook.nativelib.load",{
    task: function(ctx,event){

        // new meth
        // get the Hook from the Hook backtrace message
        //var hook = ctx.hook.getHookByID(event.hook);
        // get the method from the hook
        //var meth = ctx.find.get.method(hook.getMethod().signature());

        //meth.
    }
});


module.exports = NativeLibraryInspector;
