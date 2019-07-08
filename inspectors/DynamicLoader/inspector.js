const Fs = require("fs");
const Path = require("path")

const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js");
const AnalysisHelper = require("../../src/AnalysisHelper.js");
const ut = require("../../src/Utils.js");


// ===== INIT =====

var DynLoaderInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "DynamicLoader",
        name: "Dynamic class loader inspector",
        description: "Update the application representation with Custom classloader and reflection data"
    })
});

DynLoaderInspector.useGUI();

DynLoaderInspector.registerTagCategory(
    "dynamic_loading",
    ["invoked","loaded"]
);
// ===== CONFIG HOOKS =====

DynLoaderInspector.hookSet.require("Common");
DynLoaderInspector.hookSet.require("Reflect");


// add callback
/*
DynLoaderInspector.hookSet.addPrologue(`
    var @@__CTX__@@_invokeHooked = false;
    var meth_47fc55b2d470b2b68bef852491d2c0d8 = CLS.java.lang.reflect.Method.invoke.overload('java.lang.Object','[Ljava.lang.Object;');
    
    function @@__CTX__@@_startInvokeHooking(){

        meth_47fc55b2d470b2b68bef852491d2c0d8.implementation = function(arg0,arg1) {

            var param = DEXC_MODULE.reflect.castArray( 
                DEXC_MODULE.common.class.java.lang.Object,
                arg1 );

            var paramCls = [], cls = null;

            for(var i in param){
                cls = Java.cast( param[i].getClass(), CLS.java.lang.Class);
                paramCls.push( cls.getName());
            }

            // thisRef: arg0.hashcode(),
            
                          
            send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                msg:"java.lang.reflect.Method.invoke([]) target", 
                data:{
                    method: DEXC_MODULE.reflect.getMethodSignature(this, this.getParameterTypes()),
                    param: paramCls,
                    before:1
                }, 
                action:"None before", after:false  });
            
            var ret = meth_47fc55b2d470b2b68bef852491d2c0d8.call(this, arg0, arg1);

            if(isIntanceOf(ret,"java.lang.String")){
                var str = Java.cast(ret, DEXC_MODULE.common.class.java.lang.String);
                send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                msg:"java.lang.reflect.Method.invoke([]) after", 
                data:{
                    ret:str.toString(),
                    before:0
                }, action:"None before", after:true  });
            }else{
                send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                msg:"java.lang.reflect.Method.invoke([]) after", 
                data:{
                    ret:"[Object]",
                    before:0
                }, action:"None before", after:true  });
            }

            
            return ret; 
        };

        @@__CTX__@@_invokeHooked = true;
    }
`); */


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
        DynLoaderInspector.emits("hook.reflect.method.get",event);
    },
    interceptReplace: `  
            var ret = meth_@@__METHDEF__@@.call(this, arg0, arg1);
            var cls = Java.cast( ret.getDeclaringClass(), DEXC_MODULE.common.class.java.lang.Class);
            
            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    s: DEXC_MODULE.reflect.getMethodSignature(ret,arg1),
                    __hidden__trace: DEXC_MODULE.common.getStackTrace()
                },
                after: true, 
                msg: "Class.getMethod()", 
                tags: [{
                    style:"purple",
                    text: "invoke"
                }], 
                action: "Update" 
            });

            //  if(!@@__CTX__@@_invokeHooked) @@__CTX__@@_startInvokeHooking();

            return ret;
    `
});

DynLoaderInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: "java.lang.Class.forName(<java.lang.String>)<java.lang.Class>",
    onMatch: function(ctx,event){
        DynLoaderInspector.emits("hook.reflect.class.get",event);
    },
    interceptAfter: `  

            //var cls = Java.cast( ret, DEXC_MODULE.common.class.java.lang.Class);

            //var types = Java.array( this.getParameterTypes(), DEXC_MODULE.common.class.java.lang.Class);

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    name: ret.getCanonicalName()
                },
                after: true, 
                msg: "Class.forName()", 
                tags: [{
                    style:"purple",
                    text: "dynamic"
                }], 
                action: "Update" 
            });
    `
});


/**
 * This hook is a custom hook, it means that all code is custom and manually
 * wrote. It is useful if you want create hook at runtime.
 * 
 * Its a delegate hook where the method is hooked if a condition into another hook
 */
