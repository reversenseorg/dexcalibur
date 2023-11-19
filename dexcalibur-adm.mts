import * as _fs_ from "fs";
import * as _os_ from "os";
import * as _path_ from 'path';
import * as Process from 'process';
import chalk from "chalk";
import ArgParser from './src/ArgUtils.js';


import DexcaliburEngine from './src/DexcaliburEngine.js';
import {ConnectorFactory} from "./src/ConnectorFactory.js";
import * as Log from "./src/Logger.js";
import * as S from "./src/Settings.js";
import {AuthenticationSettings} from "./src/user/auth/AuthenticationSettings.js";
import {UserAccount} from "./src/user/UserAccount.js";
import Util from "./src/Utils.js";
import AccessControl from "./src/user/acl/AccessControl.js";
import {install} from "./src/install/Installer.js";
import DexcaliburRegistry from "./src/DexcaliburRegistry.js";
import {ConstraintType} from "./src/audit/common/Constraint.js";
import CodeConstraint from "./src/audit/common/CodeConstraint.js";
import {NodeInternalTypeName} from "./src/NodeInternalType.js";
import {UserSession} from "./src/user/session/UserSession.js";
import {LicenceManager} from "./src/credit/LicenceManager.js";
import {AuditManager} from "./src/audit/AuditManager.js";
import {AssuranceScanner} from "./src/audit/common/AssuranceScanner.js";
import DexcaliburProject from "./src/DexcaliburProject.js";
import { Merlin } from "./src/search/Merlin.js";
import * as VM from "vm";
import {MerlinSearchRequest} from "./src/search/MerlinSearchRequest.js";
import {ControlNode} from "./src/audit/common/AssuranceModel.js";
import Control from "./src/audit/common/Control.js";
import ControlAssessment from "./src/audit/common/ControlAssessment.js";
import { Match } from "./src/audit/common/AssuranceReport.js";
import AdbWrapperFactory from "./src/AdbWrapperFactory.js";
import AppPackage from "./src/AppPackage.js";
import Platform from "./src/Platform.js";
import { Device } from "./src/Device.js";
import  DeviceManager  from "./src/DeviceManager.js";
import {IStringIndex, Nullable} from "./src/core/IStringIndex.js";
import {DexcaliburProjectException} from "./src/errors/DexcaliburProjectException.js";
import {UserManager} from "./src/UserManager.js";
import {UserService} from "./src/user/UserService.js";
import PlatformManager from "./src/PlatformManager.js";
import {Workflow} from "./src/Workflow.js";


ConnectorFactory.getInstance(true);

enum PROJ_ACTION {
    READ,
    NEW
}

enum SUBMENU {
    NONE,
    GLOBAL,
    WEB,
    LOGS,
    USER,
    TEST,
    INSTALL,
    TOOLS,
    START,
    MODEL,
    MERLIN,
    DEVICE,
    PROJECT
}


const LOG_FILE = (process.env.DXC_LOG_PATH ? process.env.DXC_LOG_PATH : null);

function __log( pMessage:string):void{
    if(LOG_FILE!=null)
        _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
}



var projectArgs:any = {
    ipc: false,
    ipcMode: 'API'
};

