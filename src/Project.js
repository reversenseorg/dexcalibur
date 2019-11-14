var Process = require("child_process");
var Chalk = require("chalk");
const Path = require("path");
const Fs = require("fs");


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



/**
 * Represents the project, the current configuration and all the context.
 *   
 * @param {string} pkgName The name of the Application package name to analyze
 * @param {string} scanDir Optional , the path to the bytecode directory to scan. If it sets, the scan start immediately.
 * @constructor
 */
function Project(pkgName, cfgpath=null, nofrida=0){
    this.initDexcalibur(pkgName,cfgpath,nofrida);
}

/**
 * To initialize - or re-init - Dexcalibur. It sets the rpject context.
 * 
 * @param {String}  pkgName     Identifier of the targeted application. 
 * @param {String|Configuration}  cfgpath     Optional - Configuration filepath or instance. Default: $CWD/config.js . 
 * @param {Boolean} nofrida     Optional - Set 1 to disable Frida. Default: 0. 
 * @param {String}  apiVersion  Optional - Android API version to ude during analysis.
 * @function
 */
Project.prototype.initDexcalibur = function(pkgName, cfgpath=null, nofrida=0, apiVersion="android:7.0.0"){
    /**
     * @field Package name of the target
     */
    this.pkg = pkgName;

    /**
     * @field Instance of project's configuration
     */
    this.config = new Configuration();

    /**
     * @field Path of the configuration file
     */
    this.cfgpath = cfgpath;

    /**
     * @field Flag 
     */
    this.nofrida = nofrida;

    /**
     * @field the default android API version to use.
     */
    this.apiVersion = apiVersion;

    var _self = this;

    if(cfgpath != null){
        if(cfgpath instanceof Configuration){
            this.config = cfgpath; 
            Logger.info(" Given configuration instance loaded");
        }else{
            this.config.import(require(cfgpath), true, true);
            Logger.info(" Given configuration file loaded");
        }
    }else{
        //let cfg = require("../config.js");
        this.config.import(require("../config.js"), true, true);
        
        Logger.info(" Default configuration loaded from 'config.js' file.");
    }
    this.config.dexcaliburPath = Path.join(process.cwd(),"src");
    
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

    // setup web server
    this.web = new WebServer(this);

    // setup File Analyzer
    this.dataAnalyser = new DataAnalyzer.Analyzer(this);

    this.bus = new Bus(this); //.setContext(this);

    this.appAnalyzer = new AndroidAppAnalyzer(this);

    this.inspectors = new InspectorManager(this);

    let insp = null;

    this.inspectors.autoRegister();

    // auto deploy all inspectors
    /*ut.forEachFileOf(this.config.dexcaliburPath+"/inspectors/", function(path,file){
        insp = require(path).injectContext(_self);
        // subscribe to event bus
        mainBus.subscribe(insp);
        mainInsp.push(insp);
        // deploy conteined hookset
        //insp.deploy();
    },true);*/

    // FridaBuilder make Frida script chunk from cls
    this.fridaBuilder = new FridaGenerator(this);

    // 
    this.graph = new GraphMaker(this);
    

    // smali patcher
    /*
    this.patcher = {
        > var patch = project.patch.new()
        > patch.strings("SHA-1").with("MD5").build()
        > patch.install()
    }
    */


    Logger.info("\n\n"
    +"███████╗ ███████╗██╗  ██╗ ██████╗ █████╗ ██╗     ██╗██████╗ ██╗   ██╗██████╗\n" 
    +"██╔═══██╗██╔════╝╚██╗██╔╝██╔════╝██╔══██╗██║     ██║██╔══██╗██║   ██║██╔══██╗\n"
    +"██║   ██║█████╗   ╚███╔╝ ██║     ███████║██║     ██║██████╔╝██║   ██║██████╔╝\n"
    +"██║   ██║██╔══╝   ██╔██╗ ██║     ██╔══██║██║     ██║██╔══██╗██║   ██║██╔══██╗\n"
    +"███████╔╝███████╗██╔╝ ██╗╚██████╗██║  ██║███████╗██║██████╔╝╚██████╔╝██║  ██║\n"
    +"╚══════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝\n"
    +" v0.6.1                                                        by @FrenchYeti \n"
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

    this.workspace.init();
}


/**
 * To switch from a project to another without restart Dexcalibur
 * 
 * Internally, it re-initialize Dexcalibur with the targeted package, 
 * and starts analysis.  
 * 
 * @param {String} packageIdentifier Package identifier of the target.
 * @function 
 */
Project.prototype.changeProject = function(packageIdentifier) {
    this.initDexcalibur(packageIdentifier,this.cfgpath,this.nofrida);
    this.useAPI(this.apiVersion).fullscan();
};

/**
 * To get the project configuration.
 * 
 * @returns {Configuration} The configuration of project
 * @function
 */
Project.prototype.getConfiguration = function(){
    return this.config;
}


/**
 * To get the data analyzer.
 * 
 * @returns {DataAnalyzer} The data analyzer 
 * @function
 */
Project.prototype.getDataAnalyzer = function(){
    return this.dataAnalyser;
};


/**
 * To get the application analyzer, which includes manifest and permission analysis.
 * 
 * @returns {AndroidAppAnalyzer} The application analyzer 
 * @function
 */
Project.prototype.getAppAnalyzer = function(){
    return this.appAnalyzer;
};


/**
 * To get the bytecode static code analyzer which contains the internal database.
 * 
 * @returns {Analyzer} The internal bytecode analyzer 
 * @function
 */
Project.prototype.getAnalyzer = function(){
    return this.analyze;
};

/**
 * To show available APIs (console print).
 * 
 * @returns {Project} The current project instance.
 * @function
 */
Project.prototype.showAPIs = function(){
    for(let i=0 ;i<this.config.platform_available.length ; i++){
        Logger.info(this.config.platform_available[i].name);
    }
    return this;
};

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
    let adb=this.config.adbPath, ret="", path="", i=0;
    
    if(this.config.useEmulator) adb+=" -e";
    
    if(device===null || this.devices.hasNotDefault()){
        Logger.warn("[!] Warning ! : device not selected. Searching ...");
        this.devices.scan();
        if(this.devices.count==0){
            Logger.error("[E] No device found");
            return "";
        }
        else if(this.devices.count==1){
            Logger.success("[*] Device selected : "+this.devices.getDefault().id);
        }
        else if(this.devices.count>1){
            Logger.warn("[!] Please choose a device above with *.devices.setDefault(<id>)");
            return "";
        }
    }

    if(!this.config.useEmulator && this.devices.getDefault()!==null) 
        adb+=" -s "+this.devices.getDefault().id;

    ret = Process.execSync(adb+" shell pm list packages -f").toString("ascii");
    
    if(ret.indexOf(this.pkg)==-1){
        Logger.warn("[!] Package not found");
        return null;
    }

    ret = ret.split("\n");
    let t=null,ppath=null;
    for(let i in ret){
        if(ret[i].indexOf(this.pkg)>-1){
            
            t = ret[i].indexOf(":");
            ppath = ret[i].substr(t+1,ret[i].lastIndexOf("=")-t-1);
            break;
        }
    } 

    if(typeof ppath !== 'string'){
        Logger.error("[!] Package not found");
        return "";
    }else{
        Logger.success("[*] Package found");
    }
        
    //let pathWD = this.workspace.getWD()+this.pkg;
    let pathWD = Path.join(this.workspace.getWD(),this.pkg);
    let dexPath = Path.join(this.workspace.getWD(),"dex");

    try {
        Process.execSync(adb+" pull "+ppath+" "+pathWD+".apk");
        Logger.success("[*] Package downloaded to "+pathWD+".apk");

        ret = Process.execSync(this.config.apktPath+" d -f -m -o "+dexPath+" "+pathWD+".apk").toString("ascii");
        Logger.success("[*] APK decompiled in "+dexPath);
    }
    catch(exception) {
        Logger.error("[!] Failed to pull package:");
        Logger.error(exception);
    }
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
Project.prototype.startWebserver = function(port=null){
    // if port is undefined or null
    if(port==null){
        this.web.start(this.config.getWebPort());
    }else{
        this.web.start(port);
    }
}

module.exports = Project;
