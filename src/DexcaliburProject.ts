
import * as Process from "child_process";
import * as  _path_ from "path";
import * as  Fs from "fs";

import DexcaliburWorkspace from "./DexcaliburWorkspace";
import Platform from "./Platform";
import APK from "./APK";
import {ConnectorFactory, IDatabaseAdapter} from "./ConnectorFactory";
import DexHelper from "./DexHelper";
import {Device} from "./Device";
import {Finder} from "./Finder";
import Bus from "./Bus";
import AndroidApplication from "./android/AndroidApplication";
import PlatformManager from "./PlatformManager";
import {SearchAPI} from "./SearchAPI";
import DeviceManager from "./DeviceManager";
import Event from "./Event";
import {DATA_SCOPE, DataAnalyzer} from "./DataAnalyzer";
import Analyzer from "./Analyzer";
import ApkHelper from "./ApkHelper";
import AndroidAppAnalyzer from "./AndroidAppAnalyzer";
import DexcaliburEngine from "./DexcaliburEngine";
import Configuration from "./Configuration";
import Workspace from "./Workspace";
import * as Log from './Logger';
import {TAG} from "./AnalysisHelper";
import {HookManager} from "./HookManager";
import Inspector, {INSPECTOR_TYPE} from "./Inspector";
import InspectorManager from "./InspectorManager";
import {DexcaliburVM} from "./DexcaliburVM";
import Simplifier from "./Simplifier";
import SmaliDisassembler from "./SmaliDisassembler";
import GraphMaker from "./Graph";
import IosAppAnalyzer from "./ios/IosAppAnalyzer";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var g_builtinHookSets:any = {};

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
 * @class
 * @author Georges-B. MICHEL
 */
export default class DexcaliburProject
{

    /**
     * @type {DexcaliburEngine}
     * @field Dexcalibur engine (context)
     */
    engine:DexcaliburEngine = null;

    /**
     * @type {String}
     * @field Project UID
     */
    uid:string = '';

    /**
     * @type {String}
     * @field Package name of the target
     */
    pkg:string = null;

    /**
     * @field Instance of project's configuration
     */
    config:Configuration = null;

    /**
     * @field Flag
     */
    nofrida:boolean = false;

    /**
     * @field the default android API version to use.
     */
    apiVersion:string = null;

    // set the Search API which allow the user to perform search
    /**
     *
     * @type {SearchAPI}
     * @field the finder API configured for this project
     */
    find:SearchAPI = null;

    // set SC analyzer
    /**
     * @type {Analyzer}
     * @field The static analyzer for this project
     */
    analyze:Analyzer = null;

    // dex helper
    dexHelper:DexHelper = null;

    //package Patcher
    // packagePatcher:PackagePatcher = null;

    // hook, deprecated here ?
    hook:HookManager = null;

    // set the workspace API
    /**
     * @type {Workspace}
     * @field Project workspace
     */
    workspace:Workspace = null;

    // setup File Analyzer
    /**
     * @type {DataAnalyzer}
     * @field Raw data analyzer unit
     */
    dataAnalyzer:DataAnalyzer = null;

    /**
     * @type {Bus}
     * @field The event bus
     */
    bus:Bus = null;

    /**
     * @type {AndroidAppAnalyzer}
     * @field Application topology analyzer unit (depend of application type : apk,bin, ...)
     */
    appAnalyzer = null;

    /**
     * @type {Inspector[]}
     * @field All inspectors
     */
    inspectors:Inspector[] = null;

    // FridaBuilder make Frida script chunk from cls
    fridaBuilder:any = null;

    //
    graph:GraphMaker = null;

    // NEW

    /**
     * Ready flag
     * @field
     */
    ready:boolean = false;

    /**
     * Target platform
     * @field
     */
    platform:Platform = null;

    /**
     * Default device
     */
    device:Device = null;

    /**
     * @field Class representing target application
     */
    application:AndroidApplication = null;

    /**
     * @type {*}
     * @field Connector
     */
    connector:IDatabaseAdapter = null;