var Parser:ArgParser = new ArgParser(projectArgs, "dexcalibur-adm", [
    { name:"server",
        help: "Global server settings",
        hasVal:false,
        options: [
            { name:"-l",
                help: "List informations from active sub menu",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.doList = true; }
            },{
                name:"--set-ws",
                help: "Set workspace path (not create a new one)",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.srvSetWS = param.value; }
            },{
                name:"--set-marketplace",
                help: "Set marketplace remote location (URI & API). To use official marketplace: --set-marketplace=official",
                hasVal:true,
                callback:(ctx,param)=>{
                    ctx.srvSetMP = true;
                    ctx.srvMP = param.value
                }
            },{
                name:"--create-home",
                help: "Create a new home. Use --create-home=<PATH>",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.srvCreateHome = param.value; }
            },{
                name:"--create-ws",
                help: "Create a new workspace. Use --create-ws=<PATH>",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.srvCreateWS = param.value; }
            },{
                name:"--heap-size",
                help: "Set heap size. Use --heap-size=<SIZE_MB>",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.srvHeapSize = param.value; }
            },{
                name:"--auth-support",
                help: "Set supported auth types. Use --auth-support=<COMMA_SEPARED_TYPE>",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.srvAuthSupport = param.value; }
            },{
                name:"--auth-db-uri",
                help: "Set URI of Auth DB. Use --auth-db-uri=<URI|STRING>",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.srvAuthDbUri = param.value; }
            },{
                name:"--http-port",
                help: "Set HTTP port where /api/ endpoints and GUIs are exposed",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.srvHttpPort = param.value; }
            },{
                name:"--ws-port",
                help: "Set Web Socket port used by GUIs",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.srvWsPort = param.value; }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.GLOBAL; }
    },

    {  name:"tools",
        help: "External tools management (required and plugins)",
        hasVal:false,
        options: [
            {
                name:"-l",
                help: "List configured tools",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.doList = true; }
            },{
                name:"--name",
                help: "Specify name",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.tName = param.value; }
            },{
                name:"--path",
                help: "Specify path to update. Require --name option",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.tPath = param.value; }
            },{
                name:"--check",
                help: "To check each",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.tCheck = true; }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.TOOLS; } },

    { name:"install",
        help: "Install operations",
        hasVal:false,
        options: [
            {
                name:"--auto",
                help: "Perform auto install. Default is online install (download dependencies)",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.iAuto = true; }
            },{
                name:"--online",
                help: "To force online install",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.iOnline = true; }
            },{
                name:"--offline",
                help: "To force offline install",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.iOnline = false; }
            },{
                name:"--server-only",
                help: "To force offline install",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.iServer = true; }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.INSTALL; } },

    { name:"start",
        help: "Start Dexcalibur server",
        hasVal:false,
        options: [
            {
                name:"--web-ui",
                help: "To enable web UI",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.sWUI = true; }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.START; } },

    { name:"devices",
        help: "perform actions on a connected devices",
        hasVal:false,
        options: [
            {
                name:"--bridge",
                help: "Bridge name : adb, sdb, ...",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.devBridge = param.value; }
            },
            {
                name:"--pull",
                help: "Pull a single or all apps",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.devPull = param.value; }
            },
            {
                name:"--out",
                help: "Output folder",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.devOut = param.value; }
            },{
                name:"-ls-app",
                help: "List apps",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.devLsApp = true; }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.DEVICE; } },

    { name:"project",
        help: "Start Dexcalibur server",
        hasVal:false,
        options: [
            {
                name:"--new",
                help: "To create a new project ",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.projAction = PROJ_ACTION.NEW; }
            },
            {
                name:"--uid",
                help: "Project name. --uid=<NAME>",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projUID = param.value; }
            },
            {
                name:"--os",
                help: "Target OS. Supported: android, ios, macos, tizen, fireos, webos",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projOS = param.value; }
            },
            {
                name:"--dev",
                help: "Device UID (see : device -ls)",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projDevice = param.value; }
            },
            {
                name:"--platform",
                help: "Platform UID (see : platform -ls)",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projPlatform = param.value; }
            },
            {
                name:"--arch",
                help: "Target Architecture. Supported: aarch64, aarch32, x64, x86, mips",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projArch = param.value; }
            },
            {
                name:"--app",
                help: "Path to targeted app. See documentation",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projApp = param.value; }
            },
            {
                name:"--user",
                help: "Path to targeted app. See documentation",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projUser = param.value; }
            },
            {
                name:"--gui",
                help: "GUI exposed. By default it run in headless mode.",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projGui = param.value; }
            },
            { name:"--auth-settings",
                help: "To extend/override authentication settings ",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.overrideAuth = param.value; } },
            {
                name:"--opts",
                help: "Options serialized as JSON object and encoded in base64. --opts=<ENCODED_OPTS>",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.projOpts = param.value; }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.PROJECT; } },

    { name:"merlin",
        help: "Test/explain Merlin rules",
        hasVal:false,
        options: [
            {
                name:"--rule",
                help: "Detection rule",
                hasVal:true,
                callback:(ctx,param)=>{
                    ctx.mlRule = param.value;
                }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.MERLIN; } },


    /*{ name:"gui",
        help: "GUI settings",
        hasVal:false,
        options: [
            {
                name:"--add-conn",
                help: "To set a connection",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.guiAddConn = param.value; }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.WEB; } },*/

    { name:"user",
        help: "User management",
        hasVal:false,
        options: [
            { name:"-l",
                help: "List informations from active sub menu",
                hasVal:true,
                callback:(ctx,param)=>{
                ctx.doList = true;
            }
            },{ name:"--update-pwd",
                help: "Change user password",
                hasVal:true,
                callback:(ctx,param)=>{ ctx.uipath = param.value; }
            },{ name:"--add-account",
                help: "Add a new user account",
                hasVal:true,
                callback:(ctx,param)=>{
                    ctx.addUser = param.value;
                }
            },{ name:"--del-account",
                help: "Delete a user account",
                hasVal:true,
                callback:(ctx,param)=>{
                    ctx.delUser = param.value;
                }
            },{ name:"--local",
                help: "Operate locally",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.local = true; }
            },{ name:"--list-roles",
                help: "List all user roles",
                hasVal:false,
                callback:(ctx,param)=>{ ctx.listRole = true; }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.USER; } },

    { name:"model",
        help: "Assurance model management",
        hasVal:false,
        options: [
            { name:"--privacy",
                help: "Print privacy model",
                hasVal:false,
                callback:(ctx,param)=>{
                    ctx.mPrintPriv = true;
                }
            },{ name:"--info",
                help: "List info about models",
                hasVal:false,
                callback:(ctx,param)=>{
                    ctx.mInfo = true;
                }
            },{ name:"--scan",
                help: "Perform scan using specified models",
                hasVal:false,
                callback:(ctx,param)=>{
                    ctx.mScan = true;
                }
            },{ name:"--print",
                help: "To print data",
                hasVal:false,
                callback:(ctx,param)=>{
                    ctx.mPrint = true;
                }
            },{ name:"--save",
                help: "To write the report to an output file.",
                hasVal:false,
                callback:(ctx,param)=>{
                    ctx.mSave = true;
                }
            },{ name:"--type",
                help: "Assurance model. Separated by comma. Example : --type=privacy",
                hasVal:true,
                callback:(ctx,param)=>{
                    ctx.mScanType = param.value;
                }
            },{ name:"--pkg",
                help: "Project name as in workspace.",
                hasVal:true,
                callback:(ctx,param)=>{
                    ctx.mPkg = param.value;
                }
            },{ name:"--user",
                help: "User name",
                hasVal:true,
                callback:(ctx,param)=>{
                    ctx.mUser = param.value;
                }
            },{ name:"--pwd",
                help: "User password",
                hasVal:true,
                callback:(ctx,param)=>{
                    ctx.mPwd = param.value;
                }
            },{ name:"--tree",
                help: "Show control point trees",
                hasVal:false,
                callback:(ctx)=>{
                    ctx.mShowTree = true;
                }
            },{ name:"--plan",
                help: "Show test plan",
                hasVal:false,
                callback:(ctx)=>{
                    ctx.mShowPlan = true;
                }
            },{ name:"--prepare-scan",
                help: "Prepare a scan",
                hasVal:false,
                callback:(ctx,param)=>{
                    ctx.mScan = true;
                }
            }
        ],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.MODEL; } },

    { name:"logs",
        help: "Log management",
        hasVal:false,
        options:[],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.LOGS; } },

    { name:"test",
        help: "Perform some functional tests",
        hasVal:false,
        options:[],
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.TEST; } },


    { name:"-h",
        help: "Print this help",
        hasVal:false,
        callback:(ctx,param)=>{ ctx.help = true; } },

    { name:"-b",
        help: "Batch mode",
        hasVal:false,
        callback:(ctx,param)=>{ ctx.batch = true; } },


    { name:"--restore",
        help: "Restore settings from backup",
        hasVal:true,
        callback:(ctx,param)=>{
           // ctx.restore = param.value;
        } },

    { name:"--home",
        help: "Dexcalibur home directory path",
        hasVal:true,
        callback:(ctx,param)=>{
            ctx.homePath = param.value;
        } },

    { name:"----debug",
        help: "Enable debug logs",
        hasVal:true,
        callback:(ctx,param)=>{
            ctx.debug = true;
        } },

    { name:"--config",
        help: "Optional. Path of configuration file. By default, the configuration file is searched at some predefined location",
        hasVal:true,
        callback:(ctx,param)=>{
            ctx.configPath = param.value;
        } },
]);

