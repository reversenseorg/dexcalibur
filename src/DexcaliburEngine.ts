import DexcaliburRegistry from "./DexcaliburRegistry.js";
import PlatformManager from "./PlatformManager.js";

import * as  _fs_ from 'fs';
import * as  _path_ from 'path';
import * as  _os_ from "os";
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";

import * as Log from './Logger.js';
import StatusMessage from "./StatusMessage.js";
import DexcaliburProject from "./DexcaliburProject.js";
import WebServer from "./WebServer.js";
import DeviceManager from "./DeviceManager.js";
import InspectorManager from "./InspectorManager.js";
import Configuration from "./Configuration.js";
import FridaHelper from "./FridaHelper.js";
import {WebsocketServer} from "./WebsocketServer.js";
import {TerminalServer} from "./TerminalServer.js";
import {DexcaliburServerChildProcess, IpcMode} from "./DexcaliburServerChildProcess.js";
import {ApkPackage} from "./android/ApkPackage.js";
import {Workflow} from "./Workflow.js";
import {ValidationCapable, ValidationRule} from "./Validator.js";
import ApkHelper from "./ApkHelper.js";
import JavaHelper from "./JavaHelper.js";
import {BinwalkHelper} from "./BinwalkHelper.js";
import DexHelper from "./DexHelper.js";
import {External} from "./external/External.js";
import {Settings} from "./Settings.js";
import RadareHelper from "./R2Helper.js";
import {UserService} from "./user/UserService.js";
import AccessControl from "./user/acl/AccessControl.js";
import {AccessZone} from "./user/acl/Zones.js";
import {ProjectAccessControl} from "./user/acl/rbac/ProjectAccessContol.js";
import {SettingsAccessControl} from "./user/acl/rbac/SettingsAccessContol.js";
import {IDexcaliburEngine} from "./IDexcaliburEngine.js";
import {ConnectionManager} from "./remote/ConnectionManager.js";
import ShellHelper from "./ShellHelper.js";
import {GlobalAccessControl} from "./user/acl/rbac/GlobalAccessContol.js";
import {UserAccount} from "./user/UserAccount.js";
import {NodeSchema} from "./NodeSchema.js";
import {DexcaliburUpdater} from "./DexcaliburUpdater.js";
import Tool = External.Tool;
import {DXC_LIFECYCLE_EVENT} from "./CoreConst.js";
import Util from "./Utils.js";
import {LicenceManager} from "./credit/LicenceManager.js";
import {AuditManager} from "./audit/AuditManager.js";
import {WebGuiConfiguration} from "./webserver/WebGuiConfiguration.js";
import {WebGuiHelper} from "./webserver/WebGuiHelper.js";
import {SignatureServerAPI} from "./audit/SignatureServerAPI.js";
import {Nullable} from "./core/IStringIndex.js";
import {EngineNodeManager, MasterNodeOptions, NodeState} from "./core/EngineNodeManager.js";
import {ScanScheduler} from "./audit/common/ScanScheduler.js";
import {AppContextType, IAppContext} from "@dexcalibur/dexcalibur-orm"

/*
const _fixPath_ = require("fix-path");

if(require('os').platform()=="darwin"){
    _fixPath_();
}*/

/**
 * Running mode of engine instance :
 * - master : manage several slave engines, and expose GUIs
 * - slave : headless engine used to distribute processing
 *
 *
 */
export enum DexcaliburEngineMode {
    MASTER= "MASTER",
    SLAVE= "SLAVE",
    STANDALONE="STANDALONE"
}


export interface SignatureServerOptions {
    host: string;
    port: number;
    ssl?: boolean;
    auth?: Nullable<any>;
}

export interface DexcaliburEngineOptions {
    engine_mode?: DexcaliburEngineMode;
    node_uid?: Nullable<string>;
    master_pub_key?:Nullable<string>;
    master_opts?:MasterNodeOptions;
    signature_server?: SignatureServerOptions;
}

if(_os_.platform()=="darwin"){
    Util.updateEnvPATH();
}


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

let gEngineInstance:DexcaliburEngine = null;
// eslint-disable-next-line @typescript-eslint/no-var-requires

const PACKAGE_JSON:any = Util.readPackageJson();

const LOG_FILE = (process.env.DXC_LOG_PATH? process.env.DXC_LOG_PATH : null);
function __log( pMessage:string):void{
    if(LOG_FILE!=null)
        _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
}

let CONFIG_PATH:string;
if(process.env.DXC_HOME!=null){
    CONFIG_PATH = process.env.DXC_HOME;
}else{
    CONFIG_PATH = _path_.join( _os_.homedir(), '.dexcalibur', 'config.json');
}


const FRIDA_BIN = (process.env.DEXCALIBUR_FRIDA !== null)? process.env.DEXCALIBUR_FRIDA : "frida"