    /**
     * @field
     */
    simplifier:Simplifier = null;

    saveManager:any = null;

    /**
     * 
     * @param {DexcaliburEngine} pEngine  Instance of the DexcaliburEngine (holding the context)
     * @param {String} pUID The UID of the project, an unique name for this project
     * @constructor
     */
    constructor( pEngine:DexcaliburEngine, pUID:string){

        this.engine = pEngine;
        this.uid = pUID;
    }


    setSaveManager(pManager:any){
        this.saveManager = pManager;
    }

    getSaveManger():any{
        return this.saveManager;
    }
    /**
     * To select the way to store the internal data
     *
     * @param {String} pConnectorType Connector type
     * @method
     */
    setConnector( pConnectorType:string):void{
        this.connector = ConnectorFactory.getInstance().newConnector( pConnectorType, this);
    }

    /**
     * @return {boolean}
     * @method
     */
    hasVM():boolean{
        return this.platform.isVmSupported();
    }

    /**
     * @return {DexcaliburVM}
     * @method
     */
    getVM():DexcaliburVM {
        return this.platform.getNewDexcaliburVM(this);
    }

    /**
     * @return {Simplifier}
     * @method
     */
    getSimplifier():Simplifier{
        if(this.simplifier == null){
            this.simplifier = new Simplifier(this);
        }

        return this.simplifier;
    }
    /**
     * To get DexcaliburEngine instance associated to this project
     *
     * @returns {DexcaliburEngine} DexcaliburEngine instance
     * @method
     */
    getContext():DexcaliburEngine{
        return this.engine;
    }

    /**
     * To suggest a new project name
     * 
     * @param {*} pUID 
     * @method
     */
    static suggests( pUID:string):string{
        let original:string = pUID;
        let i:number = 0;

        while( DexcaliburProject.exists(original+"_"+i) ) i++;

        return original+"_"+i;
    }

    /**
     * To detect if there is a project with the specified UID
     *
     * @param {String} pUID Project UID
     * @returns {Boolean} TRUE if a project exists, else FALSE
     * @method
     */
    static exists( pUID:string):boolean{
        let proj = DexcaliburWorkspace.getInstance().listProjects();
        let status = false;

        proj.map((vProject)=>{
            if(vProject === pUID)
                status = true;
        });

        return status;
    }

    /**
     * To init the project
     *
     * @method
     */
    init():void{
        let im:InspectorManager = InspectorManager.getInstance();

        // init config
        // TODO remove engine configuration
        if(this.config === null) {
            this.config = this.engine.getConfiguration();
        }

        // init project workspace
        if(this.workspace === null){
            this.workspace = new Workspace(
                _path_.join( this.engine.workspace.getLocation(), this.uid )
            );

            this.workspace.init();
        }

        // init connector
        if(this.connector === null){
            this.connector = ConnectorFactory.getInstance().newConnector('inmemory', this);
        }

        // set the Search API which allow the user to perform search
        this.find = new SearchAPI();

        // set SC analyzer
        this.analyze = new Analyzer(this.config.encoding as BufferEncoding, this);
        this.find.setDatabase(this.analyze.getData());


        this.analyze.addTagCategory(
            "hash",
            ["md5","sha1","sha256","sha512"]
        );
        this.analyze.addTagCategory(
            "key",
            ["256","1024","2048","4096"]
        );

        // todo : move to context free
        this.dexHelper = new DexHelper(this);

        // pkgName => uid => read project.json
        // todo : move as inspector
        //this.packagePatcher = new PackagePatcher(this.uid, this.config);

        this.hook = new HookManager(this, this.nofrida);
        //this.hook.refreshScanner();


        // file analyzer 
        this.dataAnalyzer = new DataAnalyzer(this);

        // create main event bus of this project 
        this.bus = new Bus(this); //.setContext(this);

        // manifest / app analyzer
        // depend of application type
        if(this.platform != null){
            if(this.platform.isAndroid())
                this.appAnalyzer = new AndroidAppAnalyzer(this);
            else if(this.platform.isIOS())
                this.appAnalyzer = new IosAppAnalyzer(this);
            /*else if(this.platform.isELF())
                this.appAnalyzer = new BinaryAppAnalyzer(this);
            else
                this.appAnalyzer = new OtherAppAnalyzer(this);*/


        }else {
            this.appAnalyzer = new AndroidAppAnalyzer(this);
        }
        // plugins
        im.createInspectorsFor(this);
        im.deployInspectors(this, INSPECTOR_TYPE.BOOT);
        this.inspectors = im.getInspectorsOf(this);
        
        this.graph = new GraphMaker(this);
    }

