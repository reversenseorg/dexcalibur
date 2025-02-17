import DexcaliburRegistry from "./DexcaliburRegistry.js";
import PlatformManager from "./platform/PlatformManager.js";

import * as  _fs_ from 'fs';
import * as  _path_ from 'path';
import * as  _os_ from "os";
import * as _ps_ from "process";

import DexcaliburWorkspace from "./DexcaliburWorkspace.js";


import * as Log from './Logger.js';
import StatusMessage from "./StatusMessage.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "./DexcaliburProject.js";
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
import {AppContextType, IAppContext, TagCategory} from "@dexcalibur/dexcalibur-orm"
import {EngineDatabase} from "./database/EngineDatabase.js";
import {EngineNodeException} from "./errors/EngineNodeException.js";
import TargetApp from "./common/TargetApp.js";
import Platform from "./platform/Platform.js";
import {ProjectState} from "./ProjectState.js";
import Tool = External.Tool;
import { Subject} from "rxjs";
import {LogMessage} from "./log/Log.js";
import {ProjectInput} from "./analyzer/ProjectInput.js";
import {UserServiceException} from "./errors/UserServiceException.js";
import {OrganizationManager} from "./organization/OrganizationManager.js";
import {OrganizationAccessControl} from "./user/acl/rbac/OrganizationAccessContol.js";
import {AccessControlManager} from "./user/acl/AccessControlManager.js";
import Role from "./user/acl/common/Role.js";
import {randomUUID} from "crypto";
import {ProjectManager} from "./project/ProjectManager.js";
import ts from "typescript/lib/tsserverlibrary.js";
import Project = ts.server.Project;
import {InternalSecretManager} from "./core/InternalSecretManager.js";
import {ApplicationUnit} from "./organization/ApplicationUnit.js";
import {Device} from "./Device.js";
import AvdHelper from "./device/maker/AvdHelper.js";
import {EngineNode, EngineNodeUUID} from "./core/EngineNode.js";
import {ProjectScheduler} from "./project/ProjectScheduler.js";

/*
const _fixPath_ = require("fix-path");

if(require('os').platform()=="darwin"){
    _fixPath_();
}*/
export const DEXCALIBUR_HOME_DIRNAME = ".dexcalibur";
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


export interface RepairWsOptions {
    rmMissingProjects:boolean;
    backup:Nullable<string>;
}

export interface RepairOptions {
    ws?:RepairWsOptions;
}

export interface SignatureServerOptions {
    host: string;
    port: number;
    ssl?: boolean;
    auth?: Nullable<any>;
}

export interface DexcaliburEngineOptions {
    engine_mode?: DexcaliburEngineMode;
    node_uid?: Nullable<EngineNodeUUID>;
    master_pub_key?:Nullable<string>;
    master_opts?:MasterNodeOptions;
    signature_server?: SignatureServerOptions;
    offline?:boolean;
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
    CONFIG_PATH = _path_.join( _os_.homedir(), DEXCALIBUR_HOME_DIRNAME , 'config.json');
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


export interface CleanupEvent {
    type: string;
    data: any;
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

    /**
     * A flag to enable install mode or not
     *
     * @private
     */
    private _installMode = false;

    /**
     * Service account used internally to enforce access control check
     * on any APIs.
     *
     * This account cannot be used with remote server
     *
     * @private
     */
    private _internalAcc:UserAccount = new UserAccount({
        _uid: AccessControl.INTERNAL_USER_ACCOUNT_UUID,
        _locked: false
    });

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


    /**
     * A flag to enable CLI-only actions
     * @field
     */
    private _cliMode:boolean = false;


    engine_type = DexcaliburEngineMode.STANDALONE;


    /**
     * @type {string}
     * @field Version of the engine for this instance
     * @static
     * @since 1.1.0
     */
    version = DexcaliburEngine.VERSION;

    /**
     * engine node
     */
    UID:EngineNodeUUID = DexcaliburEngine.DEFAULT_UID;

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
     * Inspector manager
     * @type {InspectorManager}
     * @field
     */
    projMgr:ProjectManager = null;

    /**
     * Audit manager
     * @type {AuditManager}
     * @field
     */
    auditMgr:AuditManager = null;

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
    active:Record<DexcaliburProjectUUID, DexcaliburProject> = {};


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
     * @type {ConnectionManager}
     * @since 1.0.0
     * @field
     */
    connManager: ConnectionManager = null;

