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


if(projectArgs.help != null){
    console.log(Parser.getHelp());
    Process.exit();
}


var dxcInstance  = null, ready=false;

if(projectArgs.reinstall == true){
    DexcaliburEngine.clearInstall();
}
if( DexcaliburEngine.requireInstall() ){
    // pass 
    dxcInstance = DexcaliburEngine.getInstance();

    dxcInstance.prepareInstall( (projectArgs.port!=null) ? projectArgs.port : 8000);

    dxcInstance.start( projectArgs.port );
}
else{

    dxcInstance = DexcaliburEngine.getInstance();

    dxcInstance.loadWorkspaceFromConfig();
    
    ready = dxcInstance.boot();

    if(ready){
        dxcInstance.start( projectArgs.port );
    }
    
}




