import DexcaliburRegistry from "./DexcaliburRegistry";
import PlatformManager from "./PlatformManager";

import * as  _fs_ from 'fs';
import * as  _path_ from 'path';
import * as  _os_ from "os";
import DexcaliburWorkspace from "./DexcaliburWorkspace";

import * as Log from './Logger';
import StatusMessage from "./StatusMessage";
import DexcaliburProject from "./DexcaliburProject";
import Util from "./Utils";
import WebServer from "./WebServer";
import DeviceManager from "./DeviceManager";
import InspectorManager from "./InspectorManager";
import Configuration from "./Configuration";
import Installer from "./Installer";
import FridaHelper from "./FridaHelper";
import {WebsocketServer} from "./WebsocketServer";
import {TerminalServer} from "./TerminalServer";
import {DexcaliburServerChildProcess, IpcMode} from "./DexcaliburServerChildProcess";
import {ApkPackage} from "./android/ApkPackage";
import {Workflow} from "./Workflow";
import {ValidationCapable, ValidationRule} from "./Validator";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var gAdmZip:any = null;
var gEngineInstance:DexcaliburEngine = null;
var PACKAGE_JSON:any = require(_path_.join(__dirname,"..","..","package.json"));



const LOG_ENABLED = true;
const LOG_FILE = (process.env.DXC_LOG_PATH? process.env.DXC_LOG_PATH : null); //"/Users/salade/Documents/repos/dexcalibur-codebase/dexcalibur-ui/dexcalibur.logs";

