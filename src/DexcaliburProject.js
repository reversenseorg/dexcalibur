var Process = require("child_process");
var Chalk = require("chalk");
const Path = require("path");
const Fs = require("fs");


var CoreConst = require('./CoreConst.js');
var PACKAGE_JSON = require("../package.json");

var Logger = require("./Logger.js")();
var Configuration = require("./Configuration.js");
var Analyzer = require("./Analyzer.js");
var AnalysisHelper = require("./AnalysisHelper.js");
var Finder = require("./Finder.js");
var DeviceManager = require("./DeviceManager.js");
var PackagePatcher = require("./PackagePatcher.js");
var HookHelper = require("./HookManager.js");
var DexHelper = require("./DexHelper.js");
var InspectorManager = require("./InspectorManager.js");
var Workspace = require("./Workspace.js");
var WebServer = require("./WebServer.js");
var DataAnalyzer = require("./DataAnalyzer.js");
const AndroidAppAnalyzer = require("./AndroidAppAnalyzer.js");
var GraphMaker = require("./Graph.js");
var Bus = require("./Bus.js");
var Event = require("./Event.js");
var ApkHelper = require("./ApkHelper.js");
var FridaGenerator = require("./FridaGenerator.js");
var AndroidPM = require('./adb/AndroidPackageManager');
const Platform = require("./Platform.js");
const SYSCALLS = require("./Syscalls.js");
//const CONFIG = require("../config.js");


var g_builtinHookSets = {};

/**
 * To represent an instance of a running application.
 * 
 * It can be used in order to pause/resume an application running on a remote device. 
 * 
 * @param {int} pid The Remote PID of the application 
 * @constructor
 */
function ApplicationInstance(pid){
    this.pid = null;
}


class DexcaliburProject
{

    /**
     * 
     * @param {DexcaliburEngine} pEngine  Instance of the DexcaliburEngine (holding the context)
     * @param {String} pUID The UID of the project, an unique name for this project
     */
    constructor( pEngine, pUID){

        this.engine = pEngine;

        this.uid = pUID;

        /**
         * @field Package name of the target
         */
        this.pkg = pPackageName;

        /**
         * @field Instance of project's configuration
         */
        this.config = null;

        /**
         * @field Flag 
         */
        this.nofrida = false;

        /**
         * @field the default android API version to use.
         */
        this.apiVersion = null;

        // set the Search API which allow the user to perform search
        this.find = null;

        // set SC analyzer 
        this.analyze = null;

        this.apkHelper = null;

        // dex helper
        this.dexHelper = null;

        //package Patcher
        this.packagePatcher = null;

        // hook
        this.hook = null;

        // set the workspace API
        this.workspace = null;

        // setup File Analyzer
        this.dataAnalyser = null;

        this.bus = null;

        this.appAnalyzer = null;

        this.inspectors = null;

        // FridaBuilder make Frida script chunk from cls
        this.fridaBuilder = null;

        // 
        this.graph = null;
    }

    init(){
        // set the Search API which allow the user to perform search
        this.find = new Finder.SearchAPI();

        // set SC analyzer 
        this.analyze = new Analyzer(this.config.encoding, this.find, this);
        
        // set syscall list (bionic) 
        this.analyze.useSyscalls(SYSCALLS);
        this.analyze.addTagCategory(
            "hash",
            ["md5","sha1","sha256","sha512"]
        );
        this.analyze.addTagCategory(
            "key",
            ["256","1024","2048","4096"]
        );


        this.apkHelper = new ApkHelper(this);
        this.dexHelper = new DexHelper(this);
        this.devices = new DeviceManager(this.config);
        this.packagePatcher = new PackagePatcher(pkgName, this.config, this.apkHelper);
        this.hook = new HookHelper.Manager(this, nofrida);
        this.hook.refreshScanner();
        this.workspace = new Workspace(pkgName,this.config);
        this.web = new WebServer(this);
        this.dataAnalyser = new DataAnalyzer.Analyzer(this);
        this.bus = new Bus(this); //.setContext(this);
        this.appAnalyzer = new AndroidAppAnalyzer(this);
        this.inspectors = new InspectorManager(this);
        this.inspectors.autoRegister();
        this.fridaBuilder = new FridaGenerator(this);
        this.graph = new GraphMaker(this);

        this.context.printBanner();
        this.workspace.init();
    }

    open(){
        // read project data

        // re-scan
        
    }

    /**
     * To get the data analyzer.
     * 
     * @returns {DataAnalyzer} The data analyzer 
     * @function
     */
    getDataAnalyzer(){
        return this.dataAnalyser;
    }


    /**
     * To get the application analyzer, which includes manifest and permission analysis.
     * 
     * @returns {AndroidAppAnalyzer} The application analyzer 
     * @function
     */
    getAppAnalyzer(){
        return this.appAnalyzer;
    }