const LOGO = "███████╗ ███████╗██╗  ██╗ ██████╗ █████╗ ██╗     ██╗██████╗ ██╗   ██╗██████╗\n"
            +"██╔═══██╗██╔════╝╚██╗██╔╝██╔════╝██╔══██╗██║     ██║██╔══██╗██║   ██║██╔══██╗\n"
            +"██║   ██║█████╗   ╚███╔╝ ██║     ███████║██║     ██║██████╔╝██║   ██║██████╔╝\n"
            +"██║   ██║██╔══╝   ██╔██╗ ██║     ██╔══██║██║     ██║██╔══██╗██║   ██║██╔══██╗\n"
            +"███████╔╝███████╗██╔╝ ██╗╚██████╗██║  ██║███████╗██║██████╔╝╚██████╔╝██║  ██║\n"
            +"╚══════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝\n";
/**
 * List of remote location where each tool can be downloaded
 * @constant
 */
const REMOTE_URLS:any = {
    apktool: "https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.4.1.jar",
    //apktool: "https://bbuseruploads.s3.amazonaws.com/0becf6a1-1706-4f2e-9ae6-891e00a8dd5f/downloads/5b0ec3aa-15d9-462a-8573-3744c8855ee7/apktool_2.4.1.jar?Signature=jmQo3MJSfHOfEwSCRTdjA1zZWns%3D&Expires=1586629301&AWSAccessKeyId=AKIA6KOSE3BNJRRFUUX6&versionId=zmIH9wY6Q_aTyUGAwbMg_KwZ5VWcE4VW&response-content-disposition=attachment%3B%20filename%3D%22apktool_2.4.1.jar%22",
    adb: null,
    officialRegistryAPI: "https://api.github.com/repos/FrenchYeti/dexcalibur-registry/contents/",
    officialRegistry: "https://github.com/FrenchYeti/dexcalibur-registry/raw/master/",
    defaultPlatform: "https://github.com/FrenchYeti/dexcalibur-registry/raw/master/platforms/sdk_androidapi_27_google.dex"
};

switch(process.platform){
    case "linux":
        REMOTE_URLS.adb = "https://dl.google.com/android/repository/platform-tools_r29.0.6-linux.zip";
        break;
    case "win32":
        REMOTE_URLS.adb = "https://dl.google.com/android/repository/platform-tools_r29.0.6-windows.zip";
        break;
    case "darwin":
        REMOTE_URLS.adb = "https://dl.google.com/android/repository/platform-tools_r29.0.6-darwin.zip";
        break;
}


enum MODE {
    INSTALL,
    NORMAL
}


export interface DexcaliburProjectMap {
    [uid:string] :DexcaliburProject
}

/**
 *
 *
 * Boot :
 *  - Read /home/ * /.dexcalibur/config.json
 *  - Else, Dexcalibur starts into "production mode"
 *
 *  - Init DexcaliburWorkspace
 *  - Start Dexcalibur (web server and socket server)
 *  - When the user selects or creates a project from SplashScreen, corresponding
 *  Project are loaded / created
 *
 *  @class
 */
export default class DexcaliburEngine extends ValidationCapable implements IDexcaliburEngine, IAppContext
{
    _type = AppContextType.WEB_SERVER;

    /**
     * @type {string}
     * @field Minimal version of the engine
     * @static
     * @since 1.1.0
     */
    static VERSION_MIN = "0.1";

    /**
     * @type {string}
     * @field Default version of the engine instance for this server
     * @static
     * @since 1.1.0
     */
    static VERSION = "1.1.0";

    /**
     * @type {string}
     * @field Default engine UID
     * @static
     */
    static DEFAULT_UID = "local:dxc";

    /**
     * @type {string}
     * @field Default GUI
     * @static
     */
    static DEFAULT_GUI:string = "dxc-web";


    engine_type = DexcaliburEngineMode.STANDALONE;


    /**
     * @type {string}
     * @field Version of the engine for this instance
     * @static
     * @since 1.1.0
     */
    version = DexcaliburEngine.VERSION;

    /**
     *
     */
    UID:string = DexcaliburEngine.DEFAULT_UID;

    /*
     * Configuration file path
     * @type {string}
     * @field
     * @private
     * @since 1.0.0
     */
   // private _configPath:string = null;

    /**git diff
     * Global configuration of Dexcalibur
     * @field
     */
    config:Configuration = null;

    /**
     * Workspace of Dexcalibur.
     * By default, this workspace contains all project workspaces.
     *
     * @field
     */
    workspace:DexcaliburWorkspace = null;

    /**
     * Web Server
     * @field
     */
    webserver:WebServer = null

    /**
     * Device Manager
     * @field
     */
    deviceMgr:DeviceManager = null;