    /**
     * To deploy all inspectors starting at the specified step
     *
     * Supported step :
     * - BOOT
     * - POST_PLATFORM_SCAN
     * - POST_APP_SCAN
     * - POST_DEV_SCAN
     * - ON_DEMAND
     *
     * @param {String} pStep Inspector step
     * @method
     */
    deployInspectors(pStep){
        let im:InspectorManager = InspectorManager.getInstance();

        im.deployInspectors(this, pStep);
        this.inspectors = im.getInspectorsOf(this);
    }

    /**
     * To get the project UID
     *
     * @returns {String} ProjectUID
     * @method
     */
    getUID():string{
        return this.uid;
    }

    /**
     * To get the inspector with specified name
     *
     * @param {String} Inspector name
     * @returns {Inspector} Inspector instance
     * @method
     */
    getInspector( pName):Inspector{
        return this.inspectors[pName];
    }

    /**
     * To set default device
     * @method
     */
    setDevice( pDevice:Device){
        this.device = pDevice;
        this.analyze.useSyscalls(this.device.getSyscallList());
    }
    

    /**
     * To get device target of the project
     * 
     * @method
     */
    getDevice():Device{
        return this.device;
    }


    /**
     * 
     * @param {*} pPath 
     */
    async useAPK( pPath:string):Promise<boolean>{

        // copy the APK into project workspace
        this.workspace.changeMainAPK(pPath);

        // load it : decompress file, disass dex files
        return await ApkHelper.extract( 
            this.workspace.getApkPath(),
            this.workspace.getApkDir(),
            {
                force: true,
                match: true
            }
        );
    }

    /**
     * To synchronize project platform used during analysis with device and APK
     *
     * @param {*} pName 
     * @method
     * @async
     */
    async synchronizePlatform( pName:string):Promise<boolean>{
        let pm:PlatformManager = PlatformManager.getInstance(), res:boolean=false;

        // select platform
        switch(pName){
            case 'dev':
                this.platform = this.device.getPlatform();
                break;
            case 'min':
                this.platform = pm.getFromAndroidApiVersion(this.application.getMinApiVersion());
                break;
            case 'max':
                this.platform = pm.getFromAndroidApiVersion(this.application.getTargetApiVersion());
                break;
            default:
                if( (this.platform instanceof Platform) === false){
                    if(this.device instanceof Device){
                        this.platform = this.device.getPlatform(); //pName
                    }else{
                        this.platform = pm.getFromAndroidApiVersion(this.application.getTargetApiVersion());
                    }
                }
                break;
        }

        // check if platform is installed
        if(this.platform == null){
            throw new Error("[PROJECT] synchronizePlatform : unkow platform. Aborted")
        }

        // install platform
        if(this.platform.checkInstall() === false){
            Logger.info("[PROJECT] synchronizePlatform : Target platform is not installed. Installing ...")
            res = await pm.install(this.platform);
            if(res == true){
                Logger.info("[PROJECT] synchronizePlatform : Platform installed successfully");
            }else{
                throw new Error("[PROJECT] synchronizePlatform : failed to install platform. Aborted")
            }
        }else{
            Logger.success("[PROJECT] Project uses platform : "+this.platform.getUID());
        }

        // save project
        this.save();

        return true;
    }
    /**
     * To get Search Engine   
     * 
     * @returns {Finder.SearchAPI} Search engine for this project
     * @method
     */
    getSearchEngine():SearchAPI{
        return this.find;
    }