function __log( pMessage:string):void{
    if(LOG_ENABLED)
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
var REMOTE_URLS:any = {
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
 *  - If this file is not existing, then Dexcalibur starts into "install mode" 
 * and import the configuration file specified by "/home/ * /.dexcalibur/config.json"
 *  - Else, Dexcalibur starts into "production mode"
 * 
 *  - Init DexcaliburWorkspace  
 *  - Start Dexcalibur (web server and socket server)
 *  - When the user selects or creates a project from SplashScreen, corresponding 
 *  Project are loaded / created
 * 
 *  @class
 */
export default class DexcaliburEngine extends ValidationCapable
{

    /**
     * Configuration file path
     * @type {string}
     * @field
     * @private
     * @since 1.0.0
     */
    private _configPath:string = null;

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
     * installer
     * @field
     */
    installer:Installer = null;


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
     * IPC describes server behavior
     *
     * Mode are follow :
     * - API : the engine starts automatically, it runs the web server and the user can use both IPC and WebApp.
     * - WAIT : the engine is not initialized and wait for command
     *
     * @type {IpcMode}
     * @since 1.0.0
     * @fielc
     */
    ipcMode: IpcMode = IpcMode.API;

    mode: MODE = MODE.NORMAL;

    workflows: Workflow[] = [];

    /**
     * Hold workflow's callbacks to execute when the WF is created
     */
    wfCbs: any = {};

    /**
     * To instanciate DexcaliburEngine.
     * 
     * @private
     * @constructor
     */
    constructor(){
        super({
            'engine:project.uid.new': [
                ValidationRule.newCustomAssert( x => {
                    return (this.workspace.listProjects().indexOf(x)==-1);
                })
            ],
            'engine:project.uid': [
                ValidationRule.newRegexpAssert(new RegExp('^[a-zA-Z0-9\\_\s.-]+$')),
            ]
        })
    }
    
    /**
     * To get an instance of the engine
     * 
     * @returns {DexcaliburEngine} engine
     * @method
     * @static
     */
    static getInstance():DexcaliburEngine{

        if(gEngineInstance == null){
            gEngineInstance = new DexcaliburEngine();
        }

        return gEngineInstance;
    }

    /**
     * To enable Inter-Process Communication (IPC)
     *
     * When IPC is enabled, Dexcalibur wait command
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
     * 
     * @static
     * @method
     */
    static requireInstall():boolean{
        return (_fs_.existsSync( CONFIG_PATH) == false);
    }

    /**
     * To set configuration path
     * @param {string} pPath Configuartion file path
     * @method
     * @since 1.0.0
     */
    setConfigurationPath(pPath:string):void {
        this._configPath = pPath;
    }

    /**
     * To load data from workspace and to init registry
     * 
     * @method
     */
    loadWorkspaceFromConfig(pDexcaliburHome:string=null, pOverride:any=null){
        let d:any = null;
        
        if(process.env.DEXCALIBUR_HOME != null)
            d = JSON.parse( _fs_.readFileSync( _path_.join( process.env.DEXCALIBUR_HOME, 'config.json')).toString() );
        else if(this._configPath != null) {
            const data = JSON.parse(_fs_.readFileSync(this._configPath).toString());
            d = data.server;
        }else if(pDexcaliburHome!= null)
            d = JSON.parse( _fs_.readFileSync( _path_.join( pDexcaliburHome, 'config.json')).toString() );
        else
            d = JSON.parse( _fs_.readFileSync(CONFIG_PATH).toString() );

        if(pOverride != null){
            for(let i in pOverride) d[i] = pOverride[i];
        }

        _fs_.writeFileSync('/Users/salade/Documents/repos/dexcalibur-codebase/dexcalibur-ts/electron.logs','Config from installer'+JSON.stringify(d)+"\n"+process.env.DEXCALIBUR_HOME+"\n"+this._configPath);

        this.workspace = DexcaliburWorkspace.getInstance( d.workspace);
        this.registry = new DexcaliburRegistry( d.registry, d.registryAPI);
    }   
    
    /**
     * To load bootstrap file or configuration from home.
     * 
     * Require `this.workspace` is loaded.  
     * 
     * @returns {Boolean} TRUE if ready to start, FALSE if install is required.
     * @method
     */
    boot( pRestore:boolean=false, pWebRoot:string = null){
        let self:DexcaliburEngine=this;
        
        // init workspace
        this.workspace.init();

        // read configuration file into target workspace 
        this.loadConfig( pRestore);

        // init
        this.init( pWebRoot);

        this.terminalSrv = new TerminalServer({
            _engine: this
        });

        //  enumerate local and remote platforms
        this.platformMgr.enumerate();

        //  enumerate local and remote inspectors
        this.inspectorMgr.enumerate();

        // load device manager db
        this.deviceMgr.load();

        // restart child ADB server
        (async function(){
            self.deviceMgr.getBridgeFactory('adb').newGenericWrapper().kill();
        })();

        return true;
    }

    /**
     * 
     * @param {Boolean} pRestore If TRUE backed up configuration is loaded,  
     * @method
     */
    loadConfig( pRestore:boolean) {
        let data:any = null;

        try{
            if(pRestore){
                data = this.workspace.readConfigurationBackupFile();
            }else{
                data = this.workspace.readConfigurationFile();
            }

            this.config = Configuration.from( data );
        }catch(e){
            console.log(e);
            Logger.error(`Dexcalibur configuration file not found.`);
        }
    }

    /**
     * To init the context shared by any project
     * 
     * @method
     */
    init(pWebRoot:string = null){

        if(pWebRoot === null){
            pWebRoot = _path_.join(__dirname, 'webserver', 'public');
        }

        // setup web server
        this.webserver = new WebServer(pWebRoot);

        this.webserver.setContext(this);

        this.webserver.useProductionMode();

        // setup web socket server
        this.wsserver = new WebsocketServer(this);

        // pass allowed origins to init;
        this.wsserver.init();

        this.platformMgr = PlatformManager.getInstance(this);

        this.deviceMgr = DeviceManager.getInstance();

        this.inspectorMgr = InspectorManager.getInstance(this);


/*

        // hook
        this.hook = new HookHelper.Manager(this, nofrida);
        this.hook.refreshScanner();
*/ 
    }

    /**
     * To init engine before install
     * 
     * @method
     */
    preInstall( pWebRoot:string){
        // setup web server
        this.webserver = new WebServer(pWebRoot);

        this.webserver.setContext(this);
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
     * To create the workspace
     * @param {String} pPath Path where the workspace will be created
     */
    createWorkspace( pPath:string){
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
     * To init installer
     *
     */
    initInstaller(){
        if(gAdmZip == null){
            gAdmZip = require('adm-zip');
        }

        let tmpAdbPath:string, tmpApktoolPath:string, tmpPlatformPath:string;
        let self:DexcaliburEngine = this;

        // init installer
        this.installer = new Installer( this);

        
        // define "ADB install" task 
        tmpAdbPath = _path_.join(this.workspace.tmpFolder,"platform_tools.zip");
        tmpApktoolPath = _path_.join(this.workspace.binFolder,"apktool.jar");
        tmpPlatformPath = _path_.join(this.workspace.apiFolder,"default.dex");


        this.installer.addTask(
            "Android platform tools",
            //new URL(REMOTE_URLS.adb),
            REMOTE_URLS.adb,
            tmpAdbPath,
            {
                // unzip platform-tools and copy ADB
                onPostDownload: function( vTask, vStep, vData){
                    let zip = new gAdmZip(tmpAdbPath);
                    self.installer.status = new StatusMessage(
                        self.installer.getStatus().getProgress()+vStep, "Android platform tool downloaded. Uncompressing ..");
                    zip.extractAllTo( _path_.join(self.workspace.binFolder), true);
                    _fs_.unlinkSync(tmpAdbPath);
                    _fs_.chmodSync( _path_.join(self.workspace.binFolder,'platform-tools','adb'), 0o555);
                    self.installer.status = new StatusMessage(
                        self.installer.getStatus().getProgress()+vStep,
                        "Android platform tool installed");
                },
                onSuccess: function(){
                    self.installer.status = new StatusMessage(
                        self.installer.getStatus().getProgress(), "Android platform tool configured");
                }
            }
        );

        this.installer.addTask(
            "APKTool",
//            new URL(REMOTE_URLS.apktool),
            REMOTE_URLS.apktool,
            tmpApktoolPath,
            {
                onPostDownload: function( vTask, vStep, vData){
                    // apktool downloaded
                    self.installer.status = new StatusMessage(
                        self.installer.getStatus().getProgress()+2*vStep, "APKTool installed");


                    // save workspace configuration
                    self.workspace.saveConfiguration( self.config);
                    self.installer.status = new StatusMessage(
                        self.installer.getStatus().getProgress()+2*vStep, "Configuration");

                    // save workspace location into ~/.dexcalibur
                    /*self.installer.progress += vStep;
                    self.postInstall();
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "Finished");*/
                } 
            },{
                followRedirect: true
            }
        );

        //console.log(REMOTE_URLS.officialRegistry+"android-sdk-apis/android-27.dex");
        this.installer.addSimpleTask(
            "Platform images",
            {
                onSuccess: function( vTask, vStep, vData){
                    // apktool downloaded
                    self.installer.status = new StatusMessage(
                        self.installer.getStatus().getProgress()+vStep, "Android 27 downloaded");

                    // backsmali 
                    let p = self.platformMgr.getRemotePlatform('sdk_androidapi_29_google');
                    //console.log(p);
                    self.platformMgr.install( p);

                    // save workspace location into ~/.dexcalibur
                    self.postInstall();
                    self.installer.status = new StatusMessage(
                        self.installer.getStatus().getProgress()+vStep, "Finished");
                } 
            }
        );

    }


    /**
     * To clear .dexcalibur folder and to trigger a new install
     * 
     * @method
     * @static
     */
    static clearInstall(){
        if(_fs_.existsSync(CONFIG_PATH))
            _fs_.unlinkSync(CONFIG_PATH);
    }

    /**
     * To start installer
     * Only for version < 1.x
     *
     * @deprecated
     * @method
     */
    prepareInstall( pWebPort:number|string, pWebRoot:string){

        this.mode = MODE.INSTALL;

        this.preInstall(pWebRoot);

        // create a default Configuration containing
        // pre-defined paths
        this.config = Configuration.getDefault();


        // Turn routing into "install mode"
        this.webserver.useInstallMode();

        // init registry
        this.registry = new DexcaliburRegistry( REMOTE_URLS.officialRegistry, REMOTE_URLS.officialRegistryAPI);

        DexcaliburEngine.printFirstBanner(pWebPort+"");
    }

    /**
     * To start downloading and installing dependencies
     *
     * Only for version < 1.x
     *
     * @deprecated
     * @method
     */
    startInstall(){
        this.installer.run();
    }

    /**
     * 
     */
    postInstall(){
        _fs_.writeFileSync(
            CONFIG_PATH,
            JSON.stringify({
                workspace: this.workspace.getLocation(),
                registry: REMOTE_URLS.officialRegistry,
                registryAPI: REMOTE_URLS.officialRegistryAPI
            })
        );
    }

    getInstallerStatus():StatusMessage{
        return this.installer.getStatus();
    }

    /**
     * To starts servers and child process
     *
     * @param pWebPort {number} Port number
     * @param pUI {Path} (Optional) Web root of the UI
     */
    start( pWebPort:string|number, pUI:string=null){

        // Start the web server serving Installer UI
        this.webserver.start((typeof pWebPort==='string')?parseInt(pWebPort,10):pWebPort);

        // if server run in production mode (instead of install mode)
        // then start web socket server
        if(this.mode == MODE.NORMAL) {
            this.wsserver.start((typeof pWebPort === 'string') ? parseInt(pWebPort, 10) + 1 : pWebPort + 1)
        }
    }

    /**
     * To retrieve project list
     *
     * @return {DexcaliburProject[]}
     * @method
     */
    getProjects():string[]{

        return this.workspace.listProjects();
    }

    /**
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
     * To get all active projects
     *
     * @return {DexcaliburProjectMap} A map of cctive projects, indexed by project UIDs
     * @method
     * @since 1.0.0
     */
    getActiveProjects():DexcaliburProjectMap {
        return this.active;
    }


    /**
     * To remove a project from the workspace. It erases files.
     *
     * @param {string} pUID Project UID
     * @return {boolean} Rteurn TRUE if operation is successfull, else FALSE
     * @method
     */
    deleteProject( pUID:string):boolean{
        let success:boolean = false;
        try{
            let proj:DexcaliburProject = this.webserver.project;

            if(this.active[pUID] != null) this.active[pUID] =  null;
            /*if(proj!= null && proj.getUID()==pUID){
                this.workspace.setProject(null);
            }*/

            Util.recursiveRmDirSync(
                _path_.join( this.workspace.getLocation(), pUID )
            );

            success = true;
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
    async openProject( pUID:string):Promise<DexcaliburProject>{
        let project:DexcaliburProject = null, success:any = false;

        let wf:Workflow = this.getWorkflow( pUID);
        Logger.info("ENGINE : openProject : workflow : "+(wf!=null? wf.getUID() : '<null>'));

        try{
            wf.pushStatus(new StatusMessage(5, "Scanning connected devices"));
            await DeviceManager.getInstance().scan();


            wf.pushStatus(new StatusMessage(7, "Loading project data"));
            project = DexcaliburProject.load(this, pUID);

            project.setWorkflow(wf);

            // init

//            project = new DexcaliburProject( this, pUID);
            
            DexcaliburEngine.printBanner();

            wf.stepUp(10);
            success = await project.open();


            wf.pushStatus(StatusMessage.newSuccess("Project is ready."));
            this.active[pUID] = project;
            this.webserver.setProject(project);
        }catch(err){
            Logger.error(err.message);
            Logger.error("ENGINE"," openProject() failed");
            wf.pushStatus(StatusMessage.newError("Project cannot be loaded. See logs for more details"));
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
    async newProject( pUID:string, pApkPath:string, pDevice:any=null):Promise<DexcaliburProject>{

        let project:DexcaliburProject = null;
        let success:boolean = null;
        let apkFile:ApkPackage = null;

        let wf:Workflow = this.getWorkflow( pUID);
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

        project.setWorkflow(wf);

        Logger.info('[ENGINE] Creating new project : ',pUID);

        wf.pushStatus(new StatusMessage( 6, "Initialize project"));
        project.init();


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

            return project;
        }else{
            Logger.error('[ENGINE] Error : APK extraction failed.')
            return null;
        }
    }

    /**
     * To detect if Frida is installed and get version
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
    closeProject(pProject:DexcaliburProject):boolean {

        if(Object.keys(this.getActiveProjects()).length>0){
            let p:any = {};
            for(let i in this.active){
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
        let wf:Workflow = new Workflow({ uid:'de:'+pName });
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
    getWorkflow(pUID:string, pExternal:boolean=false):Workflow{
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
    onNewWorkflow( pUID:string, pCallback:any, pExternal:boolean=false):void {
        const name = (pExternal? '' : 'de:')+pUID;
        if(this.wfCbs[name]==null){
            this.wfCbs[name] = [];
        }
        this.wfCbs[name].push(pCallback);
    }
}