/*
DynLoaderInspector.hookSet.addCustomHook({
    method: "java.lang.reflect.Method.invoke(<java.lang.Object><java.lang.Object>[])<java.lang.Object>",
    onMatch: function(ctx,event){
        DynLoaderInspector.emits("hook.reflect.method.call",event);
    },
    customCode: `  
        var @@__CTX__@@_invokeHooked = false;
        var meth_47fc55b2d470b2b68bef852491d2c0d8 = CLS.java.lang.reflect.Method.invoke.overload('java.lang.Object','[Ljava.lang.Object;');
        

        
        function @@__CTX__@@_startInvokeHooking(){

            meth_47fc55b2d470b2b68bef852491d2c0d8.implementation = function(arg0,arg1) {


                // ============ !! WARNING !! =================
                // Args parsing below introduce lof of instability
                // It can be commented
                // ========= !! END OF WARNING !! =================

                var param = DEXC_MODULE.reflect.castArray( 
                    DEXC_MODULE.common.class.java.lang.Object,
                    arg1 );
    
                var paramCls = [], cls = null;
    
                for(var i in param){
                    cls = Java.cast( param[i].getClass(), CLS.java.lang.Class);
                    paramCls.push( cls.getName());
                }
    
                              
                send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                    msg:"java.lang.reflect.Method.invoke([]) target", 
                    data:{
                        method: DEXC_MODULE.reflect.getMethodSignature(this, this.getParameterTypes()),
                        param: paramCls,
                        before:1
                    }, 
                    action:"None before", after:false  });
                
                var ret = meth_47fc55b2d470b2b68bef852491d2c0d8.call(this, arg0, arg1);
    
                if(isIntanceOf(ret,"java.lang.String")){
                    var str = Java.cast(ret, DEXC_MODULE.common.class.java.lang.String);
                    send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                    msg:"java.lang.reflect.Method.invoke([]) after", 
                    data:{
                        ret:str.toString(),
                        before:0
                    }, action:"None before", after:true  });
                }else{
                    send({ id:"ZDI5YmYxN2Y5YjViZjlhMDAzYmJjZDUwZjU1MjAxMzI=", 
                    msg:"java.lang.reflect.Method.invoke([]) after", 
                    data:{
                        ret:"[Object]",
                        before:0
                    }, action:"None before", after:true  });
                }
    
                
                return ret; 
            };

            @@__CTX__@@_invokeHooked = true;
        }
    `
});
*/


// dalvik.system.BaseDexClassLoader.findClass(<java.lang.String>)<java.lang.Class>
DynLoaderInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: "dalvik.system.BaseDexClassLoader.findClass(<java.lang.String>)<java.lang.Class>",
    onMatch: function(ctx,event){
        DynLoaderInspector.emits("hook.dex.find.class",event);
    },
    interceptAfter: `   
            // get classname
            var cls = Java.cast(ret, CLS.java.lang.Class);
            // collect methods
            // cls.getMethods();

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    cls: cls.getName()
                },
                after: true, 
                msg: "BaseDexClassLoader.findClass()", 
                tags: [{
                    style:"purple",
                    text: "dynamic"
                }], 
                action:"Log" 
            });
    `
});

// dalvik.system.DexClassLoader.<init>(<java.lang.String><java.lang.String><java.lang.String><java.lang.ClassLoader>)<void>
DynLoaderInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: "dalvik.system.DexClassLoader.<init>(<java.lang.String><java.lang.String><java.lang.String><java.lang.ClassLoader>)<void>",
    onMatch: function(ctx,data){
        // the evvent data contains the bytecode of the Dex file        
        DynLoaderInspector.emits("hook.dex.classloader.new",data);
    },
    interceptBefore: `   
    
            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    arg0: arguments[0],
                    arg1: arguments[1],
                    arg2: arguments[2],
                    __hidden__data: DEXC_MODULE.common.readFile(arguments[0])
                },
                after: true, 
                msg: "DexClassLoader.<init>()", 
                tags: [{
                    style:"purple",
                    text: "dynamic"
                }], 
                action:"Log" 
            });

    `
});


DynLoaderInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: "dalvik.system.DexFile.loadDex(<java.lang.String><java.lang.String><int>)<dalvik.system.DexFile>",
    onMatch: function(ctx,event){
        DynLoaderInspector.emits("hook.dex.load",event);
    },
    interceptBefore: `
    
            // DEXC_MODULE.common.copy(arguments[0], "dexfile.dex");

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
                tags: [{
                    style:"purple",
                    text: "dynamic"
                }], 
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

            
            // DEXC_MODULE.common.copy(path, "dexfile.dex");

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: false, 
                data: {
                    path: path,
                },
                after: false, 
                msg: "DexFile.<init>()", 
                tags: [{
                    style:"purple",
                    text: "dynamic"
                }], 
                action:"Log" 
            });
    `
});


DynLoaderInspector.hookSet.addProbe({
    method: "android.os.Parcelable$ClassLoaderCreator.createFromParcel(<android.os.Parcel><java.lang.ClassLoader>)<java.lang.Object>",
    onMatch: function(ctx,event){
       /* ctx.bus.send({ 
            type: "hook.classloader.new", 
            data: event 
        });*/
    },
    interceptBefore: `    
            
            var parcel = arg0;
            var cll = arg1;

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    classloader: "--" //arg1.getClass,
                }
                after: true, 
                msg: "ClassLoaderCreator.createFromParcel()", 
                tags: [{
                    style:"purple",
                    text: "dynamic"
                }], 
                action:"Log" 
            });
    `
});




// ====== CONFIG TASK ====== 


