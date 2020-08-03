import DexcaliburRegistry from "./DexcaliburRegistry";
import PlatformManager from "./PlatformManager";

import * as  _fs_ from 'fs';
import * as  _path_ from 'path';
import * as  _os_ from "os";
import * as  _url_ from "url";
import DexcaliburWorkspace from "./DexcaliburWorkspace";

import * as Log from './Logger';
import StatusMessage from "./StatusMessage";
import DexcaliburProject from "./DexcaliburProject";
import Util from "./Utils";
import Platform from "./Platform";
import WebServer from "./WebServer";
import DeviceManager from "./DeviceManager";
import InspectorManager from "./InspectorManager";
import Configuration from "./Configuration";
import Installer from "./Installer";
import FridaHelper from "./FridaHelper";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var gAdmZip:any = null;
var gEngineInstance:DexcaliburEngine = null;
var PACKAGE_JSON:any = require("../package.json");

const CONFIG_PATH = _path_.join( _os_.homedir(), '.dexcalibur', 'config.json');

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
 *  - Start Dexcalibur
 *  - When the user selects or creates a project from SplashScreen, corresponding 
 *  Project are loaded / created
 * 
 *  @class
 */
export default class DexcaliburEngine
{
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
    active:any = {};

    /**
     * installer
     * @field
     */
    installer:Installer = null;

    /**
     * To instanciate DexcaliburEngine.
     * 
     * @private
     * @constructor
     */
    constructor(){

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
     * To get active registry 
     * 
     * @returns {DexcaliburRegistry} Current active registry
     * @method
     */
    getRegistry():DexcaliburRegistry{
        return this.registry;
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
     * To load data from workspace and to init registry
     * 
     * @method
     */
    loadWorkspaceFromConfig(pDexcaliburHome:string=null, pOverride:any=null){
        let d:any = null;
        
        if(process.env.DEXCALIBUR_HOME != null)
            d = JSON.parse( _fs_.readFileSync( _path_.join( process.env.DEXCALIBUR_HOME, 'config.json')).toString() );
        else if(pDexcaliburHome!= null)
            d = JSON.parse( _fs_.readFileSync( _path_.join( pDexcaliburHome, 'config.json')).toString() );
        else
            d = JSON.parse( _fs_.readFileSync(CONFIG_PATH).toString() );

        if(pOverride != null){
            for(let i in pOverride) d[i] = pOverride[i];
        }

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
     */
    prepareInstall( pWebPort:number|string, pWebRoot:string){


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
     * @ 
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

    start( pWebPort:string|number, pUI:string=null){

        

        // Start the web server serving Installer UI
        this.webserver.start((typeof pWebPort==='string')?parseInt(pWebPort,10):pWebPort);
    }

    /**
     * @method
     */
    getProjects():string[]{
        return this.workspace.listProjects();
    }

    /**
     * @method
     */
    getProject(pProjectUID:string):DexcaliburProject{
        if(this.active[pProjectUID] instanceof DexcaliburProject){
            return this.active[pProjectUID]; 
        }

        return null;
    }

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

    async openProject( pUID:string):Promise<DexcaliburProject>{
        let project:DexcaliburProject = null, success:any = false;
        try{
            await DeviceManager.getInstance().scan();

            project = DexcaliburProject.load(this, pUID);

            // init

//            project = new DexcaliburProject( this, pUID);
            
            DexcaliburEngine.printBanner();
            
            success = await project.open();
            this.active[pUID] = project;
            this.webserver.setProject(project);
        }catch(err){
            console.log(err);
            Logger.error("ENGINE"," openProject() failed");
        }

        return project;
    }

    // TODO : remove platform ?
    async newProject( pUID:string, pApkPath:string, pDevice:any):Promise<DexcaliburProject>{

        let project:DexcaliburProject = null;
        let success:boolean = null;

        await DeviceManager.getInstance().scan();

        //validate or suggest project UID 
        if(DexcaliburProject.exists(pUID)){
            pUID = DexcaliburProject.suggests(pUID);
        }

        project = new DexcaliburProject( this, pUID);

        Logger.info('[ENGINE] Creating new project : ',pUID);
        project.init();


        DexcaliburEngine.printBanner();

        if(pDevice != null){
            project.setDevice(pDevice);
        }

        // open APK, analyze manifest
        success = await project.useAPK(pApkPath);

        // create project.json file
        if(success){
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

}


