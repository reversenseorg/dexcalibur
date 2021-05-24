#!/usr/bin/env node
import * as _path_ from 'path';
import * as Process from 'process';
import ArgParser from './src/ArgUtils.js';


import DexcaliburEngine from './src/DexcaliburEngine';

import * as _fs_ from "fs";
import * as _os_ from "os";


const LOG_FILE = (process.env.DXC_LOG_PATH ? process.env.DXC_LOG_PATH : null);



function __log( pMessage:string):void{
    if(LOG_FILE!=null)
        _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
}



var projectArgs:any = {
    ipc: false,
    ipcMode: 'API'
};

var Parser:ArgParser = new ArgParser(projectArgs, [
    { name:"--port", 
        help: "The web server port number",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.port = param.value; } },
    { name:"--ui",
        help: "Change UI location",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.uipath = param.value; } },
    { name:"--debug", 
        help: "Enable debug",
        hasVal: false, 
        callback: (ctx,param)=>{ ctx.debug = true; } },
    { name:"--ipc",
        help: "Enable IPC handlers",
        hasVal: false,
        callback: (ctx,param)=>{ ctx.ipc = true; } },
    { name:"--ipc-mode",
        help: "To set Dexcalibur behavior when IPC is enabled [ WAIT, API ]. If mode is 'WAIT' then program is commanded exclusively by IPC. Default: API   ",
        hasVal: true,
        callback: (ctx,param)=>{ ctx.ipcMode = param.value; } },
    { name:["--help","-h"], 
        help: "This menu",    
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.help = 1; } },
    { name:"--reinstall", 
        help: "To clear Dexcalibur configuration",
        hasVal:false, 
        callback:(ctx,param)=>{ ctx.reinstall = true; } }
]);

Parser.parse(Process.argv);


import * as Log from "./src/Logger";
import {Core} from "./src/Core";
import GlobalSettings = Core.Configuration.GlobalSettings;
import {Settings} from "./src/Settings";

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




if(projectArgs.help != null){
    console.log(Parser.getHelp());
    Process.exit();
}

__log('( =============================================== )')
__log('[DXC_SRV][ARGS] '+JSON.stringify(projectArgs));

var dxcInstance:DexcaliburEngine, ready:boolean=false;

let dxcWebRoot:string = null;
if(projectArgs.uipath!==undefined){
    dxcWebRoot = (projectArgs.uipath[0]=='/'? projectArgs.uipath : _path_.join(__dirname, projectArgs.uipath));
}else{
    dxcWebRoot = null; //_path_.join(__dirname, 'src', 'webserver', 'src');
}

// create an empty single (not yet initialiazed) instance of engine
dxcInstance = DexcaliburEngine.getInstance();

if(projectArgs.ipc == true){
    __log('[DXC_SRV][IPC] Enabled');
    // when IPC are enabled, engine will be initialized only if ipcMode is 'API'
    dxcInstance.enableIPC(projectArgs.ipcMode);
}else{
    __log('[DXC_SRV][IPC] Disabled');
}


__log('[DXC_SRV][IPC] Waiting for IPC message ...');
if( !projectArgs.ipc
    || (projectArgs.ipc && (projectArgs.ipcMode=='API') )){

    /*// TODO : replace by dexcalibur-installer
    if(projectArgs.reinstall == true){
        DexcaliburEngine.clearInstall();
    }*/

    if( DexcaliburEngine.requireInstall() ){
        // TODO : replace by dexcalibur-installer
        /*dxcInstance.prepareInstall(
            (projectArgs.port!=null) ? projectArgs.port : 8000,
            dxcWebRoot
        );

        dxcInstance.start(
            projectArgs.port,
            projectArgs.uipath!==undefined? projectArgs.uipath : null
        );*/
    }
    else{
        // load global settings
        const cfg:Settings.GlobalSettings = Settings.GlobalSettings.load();
        // init engine with settings
        dxcInstance.loadConfiguration(cfg);
        // boot engine
        ready = dxcInstance.boot(
            projectArgs.restore===true? true : false,
            dxcWebRoot
        );

        if(ready){
            dxcInstance.start((projectArgs.port!=null) ? projectArgs.port : null);
        }

    }

}




