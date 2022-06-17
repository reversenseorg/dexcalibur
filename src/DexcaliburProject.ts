import * as  _path_ from "path";
import * as  Fs from "fs";

import DexcaliburWorkspace from "./DexcaliburWorkspace";
import Platform from "./Platform";
import APK from "./APK";
import {ConnectorFactory} from "./ConnectorFactory";
import DexHelper from "./DexHelper";
import {Device} from "./Device";
import {Finder} from "./Finder";
import Bus, {BusSubscriber} from "./Bus";
import AndroidApplication from "./android/AndroidApplication";
import PlatformManager from "./PlatformManager";
import {SearchAPI} from "./SearchAPI";
import DeviceManager from "./DeviceManager";
import Event from "./Event";
import {DataAnalyzer} from "./DataAnalyzer";
import Analyzer from "./Analyzer";
import ApkHelper from "./ApkHelper";
import AndroidAppAnalyzer from "./AndroidAppAnalyzer";
import DexcaliburEngine from "./DexcaliburEngine";
import ProjectWorkspace from "./ProjectWorkspace";
import * as Log from './Logger';
import {TAG} from "./AnalysisHelper";
import {HookManager} from "./hook/HookManager";
import Inspector, {INSPECTOR_TYPE} from "./Inspector";
import InspectorManager from "./InspectorManager";
import {DexcaliburVM} from "./DexcaliburVM";
import Simplifier from "./Simplifier";
import SmaliDisassembler from "./SmaliDisassembler";
import GraphMaker from "./Graph";
import IosAppAnalyzer from "./ios/IosAppAnalyzer";
import {AppIcon} from "./AppIcon";
import {ApkPackage} from "./android/ApkPackage";
import {Workflow} from "./Workflow";
import StatusMessage from "./StatusMessage";
import {ValidationRule} from "./Validator";
import ModelFile from "./ModelFile";
import {ModelLocation} from "./ModelLocation";
import {Settings} from "./Settings";
import {UserAccount} from "./user/UserAccount";
import {IAuditableAccess} from "./user/acl/IAuditableAccess";
import {ProjectAccessControl} from "./user/acl/rbac/ProjectAccessContol";
import {AnalyzerConfiguration, FileAnalysisType} from "./AnalyzerConfiguration";
import {IDatabase, IDatabaseAdapter} from "./persist/orm/DbAbstraction";
import SqliteConnector from "../connectors/sqlite/adapter";
import AccessControl from "./user/acl/AccessControl";
import {AccessZone} from "./user/acl/Zones";
import {UserSession} from "./user/session/UserSession";
import {AccesErrCode, AccessException} from "./user/acl/Access";
import Util from "./Utils";
import {Auditable} from "./Auditable";
import DataScope from "./DataScope";
import KeyPointManager from "./hook/KeyPointManager";
import {ScriptManager} from "./ScriptManager";
import {TypeManager} from "./types/TypeManager";
import {AnalyzerState} from "./AnalyzerState";

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



interface DigestSet {
    [type:string] :string
}

/*
const DexcaliburProjectValidator = new Validator({
    'uid': [
        ValidationRule.newRegexpAssert(/^[a-zA-Z_-\s]+$/),
    ],
    'nofrida': [
        ValidationRule.newPinklistAssert(['true','false'])
    ]
});*/

/**
 * @class
 * @author Georges-B. MICHEL
 */