    /**
     * To open an existing project
     * 
     * Read `project.json` file
     * 
     * @method
     */
    async open(){
        //throw new Error('[DEXCALIBUR PROJECT] open() : Not implemented');
        // re-scan
        return this.fullscan();
    }

    /**
     * 
     * @param {*} pContext 
     * @param {*} pProjectUID 
     * @param {*} pConfigPath 
     */
    static load( pEngine:DexcaliburEngine, pProjectUID:string, pConfigPath:string = null):DexcaliburProject{
        
        let project:DexcaliburProject = new DexcaliburProject( pEngine, pProjectUID);
        let data:any = null;

        // Load project from workspace
        project.config = pEngine.getConfiguration();

        project.workspace = new Workspace(
            _path_.join( pEngine.workspace.getLocation(), pProjectUID )
        );

        project.workspace.init();


        if(pConfigPath == null){
            pConfigPath = project.workspace.getProjectCfgPath();
        }

        data = Fs.readFileSync( pConfigPath);
        data = JSON.parse(data);

        for(let i in data){
            switch(i)
            {
                case "device":
                    project.device = DeviceManager.getInstance().getDevice(data.device);
                    break;
                case "package":
                case "nofrida":
                    project[i] = data[i];
                    break;
                case "apk":
                    project.workspace.setApk( APK.fromJsonObject(data.apk));
                    break;
                case "connector":
                    if(data[i].hasOwnProperty('type')){
                        project.connector = ConnectorFactory.getInstance().newConnector(data[i].type, project, data[i]);
                    }else{
                        project.connector = ConnectorFactory.getInstance().newConnector('inmemory', project);
                    }
                    break;
            }
        }

        if(data.platform != null){
            project.platform = PlatformManager.getInstance().getPlatform(data.platform);
        }
        else if(project.device != null){
            project.platform = project.device.getPlatform();
        }

        // init other properties
        project.init();

        return project;
    }

    /**
     * To save project metadata into 'project.json'
     *  
     * @param {*} pExportPath 
     */
    save( pExportPath:string = null):void{
        if(pExportPath == null){
            pExportPath = this.workspace.getProjectCfgPath();
        }

        Fs.writeFileSync(
            pExportPath, 
            JSON.stringify(this.toJsonObject())
        );
    }

    toJsonObject():any{
        let o:any = new Object();

        // add last modified, user, etc ...
        o.uid = this.uid;
        o.package = this.pkg;
        o.device = this.device!=null? this.device.getUID() : null;
        o.platform = this.platform!=null? this.platform.getUID() : null;
        o.nofrida = this.nofrida;

        o.connector = this.connector.toJsonObject(); //constructor.getProperties();

        if(this.workspace.getApk() !== null){
            o.apk = this.workspace.getApk().toJsonObject();
        }else{
            o.apk = null;
        }
        
        return o;
    }
    /**
     * To get the data analyzer.
     * 
     * @returns {DataAnalyzer} The data analyzer 
     * @method
     */
    getDataAnalyzer():DataAnalyzer{
        return this.dataAnalyzer;
    }


    /**
     * To get the application analyzer, which includes manifest and permission analysis.
     * 
     * @returns {AndroidAppAnalyzer} The application analyzer 
     * @method
     */
    getAppAnalyzer():AndroidAppAnalyzer{
        return this.appAnalyzer;
    }


    /**
     * To get the bytecode static code analyzer which contains the internal database.
     * 
     * @returns {Analyzer} The internal bytecode analyzer 
     * @method
     */
    getAnalyzer():Analyzer{
        return this.analyze;
    }