    /**
     * Plateform manager
     * @field
     */
    platformMgr:PlatformManager = null;

    /**
     * Inspector manager
     * @type {InspectorManager}
     * @field
     */
    inspectorMgr:InspectorManager = null;


    /**
     * External tool manager
     * @type {Core.External.ToolManager}
     * @field
     */
    extMgr:External.ToolManager = null;


    /**
     * Registry
     * @field
     */
    registry:DexcaliburRegistry = null;

    /**
     * To hold active projects
     * @field
     */
    active:DexcaliburProjectMap = {};


    /**
     * Web socket server
     * @field
     * @type {WebsocketServer}
     * @since 1.0.0
     */
    wsserver: WebsocketServer = null;

    /**
     * Terminal server manages all
     * local and remote (device) terminal sessions
     *
     *
     */
    terminalSrv: TerminalServer = null;

    /**
     * IPC handlers when Dexcalibur allow IPC comm
     *
     * It is instanciated only if Dexcalibur starts with '--ipc' options
     *
     * @type {DexcaliburServerChildProcess}
     * @since 1.0.0
     * @field
     */
    ipcHandler: DexcaliburServerChildProcess = null;

    /**
     * Create / manage remote connections
     *
     * @type {ConnectionManager}Ò
     * @since 1.0.0
     * @field
     */
    connManager: ConnectionManager = null;

    /**
     * IPC describes server behavior
     *
     * Mode are follow :
     * - API : the engine starts automatically, it runs the web server and the user can use both IPC and WebApp.
     * - WAIT : the engine is not initialized and wait for command
     *
     * @type {IpcMode}
     * @since 1.0.0
     * @field
     */
    ipcMode: IpcMode = IpcMode.API;

    /**
     * The Updater is the component performing server update and executing patches
     *
     * It is also useful to apply patch to repair DB
     *
     * @type {DexcaliburUpdater}
     * @since 1.0.0
     * @field
     */
    updater:DexcaliburUpdater;

    mode: MODE = MODE.NORMAL;

    workflows: Workflow[] = [];

    /**
     * Hold workflow's callbacks to execute when the WF is created
     */
    wfCbs: any = {};

    /**
     * Hold global settings : server and external tools settings
     * @private
     * @field
     * @type {Core.Configuration.GlobalSettings}
     */
    private settings: Settings.GlobalSettings;

    /**
     * Hold user service for the current instance of engine
     * @private
     * @field
     * @type {UserService}
     */
    private userSvc: UserService;


    sigServerApi:SignatureServerAPI;
    
    nodeManager:EngineNodeManager;

    scanScheduler:ScanScheduler;

    /**
     * To instanciate DexcaliburEngine.
     *
     * @private
     * @constructor
     */
    constructor(pEngineOptions:Nullable<DexcaliburEngineOptions> = null){
        super({
            'engine:project.uid.new': [
                ValidationRule.newCustomAssert( x => {
                    return (this.workspace.listProjects().indexOf(x)==-1);
                })
            ],
            'engine:project.uid': [
                ValidationRule.newRegexpAssert(new RegExp('^[a-zA-Z0-9\\_\s.-]+$')),
            ]
        });

        if(pEngineOptions!=null){
            this.setEngineMode(pEngineOptions.engine_mode);
        }


        NodeSchema.init();
        this.initAccessControl();
        this.sigServerApi = new SignatureServerAPI({
            host: '127.0.0.1',
            port: '8085',
            ssl: false,
            auth: null
        });

        this.nodeManager = new EngineNodeManager(this,
            (pEngineOptions!=null && pEngineOptions.node_uid!=null) ? pEngineOptions.node_uid : this.UID);

        if(pEngineOptions!=null && pEngineOptions.master_opts!=null){
            this.nodeManager.setMasterURI(pEngineOptions.master_opts.uri, pEngineOptions.master_opts);
        }

        this.scanScheduler = new ScanScheduler(this);
    }

    setEngineMode(pType:DexcaliburEngineMode):void {
        if([
            DexcaliburEngineMode.STANDALONE,
            DexcaliburEngineMode.MASTER,
            DexcaliburEngineMode.SLAVE
        ].indexOf(pType)>-1){
            this.engine_type = pType;
        }else{
            this.engine_type = DexcaliburEngineMode.STANDALONE;
        }
    }


    getEngineMode():DexcaliburEngineMode {
        return this.engine_type;
    }

    isSlaveNode():boolean {
        return (this.getEngineMode()===DexcaliburEngineMode.SLAVE);
    }

    isStandaloneMode():boolean {
        return (this.getEngineMode()===DexcaliburEngineMode.STANDALONE);
    }