    /**
     * To get the bytecode static code analyzer which contains the internal database.
     * 
     * @returns {Analyzer} The internal bytecode analyzer 
     * @function
     */
    getAnalyzer(){
        return this.analyze;
    }

    scan(){

    }
}




/**
 * To specify the Android API version to use in the map.
 * 
 * It should be write according to the format in "config.platform_available"
 * 
 * @param {string} version The version of the API  
 * @function
 */
Project.prototype.useAPI = function(version){
    this.config.platform_target = version;
    return this;
};



/**
 * To perform a scan of the application byetcode only.
 * 
 * All reference to Android system classes will be tagged MissingReference or VMBinding
 * 
 * @param {string} path Optional, the path of the folder containing the decompiled smali code. 
 * @returns {Project} Returns the instance of this project
 * @function
 */
Project.prototype.scan = function(path){
    // make IR 
    if(path !== undefined){   
        this.analyze.path( path);
    }else{
//        let dexPath = this.workspace.getWD()+"dex";
        let dexPath = Path.join(this.workspace.getWD(),"dex");
        fs.mkdirSync(dexPath, {recursive: true});
        Logger.info("Scanning default path : "+dexPath);
        this.analyze.path( dexPath);
        this.dataAnalyser.scan( dexPath);
        this.analyze.insertFiles( this.dataAnalyser.getDB, false);
    }
};



/**
 * To perform a scan of the set of files.
 * @param {string} path Optional, the path of the folder containing the decompiled smali code. 
 * @returns {Project} Returns the instance of this project
 * @function
 * @deprecated
 */
Project.prototype.scanForFiles = function(path){

    if(path == null){   
        Logger.error("Invalid filepaths to scan");
        return null;
    }

    let files = this.dataAnalyzer.scan(path);
    
    this.analyze.updateFiles(files.getDb().getFiles());
    this.analyze.updateBuffers(files.getDb().getBuffers());
    
    return this;
};

/**
 * To perform a fullsacn of the application. It  performs :
 *      - Android API bytecode scan (for the specified API version - by default it's API 25)
 *      - Application bytecode scan
 *      - Application package scan
 * @param {string} path Optional, the path of the folder containing the decompiled smali code. 
 * @returns {Project} Returns the instance of this project
 * @function
 */
Project.prototype.fullscan = function(path){
    // scan OS
    Logger.info("Scanning platform "+this.config.platform_target);
    //this.config.getTargetPlatform().getBinPath();
    //this.analyze.path()
    this.analyze.path(this.config.getTargetPlatformPath());

    this.analyze.updateDataBlock();    

    this.analyze.tagAllAsInternal();

    //this.analyze.path(this.config.platform_available[this.config.platform_target].getBinPath());

    // scan files  
    if(path !== undefined){   
        this.analyze.path( path);
        this.dataAnalyser.scan( path, ["smali"]);
        
       // this.analyze.scanManifest(Path.join(path,"AndroidManifest.xml"));
        this.appAnalyzer.importManifest(Path.join(path,"AndroidManifest.xml"));
    }else{
        //        let dexPath = this.workspace.getWD()+"dex";
        let dexPath = Path.join(this.workspace.getWD(),"dex");

        Logger.info("Scanning default path : "+dexPath);
        
        this.analyze.path( dexPath);
        this.dataAnalyser.scan( dexPath, ["smali"]);
//        this.analyze.scanManifest(Path.join(dexPath,"AndroidManifest.xml"));
        this.appAnalyzer.importManifest(Path.join(dexPath,"AndroidManifest.xml"));
    }




    // index static array 
    this.analyze.updateDataBlock();    

    this.analyze.tagAllIf(
        function(k,x){ 
            return x.hasTag(AnalysisHelper.TAG.Discover.Internal)==false; 
        }, 
        AnalysisHelper.TAG.Discover.Statically);


    // scan bytecode gathered during previous instrumentation session
    if(path == null){

        let dir=Fs.readdirSync(this.workspace.getRuntimeBcDir());
        for(let i in dir){
            elemnt = Path.join(this.workspace.getRuntimeBcDir(),dir[i],"smali");
            if(Fs.lstatSync(elemnt).isDirectory()){
                Logger.info("Scanning previously discovered dex chunk : "+elemnt);
                this.analyze.path(elemnt);
            }
        }  


        this.analyze.tagAllIf(
            function(k,x){ 
                return (x.hasTag(AnalysisHelper.TAG.Discover.Internal)==false) 
                    && (x.hasTag(AnalysisHelper.TAG.Discover.Statically)==false); 
            }, 
            AnalysisHelper.TAG.Discover.Dynamically);
        
        this.dataAnalyser.scan(this.workspace.getRuntimeFilesDir());
    }

    this.bus.send(new Event.Event({
        type: "dxc.fullscan.post" 
    }));

    // deploy inspector's hooksets
    this.inspectors.deployAll();
    
    // trigger event
    this.bus.send(new Event.Event({
        type: "dxc.appview.new" 
    }));

    this.analyze.insertIn( "files", this.dataAnalyser.getDB().getFiles());
    
    this.bus.send(new Event.Event({
        type: "filescan.new" 
    }));


    this.bus.send(new Event.Event({
        type: "dxc.initialized" 
    }));

    // make CFG
    //this.analyze.cfg();
    return this;
};

