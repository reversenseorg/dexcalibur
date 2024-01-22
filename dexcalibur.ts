#!/usr/bin/env node
import * as _path_ from 'path';
import * as Process from 'process';
import ArgParser from './src/ArgUtils.js';


import DexcaliburEngine, {DexcaliburEngineMode, DexcaliburEngineOptions} from './src/DexcaliburEngine.js';

import * as _fs_ from "fs";
import * as _os_ from "os";
import * as Log from "./src/Logger.js";
import {Settings} from "./src/Settings.js";
import Util from "./src/Utils.js";
import {IStringIndex} from "./src/core/IStringIndex.js";

// Classic expert-oriented view
const DEFAULT_GUI:string = "dxc-web";

const LOG_FILE = (process.env.DXC_LOG_PATH ? process.env.DXC_LOG_PATH : null);
function __log( pMessage:string):void{
    if(LOG_FILE!=null)
        _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
}



var projectArgs:any = {
    ipc: false,
    ipcMode: 'API'
};

var Parser:ArgParser = new ArgParser(projectArgs, "dexcalibur", [
    { name:"--port", 
        help: "The web server port number",
        hasVal:true, 
        callback:(ctx,param)=>{ ctx.port = param.value; } },
    { name:"--port-ws",
        help: "The web socket port number",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.wsPort = param.value; } },
    { name:"--ws",
        help: "Workspace path",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.ws = param.value; } },
    { name:"--ui",
        help: "Change UI location (deprecated, see logs)",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.uipath = param.value; } },
    { name:"--save-cfg",
        help: "Save config is teh config is updated",
        hasVal:false,
        callback:(ctx,param)=>{ ctx.saveCfg = true; } },
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
        callback:(ctx,param)=>{ ctx.reinstall = true; } },
    { name:"--headless",
        help: "To serve REST API only. No GUI will be available.",
        hasVal:false,
        callback:(ctx,param)=>{ ctx.guiCfg = ""; } },
    { name:"--master-node",
        help: "To start engine as a MASTER node",
        hasVal:false,
        callback:(ctx,param)=>{ ctx.masterMode = true; } },
    { name:"--slave-node",
        help: "To start engine as a slave node",
        hasVal:false,
        callback:(ctx,param)=>{ ctx.slaveMode = true; } },
    { name:"--master-uri",
        help: "To set the URI of the MASTER node",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.masterURI = param.value; } },
    { name:"--master-ssl",
        help: "To enable SSL for SLAVE/MASTER communication channels",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.masterSSL = (param.value==='true'?true:false); } },
    { name:"--node-uid",
        help: "To set the UID of this node when the engine runs in SLAVE mode",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.slaveNodeUID = param.value; } },
    { name:"--node-pubk",
        help: "To set the public key of the MASTER",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.slaveNodeKey = param.value; } },
    { name:"--auth-settings",
        help: "To extend/override authentication settings ",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.overrideAuth = param.value; } },
    { name:"--offline",
        help: "Run in offline mode",
        hasVal:false,
        callback:(ctx,param)=>{ ctx.offline = true; } },
    { name:"--gui",
        help: "To expose one or more GUI over specified ports. Please use following format :  <GUI_NAME>:<HTTP_PORT>[:<extra>][,<GUI_NAME>:<HTTP_PORT>[:<extra>]]. Example: --gui=home:4200:ssl,expert:8080",
        hasVal:true,
        callback:(ctx,param)=>{ ctx.guiCfg = param.value; } }
]);

Parser.parse(Process.argv);


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


// web root
/**
 * @deprecated
 */
let dxcWebRoot:string = null;

let guiConfigString:string = DEFAULT_GUI;

if(projectArgs.uipath!==undefined){
    dxcWebRoot = (projectArgs.uipath[0]=='/'? projectArgs.uipath : _path_.join(Util.__dirname(import.meta.url), projectArgs.uipath));
}else{
    dxcWebRoot = null; //_path_.join(__dirname, 'src', 'webserver', 'src');
}

if(projectArgs.guiCfg!=null){
    guiConfigString = projectArgs.guiCfg
}

// prepare engine options
const engineOpts:DexcaliburEngineOptions = {};

// generic options
engineOpts.offline = (projectArgs.offline===true);

// mode-related options
if(projectArgs.slaveMode){
    console.log("------- MODE : SLAVE --------");
    engineOpts.engine_mode = DexcaliburEngineMode.SLAVE;
    engineOpts.node_uid = projectArgs.slaveNodeUID? projectArgs.slaveNodeUID : null;
    engineOpts.master_pub_key = projectArgs.slaveNodeKey? projectArgs.slaveNodeKey : null;

    if(projectArgs.masterURI!=null){
        engineOpts.master_opts = {
            uri: projectArgs.masterURI ? projectArgs.masterURI : null,
            ssl: projectArgs.masterSSL ? projectArgs.masterSSL : false
        };
    }else{
        engineOpts.master_opts = {
            uri: null,
            ssl: projectArgs.masterSSL ? projectArgs.masterSSL : false
        };
    }
}else if(projectArgs.masterMode){
    console.log("------- MODE : MASTER --------");
    engineOpts.offline = (projectArgs.offline===true);
}else{
    console.log("------- MODE : STANDALONE --------");
}



// create an empty single (not yet initialiazed) instance of engine
dxcInstance = DexcaliburEngine.getInstance(engineOpts);

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

        (async ()=>{
            // load global settings
            let cfg:Settings.GlobalSettings = Settings.GlobalSettings.load();
            if(projectArgs.ws != null){
                console.log("WS uopdated : "+cfg.getPath())
                cfg.getServerSettings().setWorkspace(projectArgs.ws);
                cfg.getServerSettings().save()
            }
            if(projectArgs.saveCfg){
                cfg.save();
                cfg = Settings.GlobalSettings.load(cfg.getPath());
            }


            // init engine with settings
            await dxcInstance.loadConfiguration(cfg);

            // override previously loaded config
            if(projectArgs.overrideAuth!=null){
                dxcInstance.getSettings().getServerSettings().getAuthenticationSettings().overrideWith(
                    JSON.parse(Util.b64_decode(projectArgs.overrideAuth)) as IStringIndex<any>, true
                );
            }

            // init service, sso, ...
            await dxcInstance.getUserService().getAuthenticationService().init();

            // boot engine
            ready = await dxcInstance.boot(
                projectArgs.restore===true? true : false,
                guiConfigString
            );

            if(ready){
                if(projectArgs.wsPort!=null){
                    dxcInstance.wsserver.setPort(projectArgs.wsPort);
                }

                dxcInstance.start((projectArgs.port!=null) ? projectArgs.port : null);
            }
        })();


    }

}