    initAccessControl():void {
        AccessControl.init();

        //AccessControl.registerZone( AccessZone.GLOBAL, EngineAccessControl)
        AccessControl.registerZone( AccessZone.PROJECT, new ProjectAccessControl());
        AccessControl.registerZone( AccessZone.GLOBAL, new SettingsAccessControl());
        AccessControl.registerZone( AccessZone.GENERIC, new GlobalAccessControl());

        //AccessControl.startAudit();
    }

    /**
     * To get an instance of the engine
     *
     * @returns {DexcaliburEngine} engine
     * @method
     * @static
     */
    static getInstance(pOptions:Nullable<DexcaliburEngineOptions>=null):DexcaliburEngine{

        if(gEngineInstance == null){
            gEngineInstance = new DexcaliburEngine(pOptions);


        }

        return gEngineInstance;
    }

    getScanScheduler():ScanScheduler {
        return this.scanScheduler;
    }


    /**
     * To enable Inter-Process Communication (IPC)
     *
     * When IPC is enabled, Dexcalibur is waiting for incoming commands.
     * Handler of such IPC are implemented into DexcaliburServerChildProcess
     *
     */
    enableIPC(pMode:IpcMode):void{
        __log('[DXC_SRV][ENGINE] Enabling IPC for : '+process.pid);
        this.ipcHandler = new DexcaliburServerChildProcess(process);
        this.ipcMode = pMode;
    }

    /**
     * To check if the IPC mode is API or WAIT
     *
     * Usually, it helps to know if the engine must continue to execute or wait for a command.
     *
     * @return {boolean} TRUE is Dexcalibur must wait, else FALSE
     * @method
     */
    isIpcWaitMode():boolean{
        return (this.ipcMode === IpcMode.WAIT);
    }

    /**
     * To disable Inter-Process Communication (IPC)
     *
     * When IPC is enabled, Dexcalibur wait command
     *
     */
    disableIPC():void{
        this.ipcHandler.disable();
    }

    /**
     *
     */
    getToolManager():External.ToolManager {
        return this.extMgr;
    }

    /**
     * To get active registry
     *
     * @returns {DexcaliburRegistry} Current active registry
     * @method
     */
    getRegistry():DexcaliburRegistry{
        return this.registry;
    }

    getTerminalServer():TerminalServer{
        return this.terminalSrv;
    }

        /* +"║ > const Dexcalibur = require('./src/Project.js')                           ║\n"
            +"║ > var project = new Dexcalibur('com.example.test')                         ║\n"
            +"║ > project.useAPI('android:7.0.0').fullscan()                               ║\n"
            +"║ > project.find.method('name:loadLibrary')                                  ║\n"*/

    /**
     * To print Dexcalibur banner into CLI at starting
     *
     * @param {Integer} pPort Port number
     * @static
     * @method
     */
    static printBanner( ){

            Logger.info("\n\n"
            + LOGO
            + PACKAGE_JSON.version
            + (" ".repeat(78-14-PACKAGE_JSON.version.length))
            +"by @FrenchYeti \n"
            +"╔════════════════════════════════════════════════════════════════════════════╗\n"
            +"║ Hey :)                                                                     ║\n"
            +"║                                                                            ║\n"
            +"║ Do you need some help ? Visit http://docs.dexcalibur.org                   ║\n"
            +"╚════════════════════════════════════════════════════════════════════════════╝\n"
            );

    }

    /**
     *
     * @param {*} pPort
     */
    printWebBanner( pPort:number|string){
        Logger.info("\n\n"
        + LOGO
        + PACKAGE_JSON.version
        + (" ".repeat(78-14-PACKAGE_JSON.version.length))
        +"by @FrenchYeti \n"
        +"╔════════════════════════════════════════════════════════════════════════════╗\n"
        +"║ Visit http://127.0.0.1:"+pPort+(" ".repeat(78-26-(""+pPort).length))+"║\n"
        +"╚════════════════════════════════════════════════════════════════════════════╝\n"
        );
    }


    /**
     * To print Dexcalibur banner into CLI during install
     *
     * @param {Integer} pPort Port number
     * @static
     * @method
     */
    static printFirstBanner( pPort:number|string){
        Logger.info("\n\n"
        + LOGO
        + PACKAGE_JSON.version
        + (" ".repeat(78-14-PACKAGE_JSON.version.length))
        +"by @FrenchYeti \n"
        +"╔════════════════════════════════════════════════════════════════════════════╗\n"
        +"║ Dexcalibur is not fully configured, please visit URL below to              ║\n"
        +"║ finalize install:                                                          ║\n"
        +"║                                                                            ║\n"
        +"║ http://127.0.0.1:"+pPort+(" ".repeat(78-20-(pPort+"").length))+"║\n"
        +"║                                                                            ║\n"
        +"║ :-)                                                                        ║\n"
        +"╚════════════════════════════════════════════════════════════════════════════╝\n"
        );
    }