DynLoaderInspector.on("hook.dex.load", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file loaded ",event.data.path);
    }
});
DynLoaderInspector.on("hook.dex.new", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file", event.data.path);
        
    }
});
DynLoaderInspector.on("hook.reflect.class.get", {
    task: function(ctx, event){
        // get CFG
        //let db = ctx.analyze.db;

        // search if the method exists

        Logger.info("[INSPECTOR][TASK] DynLoaderInspector search Class ",event.data.signature);
    }
});
/*
 * Potential method call, this could be confirmed by several ways :
    - hook the function, inspect stack, confirm and locate Method.invoke
 */
DynLoaderInspector.on("hook.reflect.method.get", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector search Method ");

        //console.log(event);
        if(event == null || event.data == null || event.data.data == null) return false;
        let data  = event.data.data, caller = null, callers = null, methd = null;

        //console.log(data);
        meth = ctx.find.get.method(data.s);

        // find the callers by inspecting the stacktrace
        if(data.__hidden__trace.length > 2){
            callers = ctx.find.method("__signature__:^"+ut.RegExpEscape(data.__hidden__trace[1].cls+"."+data.__hidden__trace[1].meth+"("));
        
            //  if no result, do nothing
            // try to resolve reference (it may be an inherited method)
            if(callers.count() == 0) return false;

            // if more than one result, try to filter with filename/line number
            if(callers.count()>1){
                Logger.warn("[INSPECTOR][TASK] DynLoaderInspector search Method : there are more than one result");
            }else{
                caller = callers.get(0);
            }
        }else{
            //  no trace ==> try another heuristic
            if(callers.count() == 0) return false;

        }

        // not able to correlate (TODO : keep a track)
        if(caller == null || meth == null) 
            return false;

        // tag the method as "invoked dynamically"
        if(!meth.hasTag(AnalysisHelper.TAG.Invoked.Dynamically))
            meth.addTag(AnalysisHelper.TAG.Invoked.Dynamically);

        // update callers of the calleed methods
        meth.addCaller(caller);

        // , { tag: AnalysisHelper.TAG.Called.Dynamically }
        // update method used by the method performing the invoke
        call  = new CLASS.Call({
            caller: caller,
            calleed: meth,
            instr: null,
            line: data.__hidden__trace[2].line,
            tags: [AnalysisHelper.TAG.Invoked.Dynamically]
        });

        caller.addMethodUsed(meth, call);
    }
});

DynLoaderInspector.on("hook.dex.find.class",{
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector external class loaded dynamically ");
        if(event == null || event.data == null || event.data.data == null) return false;

        let data = event.data.data;
        let cls = ctx.find.get.class(data.cls);
        console.log(cls, data);
        
        if(cls == null){
            cls = ctx.analyze.addClassFromFqcn(data.cls);
        }
        

        if(!cls.hasTag(AnalysisHelper.TAG.Load.ExternalDyn))
            cls.addTag(AnalysisHelper.TAG.Load.ExternalDyn);
    }
});

DynLoaderInspector.on("hook.dex.classloader.new",{
    task: function(ctx, event){
        // 1. save gathered bytecode to a file
        // 2. disassemble this file 
        // 3. Analyze & update graph
        // 4. Workspace cleanup

        let rtWorkingDir = ctx.workspace.getRuntimeDir();
        let localDexFile = Path.join(rtWorkingDir, Path.basename(event.data.data.arg0));
        let stat = null, ignore=false;

        // check if file exist
        if(Fs.existsSync(localDexFile)){
            stat = Fs.lstatSync(localDexFile);
            if(stat.size==event.data.data.__hidden__data.length){
                 // TODO : then if it is identic do checksum
                 ignore = true;
                 return;
            }
        }

        if(ignore) return null;

        let data = Buffer.from(event.data.data.__hidden__data);

        Fs.open(localDexFile, 'w+', 0o666,  function(err,fd){
            if(err){
                console.log("TODO : An error occured when file is created ",err);
                return;
            }

            Fs.write(fd, data, function(err, written, buffer){
                if(err){
                    console.log("TODO : An error occured when file is written ",err);
                    return;
                }

                Fs.close(fd, function(err){
                    if(err){
                        console.log("TODO : An error occured when file is closed ",err);
                        return;
                    }

                    console.log("Start to disassemble "+localDexFile);

                    // disass file
                    ctx.dexHelper.disassembleFile(
                        localDexFile,
                        function(destFolder, err, stdout, stderr){
                            console.log("After disass called !");
                            if(err){
                                //todo
                            }else{
                                ctx.analyze.path(destFolder);
                            }

                            // remove tmp files
                        });
                });
            })
        })

        // 3. decompile resulting files
        // 4. update internal database

    }
})

DynLoaderInspector.on("hook.reflect.method.call", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector method invoked dynamically ");
        console.log(event);
        if(event == null || event.data == null || event.data.data == null) return false;
        let data  = event.data.data;

        console.log(data);
        let meth = ctx.find.get.method(data.s);
        console.log(data);

        /*
            let rettype = ctx.find.get.class(event.data.data.ret)

        // if meth == null, the method is unknow and the graph should be updated
        if(meth == null){
            let ref = new CLASS.Method();


            ref.setReturnType(event.data)
            

        }*/
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