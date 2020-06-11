const Fs = require("fs");
const Path = require("path")

const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");

const Inspector = require("../../src/Inspector.js");
const InspectorFactory = require("../../src/InspectorFactory.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js")();
const AnalysisHelper = require("../../src/AnalysisHelper.js");
const ut = require("../../src/Utils.js");
const DexHelper = require('../../src/DexHelper');


// ===== INIT =====

var DynLoaderInspector = new InspectorFactory({

    id: "DynamicLoader",
    name: "Dynamic class loader inspector",
    description: "Update the application representation with Custom classloader and reflection data",

    startStep: Inspector.STEP.POST_APP_SCAN,

    useGUI: true,

    db: {
        dbms: 'inmemory',
        type: 'index',
        name: 'dex'
    },

    tags: {
        "dynamic_loading": ["invoked", "loaded"]
    },

    color: 'purple',


    hookSet: {
        require: ["Common", "Reflect"],
        hookShare: {
            classloader: [],
            additionalDex: []
        },
        hooks: [
            {
                //when: HOOK.BEFORE,
                method: "java.lang.Class.getMethod(<java.lang.String><java.lang.Class>[])<java.lang.reflect.Method>",
                onMatch: function (ctx, event) {
                    ctx.getInspector("DynamicLoader").emits("hook.reflect.method.get", event);
                },
                interceptReplace: `  
                        var ret = meth_@@__METHDEF__@@.call(this, arg0, arg1);
                        var cls = Java.cast( ret.getDeclaringClass(), DEXC_MODULE.common.class.java.lang.Class);
                        
                        send({ 
                            id:"@@__HOOK_ID__@@", 
                            match: true, 
                            data: {
                                __meth__: DEXC_MODULE.reflect.getMethodSignature(ret,arg1),
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
            }, {
                //when: HOOK.BEFORE,
                method: "java.lang.Class.forName(<java.lang.String><boolean><java.lang.ClassLoader>)<java.lang.Class>",
                onMatch: function (ctx, event) {
                    ctx.getInspector("DynamicLoader").emits("hook.reflect.class.get", event);
                },
                interceptAfter: `  
            
                        //var clscl = Java.cast( arg2.getClass(), DEXC_MODULE.common.class.java.lang.Class);
            
                        //var types = Java.array( this.getParameterTypes(), DEXC_MODULE.common.class.java.lang.Class);
            
                        send({ 
                            id:"@@__HOOK_ID__@@", 
                            match: true, 
                            data: {
                                __class__: arg0.toString()
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
            }, {
                //when: HOOK.BEFORE,
                method: "dalvik.system.BaseDexClassLoader.findClass(<java.lang.String>)<java.lang.Class>",
                onMatch: function (ctx, event) {
                    ctx.getInspector("DynamicLoader").emits("hook.dex.find.class", event);
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
                                __class__: cls.getName()
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
            }, {
                //when: HOOK.BEFORE,
                method: "dalvik.system.DexClassLoader.<init>(<java.lang.String><java.lang.String><java.lang.String><java.lang.ClassLoader>)<void>",
                onMatch: function (ctx, data) {
                    // the evvent data contains the bytecode of the Dex file        
                    ctx.getInspector("DynamicLoader").emits("hook.dex.classloader.new", data);
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
            }, {
                //when: HOOK.BEFORE,
                method: "dalvik.system.DexFile.loadDex(<java.lang.String><java.lang.String><int>)<dalvik.system.DexFile>",
                onMatch: function (ctx, event) {
                    ctx.getInspector("DynamicLoader").emits("hook.dex.load", event);
                },
                variables: {
                    names: new HOOK.VariableArray([])
                },
                interceptBefore: `
                
                        var doCondition = true;
            
            
                        if(@@__VAR__@@.names.indexOf(arguments[0])>-1) 
                            doCondition = false;
                        
            
            
                        if(doCondition){
                            send({ 
                                id:"@@__HOOK_ID__@@", 
                                match: true, 
                                data: {
                                    dex: arguments[0],
                                    odex: arguments[1],
                                    arg2: arguments[2],
                                    isNew: true,
                                    __hidden__data: DEXC_MODULE.common.readFile(arguments[0])
                                },
                                after: false, 
                                msg: "DexFile.loadDex()", 
                                tags: [{
                                    style:"purple",
                                    text: "dynamic"
                                }], 
                                action:"Log" 
                            });
                        }else{
                            send({ 
                                id:"@@__HOOK_ID__@@", 
                                match: true, 
                                data: {
                                    dex: arguments[0],
                                    odex: arguments[1],
                                    arg2: arguments[2],
                                    isNew: false,
                                    __hidden__data: null
                                },
                                after: false, 
                                msg: "DexFile.loadDex()", 
                                tags: [{
                                    style:"purple",
                                    text: "dynamic"
                                }], 
                                action:"Log" 
                            });
                        }
            
                        
                `
            }, {
                //when: HOOK.BEFORE,
                method: [
                    "dalvik.system.DexFile.<init>(<java.io.File>)<void>",
                    "dalvik.system.DexFile.<init>(<java.lang.String>)<void>",
                ],
                onMatch: function (ctx, event) {
                    ctx.getInspector("DynamicLoader").emits("hook.dex.new", event);
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
            }/*,{
                method: "android.os.Parcelable$ClassLoaderCreator.createFromParcel(<android.os.Parcel><java.lang.ClassLoader>)<java.lang.Object>",
                onMatch: function(ctx,event){
                   
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
            }*/

        ]
    },

    eventListeners: {

        "hook.dex.load": function (ctx, event) {
            if (event.data.data.isNew == false) return null;

            let hook = ctx.hook.getHookByID(ut.b64_decode(event.data.hook));

            Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file loaded :\tDex: ", event.data.data.dex);

            // update variable for next time
            hook.getVariable('names').getData().push(event.data.data.dex);
        },

        "hook.dex.new": function (ctx, event) {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file", event.data.data.path);
        },

        "hook.reflect.class.get": function (ctx, event) {
            // get CFG
            //let db = ctx.analyze.db;

            // search if the method exists
            console.log(event.data);

            Logger.info("[INSPECTOR][TASK] DynLoaderInspector search Class ", event.data.data.signature);
        },

        "hook.reflect.method.get": function (ctx, event) {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector search Method ");

            //console.log(event);
            if (event == null || event.data == null || event.data.data == null) return false;
            let data = event.data.data, caller = null, callers = null, methd = null;

            //console.log(data);
            meth = ctx.find.get.method(data.__meth__);

            // find the callers by inspecting the stacktrace
            if (data.__hidden__trace != null && data.__hidden__trace.length > 2) {
                callers = ctx.find.method("__signature__:^" + ut.RegExpEscape(data.__hidden__trace[1].cls + "." + data.__hidden__trace[1].meth + "("));

                //  if no result, do nothing
                // try to resolve reference (it may be an inherited method)
                if (callers.count() == 0) {
                    Logger.info("Callers of '", data.__hidden__trace[1].cls + "." + data.__hidden__trace[1].meth, "' not found!");
                    return false;
                }

                // if more than one result, try to filter with filename/line number
                if (callers.count() > 1) {
                    Logger.warn("[INSPECTOR][TASK] DynLoaderInspector search Method : there are more than one result");
                } else {
                    //console.log(callers.get(0));
                    caller = callers.get(0);
                }
            } else {
                //  no trace ==> try another heuristic
                Logger.debug("No hidden trace");
                return false;

            }

            // not able to correlate (TODO : keep a track)
            if (caller == null || meth == null) {
                Logger.debug("Caller not found")
                return false;
            }

            // tag the method as "invoked dynamically"
            if (!meth.hasTag(AnalysisHelper.TAG.Invoked.Dynamically))
                meth.addTag(AnalysisHelper.TAG.Invoked.Dynamically);

            // update callers of the calleed methods
            // console.log('caller:',caller);
            meth.addCaller(caller);

            // , { tag: AnalysisHelper.TAG.Called.Dynamically }
            // update method used by the method performing the invoke
            call = new CLASS.Call({
                caller: caller,
                calleed: meth,
                instr: null,
                line: data.__hidden__trace[2].line,
                tags: [AnalysisHelper.TAG.Invoked.Dynamically]
            });

            caller.addMethodUsed(meth, call);

        },

        "hook.dex.find.class": function (ctx, event) {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector external class loaded dynamically ");
            if (event == null || event.data == null || event.data.data == null) return false;

            let data = event.data.data;
            let cls = ctx.find.get.class(data.__class__);
            //console.log(cls, data);

            if (cls == null) {
                cls = ctx.analyze.addClassFromFqcn(data.__class__);
            }


            if (!cls.hasTag(AnalysisHelper.TAG.Discover.Dynamically))
                cls.addTag(AnalysisHelper.TAG.Discover.Dynamically);
        },

        "hook.dex.classloader.new": function (ctx, event) {
            // 1. save gathered bytecode to a file
            // 2. disassemble this file 
            // 3. Analyze & update graph
            // 4. Workspace cleanup



            let rtWorkingDir = ctx.workspace.getRuntimeBcDir();
            let dexFileName = Path.basename(event.data.data.arg0);
            let localDexFile = Path.join(rtWorkingDir, dexFileName, dexFileName);
            let stat = null, ignore = false;
            let inspector = ctx.getInspector("DynamicLoader");

            Logger.info('Analyzing "'+dexFileName+'" at : '+localDexFile);

            // check if file exist
            if (Fs.existsSync(localDexFile)) {
                stat = Fs.lstatSync(localDexFile);

                if (stat.size == event.data.data.__hidden__data.length) {
                    // TODO : then if it is identic do checksum
                    ignore = true;
                    return;
                }
            }

            // create the folder where the dex file will be written
            if (!Fs.existsSync(Path.join(rtWorkingDir, dexFileName))) {
                Fs.mkdirSync(Path.join(rtWorkingDir, dexFileName));
            }

            if (ignore) return null;

            let data = Buffer.from(event.data.data.__hidden__data);

            Fs.open(localDexFile, 'w+', 0o666, function (err, fd) {
                if (err) {
                    Logger.error("TODO : An error occured when file is created ", err);
                    return;
                }

                Fs.write(fd, data, function (err, written, buffer) {
                    if (err) {
                        Logger.error("TODO : An error occured when file is written ", err);
                        return;
                    }

                    Fs.close(fd, function (err) {
                        if (err) {
                            Logger.error("TODO : An error occured when file is closed ", err);
                            return;
                        }

                        Logger.debug("Start to disassemble " + localDexFile);

                        // disass file
                        let destFolder = Path.join(rtWorkingDir, dexFileName, "smali");
                        (async function () {
                            let success = await DexHelper.disassemble(localDexFile, destFolder);

                            if (success != null) {
                                // do incremental static analysis  of destfolder
                                ctx.analyze.path(destFolder);
                                inspector.getDB().getIndex('dex').addEntry(new CLASS.File({
                                    name: dexFileName,
                                    path: localDexFile,
                                    remotePath: event.data.data.arg0
                                }));
                                inspector.save();
                            } else {
                                Logger.error('[DYNAMIC LOADER] Runtime DEX analysis failed.')
                            }
                        })();
                        /*
                        ctx.dexHelpers.disassembleFile(
                            localDexFile,
                            function(destFolder, err, stdout, stderr){
                                if(err){
                                    //todo
                                }else{
                                    ctx.analyze.path(destFolder);
                                    DynDB.getIndex('dex').addEntry(new CLASS.File({
                                        name: dexFileName,
                                        path: localDexFile,
                                        remotePath: event.data.data.arg0
                                    }));
                                    DynLoaderInspector.save();
                                }
    
                                // remove tmp files
                            });*/
                    });
                })
            })

            // 3. decompile resulting files
            // 4. update internal database

        },

        "hook.reflect.method.call": function (ctx, event) {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector method invoked dynamically ");
            //console.log(event);
            if (event == null || event.data == null || event.data.data == null) return false;
            let data = event.data.data;

            //console.log(data);
            let meth = ctx.find.get.method(data.s);
            //onsole.log(data);

            /*
                let rettype = ctx.find.get.class(event.data.data.ret)
    
            // if meth == null, the method is unknow and the graph should be updated
            if(meth == null){
                let ref = new CLASS.Method();
    
    
                ref.setReturnType(event.data)
                
    
            }*/
        },

        

        "dxc.fullscan.post_deploy": function (ctx, event) {
            Logger.info("[INSPECTOR][TASK] Trying to restore previous data of DynLoaderInspector ... ");
            let currentInspector = ctx.getInspector("DynamicLoader");

            currentInspector.restore();

            // generate hooks for every class which extend ClassLoader

            let classes = ctx.find.class("extends.name:ClassLoader");
            let meth = [];

            classes.foreach((pOffset,pCls) => {
                let m = pCls.getMethod({ name: '<init>' }, true);
                m.map(x=>{
                    meth.push(x);
                })
            });

            // remove already hooked methods from methods to hook
            let hooks = ctx.hook.getHooks();
            let validMethods = [];

            meth.map( vMethod => {
                if(!ctx.hook.isProbing(vMethod))
                    validMethods.push(vMethod.signature());
            })

            meth = null;

            if(validMethods.length > 0){
                currentInspector.hookSet.addIntercept({
                    //when: HOOK.BEFORE,
                    method: validMethods,
                    onMatch: function (ctx, event) {
                        console.log(event);
                        ctx.getInspector("DynamicLoader").emits("hook.classloader.new", event);
                    },
                    interceptBefore: `     
    
                            var data ={}; 
                            var path="", path2="";
    
                            for(var i=0; i<arguments.length; i++){
                                if(isInstanceOf(arguments[i],"java.io.File")){
                                    data['arg'+i] = arguments[i].getAbsolutePath();
                                    data['__hidden__targ'+i] = 'f';
                                }
                                else if(isInstanceOf(arguments[i],"java.net.URL")){
                                    data['arg'+i] = arguments[i].toString();
                                    data['__hidden__targ'+i] = 'u';
                                }
                                else{
                                    data['arg'+i] = arguments[i];
                                    data['__hidden__targ'+i] = 's';
                                }
                            }

                
                            send({ 
                                id:"@@__HOOK_ID__@@", 
                                match: false, 
                                data: data,
                                after: false, 
                                msg: "@@__FQCN__@@.@@__METHNAME__@@()", 
                                tags: [{
                                    style:"purple",
                                    text: "dynamic"
                                }], 
                                action:"trace" 
                            });
                        `
                });
                currentInspector.hookSet.deploy();
            }            
        }
    }
});




module.exports = DynLoaderInspector;