

// ===== INIT =====
import * as _fs_ from 'fs';
import * as _path_ from 'path';

import InspectorFactory from "../../src/InspectorFactory";
import {INSPECTOR_TYPE} from "../../src/Inspector";
import DexcaliburProject from "../../src/DexcaliburProject";
import Event from "../../src/Event";
import {HookVariableArray} from "../../src/HookVariable";
import Util from "../../src/Utils";
import Hook from "../../src/Hook";
import ModelMethod from "../../src/ModelMethod";
import DexHelper from "../../src/DexHelper";
import {TAG} from "../../src/AnalysisHelper";
import * as Log from "../../src/Logger";
import ModelCall from "../../src/ModelCall";
import ModelFile from "../../src/ModelFile";
import {ModelLocation} from "../../src/ModelLocation";
import {DelegateWebApi} from "../../src/webapi/DelegateWebApi";
import WebServer from "../../src/WebServer";
import {AuthenticationException} from "../../src/errors/AuthenticationException";
import {DexcaliburProjectException} from "../../src/errors/DexcaliburProjectException";
import {Rules} from "../BytecodeCleaner/src/Rules";
import {DYNAMICLOADER_WEB_API} from "./src/main.web.api";
import {AbstractHook} from "../../src/hook/AbstractHook";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default new InspectorFactory({

    id: "DynamicLoader",
    name: "Dynamic class loader inspector",
    description: "Update the application representation with Custom classloader and reflection data",

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    webapi: DYNAMICLOADER_WEB_API,

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
        strategies: [
            {
                name: "Reflection_getMethod",
                descr: "To retrieve affected node when a method is retrieved from ReflectionAPI",
                search: {
                    type: ModelMethod.TYPE,
                    uid: "java.lang.Class.getMethod(<java.lang.String><java.lang.Class>[])<java.lang.reflect.Method>"
                },
                preprocessor: `
                    pCtx.getInspector("DynamicLoader").emits("hook.reflect.method.get", pEvent.data);
                `,
                /*onMatch: function (ctx:DexcaliburProject, event:Event) {
                    ctx.getInspector("DynamicLoader").emits("hook.reflect.method.get", event.data);
                },*/
                after: `  
                        // var ret = meth_@@__METHDEF__@@.call(this, arg0, arg1);
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
                name: "Reflection_Class.forName",
                descr: "To retrieve affected class when a class is retrieved from ReflectionAPI",
                search: {
                    type: ModelMethod.TYPE,
                    uid: "java.lang.Class.forName(<java.lang.String><boolean><java.lang.ClassLoader>)<java.lang.Class>"
                },
                /*onMatch: function (ctx:DexcaliburProject, event:Event):void {
                    ctx.getInspector("DynamicLoader").emits("hook.reflect.class.get", event.data);
                },*/
                preprocessor: `
                    pCtx.getInspector("DynamicLoader").emits("hook.reflect.class.get", pEvent.data);
                `,
                after: `  
            
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
                name: "DexCL_findClass",
                descr: "To detect class found explicitely",
                search: {
                    type: ModelMethod.TYPE,
                    uid: "dalvik.system.BaseDexClassLoader.findClass(<java.lang.String>)<java.lang.Class>",
                    // success: { obfuscation: +2 }
                },
                preprocessor: `
                    pCtx.getInspector("DynamicLoader").emits("hook.dex.find.class", pEvent.data);
                `,
               /* onMatch: function (ctx:DexcaliburProject, event:Event):void {
                    ctx.getInspector("DynamicLoader").emits("hook.dex.find.class", event.data);
                },*/
                after: `   
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
                name: "DexCL_new",
                descr: "To detect new Dex class loader",
                search: {
                  type: ModelMethod.TYPE,
                  uid: "dalvik.system.DexClassLoader.<init>(<java.lang.String><java.lang.String><java.lang.String><java.lang.ClassLoader>)<void>"
                },
                /* //method: "dalvik.system.DexClassLoader.<init>(<java.lang.String><java.lang.String><java.lang.String><java.lang.ClassLoader>)<void>",
                onMatch: function (ctx:DexcaliburProject, event:Event):void {
                    // the evvent data contains the bytecode of the Dex file        
                    ctx.getInspector("DynamicLoader").emits("hook.dex.classloader.new", event.data);
                },*/

                // the event data contains the bytecode of the Dex file
                preprocessor: ` 
                    pCtx.getInspector("DynamicLoader").emits("hook.dex.classloader.new", pEvent.data);
                `,
                before: ` 
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
                name: "Dex_loadExternal",
                descr: "To detect loading of external dex file",
                search: {
                    type: ModelMethod.TYPE,
                    uid: "dalvik.system.DexFile.loadDex(<java.lang.String><java.lang.String><int>)<dalvik.system.DexFile>"
                },
                /*
                onMatch: function (ctx:DexcaliburProject, event:Event):void{
                    ctx.getInspector("DynamicLoader").emits("hook.dex.load", event.data);
                },*/
                preprocessor: ` 
                    pCtx.getInspector("DynamicLoader").emits("hook.dex.load", pEvent.data);
                `,
                variables: {
                    names: new HookVariableArray([])
                },
                before: `
                
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
                name: "Dex_new",
                descr: "To detect new Dex file created explicitely",
                search: {
                    type: ModelMethod.TYPE,
                    uid: [
                        "dalvik.system.DexFile.<init>(<java.io.File>)<void>",
                        "dalvik.system.DexFile.<init>(<java.lang.String>)<void>",
                    ]
                },/*
                onMatch: function (ctx:DexcaliburProject, event:Event):void {
                    ctx.getInspector("DynamicLoader").emits("hook.dex.new", event.data);
                },
*/
                preprocessor: ` 
                    pCtx.getInspector("DynamicLoader").emits("hook.dex.new", pEvent.data);
                `,
                before: `     
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

        "hook.dex.load": function (ctx:DexcaliburProject, event:Event):void {
            Logger.info("hook.dex.load : ");
            Logger.info(JSON.stringify(event));

            if (event.data.isNew == false) return null;

            let hook = ctx.hook.getHookByID(Util.b64_decode(event.data.hook));

            Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file loaded :\tDex: ", event.data.dex);

            // update variable for next time
            hook.getVariable('names').getData().push(event.data.dex);
        },

        "hook.dex.new": function (ctx:DexcaliburProject, event:Event):void {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file", event.data.path);
        },

        "hook.reflect.class.get": function (ctx:DexcaliburProject, event:Event):void {
            // get CFG
            //let db = ctx.analyze.db;

            // search if the method exists

            Logger.info("[INSPECTOR][TASK] DynLoaderInspector search Class ", event.data.signature);
            //Logger.info(JSON.stringify(event));

        },

        "hook.reflect.method.get": function (ctx:DexcaliburProject, event:Event):boolean {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector search Method ");
            //Logger.info(JSON.stringify(event));

            //console.log(event);
            if (event == null || event.data == null) return false;

            let data:any = event.data, caller:ModelMethod = null, callers:any = null;
            let meth:ModelMethod;

            //console.log(data);
            meth = ctx.find.get.method(data.__meth__);

            // find the callers by inspecting the stacktrace
            if (data.__hidden__trace != null && data.__hidden__trace.length > 2) {
                callers = ctx.find.method("__signature__:^" + Util.RegExpEscape(data.__hidden__trace[1].cls + "." + data.__hidden__trace[1].meth + "("));

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
            if (!meth.hasTag(TAG.Invoked.Dynamically))
                meth.addTag(TAG.Invoked.Dynamically);

            // update callers of the calleed methods
            // console.log('caller:',caller);
            meth.addCaller(caller);

            // , { tag: TAG.Called.Dynamically }
            // update method used by the method performing the invoke
            let call:ModelCall = new ModelCall({
                caller: caller,
                calleed: meth,
                instr: null,
                line: data.__hidden__trace[2].line,
                tags: [TAG.Invoked.Dynamically]
            });

            caller.addMethodUsed(meth, call);

        },

        "hook.dex.find.class": function (ctx:DexcaliburProject, event:Event):boolean {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector external class loaded dynamically ");
            //Logger.info(JSON.stringify(event));
            if (event == null || event.data == null) return false;

            let data = event.data;
            let cls = ctx.find.get.class(data.__class__);
            //console.log(cls, data);

            if (cls == null) {
                cls = ctx.analyze.addClassFromFqcn(data.__class__);
            }


            if (!cls.hasTag(TAG.Discover.Dynamically))
                cls.addTag(TAG.Discover.Dynamically);
        },

        "hook.dex.classloader.new": function (ctx:DexcaliburProject, event:Event):void {
            // 1. save gathered bytecode to a file
            // 2. disassemble this file 
            // 3. Analyze & update graph
            // 4. Workspace cleanup



            if(event.data==null) return;


            let rtWorkingDir = ctx.workspace.getRuntimeBcDir();
            let dexFileName = _path_.basename(event.data.arg0);
            let localDexFile = _path_.join(rtWorkingDir, dexFileName, dexFileName);
            let stat = null, ignore = false;
            let inspector = ctx.getInspector("DynamicLoader");

            Logger.info('Analyzing "'+dexFileName+'" at : '+localDexFile+'(fsize:'+event.data.__hidden__data.length+')');
            //Logger.info(JSON.stringify(event.data));



            // check if file exist
            if (_fs_.existsSync(localDexFile)) {
                stat = _fs_.lstatSync(localDexFile);

                if (stat.size === event.data.__hidden__data.length) {
                    // TODO : then if it is identic do checksum
                    return;
                }
            }

            // create the folder where the dex file will be written
            if (!_fs_.existsSync(_path_.join(rtWorkingDir, dexFileName))) {
                _fs_.mkdirSync(_path_.join(rtWorkingDir, dexFileName));
            }

            Logger.info("Ignore dex file : "+(ignore? "TRUE":"FALSE"));
            //if (ignore) return null;

            let data = Buffer.from(event.data.__hidden__data);

            _fs_.open(localDexFile, 'w+', 0o666, function (err:any, fd:number) {
                if (err) {
                    Logger.error("TODO : An error occured when file is created ", err);
                    return;
                }

                _fs_.write(fd, data, function (err:any) {
                    if (err) {
                        Logger.error("TODO : An error occured when file is written ", err);
                        return;
                    }

                    _fs_.close(fd, function (err:any) {
                        if (err) {
                            Logger.error("TODO : An error occured when file is closed ", err);
                            return;
                        }

                        Logger.info("Start to disassemble " + localDexFile);

                        // disass file
                        let destFolder = _path_.join(rtWorkingDir, dexFileName, "smali");
                        (async function () {
                            let f:ModelFile;
                            try{
                                Logger.info("[DYNAMIC LOADER] Indexing DEX file");
                                f = new ModelFile({
                                    name: dexFileName,
                                    path: localDexFile,
                                    scope: ctx.dataAnalyzer.scopes.DYN_BYTECODE
                                });
                                ctx.bus.send(new Event({
                                    type: "file.new.DYN_BYTECODE",
                                    data: {
                                        file: f,
                                        rpath: event.data.arg0
                                    }
                                }));

                                inspector.getDB().getIndex('dex',null).addEntry(f);
                                inspector.save();


                                let success = await DexHelper.disassemble(localDexFile, destFolder);

                                if (success != null) {
                                    // do incremental static analysis  of destfolder
                                    ctx.analyze.path(destFolder, ModelLocation.fromFile(f));

                                    // attach dex file to discovered class as src file
                                    ctx.analyze.tagAllIf(
                                        function(k,x){
                                            return (x.hasTag(TAG.Discover.Internal)==false)
                                                && (x.hasTag(TAG.Discover.Statically)==false);
                                        },
                                        TAG.Discover.Dynamically);


                                    /*f = new ModelFile({
                                        name: dexFileName,
                                        path: localDexFile,
                                        remotePath: event.data.arg0
                                    });*/





                                    //inspector.getDB().getIndex('dex',null).addEntry(f);
                                    //inspector.save();


                                } else {
                                    Logger.error('[DYNAMIC LOADER] Runtime DEX analysis failed.')
                                }
                            }catch(err){
                                Logger.error('[DYNAMIC LOADER][ERROR] : '+err.message);
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

        "hook.reflect.method.call": function (ctx:DexcaliburProject, event:Event):boolean {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector method invoked dynamically ");
            Logger.info(JSON.stringify(event));

            //console.log(event);
            if (event == null || event.data == null) return false;
            let data = event.data;

            //console.log(data);
            // let meth = ctx.find.get.method(data.s);
            //onsole.log(data);

            /*
                let rettype = ctx.find.get.class(event.data.data.ret)
    
            // if meth == null, the method is unknow and the graph should be updated
            if(meth == null){
                let ref = new CLASS.Method();
    
    
                ref.setReturnType(event.data)
                
    
            }*/
        },

        

        "dxc.fullscan.post_deploy": function (ctx:DexcaliburProject, event:Event):void {
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
            let hooks:AbstractHook[] = ctx.hook.getHooks();
            let validMethods:ModelMethod[] = [];

            // TODO : instead of skipping hooks, it should merge hooks
            meth.map( vMethod => {
                if(!ctx.hook.isProbing(vMethod)) {
                    validMethods.push(vMethod.signature());
                }
            })

            meth = null;

            if(validMethods.length > 0){
                currentInspector.hookSet.addIntercept({
                    //when: HOOK.BEFORE,
                    method: validMethods,
                    onMatch: function (ctx:DexcaliburProject, event:Event):void {
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

            // subscribe

            // save dex file analyzed at runtime
            /*ctx.bus.subscribe(
                "file.post_scan.bcf",
                BusSubscriber.from( pEvent => {
                    Logger.info("Saaaaaaaaaaaaaavvvvveee ");
                    Logger.info(JSON.stringify(pEvent));

                    currentInspector.getDB().getIndex('dex').addEntry(pEvent.data);
                    currentInspector.save();
            }));*/
        }
    }
});

