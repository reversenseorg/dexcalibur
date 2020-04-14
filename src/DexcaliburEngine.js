const _fs_ = require('fs');
const _path_ = require('path');
const _os_ = require("os");


var Logger = require("./Logger.js")();

const Configuration = require("./Configuration.js");
const DexcaliburWorkspace = require("./DexcaliburWorkspace");
const DexcaliburProject = require("./DexcaliburProject");
const WebServer = require("./WebServer")

var AdmZip = null;
const InstallKit  = require('./Installer');
const CONFIG_PATH = _path_.join( _os_.homedir(), '.dexcalibur', 'config.json');

/** 
 * List of remote location where each tool can be downloaded 
 * @constant
 */
var REMOTE_URLS = {
    // apktool redirect from "https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.4.1.jar",
    apktool: "https://bbuseruploads.s3.amazonaws.com/0becf6a1-1706-4f2e-9ae6-891e00a8dd5f/downloads/5b0ec3aa-15d9-462a-8573-3744c8855ee7/apktool_2.4.1.jar?Signature=jmQo3MJSfHOfEwSCRTdjA1zZWns%3D&Expires=1586629301&AWSAccessKeyId=AKIA6KOSE3BNJRRFUUX6&versionId=zmIH9wY6Q_aTyUGAwbMg_KwZ5VWcE4VW&response-content-disposition=attachment%3B%20filename%3D%22apktool_2.4.1.jar%22",
    adb: null
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
 */
class DexcaliburEngine
{
    constructor(){
        /**
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
        this.platformMgr = null

        /**
         * To hold active project
         */
        this.active = {};
    }
    

    static printBanner(){

        Logger.info("\n\n"
        +"███████╗ ███████╗██╗  ██╗ ██████╗ █████╗ ██╗     ██╗██████╗ ██╗   ██╗██████╗\n" 
        +"██╔═══██╗██╔════╝╚██╗██╔╝██╔════╝██╔══██╗██║     ██║██╔══██╗██║   ██║██╔══██╗\n"
        +"██║   ██║█████╗   ╚███╔╝ ██║     ███████║██║     ██║██████╔╝██║   ██║██████╔╝\n"
        +"██║   ██║██╔══╝   ██╔██╗ ██║     ██╔══██║██║     ██║██╔══██╗██║   ██║██╔══██╗\n"
        +"███████╔╝███████╗██╔╝ ██╗╚██████╗██║  ██║███████╗██║██████╔╝╚██████╔╝██║  ██║\n"
        +"╚══════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝\n"
        + PACKAGE_JSON.version
        + (" ".repeat(78-14-PACKAGE_JSON.version.length))
        +"by @FrenchYeti \n"
        +"╔════════════════════════════════════════════════════════════════════════════╗\n"
        +"║ How to use ?                                                               ║\n"
        +"║ > const Dexcalibur = require('./src/Project.js')                           ║\n"
        +"║ > var project = new Dexcalibur('com.example.test')                         ║\n"
        +"║ > project.useAPI('android:7.0.0').fullscan()                               ║\n"
        +"║ > project.find.method('name:loadLibrary')                                  ║\n"
        +"║                                                                            ║\n"
        +"║ Read *.help() ! =)                                                         ║\n"
        +"╚════════════════════════════════════════════════════════════════════════════╝\n"
        );
    
    }

    /**
     * To detect if Dexcalibur has been installed by NPM
     */
    static requireInstall(){
        return (_fs_.existsSync( CONFIG_PATH) == false);
    }

    /**
     * 
     */
    loadWorkspaceFromConfig(){
        let d = null;
        
        if(process.env.DEXCALIBUR_HOME != null)
            d = JSON.parse( _fs_.readFileSync( _path_.join( process.env.DEXCALIBUR_HOME, 'config.json')) );
        else
            d = JSON.parse( _fs_.readFileSync(CONFIG_PATH) );

        this.workspace = new DexcaliburWorkspace( d.workspace );
    }   
    
    /**
     * To load bootstrap file or configuration from home.
     * 
     * Require `this.workspace` is loaded.  
     * 
     * @returns {Boolean} TRUE if ready to start, FALSE if install is required.
     */
    boot( pRestore=false){
        let conf = null, data=null;
        
        // init workspace
        this.workspace.init();

        // read configuration file into target workspace 
        this.loadConfig( pRestore);

        // init
        this.init();

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
     */
    init(){
        // setup web server
        this.webserver = new WebServer(this);

        this.webserver.setContext(this);

        this.webserver.useProductionMode();
/*
        this.apkHelper = new ApkHelper(this);

        // dex helper
        this.dexHelper = new DexHelper(this);

        // ste Device Manager
        this.devices = new DeviceManager(this.config);

        //package Patcher
        this.packagePatcher = new PackagePatcher(pkgName, this.config, this.apkHelper);

        // hook
        this.hook = new HookHelper.Manager(this, nofrida);
        this.hook.refreshScanner();

        // set the workspace API
        this.workspace = new Workspace(pkgName,this.config);

        // setup File Analyzer
        this.dataAnalyser = new DataAnalyzer.Analyzer(this);

        this.bus = new Bus(this); //.setContext(this);

        this.appAnalyzer = new AndroidAppAnalyzer(this);

        this.inspectors = new InspectorManager(this);

        let insp = null;

        this.inspectors.autoRegister();

        // FridaBuilder make Frida script chunk from cls
        this.fridaBuilder = new FridaGenerator(this);

        // 
        this.graph = new GraphMaker(this);*/
        
    }

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


    getPlatformManager(){
        return this.platformMgr;
    }

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

        this.workspace = new DexcaliburWorkspace( pPath);
        this.workspace.init();
    }

    initInstaller(){
        if(AdmZip == null){
            AdmZip = require('adm-zip');
        }

        let tmpAdbPath, tmpApktoolPath;
        let self = this;

        // init installer
        this.installer = new InstallKit.Installer( this);

        
        // define "ADB install" task 
        tmpAdbPath = _path_.join(this.workspace.tmpFolder,"platform_tools.zip");
        tmpApktoolPath = _path_.join(this.workspace.binFolder,"apktool.jar");


        this.installer.addTask(
            "Android platform tools",
            REMOTE_URLS.adb,
            tmpAdbPath,
            {
                // unzip platform-tools and copy ADB
                onPostDownload: function( vTask, vStep, vData){
                    let zip = new AdmZip(tmpAdbPath);
                    self.installer.progress += vStep;
                    self.installer.status = new InstallKit.StatusMessage( self.installer.progress, "Android platform tool downloaded. Uncompressing ..");
                    zip.extractAllTo( _path_.join(self.workspace.binFolder), true);
                    _fs_.unlinkSync(tmpAdbPath);
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
                workspace: this.workspace.getLocation()
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

    getProjects(){
        return this.workspace.listProjects();
    }

    openProject( pUID){
        let project = null;
        try{
            project = new DexcaliburProject( this, pUID);
            project.open();
            this.active[pUID] = project;
        }catch(err){
            Logger.error("ENGINE","openProject failed");
        }

        return project;
    }

    newProject( pUID){

    }
}

module.exports = DexcaliburEngine;

