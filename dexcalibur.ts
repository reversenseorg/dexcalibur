#!/usr/bin/env node
import * as _path_ from 'path';
import * as Process from 'process';
import ArgParser from './src/ArgUtils.js';



var projectArgs:any = {};

var Parser:ArgParser = new ArgParser(projectArgs, [
  /*  { name:"--api", 
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
        callback:(ctx,param)=>{ ctx.apkStdin = 1; } },*/
    { name:"--port", 
        help: "The web server port number",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.port = param.value; } },
    { name:"--ui",
        help: "Change UI location",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.uipath = param.value; } },
   /* { name:"--emu", 
        help: "Use emulated device",
        hasVal: false, 
        callback: (ctx,param)=>{ ctx.useEmu = true; } },*/
    { name:"--debug", 
        help: "Enable debug",
        hasVal: false, 
        callback: (ctx,param)=>{ ctx.debug = true; } },
    /*{ name:"--config", 
        help: "The path to a custom config file. Default : ./config.js",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.config = param.value; } },*/
    { name:["--help","-h"], 
        help: "This menu",    
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.help = 1; } },
    /*{ name:"--no-frida", 
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
        callback:(ctx,param)=>{ ctx.buildApi = param.value; } },*/
    { name:"--reinstall", 
        help: "To clear Dexcalibur configuration",
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.reinstall = true; } }
]);

Parser.parse(Process.argv);


import * as Log from "./src/Logger";

var Logger:Log.Logger = null;


if(projectArgs.debug){
    Logger = Log.newLogger({
        testMode: false,
        debugMode: true
    },true);
}else{
    Logger = Log.newLogger({
        testMode: false,
        debugMode: false
    },true);
}


import DexcaliburEngine from './src/DexcaliburEngine';



if(projectArgs.help != null){
    console.log(Parser.getHelp());
    Process.exit();
}


var dxcInstance:DexcaliburEngine, ready:boolean=false;

let dxcWebRoot:string = null;
if(projectArgs.uipath!==undefined){
    dxcWebRoot = (projectArgs.uipath[0]=='/'? projectArgs.uipath : _path_.join(__dirname, projectArgs.uipath));
}else{
    dxcWebRoot = _path_.join(__dirname, 'src', 'webserver', 'src');
}

if(projectArgs.reinstall == true){
    DexcaliburEngine.clearInstall();
}
if( DexcaliburEngine.requireInstall() ){
    // pass 
    dxcInstance = DexcaliburEngine.getInstance();

    dxcInstance.prepareInstall(
        (projectArgs.port!=null) ? projectArgs.port : 8000,
        dxcWebRoot
    );

    dxcInstance.start(
        projectArgs.port,
        projectArgs.uipath!==undefined? projectArgs.uipath : null
    );
}
else{

    dxcInstance = DexcaliburEngine.getInstance();

    dxcInstance.loadWorkspaceFromConfig();
    
    ready = dxcInstance.boot(
        projectArgs.restore===true? true : false,
        dxcWebRoot
    );

    if(ready){
        dxcInstance.start((projectArgs.port!=null) ? projectArgs.port : 8000 );
    }
    
}