    /**
     * Init access control manager
     *
     * @type {AccessControlManager}
     * @since 1.3.9
     * @field
     */
    aclManager: AccessControlManager = null;

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

    orgMgr:OrganizationManager;

    mode: MODE = MODE.NORMAL;

    workflows: Workflow[] = [];

    wfPrj:Record<DexcaliburProjectUUID, Workflow[]> = {};

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

    secretManager:InternalSecretManager;

    scanScheduler:ScanScheduler;

    db:Nullable<EngineDatabase> = null;

    // cleanup
    cleanup$:Subject<CleanupEvent> = new Subject<CleanupEvent>();

    offline = false;

    /**
     * To disable project persistence (DB only)
     */
    dryRun = false;

    /**
     * Flag to prevent any cleanup events
     *
     * Cleanup is mainly used to trigger cleanup routine at startup
     * or on particular steps (such as logout)
     *
     * @private
     */
    private _cleanup = true;

    /**
     *
     * @private
     */
    private _repairOpts: Nullable<RepairOptions> = null;


    projectScheduler: ProjectScheduler;
    /**
     * To instanciate DexcaliburEngine.
     *
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
            this.offline = (pEngineOptions.offline===true);
        }

        NodeSchema.init();

        this.aclManager = new AccessControlManager(this);
        this.aclManager.init(this._internalAcc);
        
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
        this.projectScheduler = new ProjectScheduler(this);

        this.projMgr = new ProjectManager(this);
        this.auditMgr = AuditManager.getInstance(this);

        this.cleanup$.subscribe(async (vEvent:CleanupEvent)=>{
            // to automatically remove inconsistent project from workspace
            if(vEvent.type==='project'){
                await this.deleteProject(null, vEvent.data, true);
            }
        });

        this._listenProcessSignals();
    }

    getOrgManager():OrganizationManager{
        return  this.orgMgr;
    }

    getProjectManager():ProjectManager{
        return  this.projMgr;
    }

    getAuditManager():AuditManager {
        return this.auditMgr;
    }

    setCliMode(pMode:boolean):void {
        Logger.info("[*] "+(pMode?'Enable':'Disable')+" CLI mode");
        this._cliMode = pMode;
    }

    /**
     * To get Engine DB instance.
     *
     * @return {EngineDatabase} Instance of engine DB
     * @method
     */
    getEngineDB():EngineDatabase {
        if(this.db==null){
            throw EngineNodeException.ENGINE_DB_NOT_READY(this.nodeManager.uuid);
        }

        return this.db;
    }