    /**
     * To set target platform to use during analysis
     * 
     * Replace `Project.useAPI()`
     * 
     * @param {String} pVersion 
     */
    async usePlatform( pVersion:string){
        // old
        // this.config.platform_target = pVersion;
        let pm:PlatformManager = this.engine.getPlatformManager(), platform:Platform = null;
        let status:boolean = false;

        //new
        this.platform = pm.getLocalPlatform(pVersion);
 
        if(this.platform !== null){
            return this;
        }

        // this platform is not yet installed
        platform = pm.getRemotePlatform(pVersion);

        // if the platform is available remotely, download it
        if(platform !== null){
            status = await pm.install(platform);
            if(status === true){
                this.platform = pm.getLocalPlatform(pVersion)
            }else{
                // TODO : throw exception. platform exists remotely, but install fails.  
            }
            return this;
        }else{
            // TODO : throw exception. unknow platform
        }
        return this;
    };


    /**
     * To perform a scan of the application byetcode only.
     * 
     * All reference to Android system classes will be tagged MissingReference or VMBinding
     * 
     * @param {string} path Optional, the path of the folder containing the decompiled smali code. 
     * @returns {Project} Returns the instance of this project
     * @deprecated ?
     * @method
     */
    scan( pPath:string){
        // make IR 
        if(pPath !== undefined){   
            this.analyze.path( pPath);
        }else{
            let apkctnPath:string = this.workspace.getApkDir();

            Fs.mkdirSync(apkctnPath, {recursive: true});
            Logger.info("Scanning default path : "+apkctnPath);

            // bytecode analysis (from smali file)
            this.analyze.path( apkctnPath);

            // TODO : improve this step
            // files analysis (signature, ...)
            this.dataAnalyzer.scan( apkctnPath);

            // update internal DB with file analyzer DB
            this.analyze.insertIn( "files", this.dataAnalyzer.getDB().getIndex('files'));
        }
    }

    getDisassembler(){
        if(this.platform.isAndroid()){
            return new SmaliDisassembler();
        }else{
            throw new Error('There is not disassembler configured');
        }
    }

    /**
     * To perform a scan of the set of files (not bytecode/dex/smali).
     * 
     * @param {string} path Optional, the path of the folder containing the decompiled smali code. 
     * @returns {Project} Returns the instance of this project
     * @method
     * @deprecated
     */
    scanForFiles(path:string){
        throw new Error('[PROJET] scanForFiles() : deprecated');
        /*
        if(path == null){   
            Logger.error("Invalid filepaths to scan");
            return null;
        }

        let files = this.dataAnalyzer.scan(path);
        
        this.analyze.updateFiles( files.getDb().getFiles());
        this.analyze.updateBuffers( files.getDb().getBuffers());
        
        return this;*/
    };