export default class DexcaliburProject extends Auditable implements IAuditableAccess
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
    config:Settings.ProjectSettings = null; //Configuration

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

    /**
     * @field
     * @type {ScriptManager}
     */
    scriptManager:ScriptManager = null;

    kpmgr:KeyPointManager = null;

    // set the workspace API
    /**
     * @type {ProjectWorkspace}
     * @field Project workspace
     */
    workspace:ProjectWorkspace = null;

    // setup File Analyzer
    /**
     * The first layer analyzer for data file (resources, libs, etc ...)
     *
     * It tries to detect file format and build file DB
     *
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
     * @type {IDatabase}
     * @field
     */
    db:IDatabase = null;

    /**
     * @field
     */
    simplifier:Simplifier = null;

    saveManager:any = null;

    typeManager:TypeManager;

    /**
     * Application Icon
     *
     * @type {AppIcon}
     * @field
     */
    icon:AppIcon = null;

    owner: UserAccount = null;

    private _wf:Workflow = null;

    private analCfg:AnalyzerConfiguration = new AnalyzerConfiguration();


    /*
     * A set of package checksum
     *
     * @type {DigestSet}
     * @field
     */
    //checksum:DigestSet = {};

    /**
     * 
     * @param {DexcaliburEngine} pEngine  Instance of the DexcaliburEngine (holding the context)
     * @param {String} pUID The UID of the project, an unique name for this project
     * @constructor
     */
    constructor( pEngine:DexcaliburEngine, pUID:string){
        super({
            'project:uid': [
                ValidationRule.newRegexpAssert(new RegExp('^[a-zA-Z_-\s]+$')),
            ],
            'project:nofrida': [
                ValidationRule.newPinklistAssert(['true','false'])
            ]
        });

        this.engine = pEngine;
        this.uid = pUID;
    }

    /**
     *
     */
    initAccessAttributes(){
        for(const k in ProjectAccessControl.attr){
            this.setAccessAttribute(ProjectAccessControl.attr[k], ProjectAccessControl.attr[k].value);
        }
    }


    getAnalyzerConfiguration():AnalyzerConfiguration {
        return this.analCfg;
    }

    getHookManager():HookManager {
        return this.hook;
    }

    getOwner():UserAccount {
       return this.owner;
    }

    static deleteCloseProject( pEngine:DexcaliburEngine, pUID:string, pAccount:UserAccount){
        const project = new DexcaliburProject(pEngine, pUID);

        const data = JSON.parse( Fs.readFileSync( project.workspace.getProjectCfgPath()).toString());

        if(data._attr != null){
            project.importAccessAttributes(data._attr);
        }

        if(project.isOwnedBy(pAccount)){
            Util.recursiveRmDirSync(
                _path_.join( pEngine.workspace.getLocation(), pUID )
            );
        }

    }

    isOwnedBy( pAccount:UserAccount):boolean {
        let ret_owned:boolean = false;

        try{
            AccessControl.checkAttr(
                AccessZone.PROJECT,
                ProjectAccessControl.attr.OWNER,
                this,
                pAccount
            );

            ret_owned = true;

        }catch(errACL){
            if(errACL.hasOwnProperty('getCode') &&  ((errACL as AccessException).getCode() === AccesErrCode.VIOLATION)){
                AccessControl.check(
                    AccessZone.PROJECT,
                    ProjectAccessControl.access.PROJ_CHOWN,
                    this,
                    pAccount
                );

                ret_owned = true;
            }else{throw  errACL;}
        }

        return ret_owned;
        //return (this.owner != null && this.owner.is(pUser));
    }


    setWorkflow( pWorkflow:Workflow):void {
        this._wf = pWorkflow;
        if(this.analyze!=null) this.analyze.setWorkflow(pWorkflow);
        if(this.dataAnalyzer!=null) this.dataAnalyzer.setWorkflow(pWorkflow);
    }

    /**
     * To get the workflow attached to this project instance
     *
     * @return {Workflow}
     */
    getWorkflow():Workflow {
        if(this._wf==null){
            this._wf = new Workflow({ uid: this.getUID() });
        }
        return this._wf;
    }



    setSaveManager(pManager:any){
        this.saveManager = pManager;
    }

    getSaveManger():any{
        return this.saveManager;
    }

    getKeyPointManager():KeyPointManager{
        return this.kpmgr;
    }

    /**
     * To select the way to store the internal data
     *
     * @param {String} pConnectorType Connector type
     * @method
     */
    setConnector( pConnectorType:string):void{
        this.connector = ConnectorFactory.getInstance().newConnector( pConnectorType, this);
        this.getWorkflow().pushStatus(new StatusMessage( 5, "Connecting to DB")) ;
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


    getDB():IDatabase {
        return this.db;
    }

    getTypeManager():TypeManager {
        return this.typeManager;
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
        /*if(this.config === null) {
            this.config = new Settings.ProjectSettings({
                encoding: 'utf8'
            }); //this.engine.getConfiguration();
        }*/

        // workspace settings provide defaults value when value are not yet
        // configured at project level
        const wsSettings:Settings.WorkspaceSettings = this.engine.workspace.getSettings();
        const wf:Workflow = this.engine.getWorkflow(this.uid);

        this.typeManager = new TypeManager();

        this.setWorkflow(wf);

        // init project workspace
        if(this.workspace === null){
            this.workspace = new ProjectWorkspace(
                _path_.join( this.engine.workspace.getLocation(), this.uid )
            );

            this.workspace.init();
        }

        // init connector
        if(this.connector === null){
            this.connector = ConnectorFactory.getInstance().newConnector(wsSettings.getDefaultConnector() , this);
        }

        // open/create db
        const sqliteConn:SqliteConnector = ConnectorFactory.getInstance().newConnector('sqlite' , this)
        sqliteConn.connect(this.workspace.getDbPath());
        this.db = sqliteConn.getDB();



        // set the Search API which allow the user to perform search
        this.find = new SearchAPI();

        // set SC analyzer
        this.analyze = new Analyzer(wsSettings.getDefaultEncoding() as BufferEncoding, this);
        this.analyze.restoreState(this.getAnalyzerState('xast'))
        this.analyze.setWorkflow(wf)
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



        // file analyzer 
        this.dataAnalyzer = new DataAnalyzer(this);
        this.dataAnalyzer.setWorkflow(wf)
        this.dataAnalyzer.restoreState(this.getAnalyzerState('data'));
        this.find.addAnalyzerUnit( 'data', this.dataAnalyzer);

        // create main event bus of this project 
        this.bus = new Bus(this); //.setContext(this);

        let state:any;
        // manifest / app analyzer
        // depend of application type
        if(this.platform != null){
            if(this.platform.isAndroid()){
                this.kpmgr = KeyPointManager.newForAndroid(this);
                this.appAnalyzer = new AndroidAppAnalyzer(this);

                state = this.getAnalyzerState('android-app');
                if(state == null){
                    state = new AnalyzerState({ _uid:'android-app',  state:{}, modified: -1});
                }
                this.appAnalyzer.restoreState(state);
            }
            else if(this.platform.isIOS()){
                this.kpmgr = KeyPointManager.newForIOS(this);
                this.appAnalyzer = new IosAppAnalyzer(this);


                state = this.getAnalyzerState('ios-app');
                if(state == null){
                    state = new AnalyzerState({ _uid:'ios-app',  state:{}, modified: -1});
                }
                this.appAnalyzer.restoreState(state);
            }
            /*else if(this.platform.isELF())
                this.appAnalyzer = new BinaryAppAnalyzer(this);
            else
                this.appAnalyzer = new OtherAppAnalyzer(this);*/


        }else {
            this.kpmgr = KeyPointManager.newForAndroid(this);
            this.appAnalyzer = new AndroidAppAnalyzer(this);


            state = this.getAnalyzerState('android-app');
            if(state == null){
                state = new AnalyzerState({ _uid:'android-app',  state:{}, modified: -1});
            }
            this.appAnalyzer.restoreState(state);
        }

        this.hook = new HookManager(this, this.nofrida);
        // move HookManager loading to "after app analysis"

        // load hook DB
        this.scriptManager = new ScriptManager(this);

        // plugins
        im.createInspectorsFor(this);
        im.deployInspectors(this, INSPECTOR_TYPE.BOOT);
        this.inspectors = im.getInspectorsOf(this);
        
        this.graph = new GraphMaker(this);

        // init listeners
        // data Analyzer
        this.bus.subscribe("file.new.DYN_BYTECODE", BusSubscriber.from( (pEvent:Event) => {
            const d = pEvent.getData();
            Logger.info("[DXC-PROJECT] [SUBSCRIBER] <file.new.DYN_BYTECODE> scanning file : "+d.file.path);
            Logger.info(JSON.stringify(pEvent));



            if(d.file.hasScope(this.dataAnalyzer.scopes.DYN_BYTECODE)){
                this.dataAnalyzer.scanFile(
                    d.file,
                    d.file.scope
                );
            }

            this.dataAnalyzer.indexFile(d.file);
            this.dataAnalyzer.indexFile(d.file.clone({
                path:d.rpath,
                scope:this.getDataAnalyzer().getScope('APPDATA')
            }));
        }));

        // update global file index with files indexed by dtaa analyzer
        this.bus.subscribe( "data.file.index", BusSubscriber.from( (pEvent:Event)=>{

            Logger.info("[DXC-PROJECT] [SUBSCRIBER] <data.file.index> Indexing file : "+pEvent.getData().path);
            this.analyze.insertIn( "files", [pEvent.getData()]);
        }));

        this.initAuthorizations();
    }

    initAuthorizations():void {

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

        if(this.inspectors==null){
            this.inspectors = InspectorManager.getInstance().getInspectorsOf(this);
        }
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
    async useAPK( pPath:string):Promise<ApkPackage>{

        let success:boolean;
        let apkFile:ApkPackage = null;

        // copy the APK into project workspace
        this.workspace.changeMainAPK(pPath);

        // load it : decompress file, disass dex files
        this.getWorkflow().pushStatus(new StatusMessage(2, "Start APK extracting"));
        success = await ApkHelper.extract(
            this.workspace.getApkPath(),
            this.workspace.getApkDir(),
            {
                force: true,
                match: true
            }
        );

        // start analysis ?
        if(success){
            apkFile = new ApkPackage();
            this.getWorkflow().pushStatus(new StatusMessage(5, "APK extracted."));
        }

        return apkFile;
    }

    /**
     * To synchronize project platform used during analysis with device and APK
     *
     * @param {*} pName 
     * @method
     * @async
     */
    async synchronizePlatform( pName:string):Promise<boolean>{
        const pm:PlatformManager = PlatformManager.getInstance();
        let res = false;

        if(pm.isStub(pName)){
            this.platform = pm.getStubPlatform(this.device, this.application, pName);
        }else{
            this.platform = pm.getPlatform(pName);
        }

        // select platform
        /*
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

                this.platform = pm.getPlatform(pName);
                break;
        }*/

        // check if platform is installed
        if(this.platform == null){
            throw new Error("[PROJECT] synchronizePlatform : unkow platform. Aborted")
        }

        // install platform
        if(this.platform.checkInstall() === false){

            this.getWorkflow().pushStatus(new StatusMessage(0, "Target platform not installed. Installing ...."));
            Logger.info("[PROJECT] synchronizePlatform : Target platform is not installed. Installing ...")
            res = await pm.install(this.platform);
            if(res == true){

                this.getWorkflow().pushStatus(new StatusMessage(2, "Target platform has been successfully installed"));
                Logger.info("[PROJECT] synchronizePlatform : Platform installed successfully");
            }else{
                throw new Error("[PROJECT] synchronizePlatform : failed to install platform. Aborted")
            }
        }else{

            this.getWorkflow().pushStatus(new StatusMessage(2, "Target platform is already installed"));
            Logger.success("[PROJECT] Project uses platform : "+this.platform.getUID());
        }


        this.getWorkflow().pushStatus(new StatusMessage(4, "Saving platform settings"));
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
     * To get information about a specified project
     *
     * @param {DexcaliburEngine} pEngine
     * @param {string} pProjectUID
     * @return {any} Project data
     * @method
     * @static
     * @since 1.0.0
     */
    static getInformationOf(pEngine:DexcaliburEngine, pProjectUID:string, pAccount:UserAccount = null):any {

        // create a minimalist instance of project to check if the user own or not this project
        const project = new DexcaliburProject(pEngine, pProjectUID);

        project.workspace = new ProjectWorkspace(_path_.join( pEngine.workspace.getLocation(), pProjectUID));

        const data = JSON.parse( Fs.readFileSync( project.workspace.getProjectCfgPath()).toString());

        if(data._attr != null){
            project.importAccessAttributes(data._attr);
        }

        AccessControl.check(
            AccessZone.PROJECT,
            ProjectAccessControl.access.PROJ_OPEN_OWN,
            project,
            pAccount
        );

        return data;
    }

    /**
     * 
     * @param {*} pContext 
     * @param {*} pProjectUID 
     * @param {*} pConfigPath 
     */
    static load( pEngine:DexcaliburEngine, pProjectUID:string, pAcc:UserAccount, pConfigPath:string = null):DexcaliburProject{
        
        let project:DexcaliburProject = new DexcaliburProject( pEngine, pProjectUID);
        let data:any = null;



        // Load project from workspace
        //project.config = pEngine.getConfiguration();

        project.workspace = new ProjectWorkspace(
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
                case "anal":
                    project.analCfg = AnalyzerConfiguration.from(data.anal);
                    project.analCfg.fileAnalysisMode = FileAnalysisType.DEEP;
                    break;
                case "package":
                case "nofrida":
                    project[i] = data[i];
                    break;
                case "_attr":
                    project.importAccessAttributes(data._attr);
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

        project.isOwnedBy(pAcc);



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

        this.hook.saveAll();
    }

    toJsonObject():any{
        let o:any = new Object();

        // add last modified, user, etc ...
        o.uid = this.uid;
        o.package = this.pkg;
        o.device = this.device!=null? this.device.getUID() : null;
        o.platform = this.platform!=null? this.platform.getUID() : null;
        o.nofrida = this.nofrida;

        o.anal = this.analCfg.toJsonObject();

        o.connector = this.connector.toJsonObject(); //constructor.getProperties();
        o._attr = {};
        for(const n in this._attr){
            o._attr[n] = (this._attr[n].hasOwnProperty('toJsonObject')?this._attr[n].toJsonObject():this._attr[n]);
        }


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
     * @deprecated
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

            const pkgScope = this.dataAnalyzer.getScope('PKG');

            // TODO : improve this step
            // files analysis (signature, ...)
            //this.dataAnalyzer.scan( apkctnPath);
            // file analysis : icon detection, strings, etc ...
            // TODO : multi threading : each file can be treated separately

            if(this.dataAnalyzer.isScopeIndexed(pkgScope)==false){
                this.dataAnalyzer.indexFilesIn(pkgScope);
            }

            // update internal DB with file analyzer DB
            this.analyze.insertIn( "files", this.dataAnalyzer.getDB().getCollection('files', ModelFile.TYPE).getAll());
        }
    }

    getPlatform():Platform {
        return this.platform;
    }

    getDisassembler(){
        if(this.platform.isAndroid()){
            return new SmaliDisassembler();
        }else{
            throw new Error('There is not disassembler configured');
        }
    }


    /**
     * To change project owner
     *
     * Only a user with PROJ_CHOWN or the current owner of the project
     * can change the owner
     *
     * @param pAuthorSess
     * @param pNewOwner
     */
    changeOwner( pAuthorSess:UserSession, pNewOwner:UserAccount):DexcaliburProject {

        if(this.getAccessAttribute(ProjectAccessControl.attr.OWNER)===null){
            this.setAccessAttribute(ProjectAccessControl.attr.OWNER, pNewOwner.getUID());
            //this._attr.OWNER.value = pNewOwner.getUID();
        }else{
            try{
                AccessControl.checkAttr(
                    AccessZone.PROJECT,
                    ProjectAccessControl.attr.OWNER,
                    this,
                    pAuthorSess.getUserAccount()
                );

                this.setAccessAttribute(ProjectAccessControl.attr.OWNER, pNewOwner.getUID());

            }catch(errACL){
                if(errACL.hasOwnProperty('getCode') && ((errACL as AccessException).getCode() === AccesErrCode.VIOLATION)){
                    AccessControl.check(
                        AccessZone.PROJECT,
                        ProjectAccessControl.access.PROJ_CHOWN,
                        this,
                        pAuthorSess.getUserAccount()
                    );

                    this.setAccessAttribute(ProjectAccessControl.attr.OWNER, pNewOwner.getUID());
                }else{
                    throw errACL;
                }
            }
        }


        return this;
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

        // scan pkg

        // application topology analysis
        success = await this.appAnalyzer.importManifest(_path_.join(this.workspace.getApkDir(),"AndroidManifest.xml"));


        // scan OS/Platform
        Logger.info("Scanning platform "+this.platform.getUID());

        this.analyze.setWorkflow(this.getWorkflow());
        this.dataAnalyzer.setWorkflow(this.getWorkflow());

        this.getWorkflow().setStep('Platform analysis', 10);
        this.getWorkflow().pushStatus(new StatusMessage(5, "Analyzing bytecode of target platform"));

        this.analyze.path(this.platform.getLocalPath());

        this.getWorkflow().pushStatus(new StatusMessage(11, "Analyzing byte arrays from target platform"))

        this.analyze.updateDataBlock();


        this.getWorkflow().pushStatus(new StatusMessage(12, "Tagging discovered elements"));
        //this.getWorkflow().setStep('Triage', 20);

        this.analyze.tagAllAsInternal();

        this.getWorkflow().pushStatus(new StatusMessage(14, "Deploying inspectors for [POST_PLATFORM_SCAN]"));

        this.deployInspectors(INSPECTOR_TYPE.POST_PLATFORM_SCAN);


        // init delayed tagging for app class injected into 'android' classes/packages
        this.analyze.flushDelayedTagging();
        this.analyze.initDelayedTagging(TAG.Discover.Statically, true);

        this.getWorkflow().setStep('App bytecode', 40);
        this.getWorkflow().pushStatus(new StatusMessage(15, "Start analysis of application byte code"));

        // scan files  
       /* if(pPath != undefined){
            this.analyze.path( pPath);


            this.getWorkflow().pushStatus(new StatusMessage(16, "Indexing and analysis of flat files"));
            this.dataAnalyzer.indexFilesIn(
                this.dataAnalyzer.getScope('PKG')
            );
            
        // this.analyze.scanManifest(Path.join(path,"AndroidManifest.xml"));
            this.getWorkflow().pushStatus(new StatusMessage(17, "Manifest analysis"));
            success = await this.appAnalyzer.importManifest(_path_.join(pPath,"AndroidManifest.xml"));
            //success = await this.appAnalyzer.scan(AppPackage); <--- add abstraction

        }else{*/
            //        let dexPath = this.workspace.getWD()+"dex";
            // To replace by package app (abstraction of apk/ipa/elf/..)
            //  par exemple : getAppDir() => path of folder containing extracted files
            let apkPath:string = this.workspace.getApkDir();

            Logger.info("Scanning default path : "+apkPath);

            // If android or iOS bytecode code analysis
            // TODO : multi threading
            this.analyze.path( apkPath);

            // load hooks
            this.hook.load();

            this.getWorkflow().setStep('App resources', 60);
            this.getWorkflow().pushStatus(new StatusMessage(41, "Indexing and analysis of flat files from package"));

            // file analysis : icon detection, strings, etc ...
            // TODO : multi threading : each file can be treated separately
            const pkgScope:DataScope = this.dataAnalyzer.getScope('PKG');
            if(!this.dataAnalyzer.hasIndexed(pkgScope)) {
                this.dataAnalyzer.indexFilesIn(pkgScope);
            }else{
                this.dataAnalyzer.loadIndex(pkgScope );
            }



            this.getWorkflow().setStep('Runtime data', 80);
            this.getWorkflow().pushStatus(new StatusMessage(60, "Updating analyzer DB with discovered files"));

            // update internal DB with file from package only (at this step)
            this.analyze.updateFileIndex(
                this.dataAnalyzer.getIndex('PKG'), true
            );

            //this.dataAnalyzer.scanAsApkContent( apkPath, DATA_SCOPE.PKG); //["smali"]); // scan

            // analysis of executable/shared libraries
            // it starts by identifying native library for the target device achitecture


            this.getWorkflow().setStep('App native libraries', 85);
            this.getWorkflow().pushStatus(new StatusMessage(80, "Analysis of native libraries"));


            this.analyze.initNativeAnalyzer(this.dataAnalyzer.getDB()); //this.dataAnalyzer.getDB()

            if(this.device!=null){

                this.analyze.getNativeAnalyzer().configure(
                    this.platform,
                    this.device.getProfile().getSystemProfile().getArchitecture(),
                    (this.analCfg.useDeviceABI()? this.device.getProfile().getSystemProfile().getABIlist() : [])
                );
            }else{
                this.analyze.getNativeAnalyzer().configure(
                    this.platform,
                    this.engine.getSettings().getServerSettings().getDefaultArchitecture(), // project architecture
                    this.device.getProfile().getSystemProfile().getABIlist()
                );
            }

            this.analyze.restoreNativeAnalyzer();

            Logger.info("[ANALYZER] Scan every native library and executable contained into package");
            //this.analyze.doNativeAnalysis(pkgScope, null, { skipAuto: this.analCfg.isAutoNativeAnalysis() });


            if(await this.analyze.doNativeAnalysisAsync(
                pkgScope,
                null,
                { skipAuto: this.analCfg.isAutoNativeAnalysis() })){

                // native hook are loaded only if depending files have been loaded
                this.hook.loadNativeHook();
            }

            // loadSyscall / Instr hook

            this.getWorkflow().setStep('Application topology analysis', 91);
            this.getWorkflow().pushStatus(new StatusMessage(86, "Manifest analysis"));

            // application topology analysis
            //success = await this.appAnalyzer.importManifest(_path_.join(apkPath,"AndroidManifest.xml"));
       // }

        if(success){
            this.setPackageName( this.appAnalyzer.getPackageName());
        }


        this.getWorkflow().pushStatus(new StatusMessage(95, "Analyzing byte arrays from target platform"));
        // index static array 
        this.analyze.updateDataBlock();


        this.getWorkflow().pushStatus(new StatusMessage(96, "Tagging fresh data and elements"));
        this.analyze.tagAllIf(
            function(k,x){ 
                return x.hasTag(TAG.Discover.Internal)==false;
            }, 
            TAG.Discover.Statically);


        //this.analyze.execDelayedTagging(TAG.Discover.Statically);


        // scan bytecode gathered during previous instrumentation session
        // if there is not path specified
        //if(pPath == null){


        this.getWorkflow().pushStatus(new StatusMessage(97, "Scanning data previously extracted by hooking"));

        this.dataAnalyzer.scan(this.workspace.getRuntimeFilesDir(), this.dataAnalyzer.getScope('DYN_BUFFER')); //["smali"]);
        this.analyze.updateFileIndex(
            this.dataAnalyzer.getIndex('DYN_BUFFER'), true
        );

        this.dataAnalyzer.scan(this.workspace.getRuntimeBcDir(), this.dataAnalyzer.getScope('DYN_BYTECODE')); //["smali"]);
        this.analyze.updateFileIndex(
            this.dataAnalyzer.getIndex('DYN_BYTECODE'), true
        );

        // scan smali files for each dex files discovered dynamically
        this.dataAnalyzer.getIndex('DYN_BYTECODE').map( (vOffset:number, vFile:ModelFile)=>{

            const bc = _path_.join( _path_.dirname(vFile.getPath()),"smali");
            const loc = ModelLocation.fromFile(vFile);

            Logger.info('Scanning dir : ', bc);
            if(Fs.existsSync(bc)){

                if( Fs.lstatSync(bc).isDirectory()) {
                    Logger.info("Scanning previously discovered dex chunk : " + bc);
                    this.analyze.path(bc, loc);
                }/*else{
                    // dex files
                    this.dataAnalyzer.indexFilesIn(
                        this.dataAnalyzer.getScope('DYN_BYTECODE')
                    );
                    this.analyze.updateFileIndex(
                        this.dataAnalyzer.getIndex('DYN_BYTECODE'), true
                    );
                }*/
            }

        });

        /*
        let dir:string[]=Fs.readdirSync(this.workspace.getRuntimeBcDir());
        for(let i in dir){
            elemnt = _path_.join(this.workspace.getRuntimeBcDir(),dir[i],"smali");

            // deprecated
            this.find.byID().file()


            Logger.info('Scanning dir : ', elemnt);
            if(Fs.existsSync(elemnt)){

                if( Fs.lstatSync(elemnt).isDirectory()) {
                    Logger.info("Scanning previously discovered dex chunk : " + elemnt);
                    this.analyze.path(elemnt);
                }else{
                    // dex files
                    this.dataAnalyzer.indexFilesIn(
                        this.dataAnalyzer.getScope('DYN_BYTECODE')
                    );
                    this.analyze.updateFileIndex(
                        this.dataAnalyzer.getIndex('DYN_BYTECODE'), true
                    );
                }
            }
        }
*/

        this.getWorkflow().pushStatus(new StatusMessage(23, "Tagging data previously extracted by hooking"));
        this.analyze.tagAllIf(
            function(k,x){
                return (x.hasTag(TAG.Discover.Internal)==false)
                    && (x.hasTag(TAG.Discover.Statically)==false);
            },
            TAG.Discover.Dynamically);

        //}



        this.bus.send(new Event({
            type: "dxc.fullscan.post" 
        }));


        this.getWorkflow().pushStatus(new StatusMessage(24, "Deploying inspectors [POST_APP_SCAN]"));

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

        /*this.analyze.insertIn( "files",
            this.dataAnalyzer.getDB().getIndex(
                this.dataAnalyzer.getScope('PKG').getName()));*/
        
        this.bus.send(new Event({
            type: "filescan.new" 
        }));


        this.bus.send(new Event({
            type: "dxc.initialized" 
        }));

        this.ready = true;

        this.getWorkflow().pushStatus(new StatusMessage(25, "Saving project ..."));

        // update project config (icon, checksum, cert, ...)
        this.save();


        // make CFG
        //this.analyze.cfg();
        return this;
    };

    async scanNativeLibraries():Promise<boolean> {

        return true;
    }
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
     * To close an opened project.
     *
     * Must free memory
     *
     * @return {boolean}
     * @method
     * @since 1.0.0
     */
    close():boolean {
        // save
        this.save();

        // free
        this.analyze = null;
        this.bus = null;
        this.inspectors = null;
        this.dataAnalyzer = null;
        this.appAnalyzer = null;
        this.application = null;
        this.device = null;

        return true;
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

    /**
     * To get project's workspace
     *
     * @return {ProjectWorkspace}
     * @method
     * @since 1.0.0
     */
    getWorkspace(): ProjectWorkspace {
        return this.workspace;
    }

    /**
     *
     * @param pAnal
     * @private
     */
    getAnalyzerState(pAnal:string):AnalyzerState {
        const coll = this.db.getCollection(AnalyzerState.TYPE.getName(), AnalyzerState.TYPE);

        let state:AnalyzerState = coll.getEntry(pAnal);
        if(state == null){
            state = new AnalyzerState({ _uid:pAnal, state:{}, modified:-1 });
            coll.addEntry(pAnal, state);
        }

        if(!state.isReady()) state.setContext(this);

        return state;
    }

    /**
     * To the state of an analyzer
     *
     * @param pState
     */
    saveAnalyzerState(pState:AnalyzerState) {
        const coll = this.db.getCollection(AnalyzerState.TYPE.getName(), AnalyzerState.TYPE);
        return coll.updateEntry(pState);
    }
}