/**
 * To create an event and push it to the queue.
 * The argulent should be given by using the format expected by the Event constructor.
 * 
 * @param {Object} eventData The description of the event to use with the Event constructor.
 * @function
 */
Project.prototype.trigger = function(eventData){
    this.bus.send(new Event.Event(eventData));
}

// Make a backup of the project 
/*
Project.prototype.saveDB = function(file){
    if(file===undefined){
        return Backup.save(this.analyze.db,this.workspace.getNewSavefilePath());
    }else{
        return Backup.save(this.analyze.db,file);
    }
}

// Load a backup
/*
Project.prototype.loadDB = function(savePath){
    //this.analyze.db = Backup.restore(savePath);
    return Backup.restore(savePath);
}*/

/**
 * To download the Application package from the default device, 
 * uncompress the package, and disassemble the application bytecode 
 * to smali code.  
 * @param {Device} device NOT USED
 * @return {*} TBD
 * @function
 */
Project.prototype.pull = function(device){
    let adb=this.config.adbPath, ret="", apkPath="", i=0;
    
    
    if(device===null || this.devices.hasNotDefault()){
        Logger.warn("[!] Warning ! : device not selected. Searching ...");
        this.devices.scan();
        if(this.devices.count==0){
            Logger.error("[E] No device found");
            throw new Error("No device connected");
        }
        else if(this.devices.count==1){
            Logger.success("[*] Device selected : "+this.devices.getDefault().id);
        }
        else if(this.devices.count>1){
            Logger.warn("[!] Please choose a device above with *.devices.setDefault(<id>)");
            return "";            
        }
    }

    let dev = this.devices.getDefault(), p = null;
    let pathWD = this.workspace.getWD();
    apkPath  = Path.join(pathWD, this.getPackageName()+".apk");

    if(dev == null){
        Logger.error("No device connected. Package cannot be pull");
        throw new Error("No device connected");
    }

    // TODO replace by AdbWrapper.get
    // this.devices.getPackagePath(this.getPackageName());
    // dev.pullPackage(this.getPackageName(), apkPath);

    p = AndroidPM.getApkPathOf(dev, this.getPackageName());

    if(p == null){
        Logger.error("[!] Application package cannot be found.");
        throw new Error("Application package cannot be found.");
    }else{
        Logger.success("[+] Package found");
    }

    if(dev.pull(p, apkPath)==false){
        Logger.error("Application package cannot been download.");
        throw new Error("Application package cannot been download.");
    }

    let dexPath = Path.join(this.workspace.getWD(),"dex");

    try {
        ret = Process.execSync(this.config.apktPath+" d -f -m -o "+dexPath+" "+apkPath).toString("ascii");
        Logger.success("[*] APK decompiled in "+dexPath);
    }
    catch(exception) {
        Logger.error("[!] Failed to disassemble package:");
        Logger.raw(exception);
    }
    
    return ;
};

/**
 * To use the emulator by default instead of an USB device
 * @deprecated
 * @function
 */
Project.prototype.useEmulator = function(){
    this.config.useEmulator = true;
}

/**
 * To start the application from a specific Activity.
 * Use the default device. It can used in order to force application crawl. 
 * @param {String} activity The activity to start
 * @returns {ApplicationInstance}  A reference to the process running the Application
 * @function 
 */
Project.prototype.start = function(activity){
    let adb=this.config.adbPath, ret="", path="", i=0;
    
    if(this.config.useEmulator) sdb+=" -e";
    if(this.config.deviceId!=null) adb+=" -s "+this.config.deviceId;
    
    ret = Process.execSync(adb+" shell am start "+this.pkg+"/"+activity).toString("ascii");

    
    return new ApplicationInstance(0);
};

/**
 * To start the web server
 * 
 * @param {int} port Optional - The port number to use. By default, the port number from configuration is used.
 * @function
 */
Project.prototype.startWebserver = function( pPort=null){
    // if port is undefined or null
    let port = null;
    if(process.env.DEXCALIBUR_PORT!=null)
        port = process.env.DEXCALIBUR_PORT
    else if(pPort != null)
        port = pPort;
    else
        port = this.config.getWebPort();

    this.web.useProductionMode();
    // start 
    this.web.start(port);
}

/**
 * To get application package name
 * 
 * @returns {String} Applciation package name
 * @function
 */
Project.prototype.getPackageName = function(){
    return this.pkg;
}

module.exports = Project;
