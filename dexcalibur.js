#!/usr/bin/env node

const Process = require("process");
const FS = require("fs"); 
const ArgParser = require("./src/ArgUtils.js");


var err = null;
var projectArgs = {};

var Parser = new ArgParser(projectArgs, [
    { name:"--api", 
        help: "The Android API version to use. It should be one entry of platform_available config option.",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.api = param.value; } },
    { name:"--pull", 
        help: "To pull the APK file of the targeted application from the device",
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.pull = 1; } },
    { name:"--devices", 
        help: "To list connected devices",
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.devices = 1; } },
    { name:"--app", 
        help: "The targeted application name (if already analyzed)",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.app = param.value; } },
    { name:"--apk", 
        help: "The path to the target APK file",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.apk = param.value; } },
    { name:"--apk-stdin", 
        help: "Read the APK to analyze on STDIN",
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.apkStdin = 1; } },
    { name:"--port", 
        help: "The web server port number",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.port = param.value; } },
    { name:"--emu", 
        help: "Use emulated device",
        hasVal: false, 
        callback: (ctx,param)=>{ ctx.useEmu = true; } },
    { name:"--debug", 
        help: "Enable debug",
        hasVal: false, 
        callback: (ctx,param)=>{ ctx.debug = true; } },
    { name:"--config", 
        help: "The path to a custom config file. Default : ./config.js",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.config = param.value; } },
    { name:["--help","-h"], 
        help: "This menu",    
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.help = 1; } },
    { name:"--no-frida", 
        help: "To disable Frida part. It allows to run Dexcalibur to analyze purpose even if Frida is not installed",
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.nofrida = 1; } },
    { name:"--buildClass", 
        help: "To generate Frida script with a Java.use for each class contained into the specified package (see docs)",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.buildClass = param.value; } },
    { name:"--buildOut", 
        help: "The output directory",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.buildOut = param.value; } },
    { name:"--buildApi", 
        help: "To build the representation of the specified Android API",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.buildApi = param.value; } },
    { name:"--reinstall", 
        help: "To clear Dexcalibur configuration",
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.reinstall = true; } }
]);

Parser.parse(Process.argv);

const Logger_getInstance = require("./src/Logger.js");
var Logger = null;


if(projectArgs.debug){
    Logger = Logger_getInstance({
        testMode: false,
        debugMode: true
    },true);
}else{
    Logger = Logger_getInstance({
        testMode: false,
        debugMode: false
    },true);
}


const DexcaliburEngine = require("./src/DexcaliburEngine.js");

const DexcaliburProject = require("./src/Project.js");
const PlatformBuilder = require("./src/PlatformBuilder.js");
const Platform = require("./src/Platform.js");
const Configuration = require("./src/Configuration.js");


if(projectArgs.help != null){
    console.log(Parser.getHelp());
    Process.exit();
}

if(projectArgs.buildApi != null){
    let name = projectArgs.buildApi.split(":");
    let target = new Platform({
        name: name[0],
        version: name[1]
    });
    let cfg = new Configuration();
    cfg.import(require(projectArgs.config!=null?projectArgs.config:"./config.js"));

    let builder = new PlatformBuilder(cfg);
    builder.build(target);
}

var dxcInstance  = null, ready=false;

if(projectArgs.reinstall == true){
    DexcaliburEngine.clearInstall();
}
if( DexcaliburEngine.requireInstall() ){
    // pass 
    dxcInstance = new DexcaliburEngine();

    dxcInstance.prepareInstall( (projectArgs.port!=null) ? projectArgs.port : 8000);

    dxcInstance.start( projectArgs.port );
}
else{

    // start install mode if required ( file '~/.dexcalibur/config.json' not exists )

    if(projectArgs.api == null){
        projectArgs.api = "android:7.0.0";
    }

    if(projectArgs.app != null){    
    
        var project = null ;
        if(projectArgs.config != null){
            project = new DexcaliburProject(projectArgs.app, projectArgs.config, projectArgs.nofrida, projectArgs.api);
        }else{
            project = new DexcaliburProject(projectArgs.app, null, projectArgs.nofrida, projectArgs.api);
        }
    
        if(projectArgs.useEmu)
        project.useEmulator();
        
    
        if(projectArgs.pull != null){
            try{
                project.pull();
            }catch(exception){
                project.exit();
            }
        }
    
        if(projectArgs.apk != null){
            success = project.apkHelper.extract(projectArgs.apk);
            if(success===false){
                Logger.error("[!] Failed to extract data from the APK : ",projectArgs.apk).exit();
            }
        }
        else if(projectArgs.apkStdin != null){
    
            let apk_data = FS.readFileSync(0);
            projectArgs.apk = project.workspace.getWD()+"/base.apk"; 
            try{
                FS.writeFileSync(projectArgs.apk, apk_data);
                Logger.info("[*] Reading APK on stdin ...");
                success = project.apkHelper.extract(projectArgs.apk);
                if(success===false){
                    Logger.error("[!][STDIN] Failed to extract data from the APK : ",err).exit();
                }
    
            }catch(e){
                Logger.error("[!] An error occured while reading APK on STDIN : ",e);
            }
        }
    
        project.useAPI(projectArgs.api).fullscan();
    
        project.startWebserver(projectArgs.port);
    
        if(projectArgs.buildClass != null && projectArgs.buildOut != null){
            var res = project.find.class("name:"+projectArgs.buildClass);
            project.fridaBuilder.class(res).save(projectArgs.buildOut);
        }
    }else{
        dxcInstance = new DexcaliburEngine();

        dxcInstance.loadWorkspaceFromConfig();
        
        ready = dxcInstance.boot();
    
        if(ready){
            dxcInstance.start( projectArgs.port );
        }
    }
    
}