Parser.parse(Process.argv);


var Logger:Log.Logger = null;

/*
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
}*/

if(projectArgs.help != null){
    console.log(Parser.getHelp());
    Process.exit();
}

let cfg:S.Settings.GlobalSettings|null = null;


function printControls(pControl:Control, pDepth = 1):void {
    console.log(`${"\t".repeat(pDepth)} ${chalk.whiteBright("ID: ")} ${pControl.id}`);
    console.log(`${"\t".repeat(pDepth)} ${chalk.whiteBright("Name: ")} ${pControl.name}`);
    console.log(`${"\t".repeat(pDepth)} ${chalk.whiteBright("Description: ")} ${pControl.description}`);

    if(pControl.hasChildren()){
        console.log(`${"\t".repeat(pDepth)} Children: `);
        pControl.children.map(x => printControls(x, pDepth+1));
    }else{
        console.log(`${"\t".repeat(pDepth)} Assessment Control: `);
        pControl.assessments.map( x => {
            console.log(`${"\t".repeat(pDepth+1)} Name: ${x.name}`);
            console.log(`${"\t".repeat(pDepth+1)} Description: ${x.description}`);
            console.log(`${"\t".repeat(pDepth+1)} Rules: `);
            x.rules.map(y => console.log(`${"\t".repeat(pDepth+2)} ${y.toSearchString()}`));
        });
    }
}

/**
 * To load a configu
 */
function loadConfiguration(pPath:string|null, pArgs:any = null):S.Settings.GlobalSettings {
    let c:S.Settings.GlobalSettings|null = null;
    try{
        if(pPath!=null){
            c = S.Settings.GlobalSettings.load(pPath);
        }else{
            if(pArgs.configPath != null){
                c = S.Settings.GlobalSettings.load(pArgs.configPath);
            }
            else if(pArgs.homePath != null){
                c = S.Settings.GlobalSettings.load(_path_.join(pArgs.homePath, S.Settings.GLOBAL_CFG_NAME));
            }
            else{
                c = S.Settings.GlobalSettings.load();
            }
        }

    }catch (e ){
        console.log(chalk.red("An error occured during settings loading. "+e.message));
        console.log(e.stack);
        c = null;
    }
    return c;
}


// ======== load configuration ========
cfg = loadConfiguration(null, projectArgs);

if(cfg==null){
    console.log(chalk.red("Dexcalibur settings cannot be found or loaded."));
    Process.exit();
}else{
    console.log(chalk.green("Dexcalibur settings have been successfully loaded."));
}

