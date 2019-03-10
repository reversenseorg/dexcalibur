const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js");
const ut = require("../../src/Utils.js");


// ===== INIT =====

var DynLoaderInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "DynamicLoader",
        name: "Dynamic class loader inspector",
        description: "Update the application representation with Custom classloader and reflection data"
    })
});


// ===== CONFIG HOOKS =====

DynLoaderInspector.hookSet.require("Reflect");


// Define a shared struct (between hooks of this hookset)
DynLoaderInspector.hookSet.addHookShare({
    classloader: [],
    additionalDex: []
});

// prologue module
//KeystoreInspector.hookSet.require("StringUtils");
DynLoaderInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: "dalvik.system.DexFile.loadDex(<java.lang.String><java.lang.String><int>)<dalvik.system.DexFile>",
    onMatch: function(ctx,event){
        DynLoaderInspector.emits("hook.dex.load",event);
    },
    interceptBefore: `     
            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    arg0: arguments[0],
                    arg1: arguments[1],
                    arg2: arguments[2]
                },
                after: true, 
                msg: "DexFile.loadDex()", 
                action:"Log" 
            });
    `
});


DynLoaderInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: [
        "dalvik.system.DexFile.<init>(<java.io.File>)<void>",
        "dalvik.system.DexFile.<init>(<java.lang.String>)<void>",
    ],
    onMatch: function(ctx,event){
        DynLoaderInspector.emits("hook.dex.new",event);
    },
    interceptBefore: `     
            if(isInstanceOf(arg0,"java.io.File"))
                path = arg0.getAbsolutePath();
            else
                path = arg0;

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    path: path,
                },
                after: true, 
                msg: "DexFile.loadDex()", 
                action:"Log" 
            });
    `
});

/*
DynLoaderInspector.hookSet.addProbe({
    //when: HOOK.BEFORE,
    method: "android.os.Parcelable$ClassLoaderCreator.createFromParcel(<android.os.Parcel><java.lang.ClassLoader>)<java.lang.Object>",
    onMatch: function(ctx,event){
        ctx.bus.send({ 
            type: "hook.classloader.new", 
            data: event 
        });
    },
    interceptBefore: `    
            
            var parcel = arg0;
            var cll = arg1;

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    arg0: arguments[0],
                    arg1: arguments[1],
                }
                after: true, 
                msg: "ClassLoaderCreator.createFromParcel()", 
                action:"Log" 
            });
    `
});

/*
dalvik.system.DexFile.<init>(<java.io.File>)<void>
Probe OFF  intercept xref	Field	dalvik.system.DexFile.<init>(<java.lang.String>)<void>
*/


// ====== CONFIG TASK ====== 


DynLoaderInspector.on("hook.dex.load", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file loaded ");
    }
});
DynLoaderInspector.on("hook.dex.new", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file");
    }
});


module.exports = DynLoaderInspector;