    /**
     * To detect if Dexcalibur has been installed by NPM
     * TODO : replace by dexcalibur-installer
     *
     * @static
     * @method
     */
    static requireInstall():boolean{
        // to implement or it asssumes dexcalibur is already installed
        return false;//  (_fs_.existsSync( CONFIG_PATH) == false);
    }

    /**
     * To set configuration path
     * @param {string} pPath Configuartion file path
     * @method
     * @since 1.0.0
     */
    setConfigurationPath(pPath:string):void {
        //this._configPath = pPath;
    }

    /**
     * To load and to initialize global settings of this engine instance
     *
     * It inits server settings and external tool settings (such as path)
     *
     * @param {Core.Configuration.GlobalSettings} pConfig
     * @version 1.0.0
     */
    async loadConfiguration( pConfig:Settings.GlobalSettings):Promise<void> {
        this.settings = pConfig;

        await this.initServerSettings();
        this.initExternalSettings();
        this.initConnectionsSettings();
    }

    /**
     * To save global settings
     */
    saveConfiguration():void {
        this.settings.save();
    }

    /**
     * To init server settings such as :
     *  - web server settings
     *  - workspace settings
     *  - dexcalibur registry settings
     *  - authentication service
     *
     *  @method
     *  @since 1.0.0
     */
    async initServerSettings():Promise<void>{
        const ss=this.settings.getServerSettings();

        try{
            this.workspace = ss.getWorkspace();
            await this.workspace.init();

            this.userSvc = new UserService(
                ss.getAuthenticationSettings(),
                this
            );
            await this.userSvc.initService(this);

            console.log(this.userSvc);

            this.registry = ss.getRegistry();
            Logger.info("[ENGINE] server settings init : Done");
        }catch(err){
            Logger.error("[ENGINE] server settings init : "+err.message+"\n"+err.stack);
        }
    }


    /**
     * To get user / session / authentication services
     */
    getUserService(): UserService{
        return this.userSvc;
    }

    /**
     *
     */
    initExternalSettings(): void{
        return ;
    }

    /**
     *
     */
    initConnectionsSettings(): void{
        const conns = this.settings.getConnectionSettings();
        if(conns == null || conns.countConnections()===0){
            this.settings.createConnectionSettings();
            this.settings.save();
        }

        this.connManager = new ConnectionManager(this);
    }

    /**
     * To get connection manager associate to this instance
     * @method
     * @return {ConnectionManager}
     */
    getConnectionManager():ConnectionManager {
        return this.connManager;
    }

    /**
     * To instenciate and initialize main components
     *
     * At this step
     * Require `this.workspace` is loaded.
     *
     * @param {boolean} pRestore Optional
     * @param {string} pGuiCfgStr Serialized configuration of GUI
     * @returns {Boolean} TRUE if ready to start
     * @method
     */
    async boot( pRestore=false, pGuiCfgStr:string = DexcaliburEngine.DEFAULT_GUI):Promise<any>{
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self:DexcaliburEngine=this;


        // create updater
        this.updater = DexcaliburUpdater.getInstance(this);

        this.updater.run( DXC_LIFECYCLE_EVENT.ENG_BEFORE_WS_INIT);

        // init workspace
        await this.workspace.init();

        // read configuration file into target workspace
        // this.loadWorkspaceConfig( pRestore);

        // parse web server GUI config
        const guiCfgs = WebGuiHelper.parse(pGuiCfgStr);

        // init
        await this.init( guiCfgs);

        this.terminalSrv = new TerminalServer({
            _engine: this
        });

        Logger.debug('PASS0');
        //  enumerate local and remote platforms
        this.platformMgr.enumerate();

        this.updater.run( DXC_LIFECYCLE_EVENT.PLATFORM_MGR_AFTER_INIT);

        Logger.debug('PASSA');
        //  enumerate local and remote inspectors
        await this.inspectorMgr.enumerate();
        Logger.debug('PASSB');

        this.updater.run( DXC_LIFECYCLE_EVENT.INSPECT_MGR_AFTER_INIT);

        // load device manager db
        this.deviceMgr.load();
        Logger.debug('PASS3');

        this.updater.run( DXC_LIFECYCLE_EVENT.DEV_MGR_AFTER_INIT);

        LicenceManager.replenish();

        // create AuditManager singleton
        AuditManager.getInstance(this);

        // restart child ADB server
        (async function(){
            self.deviceMgr.getBridgeFactory('adb').newGenericWrapper().kill();

            Logger.debug('PASS4');
        })();

        return true;
    }


    /**
     * To get engine global settings
     *
     * @return  {GlobalSettings}
     * @method
     * @since 1.0.0
     */
    getSettings():Settings.GlobalSettings {
        return this.settings;
    }