// ======== Perform actions ========
switch (projectArgs.mode){
    /*case SUBMENU.WEB:
        if(projectArgs.setPort!=null){
            console.log(chalk.whiteBright("[-] Set workspace path to : "+projectArgs.setWS));
            cfg.getServerSettings().setWorkspace(projectArgs.setWS);
            cfg.getServerSettings().save()
            console.log(chalk.green("[*] Workspace path has been updated."));
        }
        break;*/
    case SUBMENU.TOOLS:
        if(projectArgs.doList){
            const settings:S.Settings.ExternalSettings = cfg.getExternalSettings();
            let str = "";

            if(settings==null){
                str = chalk.bold.red("[NONE]       <- Add required tools:  'dexcalibur-adm tools --name=<USERNAME> --path=<PATH|COMMAND>' ");

            }else{
                console.log(settings,settings.getAll());
            }
            console.log(str);
        }
        if(projectArgs.tName!=null && projectArgs.tPath != null){
            const settings:S.Settings.ExternalSettings = cfg.getExternalSettings();
            settings.add( projectArgs.tName, projectArgs.tPath);
        }
        break;
    /*case SUBMENU.WEB:
        if(projectArgs.guiAddConn){

        }
        break;*/

    case SUBMENU.DEVICE:
        let bridge:any;
        const settings:S.Settings.ExternalSettings = cfg.getExternalSettings();

        switch (projectArgs.devBridge){
            case "adb":
                bridge = AdbWrapperFactory.getInstance(settings.getTool("adb")).newGenericWrapper();
                if(projectArgs.devPull){
                    let apps:AppPackage[] = []
                    const out = (projectArgs.devOut ? projectArgs.devOut : process.cwd());
                    apps = bridge.listPackages('-f');

                    if(projectArgs.devPull=="*"){
                        apps.map( x => {
                            try{
                                bridge.pullApplication(x, out);
                            }catch(e){
                                console.error("Package '"+x.packageIdentifier+"' cannot be pull [path="+x.packagePath+"]");
                            }

                        });
                    }else{
                        const appids = projectArgs.devPull.split(',');
                        apps.map( x => {
                            if(appids.indexOf(x.packageIdentifier)>-1){
                                try{
                                    bridge.pullApplication(x, out);
                                }catch(e){
                                    console.error("Package '"+x.packageIdentifier+"' cannot be pull [path="+x.packagePath+"]");
                                }
                            }
                        });
                    }
                }
                if(projectArgs.devLsApp){
                    let apps:AppPackage[] = []
                    apps = bridge.listPackages('-f');

                    console.log('             Package Identifier               |             Path');
                    console.log('----------------------------------------------------------------');

                    apps.map( x => {
                        console.log(x.packageIdentifier+'   |   '+x.packagePath);
                    });
                }
                break;
        }
        break;
    case SUBMENU.START:
        let dxcWebRoot:string = null;
        if(projectArgs.sWUI){
            console.log(chalk.whiteBright("[-] Enable Web UI "));
            dxcWebRoot = projectArgs.sWUI;
        }

        (async function(){

            try{
                // create an empty single (not yet initialiazed) instance of engine+
                const dxcInstance = DexcaliburEngine.getInstance();

                /*if(projectArgs.uipath!==undefined){
                    dxcWebRoot = (projectArgs.uipath[0]=='/'? projectArgs.uipath : _path_.join(__dirname, projectArgs.uipath));
                }else{
                    dxcWebRoot = null; //_path_.join(__dirname, 'src', 'webserver', 'src');
                }*/

                // init engine with settings
                dxcInstance.loadConfiguration(cfg);

                // boot engine
                const ready = await dxcInstance.boot(
                    projectArgs.restore===true,
                    dxcWebRoot
                );

                if(ready){
                    dxcInstance.start();
                }
            }catch (err){
                console.log(chalk.red(err.message));
                console.log(chalk.red(err.stack));
            }
        })();

        break;
    case SUBMENU.INSTALL:
        if(projectArgs.iAuto){
            console.log(cfg);

            if(cfg.getServerSettings().getRegistry()==null){
                cfg.getServerSettings().setRegistry(new DexcaliburRegistry(
                    "https://github.com/FrenchYeti/dexcalibur-registry/raw/master/",
                    "https://api.github.com/repos/FrenchYeti/dexcalibur-registry/contents/"
                ));
                cfg.save();
            }

            install(
                (projectArgs.homePath!=null)? projectArgs.homePath : _path_.join(_os_.homedir(), ".dexcalibur"),
                cfg
            );
        }
        break;
    case SUBMENU.GLOBAL:
        if(projectArgs.doList){
            const srv = cfg.getServerSettings();
            const web = cfg.getWebserverSettings();
            let auth:AuthenticationSettings = srv.getAuthenticationSettings();
            let authStr = "";
            let regStr="";
            let ws:any = srv.getWorkspace();

            if(auth==null){
                authStr = chalk.bold.red("[NONE]       <- Create a new user by doing:  'dexcalibur-adm server --add-account=<USERNAME> --local' ");
            }else{
                authStr = `
${"\t".repeat(2)}db = ${auth.getDbString(3)}
${"\t".repeat(2)}policy = ${auth.getPolicyString(3)}
${"\t".repeat(2)}supported = ${auth.getSupportedString()}
${"\t".repeat(2)}oidc = ${auth.getOidcString(3)}
`;
            }
            if(ws==null){
                ws = chalk.bold.red("[NONE]       <- Create a new by doing:  'dexcalibur-adm server --create-ws=<PATH>' ");
            }
            else if(typeof ws!=="string"){
                ws = srv.getWorkspace().getLocation();
            }

            if(srv.getRegistry()==null){
                regStr = chalk.bold.red("[NONE]       <- Specify registry:  'dexcalibur-adm server --add-registry=<PATH>' ");
            }else{
                regStr = `
${"\t".repeat(2)}url= ${srv.getRegistry().url}
${"\t".repeat(2)}api= ${srv.getRegistry().api}
`;
            }



            console.log(chalk.whiteBright("[-] Global / Server settings "));
            console.log(chalk.white(`
${"\t".repeat(1)}Workspace = ${ws}
${"\t".repeat(1)}Authentication = ${authStr}
${"\t".repeat(1)}WebServer = 
${"\t".repeat(2)}HTTP Port = ${web.getHttpPort()}
${"\t".repeat(2)}WebSocket Port = ${web.getWsPort()}
${"\t".repeat(2)}SSL Enabled = FALSE
${"\t".repeat(1)}Registry = ${regStr}
${"\t".repeat(1)}HeapSize = ${srv.getHeapSize()}
${"\t".repeat(1)}Default Arch = ${srv.getDefaultArchitecture()}
`));
        }

        if(projectArgs.srvCreateHome!=null){
            try{
                console.log(chalk.whiteBright("[-] Create home : "+projectArgs.srvCreateHome));
                if(!_fs_.existsSync(projectArgs.srvCreateHome)){
                    console.log(chalk.whiteBright("[-] Creating folder "));
                    _fs_.mkdirSync(projectArgs.srvCreateHome);
                }
                console.log(chalk.whiteBright("[-] Dexcalibur's home created. "));
            }catch(e){
                console.log(chalk.red("[ERROR] Failed to create home : "+e.message));
                console.log(chalk.red(e.stack));
                process.exit()
            }
        }

        if(projectArgs.srvSetWS!=null){
            console.log(chalk.whiteBright("[-] Set workspace path to : "+projectArgs.setWS));
            cfg.getServerSettings().setWorkspace(projectArgs.setWS);
            cfg.getServerSettings().save()
            console.log(chalk.green("[*] Workspace path has been updated."));
        }

        if(projectArgs.srvSetMP){

            console.log(chalk.whiteBright("[-] Set marketplace URIs: "+projectArgs.srvMP));
            if(projectArgs.srvMP=="official"){
                cfg.getServerSettings().setRegistry(new DexcaliburRegistry(
                    "https://github.com/FrenchYeti/dexcalibur-registry/raw/master/",
                    "https://api.github.com/repos/FrenchYeti/dexcalibur-registry/contents/"
                ));
            }else{
                const p = projectArgs.srvMP.split(",");
                cfg.getServerSettings().setRegistry(new DexcaliburRegistry(p[0],p[1]));
            }

            cfg.getServerSettings().save()
            console.log(chalk.green("[*] Marketplace has been updated."));
        }

        if(projectArgs.srvCreateWS!=null){
            try{
                console.log(chalk.whiteBright("[-] Creating a new  workspace at : "+projectArgs.srvCreateWS));
                if(!_fs_.existsSync(projectArgs.srvCreateWS)){
                    _fs_.mkdirSync(projectArgs.srvCreateWS);
                }
                //const freshWS = new DexcaliburWorkspace(projectArgs.srvCreateWS);
                //freshWS.init();

                // create a workspace object, if no one exist
                cfg.getServerSettings().setWorkspace(projectArgs.srvCreateWS, true);
                cfg.getServerSettings().getWorkspace().init();
                cfg.getServerSettings().save();
                console.log(chalk.green("[*] Workspace path has been created and settings updated."));
            }catch(e){
                console.log(chalk.red("[ERROR] Failed to create new workspace : "+e.message));
                console.log(chalk.red(e.stack));
                process.exit()
            }
        }

        if(projectArgs.srvHttpPort!=null){
            console.log(chalk.whiteBright("[-] Set HTTP port to : "+projectArgs.srvHttpPort));
            const webSettings = cfg.getWebserverSettings();

            webSettings.sanitize("http", projectArgs.srvHttpPort);
            webSettings.update(
                webSettings.sanitize("http", projectArgs.srvHttpPort)
            );
            webSettings.save();
            console.log(chalk.green("[*] HTTP port has been updated."));
        }

        if(projectArgs.srvWsPort!=null){
            console.log(chalk.whiteBright("[-] Set WebSocket port to : "+projectArgs.srvWsPort));
            const webSettings = cfg.getWebserverSettings();

            webSettings.sanitize("ws", projectArgs.srvWsPort);
            webSettings.update(
                webSettings.sanitize("ws", projectArgs.srvWsPort)
            );
            webSettings.save();
            console.log(chalk.green("[*] WebSocket port has been updated."));
        }
        break;
    case SUBMENU.USER:
        if(projectArgs.doList){
            try{
                const auth = cfg.getServerSettings().getAuthenticationSettings();
                if(auth==null){
                    console.log(chalk.red("[ERROR] Authentication is not configured "));
                }else{
                    const dxcInstance = DexcaliburEngine.getInstance();

                    let dxcWebRoot:string = null;
                    if(projectArgs.uipath!=null){
                        dxcWebRoot = (projectArgs.uipath[0]=='/'? projectArgs.uipath : _path_.join(Util.__dirname(import.meta.url), projectArgs.uipath));
                    }else{
                        dxcWebRoot = null; //_path_.join(__dirname, 'src', 'webserver', 'src');
                    }

                    // init engine with settings
                    dxcInstance.loadConfiguration(cfg).then(()=>{

                        // list user
                        const usrList = dxcInstance.getUserService().getAuthenticationService().getUserIndex();

                        console.log(chalk.whiteBright("UserName | Locked | Role "));
                        usrList.map((vIndex:any, vUser:UserAccount)=>{
                            console.log(`  ${chalk.whiteBright(vUser.getUID())}  ${vUser.isLocked()? chalk.redBright("LOCKED"):chalk.redBright("VALID") }  ${chalk.yellow(vUser.getUserRole())} `);
                        });

                    })


                }
            }catch(e){
                console.log(chalk.red("[ERROR] Users cannot be listed : "+e.message+_os_.EOL+e.stack));
            }

        }

        if(projectArgs.addUser){
            try{
                const auth = cfg.getServerSettings().getAuthenticationSettings();
                if(auth.db==null){
                    console.log(chalk.yellow("[-] Authentication is not configured. Creating configuration ... "));
                    auth.db = {
                        dbms: 'sqlite',
                        uri: _path_.join( _os_.homedir(), '.dexcalibur','users.db'),
                        user: null,
                        pwd: null,
                        port: null
                    };
                    cfg.getServerSettings().save();
                    cfg = loadConfiguration(null, projectArgs);
                }

                console.log(chalk.yellow("[-] Starting server ... "));
                const dxcInstance = DexcaliburEngine.getInstance();

                let dxcWebRoot:string = null;
                if(projectArgs.uipath!=null){
                    dxcWebRoot = (projectArgs.uipath[0]=='/'? projectArgs.uipath : _path_.join(Util.__dirname(import.meta.url), projectArgs.uipath));
                }else{
                    dxcWebRoot = null; //_path_.join(__dirname, 'src', 'webserver', 'src');
                }

                // init engine with settings
                console.log(chalk.yellow("[-] Load configuration  ... "));
                dxcInstance.loadConfiguration(cfg);
                // list user
                const usrList = dxcInstance.getUserService();


                console.log(chalk.yellow("[-] Create user account ... "));

                const usr = new UserAccount({
                    username: projectArgs.addUser,
                    role: 'local_admin'
                });
                usr.newPassword(projectArgs.addUser);
                dxcInstance.getUserService().createUser(usr);
            }catch(e){
                console.log(chalk.red("[ERROR] Users cannot be listed : "+e.message+_os_.EOL+e.stack));
            }

        }

        if(projectArgs.listRole){
            try{

                console.log(chalk.yellow("[-] Starting server ... "));
                const dxcInstance = DexcaliburEngine.getInstance();
                // init engine with settings
                console.log(chalk.yellow("[-] Load configuration  ... "));
                dxcInstance.loadConfiguration(cfg);


                // boot engine
                const ready = dxcInstance.boot(
                    projectArgs.restore===true? true : false, null );

                console.log(chalk.yellow("[-] List roles ... "));

                const roles = AccessControl.getRoles();
                for(let k in roles){
                    console.log("\t"+roles[k].uid+"\t"+roles[k].name+"\t"+JSON.stringify(roles[k].access));
                }

            }catch(e){
                console.log(chalk.red("[ERROR] Roles cannot be listed : "+e.message+_os_.EOL+e.stack));
            }

        }
        break;
    case SUBMENU.LOGS:
        break;
    case SUBMENU.MODEL:
        let www:string|null = null;


        (async function(){

            try{
                // create an empty single (not yet initialiazed) instance of engine+
                const dxcInstance = DexcaliburEngine.getInstance();

                /*if(projectArgs.uipath!==undefined){
                    dxcWebRoot = (projectArgs.uipath[0]=='/'? projectArgs.uipath : _path_.join(__dirname, projectArgs.uipath));
                }else{
                    dxcWebRoot = null; //_path_.join(__dirname, 'src', 'webserver', 'src');
                }*/

                // init engine with settings
                dxcInstance.loadConfiguration(cfg);

                // boot engine
                const ready = await dxcInstance.boot(
                    projectArgs.restore===true? true : false,
                    www
                );

                if(ready){
                    dxcInstance.start();

                    if(projectArgs.mInfo){

                        const am = AuditManager.getInstance();
                        const mock = new DexcaliburProject(dxcInstance,".");

                        console.log(`[AUDIT] All Products available`);
                        const prod = LicenceManager.wallet[mock.getLicenseNo()];
                        for(let i in prod)
                            console.log(` - ${i} `);

                        console.log(`[AUDIT] All models available`);
                        const models = await am.listModels();

                        models.map(x => {
                            console.log(`=====================\n ${x.id} \n=====================\n`);
                            try{
                                console.log(`| Name : ${x.name}`);
                                console.log(`| Scanner : ${x.scannerID}`);
                                console.log(`| Descriptions : ${x.description}`);
                                console.log(`| Controls : `);
                                console.log("+----------")
                                x.controls.map( ctrl => printControls(ctrl));

                                /*
                                console.log(chalk.yellow(`\tThreats[${x.globalThreats.length}] PrimaryAssets[${x.primaryAssets.length}] SecondaryAssets[${x.secondaryAssets.length}]`));

                                console.log(chalk.yellowBright(`Threats : `));
                                x.globalThreats.map( vThreat => {
                                    let s = "";
                                    let r = "";
                                    vThreat.signature.map( vConstraint => {
                                        s += "";
                                        switch (vConstraint.type){
                                            case ConstraintType.CODE:
                                                s+=`\t\tCODE [${NodeInternalTypeName[(vConstraint as CodeConstraint).node]}] ${(vConstraint as CodeConstraint).pattern}\n`;
                                                break;
                                            case ConstraintType.ANY:
                                                s+=`\t\t  ANY [${vConstraint.name}]\n`;
                                                break;
                                            case ConstraintType.PHYSICAL:
                                                s+=`\t\t  PHYSICAL[${vConstraint.name}]\n`;
                                                break;
                                            case ConstraintType.UI:
                                                s+=`\t\t  UI [${vConstraint.name}]\n`;
                                                break;
                                            case ConstraintType.FLOW:
                                                s+=`\t\t  FLOW [${vConstraint.name}]\n`;
                                                break;
                                            default:
                                                s+=vConstraint.toJsonObject();
                                                break;
                                        }
                                    });

                                    vThreat.refs.map( vRef => {
                                        r += "\t\t"+vRef+"\n";
                                    });
                                    console.log(chalk.yellowBright(vThreat.name)+chalk.white(`\n\t[${vThreat.uid}]\n${r.length>0?"\tRefs :\n"+r+"\n":""}\tSignatures :\n${s}\n`));
                                });
                                console.log(chalk.yellowBright(`Primary Assets : `));*/
                            }catch(err){
                                console.log(chalk.red(`\tLoad failure`)+err.message+"\n"+err.stack);
                            }


                            try {
                                const scanner:AssuranceScanner = LicenceManager.getProduct(mock,x.getScannerID()) as AssuranceScanner;
                                console.log("________________________________________________");
                                console.log(chalk.whiteBright(`Scanner=${scanner !=null ? scanner.name : "null"} `));
                                console.log("________________________________________________");

                                scanner.setModel(x);
                                console.log(chalk.whiteBright("[*] Model : ")+chalk.yellowBright(x.getID()));

                                function printNode(vNode:ControlNode, vDepth:number){
                                    const i ="    ".repeat(vDepth);
                                    console.log("\n"+i+chalk.yellowBright(vNode.canonicalID)+" "+(vNode.ctrl!=null ? vNode.ctrl.name : ""));

                                    if((vNode.children!=null) && ((Object.keys(vNode.children).length>0))){
                                        console.log(i+"|_ Children: ");
                                        for(let k in vNode.children){
                                            printNode( vNode.children[k], vDepth+1);
                                        }
                                    }else if ( vNode.ctrl!= null){

                                        if(vNode.ctrl.isControlAssessment()){
                                            const a = (vNode.ctrl as ControlAssessment);

                                            if(a.testType==null){
                                                console.log(a);
                                            }
                                            console.log(i+"    "+chalk.redBright(` [${a.testType}] `));
                                            a.getRules().map((vRule)=>{
                                                console.log(i+"        "+chalk.greenBright(vRule.toSearchString()));
                                            });
                                        }
                                    }


                                }

                                if(projectArgs.mShowTree){
                                    console.log(chalk.whiteBright("[*] Control Tree :"));
                                    const rootNode = scanner.model.getControlNode("*");
                                    console.log(rootNode);
                                    printNode(rootNode, 0);
                                }

                                if(projectArgs.mShowPlan){
                                    console.log(chalk.whiteBright("[*] Test plan :"));

                                    const plan = scanner._prepareTestPlan();

                                    plan.steps.map((vStep, vIndex)=>{
                                        console.log(chalk.redBright(` [${vStep.type}] `)+chalk.white("Controls :"));
                                        vStep.controls.map((vCtrl)=>{
                                            printNode(vCtrl, 1);
                                        })
                                    })
                                }

                                console.log("________________________________________________");
                            }catch(err){
                                console.log(chalk.red(`\tScanner not found : ${err.message}`)+err.stack);
                            }
                        });
                    }

                    if(projectArgs.mPkg){
                        let usrSess:UserSession;
                        if(projectArgs.mUser){
                             usrSess = dxcInstance
                                .getUserService()
                                .do1StepPasswordAuthentication(
                                    projectArgs.mUser,
                                    projectArgs.mPwd
                                );
                        }else{
                            throw new Error("Please provide user credentials");
                        }

                        // create a workflow in engine
                        const wf = dxcInstance.newWorkflow(projectArgs.mPkg).changeOwner(usrSess.getUserAccount());

                        const dxcProject = await dxcInstance.openProject( usrSess.getUserAccount(), projectArgs.mPkg);

                        if(dxcProject.isReady()){
                            if(projectArgs.mScan){

                                const am = AuditManager.getInstance();

                                projectArgs.mScanType.split(',').map( async (vModelName) => {
                                    console.log(`[AUDIT] Get model [${vModelName}] ...`);
                                    const model = await am.getModel(dxcProject, vModelName);

                                    console.log(`[AUDIT] Search scanner for model [${vModelName}] ...`);
                                    const scanner:AssuranceScanner = LicenceManager.getProduct(dxcProject,model.getScannerID()) as AssuranceScanner;

                                    scanner.setModel(model);

                                    console.log(`[AUDIT] Start scanner [scanner=${scanner.name}][model=${scanner.model.name}] ...`);
                                    scanner.run(dxcProject, {});
                                    console.log(`[AUDIT] Scan done. `);

                                    const report = scanner.getReport();

                                    if(projectArgs.mSave===true && report!=null){
                                        console.log(`[AUDIT] Saving report in project workpspace ...`);
                                        const reppath = am.saveReport(dxcProject, report);
                                        console.log(`[AUDIT] Report saved in : ${reppath} `);
                                    }
                                    if(projectArgs.mPrint===true){

                                        console.log(`[AUDIT] Results : `);
                                        let match:Match, ctrlNode:ControlNode;
                                        console.log(Object.values(report.matches).length);
                                        for(let key in report.matches){
                                            console.log(key);
                                            match = report.matches[key];

                                            ctrlNode = model.getControlNode(match.assessment.canonicalID);

                                            console.log(chalk.bold.whiteBright(match.assessment.parent?.ctrl.name));
                                            console.log("   "+chalk.bold.whiteBright(match.assessment.ctrl.name));
                                            console.log("   "+chalk.yellowBright('Canonical ID')+" "+match.assessment.canonicalID);
                                            console.log("   "+chalk.yellowBright('Matches ('+match.match.length+')'));

                                            match.match.map((m) => {

                                                if(ctrlNode.ctrl.isControlAssessment()){
                                                    const rules = (ctrlNode.ctrl as ControlAssessment).getRules();
                                                    console.log("   "+chalk.yellowBright( rules[m.ruleIdx].toSearchString()));
                                                }
                                                console.log("   "+chalk.greenBright(m.node.getUID())+" ");
                                            });
                                        }
                                    }
                                })

                                /*
                                switch(projectArgs.mScanType){
                                    case "privacy":
                                        console.log("Start Privacy scanning ...");;
                                        const privScan:PrivacyScanner = LicenceManager
                                            .getProduct(dxcProject,"PRI_CLD_SSCAN") as PrivacyScanner;

                                        const report = privScan.runModel(dxcProject);
                                        console.log(JSON.stringify(report.toJsonObject()));

                                        if(projectArgs.mOut!=null){
                                            console.log("Saving scanner report to : "+projectArgs.mOut);
                                            report.save(projectArgs.mOut);
                                        }

                                        break;
                                }*/
                            }
                        }

                    }


                    /*if(projectArgs.mPrintPriv){
                        console.log(chalk.yellow("[-] Load Privacy model : "));
                        const model:PrivacyModel = new PrivacyModel();
                        model.load()
                        console.log(chalk.yellow("[-] Privacy Assurance model : "));
                        console.log(chalk.whiteBright("\t[-] Tracker / 3th-part / Supply-chain issue : "));
                        model.globalThreats.map(x => {
                            console.log(`\t  [${x.name}] size=${x.signature.length}`);
                            x.signature.map( c => {
                                switch (c.type){
                                    case ConstraintType.CODE:
                                        console.log(`\t\t  CODE [${NodeInternalTypeName[(c as CodeConstraint).node]}] ${(c as CodeConstraint).pattern}`);
                                        break;
                                    case ConstraintType.ANY:
                                        console.log(`\t\t  ANY [${c.name}]`);
                                        break;
                                    case ConstraintType.PHYSICAL:
                                        console.log(`\t\t  PHYSICAL[${c.name}]`);
                                        break;
                                    case ConstraintType.UI:
                                        console.log(`\t\t  UI [${c.name}]`);
                                        break;
                                    case ConstraintType.FLOW:
                                        console.log(`\t\t  FLOW [${c.name}]`);
                                        break;
                                    default:
                                        console.log(c.toJsonObject());
                                        break;
                                }
                            })
                        })
                        console.log(chalk.whiteBright("[-] Personal Data : "));


                    }*/
                }
            }catch (err){
                console.log(chalk.red(err.message));
                console.log(chalk.red(err.stack));
            }
        })();
        break;
    case SUBMENU.MERLIN:
        if(projectArgs.mlRule){
            const ctx = {
                Merlin: Merlin,
                merlinAPI: null,
                ops: [],
                req: null
            };

            console.log(chalk.whiteBright("[-] Prepare rule : "+projectArgs.mlRule));
            ctx.merlinAPI = Merlin.android();
            VM.createContext(ctx);
            VM.runInNewContext(`req = Merlin.${projectArgs.mlRule}; ops = req.getOperations();`,ctx);

            console.log(MerlinSearchRequest.stringify(ctx.ops));
            console.log((ctx.req as MerlinSearchRequest).toSearchString());

            /*
            (async function() {
                const dxcInstance = DexcaliburEngine.getInstance();
                dxcInstance.loadConfiguration(cfg);
                const ready = await dxcInstance.boot(
                    projectArgs.restore === true ? true : false,
                    dxcWebRoot
                );
                if(ready){
                    dxcInstance.start((projectArgs.port!=null) ? projectArgs.port : null);

                    switch(projectArgs.mlType){
                        case "android":
                            Merlin.android()
                            break;
                    }
                }
            })()*/
        }
        break;
    case SUBMENU.TEST:
        if(projectArgs.testLoad!=null){

            // create an empty single (not yet initialiazed) instance of engine+
            (async function(){
                const dxcInstance = DexcaliburEngine.getInstance();

                let dxcWebRoot:string = null;
                if(projectArgs.uipath!==undefined){
                    dxcWebRoot = (projectArgs.uipath[0]=='/'? projectArgs.uipath : _path_.join(__dirname, projectArgs.uipath));
                }else{
                    dxcWebRoot = null; //_path_.join(__dirname, 'src', 'webserver', 'src');
                }

                // init engine with settings
                dxcInstance.loadConfiguration(cfg);

                // boot engine
                const ready = await dxcInstance.boot(
                    projectArgs.restore===true? true : false,
                    dxcWebRoot
                );

                if(ready){
                    dxcInstance.start((projectArgs.port!=null) ? projectArgs.port : null);
                }
            })();

        }
        break;
    case SUBMENU.PROJECT:


            // create an empty single (not yet initialiazed) instance of engine+
            (async function(){
                const dxcInstance = DexcaliburEngine.getInstance();

                // init engine with settings
                await dxcInstance.loadConfiguration(cfg);

                // override previously loaded config
                if(projectArgs.overrideAuth!=null){
                    dxcInstance.getSettings().getServerSettings().getAuthenticationSettings().overrideWith(
                        JSON.parse(Util.b64_decode(projectArgs.overrideAuth)) as IStringIndex<any>, true
                    );
                }

                // boot engine
                const ready = await dxcInstance.boot(
                    projectArgs.restore===true? true : false,
                    (projectArgs.projGui ? projectArgs.projGui : "")
                );

                if(ready){

                    dxcInstance.start((projectArgs.port!=null) ? projectArgs.port : null);

                    let project:DexcaliburProject, device:Nullable<Device>=null, platform:Nullable<Platform>=null;
                    let acc:Nullable<UserAccount> = null;
                    let wf:Workflow = null;

                    switch (projectArgs.projAction){
                        case PROJ_ACTION.NEW:

                            console.log("START NEW PROJECT");
                            if(projectArgs.projDevice){
                                device = DeviceManager.getInstance().getDevice( projectArgs.projDevice);
                                if(device == null || !device.isEnrolled()){
                                    throw DexcaliburProjectException.TARGET_DEVICE_NOT_ENROLLED();
                                }
                            }

                            if(projectArgs.projPlatform){
                                platform = PlatformManager.getInstance().getPlatform( projectArgs.projPlatform);
                            }

                            if(device==null && projectArgs.projOS!=null){
                                // try to find compatible device already enrolled
                                device = DeviceManager.getInstance().searchCompatibleDevice(projectArgs.projOS);
                                if(device!=null && platform==null){
                                    platform = device.getPlatform();
                                    console.log("Compatible device found :",device.uid);
                                }else{

                                    console.log("Compatiblme device NOT found ");
                                }
                            }

                            if(projectArgs.projUser){
                                acc = UserService.findUser(projectArgs.projUser);
                                console.log(acc);
                            }

                            wf = dxcInstance.newWorkflow(projectArgs.projUID).changeOwner(acc);

                            project = await dxcInstance.newProject(
                                projectArgs.projUID,
                                projectArgs.projApp,
                                device,
                                acc
                            );

                            project.setWorkflow(wf);
                            await project.fullscan();

                            break;
                    }
                }else{
                    console.error("SERVER NOT READY");
                }
            })();

        break;
    default:
        // DexcaliburEngine.requireInstall()
        break;
}



