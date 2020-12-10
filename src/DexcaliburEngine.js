const _fs_ = require('fs');
const _path_ = require('path');
const _os_ = require("os");
const _url_ = require("url");


var Utils = require("./Utils");
var Logger = require("./Logger.js")();
var gAdmZip = null;
var gEngineInstance = null;


const Configuration = require("./Configuration.js");
const DexcaliburWorkspace = require("./DexcaliburWorkspace");
const DexcaliburProject = require("./DexcaliburProject");
const DexcaliburRegistry = require("./DexcaliburRegistry");
const PlatformManager = require("./PlatformManager");
const InspectorManager = require("./InspectorManager");
const DeviceManager = require("./DeviceManager");
const WebServer = require("./WebServer")

var PACKAGE_JSON = require("../package.json");

const InstallKit  = require('./Installer');
const CONFIG_PATH = _path_.join( _os_.homedir(), '.dexcalibur', 'config.json');
const PROJECT_UID_FMT = /^[A-Za-z0-9-_]+$/;
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
var REMOTE_URLS = {
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
class DexcaliburEngine
{
    /**
     * To instanciate DexcaliburEngine.
     * 
     * @private
     * @constructor
     */
    constructor(){
        /**git diff 
         * Global configuration of Dexcalibur
         * @field
         */
        this.config = null;

        /**
         * Workspace of Dexcalibur. 
         * By default, this workspace contains all project workspaces.
         * 
         * @field
         */
        this.workspace = null;

        /**
         * Web Server
         * @field
         */
        this.webserver = null

        /**
         * Device Manager
         * @field
         */
        this.deviceMgr = null;

        /**
         * Plateform manager
         * @field
         */
        this.platformMgr = null;

        /**
         * Inspector manager
         * @type {InspectorManager}
         * @field
         */
        this.inspectorMgr = null;


        /**
         * Registry 
         * @field
         */
        this.registry = null;

        /**
         * To hold active projects
         * @field
         */
        this.active = {};
    }
    
    /**
     * To get an instance of the engine
     * 
     * @returns {DexcaliburEngine} engine
     * @method
     * @static
     */
    static getInstance(){
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
    getRegistry(){
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
    printWebBanner( pPort){
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
    static printFirstBanner( pPort){
        Logger.info("\n\n"
        + LOGO
        + PACKAGE_JSON.version
        + (" ".repeat(78-14-PACKAGE_JSON.version.length))
        +"by @FrenchYeti \n"
        +"╔════════════════════════════════════════════════════════════════════════════╗\n"
        +"║ Dexcalibur is not fully configured, please visit URL below to              ║\n"
        +"║ finalize install:                                                          ║\n"
        +"║                                                                            ║\n"
        +"║ http://127.0.0.1:"+pPort+(" ".repeat(78-20-pPort.length))+"║\n"
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
    static requireInstall(){
        return (_fs_.existsSync( CONFIG_PATH) == false);
    }

    /**
     * To load data from workspace and to init registry
     * 
     * @method
     */
    loadWorkspaceFromConfig(pDexcaliburHome=null, pOverride=null){
        let d = null;
        
        if(process.env.DEXCALIBUR_HOME != null)
            d = JSON.parse( _fs_.readFileSync( _path_.join( process.env.DEXCALIBUR_HOME, 'config.json')) );
        else if(pDexcaliburHome!= null)
            d = JSON.parse( _fs_.readFileSync( _path_.join( pDexcaliburHome, 'config.json')) );
        else
            d = JSON.parse( _fs_.readFileSync(CONFIG_PATH) );

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
    boot( pRestore=false){
        let self=this; 
        
        // init workspace
        this.workspace.init();

        // read configuration file into target workspace 
        this.loadConfig( pRestore);

        // init
        this.init();

        //  enumerate local and remote platforms
        this.platformMgr.enumerate();

        //  enumerate local and remote inspectors
        this.inspectorMgr.enumerate();

        // load device manager db
        this.deviceMgr.load();

        // restart child ADB server
        (async function(){
            self.deviceMgr.getBridgeFactory('ADB').newGenericWrapper().kill();
        })();

        return true;
    }

    /**
     * 
     * @param {Boolean} pRestore If TRUE backed up configuration is loaded,  
     * @method
     */
    loadConfig( pRestore){
        let data = null;

        try{
            if(pRestore){
                data = this.workspace.readConfigurationBackupFile();
            }else{
                data = this.workspace.readConfigurationFile();
            }

            this.config = Configuration.from( data );
        }catch(e){
            console.log(e);
            Logger.error(`Dexcalibur configuration file [ ${pConfigurationPath} ] not found.`);
        }
    }

    /**
     * To init the context shared by any project
     * 
     * @method
     */
    init(){
        // setup web server
        this.webserver = new WebServer();

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
     * To check if given project uid has a valid format
     *
     * @param {string} pProjectUID
     */
    isValidProjectUID( pProjectUID){
        return PROJECT_UID_FMT.test(pProjectUID);
    }

    /**
     * To init engine before install
     * 
     * @method
     */
    preInstall(){
        // setup web server
        this.webserver = new WebServer(this);

        this.webserver.setContext(this);
    }

    /**
     * To get configuration object
     * @method 
     */
    getConfiguration(){
        return this.config;
    }

    /**
     * To get WebServer instance
     * @returns {WebServer} Web server instance
     * @method
     */
    getWebserver(){
        return this.webserver;
    }

    /**
     * To get platform manager instance
     * 
     * @method
     */
    getPlatformManager(){
        return this.platformMgr;
    }

    /**
     * To get inspector manager instance
     * 
     * @method
     */
    getInspectorManager(){
        return this.inspectorMgr;
    }

    /**
     * To get device manager instance
     * 
     * @method
     */
    getDeviceManager(){
        return this.deviceMgr;
    }

    /**
     * To create the workspace
     * @param {String} pPath Path where the workspace will be created
     */
    createWorkspace( pPath){
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

        let tmpAdbPath, tmpApktoolPath, tmpPlatformPath;
        let self = this;

        // init installer
        this.installer = new InstallKit.Installer( this);

        
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
                    self.installer.progress += vStep;
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "Android platform tool downloaded. Uncompressing ..");
                    zip.extractAllTo( _path_.join(self.workspace.binFolder), true);
                    _fs_.unlinkSync(tmpAdbPath);
                    _fs_.chmodSync( _path_.join(self.workspace.binFolder,'platform-tools','adb'), 0o555);
                    self.installer.progress += vStep;
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "Android platform tool installed");
                },
                onSuccess: function(){
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "Android platform tool configured");
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
                    self.installer.progress += 2*vStep;
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "APKTool installed");

                    // save workspace configuration
                    self.installer.progress += 2*vStep;
                    self.workspace.saveConfiguration( self.config);
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "Configuration");

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
                    self.installer.progress += vStep;
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "Android 27 downloaded");

                    // backsmali 
                    let p = self.platformMgr.getRemotePlatform('sdk_androidapi_29_google');
                    //console.log(p);
                    self.platformMgr.install( p);

                    // save workspace location into ~/.dexcalibur
                    self.installer.progress += vStep;
                    self.postInstall();
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "Finished");
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
    prepareInstall( pWebPort){


        this.preInstall();

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

    getInstallerStatus(){
        return this.installer.getStatus();
    }

    start( pWebPort){

        

        // Start the web server serving Installer UI
        this.webserver.start(pWebPort);
    }

    /**
     * @method
     */
    getProjects(){
        return this.workspace.listProjects();
    }

    /**
     * @method
     */
    getProject(pProjectUID){
        if(this.active[pProjectUID] instanceof DexcaliburProject){
            return this.active[pProjectUID]; 
        }

        return null;
    }

    deleteProject( pUID){
        let success = false;
        try{
            let proj = this.webserver.project;

            if(this.active[pUID] != null) this.active[pUID] =  null;
            if(proj!= null && proj.getUID()==pUID){
                this.workspace.setProject(null);
            }

            Utils.recursiveRmDirSync(
                _path_.join( this.workspace.getLocation(), pUID )
            );

            success = true;
        }catch(err){
            console.log(err);
            Logger.error("[ENGINE] "," deleteProject() failed");
        }

        return success;
    }

    async openProject( pUID){
        let project = null, success = false;
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

    async newProject( pUID, pApkPath, pDevice, pPlatform='min'){

        let project = null;
        let success = null;

        await DeviceManager.getInstance().scan();

        //validate or suggest project UID 
        if(DexcaliburProject.exists(pUID)){
            pUID = DexcaliburProject.suggests(pUID);
        }

        project = new DexcaliburProject( this, pUID);

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
    getLocalFridaVersion(){
        return FridaHelper.getLocalFridaVersion(FRIDA_BIN);
    }

}

module.exports = DexcaliburEngine;