    /**
     * To init the context shared by any project
     *
     * @method
     */
    async init(pWebGuiCfg:WebGuiConfiguration[] = []):Promise<any>{



        /*if(pWebGuiCfg.length == 0){
            pWebRoot = _path_.join(Util.__dirname(import.meta.url), 'webserver', 'public');
        }else{

        }*/

        // init external tool manager
        this.extMgr = new External.ToolManager(this.settings.getExternalSettings());
        //this.extMgr.configureHelpers();
        if(this.extMgr.getTool('shell')!=null){
            ShellHelper.init(this.extMgr.getTool('shell'));
        }else{
            this.extMgr.addTool(new Tool('shell', { path:ShellHelper.getDefaultPath() }), true);
            ShellHelper.init(this.extMgr.getTool('shell'));
        }

        JavaHelper.init(this.extMgr.getTool('java'));
        FridaHelper.init(this.extMgr.getTool('frida'));
        ApkHelper.init(this.extMgr.getTool('apktool'));
        BinwalkHelper.init(this.extMgr.getTool('binwalk'));
        DexHelper.init(this.extMgr.getTool('baksmali'));
        RadareHelper.init(this.extMgr.getTool('radare2'));

        // setup web server serving API
        this.webserver = new WebServer(
            _path_.join(Util.__dirname(import.meta.url), 'webserver','www'),
            pWebGuiCfg
        );

        // TODO : override webserver settings with GUI config
        //await this.webserver.configureAuth(this.settings.getServerSettings().getAuthenticationSettings());
        this.webserver.configure(this.settings.getWebserverSettings());
        this.webserver.setContext(this);
        this.webserver.useProductionMode();

        // setup web socket server
        this.wsserver = new WebsocketServer(this);

        // TODO : override webserver settings with GUI config
        // pass allowed origins to init
        this.wsserver.init(this.settings.getWebserverSettings());

        // First call to PlatformManager : it inits
        this.platformMgr = PlatformManager.getInstance(this);

        this.deviceMgr = DeviceManager.getInstance(this);

        this.inspectorMgr = InspectorManager.getInstance(this);

/*

        // hook
        this.hook = new HookHelper.Manager(this, nofrida);
        this.hook.refreshScanner();
*/
    }

    /**
     * To get configuration object
     * @method
     */
    getConfiguration():Configuration{
        return this.config;
    }


    /**
     * To get Dexcalibur workspace from the current instance
     * @method
     * @return {DexcaliburWorkspace}
     */
    getWorkspace():DexcaliburWorkspace {
        return this.workspace;
    }

    /**
     * To get WebServer instance
     * @returns {WebServer} Web server instance
     * @method
     */
    getWebserver():WebServer{
        return this.webserver;
    }

    /**
     * To get platform manager instance
     *
     * @method
     */
    getPlatformManager():PlatformManager{
        return this.platformMgr;
    }

    /**
     * To get inspector manager instance
     *
     * @method
     */
    getInspectorManager():InspectorManager{
        return this.inspectorMgr;
    }

    /**
     * To get device manager instance
     *
     * @method
     */
    getDeviceManager():DeviceManager{
        return this.deviceMgr;
    }

    /**
     * To create the workspace from web installer
     *
     * TODO :  this method will be removed
     *
     * @param {String} pPath Path where the workspace will be created
     * @deprecated
     */
    createWorkspace( pPath:string):void{
        if(_fs_.existsSync( pPath) == false){
            _fs_.mkdirSync( pPath);
        }

        this.workspace = DexcaliburWorkspace.getInstance( pPath);
        this.workspace.init();

        // platform manager and device manager should be reconfigured;
        this.platformMgr = PlatformManager.getInstance(this);
        this.platformMgr.enumerate();
    }


    /**
     * To starts servers and child process
     *
     * @param pWebPort {number} Port number
     * @param pUI {Path} (Optional) Web root of the UI
     */
    start( pWebPort:string|number=null, pUI:string=null){

        const s =this.getSettings().getWebserverSettings();


        // Start the web server serving Installer UI
        if(pWebPort==null){
            this.webserver.start();
        }else{
            this.webserver.start((typeof pWebPort==='string')?parseInt(pWebPort,10):pWebPort);
        }

        // if server run in production mode (instead of install mode)
        // then start web socket server
        if(this.mode == MODE.NORMAL) {
            this.wsserver.start(); //(typeof pWebPort === 'string') ? parseInt(pWebPort, 10) + 1 : pWebPort + 1)
        }

        // if the engine is a SLAVE instance, notify the MASTER the instance is started
        if(this.getEngineMode()==DexcaliburEngineMode.SLAVE){
            this.nodeManager.notifyMaster(NodeState.IDDLE);
        }
    }