    /**
     * To set engine mode :
     *  - standalone mode : scan runs in the same process than web server
     *  - master mode : only the webserver and some cmp are running. It spawns slave nodes and distributes scans.
     *  - slave mode : runs scans and are connected to devices. It reports to master.
     *
     *
     * @param {DexcaliburEngineMode} pType One os upported mode
     * @method
     */
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
     * To get the project scheduler
     *
     * The purpose of project scheduler is to distribute ProjectOrder (request of new project)
     * to the right slave node, queue it and to instanciate new slave node if possible
     * 
     * @
     * @method
     */
    getProjectScheduler():ProjectScheduler {
        return this.projectScheduler;
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
    printWebBanner( pWebPort:number|string, pWsPort:number|string){

        let etype:string = "";
        switch (this.engine_type){
            case DexcaliburEngineMode.STANDALONE:
                etype = "STANDALONE";
                break;
            case DexcaliburEngineMode.MASTER:
                etype = "MASTER";
                break;
            case DexcaliburEngineMode.SLAVE:
                etype = "SLAVE";
                break;
        }

        etype += ` [node=${this.nodeManager.uuid}]`;

        Logger.info("\n\n"
        + LOGO
        + PACKAGE_JSON.version
        + (" ".repeat(78-14-PACKAGE_JSON.version.length))
        +"by @FrenchYeti \n"
        +"╔════════════════════════════════════════════════════════════════════════════╗\n"
        +"║ WebServer running on : http://127.0.0.1:"+pWebPort+(" ".repeat(78-43-(""+pWebPort).length))+"║\n"
        +"║ WebSocket : http://127.0.0.1:"+pWsPort+(" ".repeat(78-32-(""+pWsPort).length))+"║\n"
        +"║ Mode : "+etype+(" ".repeat(78-10-etype.length))+"║\n"
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
        await this.nodeManager.loadInternalState();


        if(process.env.DXC_SAVE_SETTINGS=="1"){
            this.settings.save();
        }
    }

    async enableInstallMode(pConfig:Settings.GlobalSettings, pRandomUname = false):Promise<void> {
        this._installMode = true;
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

            this.registry = ss.getRegistry();

            this.db = new EngineDatabase(this, ss.getDatabaseSettings());
            await this.db.connect();

            await this.userSvc.initService(this);

            if(this._installMode){

                // search if "local" account already exists
                let acc = await this.userSvc.listLocalAccounts();

                if(acc.length==0){
                    // create local acc
                    const uname = "0:"+randomUUID();
                    await this.userSvc.createLocalUser(
                        uname,
                        [
                            this.aclManager.getRole('local_admin')
                        ],
                        uname
                    );
                    acc = await this.userSvc.listLocalAccounts();
                }

                // enable local authentication
            }

            //this.db.registerScheduler();

            Logger.info("[ENGINE] server settings init : Done");
        }catch(err){
            if(UserServiceException.is(err,UserServiceException.ERR.DB_IS_NOT_READY)){
                // forward exception
                throw err;
            }
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


        this.orgMgr = new OrganizationManager(this);

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
        await this.deviceMgr.load();
        Logger.debug('PASS3');

        this.updater.run( DXC_LIFECYCLE_EVENT.DEV_MGR_AFTER_INIT);

        LicenceManager.replenish();

        // init AuditManager singleton
        await this.getAuditManager().init();

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
        AvdHelper.init(this.extMgr.getTool('avd'));
        //AvdEmuHelper.init(this.extMgr.getTool('avdmanager'));

        if(this._cliMode===false){
            // setup web server serving API
            this.webserver = new WebServer(
                _path_.join(Util.__dirname(import.meta.url), 'webserver','www'),
                pWebGuiCfg
            );

            // TODO : override webserver settings with GUI config
            //await this.webserver.configureAuth(this.settings.getServerSettings().getAuthenticationSettings());
            this.webserver.configure(this.settings.getWebserverSettings());
            await this.webserver.setContext(this);
            this.webserver.useProductionMode();

            // setup web socket server
            this.wsserver = new WebsocketServer(this);

            // TODO : override webserver settings with GUI config
            // pass allowed origins to init
            this.wsserver.init(this.settings.getWebserverSettings());

        }

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
     * To get WebServer instance
     * @returns {WebServer} Web server instance
     * @method
     */
    getWebsocketServer():WebsocketServer{
        return this.wsserver;
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
        let ports = {web:-1, ws:-1};

        // Start the web server serving Installer UI
        if(pWebPort==null){
            ports.web = this.webserver.start();
        }else{
            ports.web = this.webserver.start((typeof pWebPort==='string')?parseInt(pWebPort,10):pWebPort);
        }

        // if server run in production mode (instead of install mode)
        // then start web socket server
        if(this.mode == MODE.NORMAL) {
            ports.ws = this.wsserver.start(); //(typeof pWebPort === 'string') ? parseInt(pWebPort, 10) + 1 : pWebPort + 1)
        }


        this.printWebBanner(ports.web, ports.ws);
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
    async listProjectsOf( pUser:UserAccount):Promise<Record<string,DexcaliburProject>> {
        const PUIDS = this.workspace.listProjects();

        const map:Record<string,DexcaliburProject> = {};
        let project:DexcaliburProject;

        for(let i=0; i<PUIDS.length; i++){
            try{
                // only authorized user can read metadata
                project =  await DexcaliburProject.getInformationOf( this, PUIDS[i], pUser);
                if(project!=null){
                    map[PUIDS[i]] = project;
                }
            }catch(err){
                Logger.error("[ENGINE][LIST PROJECT] "+err.message);
                Logger.error(err.stack);
            }
        }
        return map;
    }


    /**
     * To get active project by its UID
     *
     * @return {DexcaliburProject} Project for the given UID
     * @method
     */
    getProject(pProjectUID:string):Nullable<DexcaliburProject>{
        if(this.active[pProjectUID] instanceof DexcaliburProject){
            return this.active[pProjectUID];
        }

        return null;
    }

    /**
     * To get all active projects of the engine instance, optionnaly filtered by owner
     *
     * @return {Record<DexcaliburProjectUUID, DexcaliburProject>} A map of cctive projects, indexed by project UIDs
     * @method
     * @since 1.0.0
     */
    getActiveProjects(pUser:Nullable<UserAccount> = null):Record<DexcaliburProjectUUID, DexcaliburProject> {

        // TODO : add ACL which allows non-owner but authorized auditor (group/team) to work on this project

        if(pUser === null){
            return this.active;
        }else{
            const sub:Record<DexcaliburProjectUUID, DexcaliburProject> = {};
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
     * TODO : disable project (move to backup folder) instead of perform hard delete
     *
     * @param {string} pUID Project UID
     * @return {boolean} Rteurn TRUE if operation is successfull, else FALSE
     * @method
     */
    async deleteProject( pAccount:UserAccount, pUID:string, pForce = false):Promise<boolean>{
        let success = false;
        try{
            // if the project is already loaded, instance can be retrieved
            // from engine instance
            // else project must be loaded first
            if(this.active[pUID] != null){
                // verifiy the project is owned byt he issuer
                if(pForce || this.active[pUID].isOwnedBy(pAccount)){
                    // if the project is local remmove it

                    this.updater.run( DXC_LIFECYCLE_EVENT.CLOSE_PROJECT, this.active[pUID]);

                    // remove files
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

            if(success){
                success = await this.getEngineDB().deleteProjectByUID(pUID);
            }
        }catch(err){
            Logger.error("[ENGINE] "," deleteProject() failed",err.message, err.stack);

            this.log("Project ["+pUID+"] cannot be deleted. See error message.", null, err.code);
        }

        if(success){

            this.log("Project ["+pUID+"] deleted. ", null);
            Logger.success("[ENGINE] ",`Project "${pUID}" has been deleted successfully [requester=${pAccount!=null?pAccount.getUID():'ENGINE (cleanup)'}]`);
        }else{
            Logger.error("[ENGINE] ",`Project "${pUID}" cannot be deleted. See logs  [requester=${pAccount!=null?pAccount.getUID():'ENGINE (cleanup)'}]`);

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
     * @deprecated
     */
    async openProject( pUserAccount:UserAccount, pUID:string):Promise<DexcaliburProject>{
        let project:DexcaliburProject = null, success:any = false;

        const wf:Workflow = this.getWorkflow( pUID);
        Logger.info("ENGINE : openProject : workflow : "+(wf!=null? wf.getUID() : '<null>'));

        try{
            wf.pushStatus(new StatusMessage(5, "Scanning connected devices"));
            await DeviceManager.getInstance().scan();


            Logger.success("[ENGINE] [OPEN PROJECT] Device manager refreshed");

            wf.pushStatus(new StatusMessage(7, "Loading project data"));
            project = await DexcaliburProject.load(this, pUID, pUserAccount, null);

            Logger.success("[ENGINE] [OPEN PROJECT] Project loaded");
            // enable auto-update of project in DB when some specifics events
            // of the project happen
            await this.getEngineDB().attachProject(project);

            // update or create
            project.state = ProjectState.OPEN_START;

            // project = await this.getEngineDB().save(project) as DexcaliburProject;
            DexcaliburEngine.printBanner();

            Logger.debug("[ENGINE] Before project open :");

            wf.stepUp(0.1);

            Logger.success("[ENGINE] [OPEN PROJECT] Project attached to global DB");
            success = await project.open();


            Logger.success("[ENGINE] [OPEN PROJECT] Project opened");

            wf.pushStatus(StatusMessage.newSuccess("Project is ready."));
            this.active[pUID] = project;
            this.updater.run( DXC_LIFECYCLE_EVENT.OPEN_PROJECT, project);

            project.state = ProjectState.OPEN;
            this.log("Project loaded", project);

            // update db
            //this.getEngineDB().saveProject(project);

            //this.webserver.setProject(project);
        }catch(err){
            Logger.error("ENGINE"," openProject() failed : "+err.message+"\n"+err.stack);
            this.log("Project cannot be opened. See error message.", project, err.code);
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
     * @param {string} pFileType Local path of the APK to analayze
     * @param {Nullable<Device>} pDevice Optional. Default NULL. The default target device for the project.
     * @param {UserAccount} pUserAccount Optional. Default NULL. The default target device for the project.
     * @param {Nullable<Platform>} pPlatform Optional.
     * @param {any} pAnalyzersOpts Optional.
     * @param {Nullable<ApplicationUnit>} pAppUnit Optional. Application unit
     * @return {Promise<DexcaliburProject>} The project instance
     * @async
     * @method
     */
    async newProject( pUID:string,  pInputs:ProjectInput[], /*pAppPath:string, pFileType:string,*/
                      pDevice:Nullable<Device>=null, pUserAccount:UserAccount = null,
                      pPlatform:Nullable<Platform> = null, pAnalyzersOpts:any = {},
                      pAppUnit:Nullable<ApplicationUnit> = null, pWorkflow:Nullable<string|Workflow> = null):Promise<DexcaliburProject>{



        /**
         * @deprecated
         */
        let apkFile:ApkPackage = null;
        let appFile:Nullable<TargetApp> = null;


        let project:DexcaliburProject = null;

        let wf:Workflow;
        if(typeof pWorkflow=='string'){
            wf = this.getWorkflow(pWorkflow, true);
        }else if(pWorkflow!=null){
            wf = this.getWorkflow(pUID, true);
        } else{
            wf = pWorkflow;
        }

        if(wf===null){
            throw EngineNodeException.PROJECT_HAS_NOT_WORKFLOW(pUID);
        }

        if(!wf.isStarted()) wf.start()

        wf.pushStatus(new StatusMessage( 2, "Scanning connected devices"));
        await DeviceManager.getInstance().scan();

        //validate or suggest project UID

        wf.pushStatus(new StatusMessage( 4, "Verify project UID"));
        if(DexcaliburProject.exists(pUID)){
            pUID = DexcaliburProject.suggests(pUID);
        }

        //  retrieve project from DB or create it
        try{
            project = await this.getProjectManager().getProject(pUserAccount,pUID);
            project.setEngine(this);
        }catch(err){
            project = new DexcaliburProject({
                engine: this,
                uid: pUID
            });
            project.state = ProjectState.ORDERED;
            project = await this.getEngineDB().createProject(project);
        }


        // init analyzers configure
        // keep it before any actions
        Logger.info('[ENGINE] Configuring generic analyzers ...');
        wf.pushStatus(new StatusMessage( 5, " Configuring generic analyzers ..."));


        /**
         * One time per project :
         * - create project workspace
         *
         */
        await project.create();


        // complete
        const analCfg = project.getAnalyzerConfiguration(); // platform.getUID());
        analCfg.setFileAnalysisMode(pAnalyzersOpts.fa_mode);
        analCfg.setNativeAnalysisMode(pAnalyzersOpts.na_mode);
        analCfg.addPkgAnalyzerOptions(pAnalyzersOpts);


        // Project can be standalone and not attached to an application unit
        // however, if an app unit is specified, the UUID of the project is added to the
        // list of app unit, and only members of the application unit will be able to access
        // to project
        if(pAppUnit!=null){
            await this.getOrgManager().attachProject(pUserAccount, pAppUnit, project);
        }

        await this.getEngineDB().attachProject(project);

        if(pUserAccount != null){
            project.changeOwner( pUserAccount, this.getInternalAcc());
        }


        project.setWorkflow(wf);

        Logger.info('[ENGINE] Creating new project : ',pUID);

        wf.pushStatus(new StatusMessage( 6, "Initialize project"));

        if(pDevice != null){
            wf.pushStatus(new StatusMessage( 8, "Set project default device"));
            project.setDevice(pDevice);
        }

        if(pPlatform!=null){
            project.synchronizePlatform(pPlatform.getUID());
        }

        /**
         * For every projects :
         * - create analyzers instances according to target platform.
         * - create main event bus
         * - ..
         *
         * If project already exists :
         * - restore analyzers states
         *
         */
        await project.init(wf);

        DexcaliburEngine.printBanner();



        /*if(pPlatform!=null){
            project.synchronizePlatform(pPlatform.getUID());
        }*/

        // open APK, analyze manifest

        wf.pushStatus(new StatusMessage( 8, "Analyze App file"));
        wf.stepUp(10);


        // set targeted binary file, optionnaly parse it according to device type
        // this steps triggers package analysis such as linked resources (not the package content)

        console.log("PROJECT INPUTS > ",pInputs);

        // inputs must be attached sequentially
        appFile = await project.useApp(pInputs);

        //apkFile = await project.useAPK(pAppPath);

        // useApp

        // create project.json file
        if(apkFile != null || appFile!=null){
            project.state = ProjectState.OPEN;
            project.save();

            this.active[pUID] = project;
            this.webserver.setProject(project);


            this.updater.run( DXC_LIFECYCLE_EVENT.NEW_PROJECT, project);

            return project;
        }else{
            Logger.error('[ENGINE] Error : application extraction failed.')
            return null;
        }
    }


    /**
     * To detect if Frida is installed and get version
     *
     * @deprecated in v1.0.0
     */
    getLocalFridaVersion():string{
        return FridaHelper.getLocalFridaVersion(FRIDA_BIN).version;
    }

    /**
     * To close an opened project
     *
     * @param {DexcaliburProject} pProject The project to close
     * @return {boolean}
     */
    closeProject( pUser:UserAccount, pProject:DexcaliburProject):boolean {

        AccessControl.isAuthorized(
            AccessControl.access.PROJ_CLOSE_OWN,
            pUser,
            pProject,
            [
                ProjectAccessControl.attr.OWNER,
                ProjectAccessControl.attr.TESTER
            ]
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
    newWorkflow(pName:string, pExternal = false):Workflow {
        const wf:Workflow = new Workflow({ uid:(pExternal?'':'de:')+pName });
        wf.start();
        this.registerWorkflow(wf);
        return wf;
    }

    /**
     * To create a new workflow and to attach it to engine
     * @param pName
     */
    registerWorkflow(pWf:Workflow):void {

        this.workflows.push(pWf);

        // execute scheduled job
        if(this.wfCbs[pWf.getUID()]!=null){
            Logger.info("[ENGINE][registerWorkflow] Execute scheduled jobs ["+this.wfCbs[pWf.getUID()].length+"]");
            this.wfCbs[pWf.getUID()].map( vFn => {
                vFn(pWf);
            })
        }
    }

    /**
     * To create a new workflow and to attach it to engine
     * @param pName
     */
    getWorkflow(pUID:string, pExternal=false):Workflow{
        let f:Workflow = null;
        const name = (pExternal? '' : 'de:')+pUID;

        console.log(this.workflows);
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

    clean(pEvent:CleanupEvent){
        if(this._cleanup){
            this.cleanup$.next(pEvent);
        }
    }

    /**
     * To prevent any cleanup events
     *
     * @method
     */
    noCleanup():void {
        this._cleanup = false;
    }

    /**
     * To log a message
     *
     * @param {string} pMessage Message of the log
     * @param {Nullable<DexcaliburProject>} pProject Optional. Project related to log message
     * @param {number} pErr Optional. If the message is an error message, then this parameter should contains the error code.
     * @method
     */
    log(pMessage:string, pProject:Nullable<DexcaliburProject>=null, pErr:number=-1):void {
        const msg = new LogMessage({
            node: this.nodeManager.uuid,
            time: (new Date()).getTime(),
            msg: pMessage,
            project: (pProject!=null ? pProject.getUID() : null),
            error: pErr
        });

        ( async ()=>{
            this.getEngineDB().getCollectionOf(LogMessage.TYPE.getType()).asyncAddEntry(msg.getUID(),msg);
        })();
    }

    /**
     * To check is the engine run in offline mode
     *
     * @return {boolean} TRUE if offline, else FALSE
     * @method
     */
    isOffline():boolean {
        return this.offline;
    }

    repairMode( pRepairOptions:RepairOptions){
        this._repairOpts = pRepairOptions;
    }

    getRepairOptions():Nullable<RepairOptions> {
        return this._repairOpts;
    }

    /**
     * This method listen for signals receipt by this process
     *
     * @private
     */
    private _listenProcessSignals() {
        process.on('SIGINT', () => {

            console.log("\n");
            // clear temporary files

            // clear DB connections

            // kill children nodes
            this.nodeManager.killNodes('SIGINT');

            Logger.success('DxEngine has been stopped successfully');
            process.exit(0);
        });
    }

    /**
     * A method to hook the state where WebServer started successfully
     *
     * @param {WebServer} pWebServer web server (http, https, ...)
     * @method
     */
    afterWebServerStarted(pWebServer:WebServer):void {

        // if the engine is a SLAVE instance, notify the MASTER the instance is started
        if(this.getEngineMode()==DexcaliburEngineMode.SLAVE){
            this.nodeManager.notifyMaster(NodeState.IDLE);
        }

    }

    /**
     *
     */
    getAclManager():AccessControlManager {
        return this.aclManager;
    }

    getInternalAcc():UserAccount {
        return this._internalAcc;
    }

    getSecretManager():InternalSecretManager {
        if(this.secretManager==null){
            if(process.env.DXC_HOME!=null){
                this.secretManager = new InternalSecretManager(process.env.DXC_HOME);
            }else{
                this.secretManager = new InternalSecretManager(_path_.join( _os_.homedir(), DEXCALIBUR_HOME_DIRNAME));
            }
        }

        return this.secretManager;
    }

    getNodeManager():EngineNodeManager {
        return this.nodeManager;
    }

    getNodeUUID():EngineNodeUUID {
        return this.getNodeManager().uuid;
    }
}


