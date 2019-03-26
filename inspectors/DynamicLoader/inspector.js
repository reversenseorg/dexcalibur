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

// add callback
/*
DynLoaderInspector.hookSet.addPrologue(`
    var @@__CTX__@@_invokeHooked = false;
    var meth_47fc55b2d470b2b68bef852491d2c0d8 = CLS.java.lang.reflect.Method.invoke.overload('java.lang.Object','[Ljava.lang.Object;');
    // var cls_d8ac3ffbea5e617f6890c7cda2ae76bd = Java.use('java.lang.reflect.Method');

    function @@__CTX__@@_startInvokeHooking(){

        //meth_47fc55b2d470b2b68bef852491d2c0d8 = CLS.java.lang.reflect.Method.invoke.overload('java.lang.Object','[Ljava.lang.Object;');
        
        
        meth_47fc55b2d470b2b68bef852491d2c0d8.implementation = function(arg0,arg1) {

            if(this.getName()=="b041B041B041BЛЛ041B"){
                send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                msg:"java.lang.reflect.Method.invoke([]) target", 
                data:{
                    v:"before"
                }, 
                action:"None before", after:false  });
                
                var o = Java.cast(this, CLS.java.lang.reflect.Method);
                var ret = meth_47fc55b2d470b2b68bef852491d2c0d8.call(this, arg0, arg1);

                send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                msg:"java.lang.reflect.Method.invoke([]) target", 
                data:{
                    v:"after"
                }, 
                action:"None before", after:false  });

                return ret
            }

            for(var x in this)
                send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                msg:"java.lang.reflect.Method.invoke([]) before", 
                data:{
                    v:x
                }, 
                action:"None before", after:false  });

            return meth_47fc55b2d470b2b68bef852491d2c0d8.call(this, arg0, arg1);

            /*
            send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
            msg:"java.lang.reflect.Method.invoke([]) after", 
            data:{test:"done"}, action:"None before", after:true  });
            
            return ret;*/
            /*
        };

        @@__CTX__@@_invokeHooked = true;
    }
`); 
*/

// Define a shared struct (between hooks of this hookset)
DynLoaderInspector.hookSet.addHookShare({
    classloader: [],
    additionalDex: []
});

// prologue module
//KeystoreInspector.hookSet.require("StringUtils");
DynLoaderInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: "java.lang.Class.getMethod(<java.lang.String><java.lang.Class>[])<java.lang.reflect.Method>",
    onMatch: function(ctx,event){
        DynLoaderInspector.emits("hook.reflect.get_method",event);
    },
    interceptAfter: `  
            var cls = Java.cast( ret.getDeclaringClass(), DEXC_MODULE.common.class.java.lang.Class);

            //var types = Java.array( this.getParameterTypes(), DEXC_MODULE.common.class.java.lang.Class);

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: false, 
                data: {
                    name: cls.getName()+"."+arg0,
                },
                after: true, 
                msg: "Class.getMethod()", 
                action: "Update" 
            });

            // if(!@@__CTX__@@_invokeHooked) @@__CTX__@@_startInvokeHooking();
    `
});

DynLoaderInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: "java.lang.Class.forName(<java.lang.String>)<java.lang.Class>",
    onMatch: function(ctx,event){
        DynLoaderInspector.emits("hook.reflect.get_class",event);
    },
    interceptAfter: `  

            //var cls = Java.cast( ret, DEXC_MODULE.common.class.java.lang.Class);

            //var types = Java.array( this.getParameterTypes(), DEXC_MODULE.common.class.java.lang.Class);

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: false, 
                data: {
                    name: arg0
                },
                after: true, 
                msg: "Class.forName()", 
                action: "Update" 
            });

            // if(!@@__CTX__@@_invokeHooked) @@__CTX__@@_startInvokeHooking();
    `
});

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

/**
 * Events below are trigged when the Analyzer found missing reference and 
 * ask to the dynamic loader to instrumente the method in order to discover
 * new elements.
 */
/*
DynLoaderInspector.on("app.missing.method", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector enable capturing hook");

    }
});
DynLoaderInspector.on("app.missing.class", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector enable capturing hooks");
    }
});*/

module.exports = DynLoaderInspector;