    /**
     * To retrieve project list
     *
     * @return {string[]}
     * @method
     */
    getProjects():string[]{

        return this.workspace.listProjects();
    }


    /**
     *
     * @param pUser
     */
    listProjectsOf( pUser:UserAccount):DexcaliburProjectMap {
        const PUIDS = this.workspace.listProjects();
        const map:DexcaliburProjectMap = {};
        PUIDS.map( (vUID:string)=>{
            try{
                // only authorized user can read metadata
                map[vUID] = DexcaliburProject.getInformationOf( this, vUID, pUser);
            }catch(err){
                Logger.error("[ENGINE][LIST PROJECT] "+err.message);
            }
        });
        return map;
    }


    /**
     * To get active project by its UID
     *
     * @return {DexcaliburProject} Project for the given UID
     * @method
     */
    getProject(pProjectUID:string):DexcaliburProject{
        if(this.active[pProjectUID] instanceof DexcaliburProject){
            return this.active[pProjectUID];
        }

        return null;
    }

    /**
     * To get all active projects of the engine instance, optionnaly filtered by owner
     *
     * @return {DexcaliburProjectMap} A map of cctive projects, indexed by project UIDs
     * @method
     * @since 1.0.0
     */
    getActiveProjects(pUser:UserAccount = null):DexcaliburProjectMap {

        // TODO : add ACL which allows non-owner but authorized auditor (group/team) to work on this project

        if(pUser === null){
            return this.active;
        }else{
            const sub:DexcaliburProjectMap = {};
            for(const uid in this.active){
                if(this.active[uid].isOwnedBy(pUser) || this.active[uid].isAuthorizedToTest(pUser)){
                    sub[uid] = this.active[uid];
                }
            }
            return sub;
        }
    }


    /**
     * To remove a project from the workspace. It erases files.
     *
     * @param {string} pUID Project UID
     * @return {boolean} Rteurn TRUE if operation is successfull, else FALSE
     * @method
     */
    deleteProject( pAccount:UserAccount, pUID:string):boolean{
        let success = false;
        try{
            // if the project is already loaded, instance can be retrieved
            // from engine instance
            // else project must be loaded first
            if(this.active[pUID] != null){
                // verifiy the project is owned byt he issuer
                if(this.active[pUID].isOwnedBy(pAccount)){
                    // if the project is local remmove it

                    this.updater.run( DXC_LIFECYCLE_EVENT.CLOSE_PROJECT, this.active[pUID]);

                    Util.recursiveRmDirSync(
                        _path_.join( this.workspace.getLocation(), pUID )
                    );

                    success = true;
                    this.active[pUID] =  null;
                }
            }else{
                // TODO : add ACL


                this.updater.run( DXC_LIFECYCLE_EVENT.CLOSE_PROJECT, pUID);

                Util.recursiveRmDirSync(
                    _path_.join( this.workspace.getLocation(), pUID )
                );
                success = true;
            }

        }catch(err){
            console.log(err);
            Logger.error("[ENGINE] "," deleteProject() failed");
        }

        return success;
    }

    /**
     * To open a project
     *
     * @param {string} pUID The UID of local project to open
     * @return {Promise<DexcaliburProject>} The project instance
     * @async
     * @method
     */
    async openProject( pUserAccount:UserAccount, pUID:string):Promise<DexcaliburProject>{
        let project:DexcaliburProject = null, success:any = false;

        const wf:Workflow = this.getWorkflow( pUID);
        Logger.info("ENGINE : openProject : workflow : "+(wf!=null? wf.getUID() : '<null>'));

        try{
            wf.pushStatus(new StatusMessage(5, "Scanning connected devices"));
            await DeviceManager.getInstance().scan();


            wf.pushStatus(new StatusMessage(7, "Loading project data"));
            project = DexcaliburProject.load(this, pUID, pUserAccount);


            // init

//            project = new DexcaliburProject( this, pUID);

            DexcaliburEngine.printBanner();

            wf.stepUp(0.1);
            success = await project.open();


            wf.pushStatus(StatusMessage.newSuccess("Project is ready."));
            this.active[pUID] = project;


            this.updater.run( DXC_LIFECYCLE_EVENT.OPEN_PROJECT, project);

            //this.webserver.setProject(project);
        }catch(err){
            Logger.error("ENGINE"," openProject() failed : "+err.message+"\n"+err.stack);
            wf.pushStatus(StatusMessage.newError("Project cannot be loaded. See logs for more details : "+err.message));
            project = null;
            throw err;
        }

        return project;
    }

