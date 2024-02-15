

// ===== INIT =====
import * as _fs_ from 'fs';
import * as _path_ from 'path';

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import {HookVariableArray} from "../../src/HookVariable.js";
import Util from "../../src/Utils.js";
import ModelMethod from "../../src/ModelMethod.js";
import DexHelper from "../../src/DexHelper.js";
import * as Log from "../../src/Logger.js";
import ModelCall from "../../src/ModelCall.js";
import ModelFile from "../../src/ModelFile.js";
import {ModelLocation} from "../../src/ModelLocation.js";
import {DYNAMICLOADER_WEB_API} from "./src/main.web.api.js";
import HookStrategy from "../../src/hook/HookStrategy.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default new InspectorFactory({

    id: "DynamicLoader",
    name: "Dynamic class loader inspector",
    description: "Update the application representation with Custom classloader and reflection data",

    version: "1.0.0",
    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    webapi: DYNAMICLOADER_WEB_API,

    useGUI: true,

    db: {
        dbms: 'inmemory',
        type: 'index',
        name: 'dex'
    },

    tags: [
        {
            name:"dynamic_loading",
            _tagsOptions:[
                { name:"invoked"},
                { name:"loaded"},
            ]
        }
    ],

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
                    type: ModelMethod.TYPE.getName(),
                    uid: "java.lang.Class.getMethod(<java.lang.String><java.lang.Class>[])<java.lang.reflect.Method>"
                },
                autoEmit: true,
                emitEvent: "hook.reflect.method.get",
                after: `  
                        // var ret = meth_@@__METHDEF__@@.call(this, arg0, arg1);
                        let cls = Java.cast( ret.getDeclaringClass(), DXC.java().class.java.lang.Class);
                        
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                __meth__: DXC.java().getMethodSignature(ret,arg1),
                                __trace__: DXC.java().getStackTrace()
                            }
                        );
                `
            }, {
                name: "Reflection_Class.forName",
                descr: "To retrieve affected class when a class is retrieved from ReflectionAPI",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: "java.lang.Class.forName(<java.lang.String><boolean><java.lang.ClassLoader>)<java.lang.Class>"
                },
                autoEmit: true,
                emitEvent: "hook.reflect.class.get",
                after: `  
            
            
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                class: { __:DXC.NODE.CLASS, fqcn: (arg0 as any).toString() }
                            }
                        );
                        
                `
            }, {
                name: "DexCL_findClass",
                descr: "To detect class found explicitely",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: "dalvik.system.BaseDexClassLoader.findClass(<java.lang.String>)<java.lang.Class>",
                    // success: { obfuscation: +2 }
                },
                autoEmit: true,
                emitEvent: "hook.dex.find.class",
                /*preprocessor: `
                    pCtx.getInspector("DynamicLoader").emits("hook.dex.find.class", pEvent.data);
                `,
               /* onMatch: function (ctx:DexcaliburProject, event:Event):void {
                    ctx.getInspector("DynamicLoader").emits("hook.dex.find.class", event.data);
                },*/
                after: `   
                        let cls = Java.cast(ret, DXC.java().class.lang.Class);
            
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                class: { __:DXC.NODE.CLASS, fqcn: (cls as any).getName() }
                            }
                        );
                `
            }, {
                name: "DexCL_new",
                descr: "To detect new Dex class loader",
                search: {
                  type: ModelMethod.TYPE.getName(),
                  uid: "dalvik.system.DexClassLoader.<init>(<java.lang.String><java.lang.String><java.lang.String><java.lang.ClassLoader>)<void>"
                },
                autoEmit: true,
                emitEvent: "hook.dex.classloader.new",
                /* //method: "dalvik.system.DexClassLoader.<init>(<java.lang.String><java.lang.String><java.lang.String><java.lang.ClassLoader>)<void>",
                onMatch: function (ctx:DexcaliburProject, event:Event):void {
                    // the evvent data contains the bytecode of the Dex file        
                    ctx.getInspector("DynamicLoader").emits("hook.dex.classloader.new", event.data);
                },*/

                // the event data contains the bytecode of the Dex file
                /*preprocessor: `
                    pCtx.getInspector("DynamicLoader").emits("hook.dex.classloader.new", pEvent.data);
                `,*/
                before: ` 
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                arg0: arguments[0],
                                arg1: arguments[1],
                                arg2: arguments[2],
                                __hidden__data: DXC.java().readFile(arguments[0])
                            }
                        );
                        /*
                        send({ 
                            id:"@@__HOOK_ID__@@", 
                            match: true, 
                            data: {
                                arg0: arguments[0],
                                arg1: arguments[1],
                                arg2: arguments[2],
                                __hidden__data: DXC.java().readFile(arguments[0])
                            },
                            after: true, 
                            msg: "DexClassLoader.<init>()", 
                            tags: [{
                                style:"purple",
                                text: "dynamic"
                            }], 
                            action:"Log" 
                        });*/
                `
            }, {
                name: "Dex_loadExternal",
                descr: "To detect loading of external dex file",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: "dalvik.system.DexFile.loadDex(<java.lang.String><java.lang.String><int>)<dalvik.system.DexFile>"
                },
                /*
                onMatch: function (ctx:DexcaliburProject, event:Event):void{
                    ctx.getInspector("DynamicLoader").emits("hook.dex.load", event.data);
                },
                preprocessor: ` 
                    pCtx.getInspector("DynamicLoader").emits("hook.dex.load", pEvent.data);
                `,*/

                autoEmit: true,
                emitEvent: "hook.dex.load",
                variables: {
                    names: new HookVariableArray([])
                },
                before: `
                
                        let doCondition = true;
            
            
                        if(@@__VAR__@@.names.indexOf(arguments[0])>-1) 
                            doCondition = false;
                        
            
            
                        if(doCondition){
                        
                            DXC.send(
                                "@@__HOOK_ID__@@",
                                "@@__FRAG_ID__@@",
                                {
                                    dex: arguments[0],
                                    odex: arguments[1],
                                    arg2: arguments[2],
                                    isNew: true,
                                    __hidden__data: DXC.java().readFile(arguments[0])
                                }
                            );
                            
                            /*
                            send({ 
                                id:"@@__HOOK_ID__@@", 
                                match: true, 
                                data: {
                                    dex: arguments[0],
                                    odex: arguments[1],
                                    arg2: arguments[2],
                                    isNew: true,
                                    __hidden__data: DXC.java().readFile(arguments[0])
                                },
                                after: false, 
                                msg: "DexFile.loadDex()", 
                                tags: [{
                                    style:"purple",
                                    text: "dynamic"
                                }], 
                                action:"Log" 
                            });*/
                        }else{
                        
                            DXC.send(
                                "@@__HOOK_ID__@@",
                                "@@__FRAG_ID__@@",
                                {
                                    dex: arguments[0],
                                    odex: arguments[1],
                                    arg2: arguments[2],
                                    isNew: false,
                                    __hidden__data: null
                                }
                            );
                        
                        /*
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
                            });*/
                        }
            
                        
                `
            }, {
                name: "Dex_new",
                descr: "To detect new Dex file created explicitely",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: [
                        "dalvik.system.DexFile.<init>(<java.io.File>)<void>",
                        "dalvik.system.DexFile.<init>(<java.lang.String>)<void>",
                    ]
                },/*
                onMatch: function (ctx:DexcaliburProject, event:Event):void {
                    ctx.getInspector("DynamicLoader").emits("hook.dex.new", event.data);
                },
                preprocessor: ` 
                    pCtx.getInspector("DynamicLoader").emits("hook.dex.new", pEvent.data);
                `,*/
                autoEmit: true,
                emitEvent: "hook.dex.new",
                before: `     
                        let path:string;
                        if(DXC.util.isInstanceOf(arg0,"java.io.File"))
                            path = arg0.getAbsolutePath();
                        else
                            path = arg0;
            
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                dexFile: { __:DXC.NODE.FILE, path: path }
                            }
                        );
                        
                `
            }, {
                name: "DexFile_createCookie",
                descr: "To gather Dex buffer/file loaded dynamically",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: "dalvik.system.DexFile.createCookieWithArray(<byte[]><int><int>)<void>"
                },
                autoEmit: true,
                emitEvent: "hook.dex.buffer.new",
                /* //method: "dalvik.system.DexClassLoader.<init>(<java.lang.String><java.lang.String><java.lang.String><java.lang.ClassLoader>)<void>",
                onMatch: function (ctx:DexcaliburProject, event:Event):void {
                    // the evvent data contains the bytecode of the Dex file
                    ctx.getInspector("DynamicLoader").emits("hook.dex.classloader.new", event.data);
                },*/

                // the event data contains the bytecode of the Dex file
                /*preprocessor: `
                    pCtx.getDevice().pull(pEvent.data.)

                    pCtx.getInspector("DynamicLoader").emits("hook.dex.classloader.new", pEvent.data);
                `,*/
                before: ` 
                        // to prevent out of memory issue, byte array is wrote into application folder
                        // by the application itself
                
                        const d = '/data/data/@@__APP_NAME__@@';
                        let p = 'inmemory_'+end+'_'+Date.now()+'.dex';
                
                        let f:any = DXC.java().class.java.io.File.$new(d, p);
                        let fos:any = DXC.java().class.java.io.FileOuputStream.$new(f);
                        fos.write(arg0);
                        fos.close();
                
                        //send({ app_path: d+"/"+p });
                
                
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                __: DXC.NODE.FILE,
                                path: d+"/"+p,
                                arg2: arguments[2],
                                __hidden__data: DXC.java().readFile(arguments[0])
                            }
                        );
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

    eventListenerSources: {
        "dxc.fullscan.post_deploy": {
            source: `
                //Logger.info("[INSPECTOR][TASK] Trying to restore previous data of DynLoaderInspector ... ");
                console.log('Search class loader');
                const hm = pCtx.getHookManager();
                const startName = "Custom_ClassLoaders";
                const selfHS = pCtx.getInspector("DynamicLoader").getHookSet();
                let strat:HookStrategy = selfHS.getStrategyByName(startName);

                if(strat == null){
                    strat = HookStrategy.from({
                        name: startName,
                        description: "",
                        search: {
                            type: ModelMethod.TYPE.getName(),
                            req: 'method("enclosingClass.extends.name:ClassLoader").filter("name:<init>")'
                        },
                        autoEmit: true,
                        emitEvent: "hook.classloader.new",
                        before: 
                        'let data:any ={}; '+
                        'let path="", path2="";'+
                        'for(var i=0; i<arguments.length; i++){'+
                        '    if(DXC.util.isInstanceOf(arguments[i],"java.io.File")){'+
                        '        data['arg'+i] = { __:DXC.NODE.FILE, path:arguments[i].getAbsolutePath() };'+
                        '    }'+
                        '    else if(DXC.util.isInstanceOf(arguments[i],"java.net.URL")){'+
                        '       data['arg'+i] = { __:DXC.NODE.FILE, url:arguments[i].toString() };'+
                        '    }'+
                        '    else{'+
                        '        data['arg'+i] = { __:DXC.NODE.STRING, path:arguments[i] };'+
                        '    }'+
                        '}'+
                        ' '+
                        'DXC.send('+
                        '    "@@__HOOK_ID__@@",'+
                        '    "@@__FRAG_ID__@@",'+
                        '    data'+
                        ');'
                    });


                    selfHS.addStrategy(strat);

                    (async ()=>{
                        await strat.run(pCtx, false, true);
                    })
                }`,
            lang: "ts"
        }
    },
    eventListeners: {

        "hook.dex.load": function (ctx:DexcaliburProject, event:BusEvent<any>):void {
            Logger.info("hook.dex.load : ");
            Logger.info(JSON.stringify(event));

            if (event.data.isNew == false) return null;

            let hook = ctx.hook.getHookByID(Util.b64_decode(event.data.hook));

            Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file loaded :\tDex: ", event.data.dex);

            // update variable for next time
            hook.getVariable('names').getData().push(event.data.dex);
        },

        "hook.dex.new": function (ctx:DexcaliburProject, event:BusEvent<any>):void {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file", event.data.path);
        },

        "hook.reflect.class.get": function (ctx:DexcaliburProject, event:BusEvent<any>):void {
            // get CFG
            //let db = ctx.analyze.db;

            // search if the method exists

            Logger.info("[INSPECTOR][TASK] DynLoaderInspector search Class ", event.data.signature);
            //Logger.info(JSON.stringify(event));

        },

        "hook.reflect.method.get": function (ctx:DexcaliburProject, event:BusEvent<any>):boolean {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector search Method ");
            //Logger.info(JSON.stringify(event));

            //console.log(event);
            if (event == null || event.data == null) return false;

            const tmgr = ctx.getTagManager();
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
            const DYN_CALL_TAG = tmgr.getTag("code.call.dynamic");

            meth.addTag(DYN_CALL_TAG);

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
                tags: [DYN_CALL_TAG.getUUID()]
            });

            caller.addMethodUsed(meth, call);

        },

        "hook.dex.find.class": function (ctx:DexcaliburProject, event:BusEvent<any>):boolean {
            Logger.info("[INSPECTOR][TASK] DynLoaderInspector external class loaded dynamically ");
            //Logger.info(JSON.stringify(event));
            if (event == null || event.data == null) return false;

            let data = event.data;
            let cls = ctx.find.get.class(data.__class__);
            //console.log(cls, data);

            if (cls == null) {
                cls = ctx.analyze.addClassFromFqcn(data.__class__);
            }


            const DYN_CALL_TAG = ctx.getTagManager().getTag("code.call.dynamic");

            cls.addTag(DYN_CALL_TAG);
        },

        "hook.dex.classloader.new": function (ctx:DexcaliburProject, event:BusEvent<any>):void {
            // 1. save gathered bytecode to a file
            // 2. disassemble this file 
            // 3. Analyze & update graph
            // 4. Workspace cleanup



            if(event.data==null) return;

            const platform_tag = ctx.getTagManager().getTag("discover.internal");
            const sast_tag = ctx.getTagManager().getTag("discover.static");
            const dast_tag = ctx.getTagManager().getTag("discover.dynamic");

            const rtWorkingDir = ctx.workspace.getRuntimeBcDir();
            const dexFileName = _path_.basename(event.data.arg0);
            const localDexFile = _path_.join(rtWorkingDir, dexFileName, dexFileName);
            let stat = null;
            let ignore = false;
            const inspector = ctx.getInspector("DynamicLoader");

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
                                ctx.bus.send(new BusEvent({
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
                                        (k,x)=>{
                                            return (!platform_tag.match(x) && !sast_tag.match(x));
                                        },dast_tag);


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

        "hook.reflect.method.call": function (ctx:DexcaliburProject, event:BusEvent<any>):boolean {
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

        

        "dxc.fullscan.post_deploy": function (ctx:DexcaliburProject, event:BusEvent<any>):void {
            Logger.info("[INSPECTOR][TASK] Trying to restore previous data of DynLoaderInspector ... ");

            const hm = ctx.getHookManager();
            const startName = "Custom_ClassLoaders";
            const selfHS = ctx.getInspector("DynamicLoader").getHookSet();
            let strat:HookStrategy = selfHS.getStrategyByName(startName);

            if(strat == null){
                strat = HookStrategy.from({
                    name: startName,
                    description: "",
                    search: {
                        type: ModelMethod.TYPE.getName(),
                        req: `method("enclosingClass.extends.name:ClassLoader").filter("name:<init>")`
                    },
                    autoEmit: true,
                    emitEvent: "hook.classloader.new",
                    before: `
let data:any ={}; 
let path="", path2="";

for(var i=0; i<arguments.length; i++){
    if(DXC.util.isInstanceOf(arguments[i],"java.io.File")){
        data['arg'+i] = { __:DXC.NODE.FILE, path:arguments[i].getAbsolutePath() };
    }
    else if(DXC.util.isInstanceOf(arguments[i],"java.net.URL")){
        data['arg'+i] = { __:DXC.NODE.FILE, url:arguments[i].toString() };
    }
    else{
        data['arg'+i] = { __:DXC.NODE.STRING, path:arguments[i] };
    }
}

DXC.send(
    "@@__HOOK_ID__@@",
    "@@__FRAG_ID__@@",
    data
);
`

                });


                selfHS.addStrategy(strat);

                (async (vCtx)=>{
                    await strat.run(vCtx, false, true);
                })(ctx);
            }

        }
    }
});