    /**
     * To perform a fullsacn of the application. It  performs :
     *      - Android API bytecode scan (for the specified API version - by default it's API 25)
     *      - Application bytecode scan
     *      - Application package scan
     * @param {string} path Optional, the path of the folder containing the decompiled smali code. 
     * @returns {Project} Returns the instance of this project
     * @method
     */
    async fullscan( pPath:string=null):Promise<DexcaliburProject>{
        let elemnt:any=null;
        let success:boolean  = false;

        // scan OS/Platform
        Logger.info("Scanning platform "+this.platform.getUID());

        this.analyze.path(this.platform.getLocalPath());

        this.analyze.updateDataBlock();    

        this.analyze.tagAllAsInternal();

        this.deployInspectors(INSPECTOR_TYPE.POST_PLATFORM_SCAN);


        //this.analyze.path(this.config.platform_available[this.config.platform_target].getBinPath());

        // scan files  
        if(pPath != undefined){
            this.analyze.path( pPath);
            this.dataAnalyzer.scan( pPath, DATA_SCOPE.PKG); //["smali"]);
            
        // this.analyze.scanManifest(Path.join(path,"AndroidManifest.xml"));
            success = await this.appAnalyzer.importManifest(_path_.join(pPath,"AndroidManifest.xml"));
            //success = await this.appAnalyzer.scan(AppPackage); <--- add abstraction

        }else{
            //        let dexPath = this.workspace.getWD()+"dex";
            // To replace by package app (abstraction of apk/ipa/elf/..)
            let apkPath:string = this.workspace.getApkDir();

            Logger.info("Scanning default path : "+apkPath);
            
            this.analyze.path( apkPath);
            this.dataAnalyzer.scan( apkPath, DATA_SCOPE.PKG); //["smali"]);
    //        this.analyze.scanManifest(Path.join(dexPath,"AndroidManifest.xml"));
            success = await this.appAnalyzer.importManifest(_path_.join(apkPath,"AndroidManifest.xml"));
        }

        if(success){
            this.setPackageName( this.appAnalyzer.getPackageName());
        }


        // index static array 
        this.analyze.updateDataBlock();    

        this.analyze.tagAllIf(
            function(k,x){ 
                return x.hasTag(TAG.Discover.Internal)==false;
            }, 
            TAG.Discover.Statically);


        // scan bytecode gathered during previous instrumentation session
        // if there is not path specified
        if(pPath == null){

            let dir:string[]=Fs.readdirSync(this.workspace.getRuntimeBcDir());
            for(let i in dir){
                elemnt = _path_.join(this.workspace.getRuntimeBcDir(),dir[i],"smali");
                if(Fs.existsSync(elemnt) && Fs.lstatSync(elemnt).isDirectory()){
                    Logger.info("Scanning previously discovered dex chunk : "+elemnt);
                    this.analyze.path(elemnt);
                }
            }  


            this.analyze.tagAllIf(
                function(k,x){ 
                    return (x.hasTag(TAG.Discover.Internal)==false)
                        && (x.hasTag(TAG.Discover.Statically)==false);
                }, 
                TAG.Discover.Dynamically);
            
            this.dataAnalyzer.scan(this.workspace.getRuntimeFilesDir(), DATA_SCOPE.DYN_BUFFER ); //["smali"]);
        }



        this.bus.send(new Event({
            type: "dxc.fullscan.post" 
        }));

        // deploy inspector's hooksets
        this.deployInspectors(INSPECTOR_TYPE.POST_APP_SCAN);

        this.bus.send(new Event({
            type: "dxc.fullscan.post_deploy"
        }));
        
        // trigger event
        this.bus.send(new Event({
            type: "dxc.appview.new" 
        }));

        //this.analyze.updateFiles( this.dataAnalyzer.getDB());

        this.analyze.insertIn( "files", this.dataAnalyzer.getDB().getIndex('files'));
        
        this.bus.send(new Event({
            type: "filescan.new" 
        }));


        this.bus.send(new Event({
            type: "dxc.initialized" 
        }));

        this.ready = true;

        // make CFG
        //this.analyze.cfg();
        return this;
    };

    /**
     * To get 'ready' status
     * 
     * @returns {Boolean} TRUE if the project has been successully opened and analyzed, else FALSE
     * @method
     */
    isReady():boolean{
        return this.ready;
    }

    /**
     * To create an event and push it to the queue.
     * The argulent should be given by using the format expected by the Event constructor.
     * 
     * @param {Object} eventData The description of the event to use with the Event constructor.
     * @function
     */
    trigger(eventData:any){
        this.bus.send(new Event(eventData));
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

    /*
     * To start the application from a specific Activity.
     * Use the default device. It can used in order to force application crawl. 
     * @param {String} activity The activity to start
     * @returns {ApplicationInstance}  A reference to the process running the Application
     * @function
     * @deprecated
     *//*
    start(activity){
        let adb=this.config.adbPath, ret="", path="", i=0;
        
        if(this.config.useEmulator) adb+=" -e";
        if(this.device instanceof Device) adb+=" -s "+this.device.getUID();
        
        // to do change
        ret = Process.execSync(adb+" shell am start "+this.pkg+"/"+activity).toString("ascii");

        
        return new ApplicationInstance(0);
    };*/



    /**
     * To get application package name
     * 
     * @returns {String} Applciation package name
     * @function
     */
    getPackageName():string{
        return this.pkg;
    }

    setPackageName( pPackageName:string){
        this.pkg = pPackageName;
    }
}

