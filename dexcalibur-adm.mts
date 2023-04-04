
import * as _fs_ from "fs";
import * as _os_ from "os";
import * as _path_ from 'path';
import * as Process from 'process';
import chalk from "chalk";
import ArgParser from './src/ArgUtils.js';



import DexcaliburEngine from './src/DexcaliburEngine.js';
import DexcaliburWorkspace from './src/DexcaliburWorkspace.js';
import {ConnectorFactory} from "./src/ConnectorFactory.js";


ConnectorFactory.getInstance(true);

enum SUBMENU {
    NONE,
    GLOBAL,
    WEB,
    LOGS,
    USER,
    TEST,
    INSTALL,
    TOOLS,
    START
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

    { name:"gui",
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
        callback:(ctx,param)=>{ ctx.mode = SUBMENU.WEB; } },

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



import * as Log from "./src/Logger.js";
import * as S from "./src/Settings.js";
import {AuthenticationSettings} from "./src/user/auth/AuthenticationSettings.js";
import {UserAccount} from "./src/user/UserAccount.js";
import Util from "./src/Utils.js";
import AccessControl from "./src/user/acl/AccessControl.js";
import {install} from "./src/install/Installer.js";
import DexcaliburRegistry from "./src/DexcaliburRegistry.js";

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
    case SUBMENU.WEB:
        if(projectArgs.setPort!=null){
            console.log(chalk.whiteBright("[-] Set workspace path to : "+projectArgs.setWS));
            cfg.getServerSettings().setWorkspace(projectArgs.setWS);
            cfg.getServerSettings().save()
            console.log(chalk.green("[*] Workspace path has been updated."));
        }
        break;
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
        break;
    case SUBMENU.WEB:
        if(projectArgs.guiAddConn){

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
                    projectArgs.restore===true? true : false,
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
                const freshWS = new DexcaliburWorkspace(projectArgs.srvCreateWS);
                freshWS.init();
                cfg.getServerSettings().setWorkspace(projectArgs.srvCreateWS, true);
                cfg.save();
                console.log(chalk.green("[*] Workspace path has been created and settings updated."));
            }catch(e){
                console.log(chalk.red("[ERROR] Failed to create new workspace : "+e.message));
                console.log(chalk.red(e.stack));
                process.exit()
            }
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
                    dxcInstance.loadConfiguration(cfg);
                    // list user
                    const usrList = dxcInstance.getUserService().getAuthenticationService().getUserIndex();

                    console.log(chalk.whiteBright("UserName | Locked | Role "));
                    usrList.map((vIndex:any, vUser:UserAccount)=>{
                        console.log(`  ${chalk.whiteBright(vUser.getUID())}  ${vUser.isLocked()? chalk.redBright("LOCKED"):chalk.redBright("VALID") }  ${chalk.yellow(vUser.getUserRole())} `);
                    });


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
    default:
        // DexcaliburEngine.requireInstall()
        break;
}