    // TODO : remove platform ?
    /**
     * To create a new project.
     *
     * @param {string} pUID Project UID, it must unique into target workspace
     * @param {string} pApkPath Local path of the APK to analayze
     * @param {Device} pDevice Optional. Default NULL. The default target device for the project.
     * @return {Promise<DexcaliburProject>} The project instance
     * @async
     * @method
     */
    async newProject( pUID:string, pApkPath:string, pDevice:any=null, pUserAccount:UserAccount = null):Promise<DexcaliburProject>{

        let project:DexcaliburProject = null;
        let apkFile:ApkPackage = null;

        const wf:Workflow = this.getWorkflow( pUID);
        if(wf===null){
            throw new Error("Project is not associated to a workflow.");
        }

        wf.pushStatus(new StatusMessage( 2, "Scanning connected devices"));
        await DeviceManager.getInstance().scan();

        //validate or suggest project UID

        wf.pushStatus(new StatusMessage( 4, "Verify project UID"));
        if(DexcaliburProject.exists(pUID)){
            pUID = DexcaliburProject.suggests(pUID);
        }

        project = new DexcaliburProject( this, pUID);

        if(pUserAccount != null){
            project.changeOwner( null, pUserAccount);
        }

        project.setWorkflow(wf);

        Logger.info('[ENGINE] Creating new project : ',pUID);

        wf.pushStatus(new StatusMessage( 6, "Initialize project"));
        await project.init();


        DexcaliburEngine.printBanner();

        if(pDevice != null){
            wf.pushStatus(new StatusMessage( 8, "Set project default device"));
            project.setDevice(pDevice);
        }

        // open APK, analyze manifest

        wf.pushStatus(new StatusMessage( 8, "Analyze APK"));
        wf.stepUp(10);
        apkFile = await project.useAPK(pApkPath);

        // create project.json file
        if(apkFile != null){
            project.save();

            this.active[pUID] = project;
            this.webserver.setProject(project);


            this.updater.run( DXC_LIFECYCLE_EVENT.NEW_PROJECT, project);

            return project;
        }else{
            Logger.error('[ENGINE] Error : APK extraction failed.')
            return null;
        }
    }


    /**
     * To detect if Frida is installed and get version
     *
     * @deprecated in v1.0.0
     */
    getLocalFridaVersion():string{
        return FridaHelper.getLocalFridaVersion(FRIDA_BIN);
    }

    /**
     * To close an opened project
     *
     * @param {DexcaliburProject} pProject The project to close
     * @return {boolean}
     */
    closeProject( pUser:UserAccount, pProject:DexcaliburProject):boolean {

        AccessControl.check(
            AccessZone.PROJECT,
            ProjectAccessControl.access.CLOSE_OWN_PROJECT,
            pProject,
            pUser
        );

        // TODO : remove project from others sessions

        if(Object.keys(this.getActiveProjects()).length>0){
            const p:any = {};
            for(const i in this.active){
                Logger.info(i+' != '+pProject.uid+' == '+(i != pProject.uid));
                if(i != pProject.uid)
                    p[i] = this.active[i];
            }
//            this.active[pProject.uid] = null;
//            this.active = this.active.filter(x => x !== null);
            this.active = p;
        }else{
            this.active = {};
        }

        return pProject.close();
    }

    /**
     * To create a new workflow and to attach it to engine
     * @param pName
     */
    newWorkflow(pName:string):Workflow {
        const wf:Workflow = new Workflow({ uid:'de:'+pName });
        this.workflows.push(wf);
        // execute scheduled job
        if(this.wfCbs[wf.getUID()]!=null){
            Logger.info("[newWorkflow] Execute scheduled jobs ["+this.wfCbs[wf.getUID()].length+"]");
            this.wfCbs[wf.getUID()].map( vFn => {
                vFn(wf);
            })
        }
        return wf;
    }

    /**
     * To create a new workflow and to attach it to engine
     * @param pName
     */
    getWorkflow(pUID:string, pExternal=false):Workflow{
        let f:Workflow = null;
        const name = (pExternal? '' : 'de:')+pUID;

        this.workflows.map( (pWF:Workflow)=>{
            if(pWF.getUID()===name){
                f = pWF;
            }
        });
        return f;
    }

    /**
     * To add job to execute when a workflow with pUID name is created
     *
     * It allows to capture notifications and to track advancement through a progress bar.
     *
     * @param {string} pUID Project UID
     * @param {Function} pCallback A callback function
     * @param {boolean} pExternal Optional. Default FALSE. TRUE if the workflow is external with a global UID, else FALSE if the workflow is attached to engine
     * @method
     */
    onNewWorkflow( pUID:string, pCallback:any, pExternal=false):void {
        const name = (pExternal? '' : 'de:')+pUID;
        if(this.wfCbs[name]==null){
            this.wfCbs[name] = [];
        }
        this.wfCbs[name].push(pCallback);
    }

    /**
     * to get signature server api client
     *
     * @method
     */
    getSignatureServer():SignatureServerAPI {
        return this.sigServerApi;
    }
}


