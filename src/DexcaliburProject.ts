/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import * as _path_ from "path";


import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import Platform from "./platform/Platform.js";
import APK from "./APK.js";
import {ConnectorFactory} from "./ConnectorFactory.js";
import DexHelper from "./DexHelper.js";
import {Device} from "./Device.js";
import Bus, {BusSubscriber} from "./Bus.js";
import AndroidApplication from "./android/AndroidApplication.js";
import PlatformManager from "./platform/PlatformManager.js";
import {SearchAPI} from "./SearchAPI.js";
import DeviceManager from "./DeviceManager.js";
import BusEvent, {BusEventOptions} from "./BusEvent.js";
import {DataAnalyzer} from "./DataAnalyzer.js";
import Analyzer from "./Analyzer.js";
import ApkHelper from "./ApkHelper.js";
import AndroidAppAnalyzer from "./android/AndroidAppAnalyzer.js";
import DexcaliburEngine from "./DexcaliburEngine.js";
import ProjectWorkspace from "./ProjectWorkspace.js";
import * as Log from './Logger.js';
import {HookManager} from "./hook/HookManager.js";
import Inspector, {INSPECTOR_TYPE} from "./Inspector.js";
import InspectorManager, {InspectorMap, InspectorUninstallOptions} from "./InspectorManager.js";
import {DexcaliburVM} from "./DexcaliburVM.js";
import Simplifier from "./Simplifier.js";
import SmaliDisassembler from "./SmaliDisassembler.js";
import GraphMaker from "./Graph.js";
import {AppIcon} from "./AppIcon.js";
import {ApkPackage} from "./android/ApkPackage.js";
import {Workflow} from "./Workflow.js";
import StatusMessage from "./StatusMessage.js";
import ModelFile from "./ModelFile.js";
import {CodeLocation, ModelLocation} from "./ModelLocation.js";
import {Settings} from "./Settings.js";
import {UserAccount, UserAccountUUID} from "./user/UserAccount.js";
import {ProjectAccessControl} from "./user/acl/rbac/ProjectAccessContol.js";
import {AnalyzerConfiguration, FileAnalysisType, PackageAnalyzerOptions} from "./AnalyzerConfiguration.js";
import AccessControl from "./user/acl/AccessControl.js";
import {AccesErrCode, AccessException} from "./user/acl/Access.js";
import Util from "./Utils.js";
import {Auditable} from "./Auditable.js";
import DataScope from "./DataScope.js";
import KeyPointManager, {KeyPointCondition} from "./hook/KeyPointManager.js";
import {ScriptManager} from "./ScriptManager.js";
import {DATATYPE_CATEGORY, TypeManager} from "./types/TypeManager.js";
import {AnalyzerState} from "./AnalyzerState.js";
import {IAppAnalyzer} from "./analyzer/IAppAnalyzer.js";
import {TagManager} from "./tags/TagManager.js";
import {DexcaliburProjectException} from "./errors/DexcaliburProjectException.js";
import {Architecture} from "./Architecture.js";
import {NodeInternalType, OperatingSystem} from "@dexcalibur/dxc-core-api";
import ModelSyscallFactory from "./ModelSyscallFactory.js";
import {ProjectState} from "./ProjectState.js";
import {LicenceManager} from "./credit/LicenceManager.js";
import {Product} from "./credit/Product.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {ScanSchedulerProject} from "./audit/common/ScanSchedulerProject.js";
import {SecurityZone} from "./security/SecurityZone.js";
import TargetApp from "./common/TargetApp.js";
import {Nullable} from "./core/IStringIndex.js";
import {
    AppContextType,
    DbDataType,
    DbKeyType,
    IAppContext,
    IDatabase,
    IDatabaseAdapter,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    Tag,
    TagUUID,
    ValidationRule
} from "@dexcalibur/dexcalibur-orm";
import {EngineDatabaseException} from "./errors/EngineDatabaseException.js";
import {ProjectDatabase} from "./database/ProjectDatabase.js";
import {MerlinSearchAPI} from "./search/MerlinSearchAPI.js";
import {IPackageAnalyzer} from "./analyzer/IPackageAnalyzer.js";
import {AndroidPackageAnalyzer} from "./android/analyzer/AndroidPackageAnalyzer.js";
import {GenericPackageAnalyzer} from "./analyzer/GenericPackageAnalyzer.js";
import {ProjectInput, ProjectInputLocation, ProjectInputPurpose, ProjectInputType} from "./analyzer/ProjectInput.js";
import {Subject} from "rxjs";
import * as _fs_ from "node:fs";
import {ModelAPI} from "./ModelAPI.js";
import InspectorFactory from "./InspectorFactory.js";
import {GuiTypesManager} from "./graphics/GuiTypesManager.js";
import {AccessAttribute, AccessAttributeMap} from "./user/acl/AccessAttribute.js";
import {ApplicationIcon, ApplicationUnit, ApplicationUnitUUID} from "./organization/ApplicationUnit.js";
import {OrganizationAccessControl} from "./user/acl/rbac/OrganizationAccessContol.js";
import {GlobalAccessControl} from "./user/acl/rbac/GlobalAccessContol.js";
import {OrganizationUnitUUID} from "./organization/OrganizationUnit.js";
import {TaintAnalyzer} from "./analyzer/taint/TaintAnalyzer.js";
import {AbiManager, AbiType} from "./binary/ABI.js";
import {ProgramManager} from "./core/ProgramManager.js";
import ModelStringValue from "./ModelStringValue.js";
import {DataFormatManager} from "./formats/DataFormatManager.js";
import {MerlinSearchRequest} from "./search/MerlinSearchRequest.js";
import {AndroidTypes} from "./android/AndroidTypes.js";
import {RuntimeManager} from "./runtime/RuntimeManager.js";
import FuzzManager from "./fuzzing/FuzzManager.js";
import KeyPoint from "./hook/KeyPoint.js";
import {InspectorEditor} from "./inspector/InspectorEditor.js";
import {NativeBackend} from "./types/common.js";
import {INodeRef} from "./INode.js";
import {FinderResult} from "./search/FinderResult.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export type DexcaliburProjectUUID = string;


export interface AppPreview {
    version:string;
    name:string;
    pkgId:string;
    os: OperatingSystem;
    arch?:Architecture;
    minOs:number;
    targetOs:number;
    fmt:string;
    icons?:any;
    dev?:any;
    iconUrl?:string;
}

export enum ProjectEventType {
    DATA_ANALYSIS_DONE="data_analysis_done",
    NATIVE_ANALYZER_READY="native_analyzer_ready",
    DATA_ANALYZER_LOADED="data_analyzer_loaded",
    NATIVE_ANALYSIS_DONE="native_analysis_done"
}

export interface ProjectEvent {
    type: ProjectEventType,
    data: Nullable<any>
}

export interface DexcaliburProjectOptions {
    pkgAnalyzer?: PackageAnalyzerOptions
}


export enum OperatingSystemFlavor {
    ANDROID= 'android',
    WEB_OS='webos',
    FIRE_OS='fireos',
}



/**
 * @class
 * @author Georges-B. MICHEL
 */
export default class DexcaliburProject extends Auditable implements INode, IAppContext
{
    static VALIDATE = {
        uid: ValidationRule.utf8String()
    }

    _type = AppContextType.WEB_SERVER;

    LOG = Logger;

    static readonly EV_TYPE = {
        ARCH_UPDATE: 'project:arch:update',
        OWNER_CHANGE: 'project:owner:change',
        PKGNAME_CHANGE: 'project:pkgName:change',
        SAVE: 'project:save',
        STATE_CHANGE: 'project.state.change'
    };

    static TYPE:NodeType = new NodeType('project', NodeInternalType.PROJECT, [
        //(new NodeProperty("_id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("uid"))
            .type(DbDataType.STRING)
            .addValidationRule(ValidationRule.uuid())
            .schema({ type: "string", format: "uuid" })
            .key(DbKeyType.PRIMARY),
        (new NodeProperty("pkg"))
            .schema({ type: "string" })
            .descr("Package identifier linked to this project")
            .type(DbDataType.STRING),
        (new NodeProperty("name"))
            .type(DbDataType.STRING)
            .descr("Human name of the project")
            .schema({ type: "string" }),
        (new NodeProperty("engineVersion"))
            .schema({ type: "string" })
            .descr("Version of Dexcalibur engine used to create this project")
            .type(DbDataType.STRING),
        (new NodeProperty("state"))
            .descr("Current state of the project.")
            .type(DbDataType.NUMERIC),
        (new NodeProperty("os"))
            .schema({ type: "string", enum: Object.values(OperatingSystem) as OperatingSystem[] })
            .descr("Target Operating System")
            .type(DbDataType.STRING),
        (new NodeProperty("archs"))
            .descr("Hardware architecture of the project")
            .type(DbDataType.STRING),
        (new NodeProperty("dbName"))
            .schema({ type: "string" })
            .type(DbDataType.STRING),
        (new NodeProperty("appUnit"))
            .type(DbDataType.STRING)
            .schema({ type: "string", format: "uuid" })
            .descr("UUID of the ApplicationUnit containing this project. If the value is NULL, the project is standalone.")
            .def(null),

        //(new NodeProperty("db")).type(DbDataType.STRING),é
        (new NodeProperty("device")).type(DbDataType.STRING)
            .sleep( (x:NodePropertyState)=>{
                if(x.p!=null){
                    return (x.p as Device).getUID();
                }else{
                    return null;
                }
            })
            .wakeUp((x:NodePropertyState)=>{
                if(x.p!=null){
                    return DeviceManager.getInstance().getDevice(x.p)
                }else{
                    return null;
                }
            })
            .descr("The default device assigned to this project. It is a DeviceUUID")
            .schema(Device.TYPE.getPrimaryKey().toJSONSchemaPart()),
        (new NodeProperty("meta"))
            .schema({ type: "object", properties: {
                    creationDate: { type: "number", description: "Creation date of the project" },
                    lastOpenDate: { type: "number", description: "Last open date of the project" },
                    lastExecDate: { type: "number", description: "Last exec date of the project" },
                    version: { type: "string", description: "Version of the application/input" },
                    versionName: { type: "string", description: "Version name" },
                    tag: { type: "object" },
                    branch: { type: "string" } ,
                    commit: { type: "string" },
                    hash: { type: "string" },
                    label: { type: "string" }
                } })
            .type(DbDataType.BLOB).def({
                    creationDate: null,
                    lastOpenDate: null,
                    lastExecDate: null,
                    version: null,
                    versionName: null,
                    tag: null,
                    branch: null,
                    commit: null,
                    hash: null,
                    label: null
                }),
        (new NodeProperty("bus"))
            .volatile()
            .type(DbDataType.BLOB),
        (new NodeProperty("inputs"))
            .type(DbDataType.BLOB)
            .def([])
            .sleep( (x:NodePropertyState)=>{
                if(x.p!=null){
                    const inputs:any[]=[];
                    (x.p as ProjectInput[]).map(vInput => {
                        inputs.push(vInput.toJsonObject(SecurityZone.PRIVATE));
                    });
                    return inputs;
                }else{
                    return [];
                }
            })
            .wakeUp((x:NodePropertyState)=>{

                if(x.p!=null && Array.isArray(x.p)){
                    const inputs:ProjectInput[]=[];
                    x.p.map(vInput => {
                        inputs.push(ProjectInput.from(vInput));
                    });
                    return inputs;
                }else{
                    return [];
                }
            })
            .descr("The list of package or files passed as inputs to this project."),
        (new NodeProperty("hook"))
            .volatile()
            .type(DbDataType.BLOB),
        (new NodeProperty("inspectors")).volatile().type(DbDataType.BLOB).def({}),
        (new NodeProperty("analCfg")).type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                if(x.p!=null){
                    return x.p;
                }else{
                    return null;
                }
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p!=null){
                    return new AnalyzerConfiguration(x.p);
                }else{
                    return new AnalyzerConfiguration();
                }
            }),

        (new NodeProperty("_attr"))
            .type(DbDataType.STRING)
            .wakeUp( (x:NodePropertyState) => {
                if(x.p!=null){
                    const m:AccessAttributeMap = {};
                    for(let k in x.p){
                        if(x.p[k]!=null){
                            m[k] = AccessAttribute.from({
                                name: x.p[k]._n,
                                value: x.p[k]._v,
                                type: x.p[k]._t
                            });
                        }
                    }
                    return m;
                }else{
                    return {};
                }
            })
            .def({}),
        (new NodeProperty("workspace")).volatile().type(DbDataType.BLOB),
        (new NodeProperty("platform")).type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                if(x.p==null) return null;

                return (x.p as Platform).toJsonObject()
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p!=null){
                    return new Platform(x.p);
                }else{
                    return null;
                }
            }),
    ]).dataSource("ENGINE_DB");

    __:NodeInternalType = NodeInternalType.PROJECT;

    private _dirty = false;

    private _state:ProjectState = ProjectState.IDLE;

    /**
     * @type {DexcaliburEngine}
     * @field Dexcalibur engine (context)
     */
    engine:DexcaliburEngine = null;

    dbName:string = "";

    /**
     * @type {string}
     * @field Version of the Engine which modified the project
     * @since 1.1.0
     */
    engineVersion:string = DexcaliburEngine.VERSION_MIN;

    _id:string = null;

    /**
     * @type {String}
     * @field Project UID
     */
    uid:DexcaliburProjectUUID = '';

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
    nofrida = false;

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

    merlin:MerlinSearchAPI<any> = null;

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

    rtmgr:RuntimeManager = null;

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
    bus:Nullable<Bus> = null;

    /**
     * @type {IAppAnalyzer}
     * @field Application topology analyzer unit (depend of application type : apk,bin, ...)
     */
    appAnalyzer:IAppAnalyzer = null;

    /**
     * @type {Nullable<IPackageAnalyzer>}
     * @field Package analyzer unit, is responsible of extracting as well as merging
     */
    packageAnalyzer:Nullable<IPackageAnalyzer> = null;

    /**
     * @type {Inspector[]}
     * @field All inspectors
     */
    inspectors:InspectorMap = {};

    // FridaBuilder make Frida script chunk from cls
    fridaBuilder:any = null;

    /**
     * @deprecated
     */
    graph:GraphMaker = null;

    // NEW

    /**
     * Ready flag
     * @field
     */
    ready = false;

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
     * @type {InstructionSet[]}
     * @field List of Instruction Set Architecture supported by this project
     */
    archs:Architecture[] = [];

    os:OperatingSystem = OperatingSystem.ANDROID;


    osFlavor:OperatingSystemFlavor = OperatingSystemFlavor.ANDROID;

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

    pdb:Nullable<ProjectDatabase> = null;

    /**
     * @field
     */
    simplifier:Simplifier = null;

    typeManager:TypeManager;

    guiTypeManager:GuiTypesManager;

    tagManager:TagManager;

    scanManager:any;

    sharedStorage:any = {};

    inputs:ProjectInput[] = [];

    /**
     * UUID of the ApplicationUnit containing this project
     * Default is NULL because a project can be standalone
     *
     * @field
     * @type {Nullable<ApplicationUnitUUID>}
     */
    appUnit:Nullable<ApplicationUnitUUID> = null;

    /**
     * Application Icon
     *
     * @type {AppIcon}
     * @field
     */
    icon:AppIcon = null;

    /**
     * DO NOT USE
     * Replaced by ABAC ACL
     * @deprecated
     */
    owner: UserAccount = null;

    /**
     * DO NOT USE
     * Replaced by ABAC ACL
     * @deprecated
     */
    tester: UserAccount[] = [];

    tags:TagUUID[] = [];

    private _pm:ProgramManager;

    private readonly _scanScheduler:ScanSchedulerProject;

    private _wf:Workflow = null;

    private analCfg:AnalyzerConfiguration = new AnalyzerConfiguration();

    private _archReady:Architecture[] = [];

    private _dfm:DataFormatManager;

    meta:any = {
        creationDate: null,
        lastOpenDate: null,
        lastExecDate: null,

        version: null,
        versionName: null,
        tag: null,
        branch: null,
        commit: null,
        hash: null,
        label: null
    };

    _createMode = false;

    _analysis$:Subject<ProjectEvent> = new Subject<ProjectEvent>();

    /**
     * An API to create new node inside the model
     *
     */
    modelAPI = new ModelAPI(this);

    /*
     * A set of package checksum
     *
     * @type {DigestSet}
     * @field
     */
    //checksum:DigestSet = {};


    taintAnalyzer:Nullable<TaintAnalyzer> = null;
    fzmgr: FuzzManager;

    /**
     * Not initialized by default
     * @private
     */
    private _iedit: Nullable<InspectorEditor> = null;

    /**
     *
     * @param {any} pConfig Project config options
     * @constructor
     */
    constructor(pConfig:any){
        super({
            'project:uid': [
                ValidationRule.newRegexpAssert(new RegExp('^[a-zA-Z_-\s]+$')),
            ],
            'project:nofrida': [
                ValidationRule.newPinklistAssert(['true','false'])
            ]
        });

        for(let i in pConfig){
            this[i] = pConfig[i];
        }

        //this.engine = pEngine;
        //this.uid = pUID;

        // scan scheduler should be attach to master engine
        this._scanScheduler = new ScanSchedulerProject(this);
        if(this.sharedStorage.tagsCtr==null){
            this.sharedStorage.tagsCtr = {};
        }
    }

    private _emit(pEvent:string, pData:any = {}):void {
        if(this.getBus() != null){
            this.getBus().send(new BusEvent<any>({
                type: pEvent,
                data: {
                    project: this,
                    ...pData
                }
            }));
        }
    }

    /**
     *
     */
    getProgramManager():ProgramManager {
        if(this._pm==null){
            this._pm = new ProgramManager(this);
        }

        return this._pm;
    }

    setEngine(pEngine:DexcaliburEngine):void {
        this.engine = pEngine;
    }

    /**
     *
     */
    initAccessAttributes(){
        this.setAccessAttribute(ProjectAccessControl.attr.OWNER);
        this.setAccessAttribute(ProjectAccessControl.attr.TESTER);

        //this.setAccessAttribute(GlobalAccessControl.attr.ORG);
    }


    getScanScheduler():ScanSchedulerProject {
        return this._scanScheduler;
    }

    /**
     * Setter for `DexcaliburProject.state`
     *
     * It triggers change event
     * @param pState
     */
    set state(pState:ProjectState) {
        Logger.debug("PROJECT STATE CHANGE : "+pState);
        const oldState = this._state;
        this._state = pState;

        this._emit(
            DexcaliburProject.EV_TYPE.STATE_CHANGE,
            {
                old: oldState,
                new: pState
            }
        );
    }


    /**
     * To get state of the project
     *
     * @return {ProjectState} Project state. See Project lifecycle doc
     * @method
     */
    get state():ProjectState {
        return this._state;
    }

    getAnalyzerConfiguration():AnalyzerConfiguration {
        return this.analCfg;
    }

    getHookManager():HookManager {
        return this.hook;
    }

    getRuntimeManager():RuntimeManager {
        return this.rtmgr;
    }

    /**
     * To get User UID of the owner
     *
     * @return {string} User UID
     * @method
     */
    getOwner():UserAccountUUID[] {
       return this.getAccessAttribute(ProjectAccessControl.attr.OWNER).value;
    }

    /**
     * To get User UID of authorized tester
     *
     * @return {string} User UID
     * @method
     */
    getAuditors():UserAccountUUID[] {
        //let uids = this.getAccessAttribute(ProjectAccessControl.attr.TESTER).value;
        //uids = this.getOwner()+(uids!=null&&uids.length>0 ? ":":'')+uids;

        return this.getAccessAttribute(ProjectAccessControl.attr.TESTER).value;
    }


    getArchitectures():Architecture[] {
        return this.archs;
    }

    /**
     * A project can be deleted only by its owner
     *
     * @param pEngine
     * @param pUID
     * @param pAccount
     */
    static deleteCloseProject( pEngine:DexcaliburEngine, pUID:DexcaliburProjectUUID, pAccount:UserAccount){
        const project = new DexcaliburProject({ uid:pUID, engine:pEngine });

        const data = JSON.parse( _fs_.readFileSync( project.workspace.getProjectCfgPath()).toString());

        if(data._attr != null){
            project.importAccessAttributes(data._attr);
        }

        if(project.isOwnedBy(pAccount)){
            Util.recursiveRmDirSync(
                _path_.join( pEngine.workspace.getLocation(), pUID )
            );
        }

    }


    /**
     * To check if the specified user account is the owner of the project
     *
     * @param pAccount
     */
    isOwnedBy( pAccount:UserAccount):boolean {
        try{
            AccessControl.isAuthorizedByAttr(
                ProjectAccessControl.attr.OWNER,
                this,
                pAccount
            );
            return true;
        }catch (err){
            return false;
        }
    }

    /**
     * Determines whether the provided user account is authorized to perform testing actions.
     *
     * @param {UserAccount} pAccount - The user account to be checked for test authorization.
     * @return {boolean} - Returns true if the user account is authorized to test, otherwise false.
     */
    isAuthorizedToTest( pAccount:UserAccount):boolean {
        try{
            AccessControl.isAuthorizedByAttr(
                ProjectAccessControl.attr.TESTER,
                this,
                pAccount
            );
            return true;
        }catch (err){
            return false;
        }
    }

    /**
     * To get
     */
    getBus():Bus {
        return this.bus;
    }

    /**
     * Configures the workflow for the current instance and initializes its execution if not already started.
     * Also updates related components with the same workflow and subscribes to workflow message events.
     *
     * @param {Workflow} pWorkflow - The workflow instance to be set and managed by the current instance.
     * @return {void} - This method does not return a value.
     */
    setWorkflow( pWorkflow:Workflow):void {
        this._wf = pWorkflow;
        if(this.analyze!=null) this.analyze.setWorkflow(pWorkflow);
        if(this.dataAnalyzer!=null) this.dataAnalyzer.setWorkflow(pWorkflow);

        if(!this._wf.isStarted()){
            this._wf.start();
        }

        this._wf.msg$.subscribe(()=>{
            this.getContext().getEngineDB().updateWorkflow(this, ['_wf']);
        })
    }

    /**
     * To get the workflow attached to this project instance
     *
     * @return {Workflow}
     */
    getWorkflow():Workflow {
        if(this._wf==null){
            throw new Error(`Workflow does not exist in project ${this.getUID()}`);
        }

        return this._wf;
    }

    getKeyPointManager():KeyPointManager{
        return this.kpmgr;
    }


    /**
     * To attach an inspector to project instance
     * @param pInspector
     */
    async attachInspector(pInspector:Inspector):Promise<void> {
        try{
            await pInspector.injectContext(this);
            await pInspector.save();
            this.inspectors[pInspector.getUID()] = pInspector;
            //this.bus.register(pInspector);
        }catch(err){
            Logger.error(`[PROJECT] Inspector cannot be attached to the project due to an error : ${err.message}`);
            Logger.error(err.stack);
            console.log(`[PROJECT] Inspector cannot be attached to the project due to an error : ${err.message}`);
        }

    }

    /**
     * To check if an inspector with the specified UID is already attached
     *
     * @param {string} pInspectorUID
     * @returns {boolean} TRUE if attached, else FALSE
     * @method
     */
    isInspectorAttached(pInspectorUID:string):boolean {
        return (this.inspectors[pInspectorUID]!=null);
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
        let i = 0;

        while( DexcaliburProject.exists(pUID+"_"+i) ) i++;

        return pUID+"_"+i;
    }

    /**
     * To detect if there is a project with the specified UID
     *
     * @param {String} pUID Project UID
     * @returns {Boolean} TRUE if a project exists, else FALSE
     * @method
     */
    static exists( pUID:DexcaliburProjectUUID):boolean{
        const proj = DexcaliburWorkspace.getInstance().listProjects();
        let status = false;

        proj.map((vProject)=>{
            if(vProject === pUID)
                status = true;
        });

        return status;
    }

    /**
     *
     */
    getProjectDB():ProjectDatabase {
        if(this.pdb==null){
            throw DexcaliburProjectException.PROJECT_DB_NOT_READY(this.getUID());
        }
        return this.pdb;
    }

    /*
    getDB():IDatabase {
        return this.db;
    }*/


    getDB():ProjectDatabase {
        return this.pdb;
    }


    getTypeManager():TypeManager {
        return this.typeManager;
    }

    /**
     * To get the tag manager of the project
     *
     * @return {TagManager} The tag manager of the project
     * @method
     * @since 1.0.0
     */
    getTagManager():TagManager {
        return this.tagManager;
    }

    createBus():void{
        Logger.debug("[PROJECT] [BUS] Creating ...");
        this.bus = new Bus(this);
    }
    /**
     * Execute a single time per project, while creating project
     *
     * -----(1)----*
     *   create()
     *
     * @method
     */
    async create( pOptions:DexcaliburProjectOptions = {}):Promise<void> {
        this.meta.creationDate = (new Date()).getTime();
        // create main bus
        this.createBus();
        // init package analyzer config with options
        // this.analCfg.addPkgAnalyzerOptions(pOptions.pkgAnalyzer);
        // enable create mode (1st scan)
        this._createMode=true;
    }

    /**
     * To init the project, after initial load()
     *
     * It :
     * - Turn project in state `ProjectState.INIT_START`
     * - Start "open project" workflow
     * - Create `TagManager`
     * - Create `TypeManager`
     * - Open Project Workspace
     * - Restore Scan Scheduler
     *
     * @method
     */
    async init(pWorkflow:Nullable<Workflow> = null):Promise<Workflow>{
        const im:InspectorManager = InspectorManager.getInstance();


        Logger.debug("[PROJECT] Start initializing ... ");
        this.state = ProjectState.INIT_START;

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
        let wf:Workflow;

        if(pWorkflow!=null){
            wf = pWorkflow;
        }else{
            wf = this.engine.getWorkflow(this.uid);
        }

        if(wf==null){
            throw DexcaliburProjectException.CANNOT_INIT_NO_WF(this.getUID());
        }

        this.setWorkflow(wf);

        this.tagManager = new TagManager();
        this.typeManager = new TypeManager();

        this._initTypes();


        // init project workspace
        if(this.workspace === null){
            this.workspace = new ProjectWorkspace(
                _path_.join( this.engine.workspace.getLocation(), this.uid ),
                this
            );

            await this.workspace.init();

            this._scanScheduler.restore();
        }

        // get existing DB of create it
        this.pdb = await this.engine.getEngineDB().getProjectDB(this.getUID());
        this.pdb.setProject(this);
        // this.pdb.restore();

        // detect missing parts of workspace and restore (useful for Kubernetes)
        // and stateless pod
        this.workspace.restore();



        // once Project DB is ready, init tag manager and load presets
        await this.tagManager.init(this.pdb, this._createMode);

        // when tag mgr is loaded, init data format manager and update parsers context
        // important: DFM requires TagManager is ready
        this._dfm = new DataFormatManager(this);


        // init connector
        if(this.connector === null){
            this.connector = ConnectorFactory.getInstance().newConnector(wsSettings.getDefaultConnector() , this);
        }


        Logger.info("PROJECT > init > tagManager ready");

        // set the Search API which allow the user to perform search
        this.find = new SearchAPI();
        this.merlin = new MerlinSearchAPI();


        this.state = ProjectState.INIT_SAST;

        // init GUI cmp mgr
        this.guiTypeManager = new GuiTypesManager(this);

        // set SC analyzer
        // Replace existing Analyzer by multiplatform analyzer
        this.analyze = new Analyzer(wsSettings.getDefaultEncoding() as BufferEncoding, this);
        this.analyze.restoreState(await this.getProjectDB().getAnalyzerState('xast'))
        this.analyze.setWorkflow(wf)

        // setup syscall list from device kernel version
        if(this.device!=null){
            this.updateSyscalls();
        }

        this.find.setDatabase(this.analyze.getData());
        this.merlin.setDatabase(this.analyze.getData());


        // todo : move to context free
        this.dexHelper = new DexHelper(this);

        this.state = ProjectState.INIT_FILE_ANALYZER;

        // file analyzer 
        this.dataAnalyzer = new DataAnalyzer(this);
        await this.dataAnalyzer.init();

        this.dataAnalyzer.setWorkflow(wf)
        this.dataAnalyzer.restoreState(await this.getProjectDB().getAnalyzerState('data'));
        this.find.addAnalyzerUnit( 'data', this.dataAnalyzer);


        let state:any;


        this.state = ProjectState.INIT_APP_ANALYZER;

        // init comp dependent of target platform
        await this.initPlatformDependentComp();

        // update global file index with files indexed by dtaa analyzer
        this.bus.subscribe( "data.file.index", BusSubscriber.from( (pEvent:BusEvent<any>)=>{

            Logger.info("[DXC-PROJECT] [SUBSCRIBER] <data.file.index> Indexing file : "+pEvent.getData().path);
            this.analyze.insertIn( "files", [pEvent.getData()]);
        }));

        this.initAuthorizations();


        Logger.debug("[PROJECT] Initializing done ");

        return wf;
    }

    getPackageAnalyzer():IPackageAnalyzer {
        return this.packageAnalyzer;
    }

    /**
     * Init components dependent of the target platform, including
     *
     * - Key Point manager
     * - App analyzer
     * - Package analyzer
     * - Hook Manager
     * - Script Manager
     *
     *
     */
    async initPlatformDependentComp():Promise<void> {

        const im:InspectorManager = InspectorManager.getInstance();

        if(this.platform != null){

            Logger.info("[PROJECT] [INIT] PLATFORM RETRIEVED");
            this.kpmgr = await this.platform.newKeyPointManager(this);
            this.packageAnalyzer = await this.platform.newPackageAnalyzer(this);
            this.appAnalyzer = await this.platform.newAppAnalyzer(this);

            /*

            else if(this.platform.isIOS()){
                this.kpmgr = KeyPointManager.newForIOS(this);
                this.appAnalyzer = new IosAppAnalyzer(this);


                state = this.getAnalyzerState('ios-app');
                if(state == null){
                    state = new AnalyzerState({ _uid:'ios-app',  state:{}, modified: -1});
                }
                this.appAnalyzer.restoreState(state);
            }*/
            /*else if(this.platform.isELF())
                this.appAnalyzer = new BinaryAppAnalyzer(this);
            else
                this.appAnalyzer = new OtherAppAnalyzer(this);*/


        }else {
            Logger.info("[PROJECT] [INIT] PLATFORM IS UNKNOWN. IT CREATES ANDROID ENV");
            // default analyzer is Android analyzer
            this.kpmgr = await KeyPointManager.newForAndroid(this);

            this.packageAnalyzer = new AndroidPackageAnalyzer({ ssa_auto:false, msa_auto:false });
            this.packageAnalyzer.setProject(this);

            this.appAnalyzer = new AndroidAppAnalyzer(this);
            this.appAnalyzer.restoreState(await this.getProjectDB().getAnalyzerState('android-app'));
        }

        this.state = ProjectState.INIT_HOOK_MANAGER;

        // create hooks manager & co
        this.hook = new HookManager(this, this.nofrida);
        await  this.hook.initBuiltInHookSets();
        // move HookManager loading to "after app analysis

        // load hook DB
        this.scriptManager = new ScriptManager(this);

        this.rtmgr = new RuntimeManager(this);
        this.fzmgr = new FuzzManager(this);
        this.fzmgr.registerListener();

        // plugins
        // before this step this.inspectors should be empty
        if(this.isDirty()){
            // restore previously deployed inspector, upgrade inspectors with new version and deploy new inspectors
            // finally, remove "dirty" flag
            await im.restoreInspectorsFor(this);
            // deploy new inspectors
            // await im.upgradeInspectorsFor(this);
        }else{
            // fresh project are not dirty
            await im.createInspectorsFor(this);
            // immeditaly trigger BOOT inspectors
            await  im.deployInspectors(this, INSPECTOR_TYPE.BOOT);
        }

        //this.inspectors = im.getInspectorsOf(this);



        this.graph = new GraphMaker(this);

        // init listeners
        // ----------------------------
        // listen for new ModelFile created when binary is loaded dynamically from extra file
        this.bus.subscribe("file.new.DYN_BYTECODE", BusSubscriber.from( (pEvent:BusEvent<any>) => {
            const d = pEvent.getData();
            Logger.info("[DXC-PROJECT] [SUBSCRIBER] <file.new.DYN_BYTECODE> scanning file : "+d.file.path);
            Logger.info(JSON.stringify(pEvent));


            const dastTag = this.tagManager.getTag("discover.dynamic");

            // update data analyzer with new file
            if(d.file.hasScope(this.dataAnalyzer.scopes.DYN_BYTECODE))
            {

                this.analyze.path(
                    d.file.path,
                    CodeLocation.DYN,
                    this.dataAnalyzer.scopes.DYN_BYTECODE,
                    [dastTag],
                    {
                        createMode: this._createMode,
                        openOpts: this._getOpenOptions()
                    }
                ).then((vRes)=>{

                    },(err)=>{
                        Logger.error(err);
                    });

            }

        }));

    }



    /**
     * To init project authorizations / ACLs
     *
     * TODO : add owners, ...
     *
     * @method
     */
    initAuthorizations():void {
        // TODO : nothing to see here
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
    async deployInspectors(pStep):Promise<boolean>{

        let insp = "";

        Logger.info("[PROJECT] ["+this.getUID()+"], Step["+pStep+"] Starting to deploy inspectors.");

        const projInsps = this.getInspectors();

        for(let i in this.inspectors){
            if(this.inspectors[i].isStartAt(pStep)){
                await this.inspectors[i].deploy();
                insp += i+' ';
            }
        }

        Logger.info("[PROJECT] ["+this.getUID()+"], Step["+pStep+"] deploying inspectors : "+(insp.length==0? '<none>':insp));

        return true;
    }



    /**
     * To get the project UID
     *
     * @returns {String} ProjectUID
     * @method
     */
    getUID():DexcaliburProjectUUID{
        return this.uid;
    }

    /**
     * To get the inspector with specified name
     *
     * @param {string} pName Inspector name
     * @returns {Inspector} Inspector instance
     * @method
     */
    getInspector( pName:string):Nullable<Inspector>{

        if(this.inspectors[pName]==null){
            throw DexcaliburProjectException.INSPECTOR_NOT_FOUND(this.getUID(), pName);
        }
        return this.inspectors[pName];
    }


    /**
     * To get all inspectors for this project
     *
     * @returns {Inspector[]} List of Inspector instances for the project
     * @method
     */
    getInspectors():InspectorMap{
        return this.inspectors;
    }

    /**
     * To set default device
     * @method
     */
    setDevice( pDevice:Device){
        this.device = pDevice;
        this.updateTargetInfo(this.device);
    }

    /**
     * To update target device
     *
     * Add a check : target device MUST be compatible with current project (sane SYSTEM API version, same ARCH, same ABI, same OS)
     *
     * @param pDevice
     */
    updateTargetInfo(pDevice:Device):void {
        if(pDevice!=null){
            const ssp = pDevice.getProfile().getSystemProfile();
            this.archs = [ssp.getArchitecture()];

            // here OS depends first of platform type android or linux
            if(pDevice.isAndroid()){
                this.os = OperatingSystem.ANDROID;
            }else{
                this.os = ssp.getOperatingSystem();
            }

            if(this.platform == null){
                this.platform = pDevice.getPlatform();
            }

            this.updateSyscalls()
        }
    }

    /**
     * To check if the project has target ISA
     *
     * @return {boolean} TRUE if there is one or several ISA
     * @method
     * @since 1.1.0
     */
    hasArchitectureOS():boolean {
        return (this.archs.length>0 && this.os!=null);
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
     * To set the APK for the project
     *
     * @param {string} pPath APK file path
     * @async
     * @deprecated
     * @method
     */
    async useAPK( pPath:string):Promise<ApkPackage>{

        let apkFile:ApkPackage = null;

        // copy the APK into project workspace
        this.workspace.changeMainAPK(pPath);

        // load it : decompress file, disass dex files
        this.getWorkflow().pushStatus(new StatusMessage(2, "Start APK extracting"));
        const success = await ApkHelper.extract(
            this.workspace.getApkPath(),
            this.workspace.getApkDir(),
            {
                extractOpts: {
                    force: true,
                    match: true
                },
                javaOpts: {}
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
     * To add an input to the project
     *
     * @param {ProjectInput} pInput
     * @method
     * @async
     */
    async attachInput(pInput:ProjectInput):Promise<void> {

        if(this.packageAnalyzer == null){
            this.packageAnalyzer = new GenericPackageAnalyzer({ });
            this.packageAnalyzer.setProject(this);
        }

        if (pInput.isFile()) {
            const copy = new ProjectInput(pInput);
            copy.location = ProjectInputLocation.DB_PRJ;

            // if the input is still in global upload bucket,
            // move it as local file in project workspace FS
            if (pInput.location == ProjectInputLocation.DB_UPL || pInput.location == ProjectInputLocation.DEVICE) {

                // if the project input is stored into DB as uploaded fil in 'dxcserver" schema, out of project workspace,
                // it must be downloaded first into project workspace
                let inputPath = this.getWorkspace().getValidInputPath(pInput);
                if (pInput.location == ProjectInputLocation.DB_UPL) {

                    // save upload UID
                    copy.setUploadUID(pInput.getPath());
                    pInput.setUploadUID(pInput.getPath());

                    await this.getContext()
                        .getEngineDB()
                        .getFileManager()
                        .readFileTo('uploads', copy.getUploadUID() /*pInput.getPath()*/, inputPath);

                } else if (pInput.location == ProjectInputLocation.DEVICE) {
                    let inputPredecessor = new ProjectInput(pInput);
                    inputPredecessor.location = ProjectInputLocation.DEVICE;
                    copy.setPredecessor(inputPredecessor);
                    pInput.setPredecessor(inputPredecessor);
                    const tmpFilePath = await this.getPackageAnalyzer().pullInput(pInput);
                    // copy it to the local workspace input directory
                    _fs_.copyFileSync(tmpFilePath, inputPath);
                }

                // update and save project input
                pInput.setPath(inputPath);
                //pInput.setWsPath(inputPath);
                pInput.location = ProjectInputLocation.LOCAL;
            }

            copy.setPath(_path_.join(_path_.sep+ProjectWorkspace.BASE_PATH.IN, _path_.basename(pInput.getPath())));

            let wsPath = _path_.join(_path_.sep+ProjectWorkspace.BASE_PATH.IN, _path_.basename(pInput.getPath()));

            if (pInput.location == ProjectInputLocation.LOCAL) {

                // import file into project DB
                await this.pdb.getFileManager().writeFile('ws', pInput.getPath(), copy.getPath(), {
                    input: copy.getPath(),
                    upload: copy.getUploadUID(),
                    type: ProjectWorkspace.BASE_PATH.IN,
                    // filename:
                });

                if (this.inputs.filter(x => x.getPath()===copy.getPath()).length == 0) {
                    // save imported input
                    this.inputs.push(copy);
                }
            }

            // download input into FS workspace if missing

            // if the project input is stored into temporary, out of project workspace,
            // it must be copied first into project workspace

            const inputDir = this.getWorkspace().getPath();
            let candidate = _path_.join(inputDir, copy.getPath());
            if (!_fs_.existsSync(candidate)) {
                // Input file is not located into project workspace
                const inputPath = this.getWorkspace().getValidInputPath(pInput);

                this.getProjectDB().getFileManager()
                    .readFileTo('ws', copy.getUploadUID(), inputPath);

                //_fs_.copyFileSync(pInput.data, inputPath);
                // update and save project input
                //pInput.setPath(inputPath);
                //this.inputs.push(pInput);
            }
        } else if (pInput.isFolder()) {
            await this.attachInputDeviceDirectory(pInput);
            return;
        } else {
            this.inputs.push(pInput);
        }

        await this.packageAnalyzer.attachInput(pInput);

        // save changes
        await this.getContext().getEngineDB().saveProject(this, ['inputs']);
    }

    /**
     * To add recursively all the files in a directory to the project
     *
     * @param {ProjectInput} pInput
     * @method
     * @async
     */
    async attachInputDeviceDirectory(pInput:ProjectInput):Promise<void> {
        if (pInput.isFolder() && pInput.location == ProjectInputLocation.DEVICE) {
            const files = await this.device.getDefaultBridge().listFiles(pInput.getPath());
            let splittedRes: ProjectInput;
            for (let deviceFile of files) {
                try {
                    splittedRes = ProjectInput.from({
                        data: deviceFile.p,
                        location: ProjectInputLocation.DEVICE,
                        purpose: ProjectInputPurpose.EXTRA,
                        type: deviceFile._t === 'd' ? ProjectInputType.FOLDER : ProjectInputType.REGULAR_FILE,
                        extractOpts: {type: 'bin'},
                        originalName: deviceFile.n
                    });
                    // Check if deviceFile is a symbolic link to a directory
                    if (deviceFile._t === "l" && _fs_.lstatSync(deviceFile.p).isDirectory()) {
                        //TODO: potentially infinite recursive loop, limit the exploration depth of symbolic directories
                        splittedRes.type = ProjectInputType.FOLDER;
                    }
                    await this.attachInput(splittedRes);
                } catch (err) {
                    Logger.error(err.message);
                }
            }
        }
    }

    /**
     * To reattach inputs from project to project workspace and local context
     *
     * @param {ProjectInput} pInput
     * @method
     * @async
     */
    async reattachInput(pInput:ProjectInput):Promise<boolean> {

        if(this.packageAnalyzer == null){
            this.packageAnalyzer = new GenericPackageAnalyzer({ });
            this.packageAnalyzer.setProject(this);
        }

        let freshData = false;
        const inputDir = this.getWorkspace().getPath();
        if(pInput.location===ProjectInputLocation.DB_PRJ){

            if(!_fs_.existsSync( _path_.join(inputDir,pInput.getPath()))){

                // download file to workspace
                await this.pdb.getFileManager()
                    .readFileTo(
                        'ws',
                        pInput.getPath(),
                        _path_.join(inputDir,pInput.getPath())
                    );

                freshData = true;
            }

            // check
            if(!_fs_.existsSync( _path_.join(inputDir,pInput.getPath()))){
                throw DexcaliburProjectException.CANNOT_REATTACH_INPUT(this.getUID(),pInput.getPath())
            }else if(freshData){
                this.packageAnalyzer.attachInput(pInput);
            }
        }

        //await this.packageAnalyzer.attachInput(pInput);


        return freshData;
    }

    /**
     * To set the app for the project (one time per project)
     *
     *
     * @param {ProjectInput[]} pInputs Project inputs
     * @returns {Promise<TargetApp>} A TargetApp instance representing whole targeted app
     * @async
     * @method
     */
    async useApp( pInputs:ProjectInput[]):Promise<TargetApp>{


        // attach inputs
        for(let i=0; i<pInputs.length; i++){
            await this.attachInput(pInputs[i]);
        }

        // prepare whole app
        const targetApp =  await this.packageAnalyzer.prepareTargetPackage();

        await this.packageAnalyzer.free();

        return targetApp;
    }


    /**
     * @since 1.8.28
     */
    async reattachWorkspace():Promise<void> {


        Logger.info("[PROJECT] reattachWorkspace : scan for missing inputs in local workspace")
        let needUnpack = false;

        for (let i = 0; i < this.inputs.length; i++) {
            if (await this.reattachInput(this.inputs[i])) {
                needUnpack = true;
            }
        }


        if ((this.os==OperatingSystem.ANDROID && this.getWorkspace().isPkgFolderEmpty())
            || (this.os==OperatingSystem.IOS && this.getWorkspace().isAppFolderEmpty())
            || this.getWorkspace().isTargetAppMissing() || needUnpack) {

            Logger.info("[PROJECT] reattachWorkspace : prepare package again locally")
            await this.packageAnalyzer.prepareTargetPackage();
            this.packageAnalyzer.free();
        }

        return;
    }

    /**
     * To synchronize project platform used during analysis with device and APK.
     *
     * If platform changed, pkg & app analyzers must be recreated
     *
     * @param {*} pName 
     * @method
     * @async
     */
    async synchronizePlatform( pName:string):Promise<boolean>{
        const pm:PlatformManager = PlatformManager.getInstance();
        let newPlatform:Platform;
        let res = false;


        this.state = ProjectState.SYNC_PLATFORM;

        if(pm.isStub(pName)){
            newPlatform = pm.getStubPlatform(this.device, this.application, pName);
        }else{
            newPlatform = pm.getPlatform(pName);
        }

        // if a platform exists and differs, update analyzers
        if((this.platform!=null) && (newPlatform!=null) && (!this.platform.equal(newPlatform))){
            // TODO : use event stream instead ( onPlatformChange$:Subject<any> )
            this.kpmgr = await this.platform.newKeyPointManager(this);
            this.appAnalyzer = await this.platform.newAppAnalyzer(this);
            this.packageAnalyzer = await this.platform.newPackageAnalyzer(this);
        }

        this.platform = newPlatform;

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
    async open():Promise<DexcaliburProject>{

        Logger.success("[PROJECT] [OPEN] Opening ...");
        //throw new Error('[DEXCALIBUR PROJECT] open() : Not implemented');
        // re-scan
        this.meta.lastOpenDate = (new Date()).getTime();
        return this.fullscan();
    }

    /**
     * To get information about a specified project
     *
     * DEPRECATED : USE PROJECT MANAGER INSTEAD
     *
     * @param {DexcaliburEngine} pEngine
     * @param {string} pProjectUID
     * @return {any} Project data
     * @method
     * @static
     * @since 1.0.0
     * @deprecated
     */
    static async  getInformationOf(pEngine:DexcaliburEngine,
                                   pProjectUID:DexcaliburProjectUUID,
                                   pAccount:UserAccount = null,
                                   pZone:SecurityZone = SecurityZone.PUBLIC):Promise<any> {

        // create a minimalist instance of project to check if the user own or not this project
        if(pProjectUID=="-"){
            return null;
        }

        let project:DexcaliburProject;
        try{
            project = await pEngine.getEngineDB().getProject(pProjectUID,pAccount);
        }catch(err){
            if(err.code==EngineDatabaseException.CODE.UNKNOWN_PROJECT){

                const repairOpts = pEngine.getRepairOptions();
                if(repairOpts!=null && repairOpts.ws!=null){

                    try{
                        if(repairOpts.ws.backup != null){

                            if(!_fs_.existsSync(repairOpts.ws.backup)){
                                _fs_.mkdirSync(repairOpts.ws.backup, 0o666);
                            }

                            _fs_.cp(
                                _path_.join(pEngine.getWorkspace().path, pProjectUID),
                                _path_.join(repairOpts.ws.backup, pProjectUID),
                                {
                                    recursive:true,
                                    force:true
                                },
                                ()=>{}
                            );

                            Logger.success("[ENGINE] [REPAIR WS] Inconsistent project '"+pProjectUID+"' backed up.");

                        }

                        if(repairOpts.ws.rmMissingProjects){
                            _fs_.rm(
                                _path_.join(pEngine.getWorkspace().path, pProjectUID),
                                {
                                    recursive:true,
                                    force:true
                                },
                                ()=>{}
                            );
                            Logger.success("[ENGINE] [REPAIR WS] Inconsistent project '"+pProjectUID+"' deleted from workspace.");
                        }

                        return null;

                    }catch(err2){
                        Logger.error(err2.message, err2.stack);
                        throw err;
                    }

                }else{

                    throw err;
                }
            }
        }


        // remove sensitive data
        if(pZone==SecurityZone.PUBLIC){
            // ORM adapter data
            if(project !=null && project.connector!=null){
                delete project.connector;
            }
        }

        AccessControl.isAuthorized(
            AccessControl.access.PROJ_OPEN_OWN,
            pAccount,
            project,
            [
                ProjectAccessControl.attr.OWNER,
                ProjectAccessControl.attr.TESTER,
                OrganizationAccessControl.attr.APP_MEMBER,
                GlobalAccessControl.attr.ORG
            ]
        );

        if(project != null){
            return project.toJsonObject();
        }else{
            Logger.error("[PROJECT] Cannot retrieve information about project : ",pProjectUID);
            throw EngineDatabaseException.UNKNOWN_PROJECT(pProjectUID,"DexcaliburProject.getInformationOf");
        }
    }

    /**
     * To check if the project is compatible with the specified engine version
     * @param {DexcaliburEngine} pEngine The candidate engine
     * @method
     * @since 1.1.0
     */
    isCompatibleWithEngine( pEngine:DexcaliburEngine):boolean{
        let curr:any[] = this.engineVersion.split('.');
        let eng:any[] = pEngine.version.split('.');

        curr = curr.map( x => parseInt(x,10));
        eng = eng.map( x => parseInt(x,10));
        if((curr[0] < eng[0])||(curr[0]==eng[0] && curr[1] < eng[1])){
            throw DexcaliburProjectException.NEED_PROJECT_UPGRADE(this.engineVersion, pEngine.version);
        }else if(curr[0] > eng[0]){
            throw DexcaliburProjectException.NEED_ENGINE_UPGRADE(this.engineVersion, pEngine.version);
        }

        return true;
    }

    /**
     * To init target ISA
     *
     * @method
     * @since 1.1.0
     */
    updateSyscalls( pDevice:Device = null):void {
        // skip if analyzerDB is not ready (at startup)
        if(this.analyze!=null){
            return;
        }

        if(pDevice != null){
            const arch = pDevice.getProfile().getSystemProfile().getArchitecture();
            if(this._archReady.indexOf(arch)==-1){
                if(this.analyze!=null){
                    this.analyze.useSyscalls(pDevice.getSyscallList());
                }
                this._archReady.push(arch);
            }
        }

        this.archs.map( (vArch)=>{
            if(this._archReady.indexOf(vArch)==-1){

                if(this.analyze!=null){
                    this.analyze.useSyscalls(
                        ModelSyscallFactory.getSyscallListFrom(vArch, this.os)
                    );
                }
            }
        });


        this._emit( DexcaliburProject.EV_TYPE.ARCH_UPDATE);
    }

    /**
     * To load a project
     *
     * the user MUST be the owner
     *
     * @param {*} pContext 
     * @param {*} pProjectUID 
     * @param {*} pConfigPath 
     */
    static async load( pEngine:DexcaliburEngine, pProjectUID:DexcaliburProjectUUID, pAcc:UserAccount, pConfig:Nullable<any> = null, pWorkflow:Nullable<Workflow> = null):Promise<DexcaliburProject>{

        let project:Nullable<DexcaliburProject>;
        let data:any;

        Logger.debug("[PROJECT] Start loading : "+pProjectUID);

        try{
           project = await pEngine.getEngineDB().getProject(pProjectUID);

           project.setWorkflow(pWorkflow);

           project.dirty();
            Logger.debug("[PROJECT] [LOADING] Project read from DB : "+(project as any)._id);
        }catch (err){
            console.error(err);
            if(err.code==EngineDatabaseException.CODE.UNKNOWN_PROJECT){
                // project is missing inside DB
                project = new DexcaliburProject({
                    engine:pEngine,
                    uid:pProjectUID,
                    engineVersion: pEngine.version
                });

                Logger.debug("[PROJECT] [LOADING] Project not exists in DB. Creating a new instance.");
            }else{
                throw err;
            }
        }


        // create main event bus of this project
        project.createBus();

        // Load project from workspace
        //project.config = pEngine.getConfiguration();

        project.workspace = new ProjectWorkspace(
            _path_.join( pEngine.workspace.getLocation(), pProjectUID ),
            project
        );

        // check if workspace exists, else recreate it using DB
        project.workspace.init();



        if(pConfig!=null){
            data = pConfig;
        }else{
            data = project;
        }

        if(!project.engineVersion){
            if(data.engineVersion!=null){
                project.engineVersion = data.engineVersion;
            }else{
                data.engineVersion = project.engineVersion = DexcaliburEngine.VERSION_MIN;
            }

        }



        try{
            project.isCompatibleWithEngine(pEngine);
        }catch(err){
            switch (err.code){
                case DexcaliburProjectException.ALL.NEED_PROJECT_UPGRADE:
                    console.error("DexcaliburProjectException.ALL.NEED_PROJECT_UPGRADE");
                    // todo
                    break;
                case DexcaliburProjectException.ALL.NEED_ENGINE_UPGRADE:
                    console.error("DexcaliburProjectException.ALL.NEED_ENGINE_UPGRADE");
                    // todo
                    break;
                default:
                    throw err;
            }
        }

        if(data!=null && data._attr !=null){
            project.importAccessAttributes((data as any)._attr);
        }

        project.isAuthorizedToTest(pAcc);



        for(const i in data){
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
                case "apk":
                    project.workspace.setApk( APK.fromJsonObject(data.apk));
                    break;
                case "connector":
                    if(data.connector!=null && data.connector.hasOwnProperty('type')){
                        project.connector = ConnectorFactory.getInstance().newConnector(data[i].type, project, data[i]);
                    }else{
                        project.connector = ConnectorFactory.getInstance().newConnector('inmemory', project);
                    }
                    break;
                case "archs":
                    project.archs = data.archs;
                    break;
                case "os":
                    project.os = data.os;
                    break;
            }
        }

        Logger.debug("[PROJECT] [LOADING] Retrieving platform ...");

        if(project.getDevice()!=null){
            const ssp = project.getDevice().getProfile().getSystemProfile();
            if(data!=null && !data.hasOwnProperty('archs') ){
                project.archs = [ssp.getArchitecture(true)];
            }
            if(data!=null && !data.hasOwnProperty('os')){
                project.os = ssp.getOperatingSystem(true);
            }
        }


        if(data.platform != null){
            project.platform = new Platform(data.platform); // PlatformManager.getInstance().getPlatform(data.platform);
        }
        else if(project.device != null){
            project.platform = project.device.getPlatform();
        }

        Logger.info("[PROJECT] [LOADING] Platform retrieved : "+(project.platform!=null));

        // init other properties
        if(pWorkflow!=null)
            await project.init(pWorkflow);
        else
            await project.init();


        Logger.debug("[PROJECT] Project loaded : "+pProjectUID);

        return project;
    }

    /**
     * To save project metadata into 'project.json'
     *  
     * @param {*} pExportPath 
     */
    save():void{

        if(this.engineVersion==null){
            this.engineVersion = this.engine.version;
        }

        if(this.hook!=null){
            this.hook.saveAll();
        }


        this._emit(DexcaliburProject.EV_TYPE.SAVE);
    }

    toJsonObject(pOptions:any = {excludeNull:true}):any{
        const o:any = new Object();

        for(let i in this){
            switch (i){
                case "platform":
                case "analCfg":
                    if(this[i] !=null){
                        o[i] = (this[i] as any).getUID!=null?  (this[i] as any).getUID() : this[i];
                    }else{
                        o[i] = null;
                    }
                    break;
                case "_attr":
                    o._attr = {};
                    for(const n in (this as any)._attr){
                        if((this as any)._attr[n]!=null){
                            o._attr[n] = ((this as any)._attr[n].toJsonObject!=null)?(this as any)._attr[n].toJsonObject():(this as any)._attr[n];
                        }else{
                            o._attr[n] = null;
                        }
                    }
                    break;
                case "_scanScheduler":
                    o._scanScheduler = this._scanScheduler.toJsonObject();
                    break;
                case "engine":
                case "_analysis$":
                case "packageAnalyzer":
                case "_wf":
                case "webserver":
                case "find":
                case "merlin":
                case "analyze":
                case "dexHelper":
                case "hook":
                case "scriptManager":
                case "kpmgr":
                case "dataAnalyzer":
                case "bus":
                case "workspace":
                case "appAnalyzer":
                case "inspectors":
                case "fridaBuilder":
                case "graph":
                case "application":
                case "connector":
                case "device":
                case "db":
                case "pdb":
                case "simplifier":
                case "tagManager":
                case "typeManager":
                case "guiTypeManager":
                case "owner":
                case "tester":
                case "modelAPI":
                case "_dfm":
                case "LOG":
                case "validator":
                    break;
                default:
                    if(!pOptions.excludeNull || this[i]!=null){
                        o[i] = this[i];
                    }
                    break;
            }
        }

        CoreDebug.checkJsonSerialize(o, "DexcaliburProject");
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
     * To get the application analyzer
     * 
     * @returns {AndroidAppAnalyzer} The application analyzer
     * deprecated
     * @method
     */
    getAppAnalyzer():IAppAnalyzer{
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
     * @method
     */
    async usePlatform( pVersion:string){
        // old
        // this.config.platform_target = pVersion;
        const pm:PlatformManager = this.engine.getPlatformManager();
        let status = false, platform:Platform = null;

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
    }



    getPlatform():Platform {
        return this.platform;
    }

    /**
     * @deprecated
     */
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
    changeOwner( pNewOwner:UserAccount, pCurrentOwner:UserAccount):DexcaliburProject {

        const oldOwner = this.owner;

        if(this.getAccessAttribute(ProjectAccessControl.attr.OWNER)===null){
            this.setAccessAttribute(ProjectAccessControl.attr.OWNER);
            this.appendToAccessAttribute(ProjectAccessControl.attr.OWNER, pNewOwner.getUID());
            //this._attr.OWNER.value = pNewOwner.getUID();
        }else{
            try{
                // useless : replace to check the current owner and the new owner
                AccessControl.isAuthorizedByAttr(
                    ProjectAccessControl.attr.OWNER,
                    this,
                    pNewOwner
                );

                this.setAccessAttribute<UserAccountUUID>(ProjectAccessControl.attr.OWNER)
                this.appendToAccessAttribute<UserAccountUUID>(ProjectAccessControl.attr.OWNER, pNewOwner.getUID());

            }catch(errACL){
                if(errACL.hasOwnProperty('getCode') && ((errACL as AccessException).getCode() === AccesErrCode.VIOLATION)){

                    // check if the current user can change owner of a project
                    AccessControl.isAuthorized(
                        AccessControl.access.PROJ_CHOWN,
                        pNewOwner,
                        this
                    );

                    this.setAccessAttribute<UserAccountUUID>(ProjectAccessControl.attr.OWNER);
                    this.appendToAccessAttribute<UserAccountUUID>(ProjectAccessControl.attr.OWNER, pNewOwner.getUID());
                }else{
                    throw errACL;
                }
            }
        }


        this._emit(
            DexcaliburProject.EV_TYPE.OWNER_CHANGE,
            {
                oldValue: oldOwner,
                currentValue: pNewOwner
            }
        );


        return this;
    }


    private _getOpenOptions():any {
        switch (this.os){
            case OperatingSystem.ANDROID:
                if(this._createMode===true){
                    return  {}
                }else{
                    return  {
                        filterFmt: [".smali"]
                    }
                }
            default:
                return {};
        }
    }
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


        // Kubernetes : detect if files required exists in filesystem
        if(!this.appAnalyzer.isReady()){
            //this.useAPK()
        }

        // ensure "save operations" will be multi-threaded
        this.getProjectDB().initScheduler();


        this.state = ProjectState.FULLSCAN_START;

        const sastTag = this.tagManager.getTag("discover.static");
        const dastTag = this.tagManager.getTag("discover.dynamic");
        const mixedTag = this.tagManager.getTag("discover.mixed");
        const internTag = this.tagManager.getTag("discover.internal");
        const codeRtBuffTag = this.tagManager.getTag("code.location.runtime.buffer");
        const codeRtLiveTag = this.tagManager.getTag("code.location.runtime.file");


        // file analysis : icon detection, strings, etc ...
        const pkgScope:DataScope = this.dataAnalyzer.getScope('PKG');

        /*
         ====== [SCAN CODE OF TARGET PACKAGE] ======
         */

        // application topology analysis and ressources analysis
        let success = await this.appAnalyzer.prepareFullScan(this._createMode, pkgScope);

        /*
         ====== [SCAN CODE OF TARGET PLATFORM / USERLAND] ======
         */
        // scan OS/Platform
        Logger.info("Scanning platform "+this.platform.getUID());

        this.analyze.setWorkflow(this.getWorkflow());
        this.dataAnalyzer.setWorkflow(this.getWorkflow());

        this.getWorkflow().setStep('Platform analysis', 10);
        this.getWorkflow().pushStatus(new StatusMessage(5, "Analyzing bytecode of target platform"));

        // TODO : if dirty, restore data

        if(this.platform.getLocalPath()!=null){
            await this.analyze.path(this.platform.getLocalPath(), CodeLocation.PLATFORM, null, [internTag]);
            this.getWorkflow().pushStatus(new StatusMessage(11, "Analyzing byte arrays from target platform"))
            this.analyze.updateDataBlock();
            this.getWorkflow().pushStatus(new StatusMessage(12, "Tagging discovered elements"));
            //this.analyze.tagAllIf((k,x) => {  return true; }, [internTag]);
        }else{
            Logger.info(`[PROJECT] Cannot retrieve platform binary code for ${this.platform.getUID()}, image is empty = ${this.platform.getLocalPath()}`);
        }


        // save model
        //await this.pdb.saveAnalyzerDB(this.analyze.getData());
        if(this._createMode){
            await this.pdb.savePartialAnalyzerDB(this.analyze.getData(), internTag);
        }

        this.getWorkflow().pushStatus(new StatusMessage(14, "Deploying inspectors for [POST_PLATFORM_SCAN]"));

        await this.deployInspectors(INSPECTOR_TYPE.POST_PLATFORM_SCAN);


        // init delayed tagging for app class injected into 'android' classes/packages
        this.analyze.flushDelayedTagging();
        this.analyze.initDelayedTagging(sastTag, true);


        /*
         ====== [SCAN CODE OF TARGET APP] ======
         */

        this.getWorkflow().setStep('Application code', 40);
        this.getWorkflow().pushStatus(new StatusMessage(15, "Start analysis of application byte code"));

        // extract pk version, app label, app main class, target SDK version, min SDK version and more
        if(this.appAnalyzer.hasMissingMeta()){
            await this.appAnalyzer.importMeta();
        }

        const targetPath:string = await this.appAnalyzer.getDefaultTargetPath();

        // prepare, configure and restore state of the native analyzer
        this._prepareNativeAnalyzer();

        Logger.info("Scanning default path : "+targetPath);


        this._analysis$.subscribe(async (vProjEvt)=>{
            if([ProjectEventType.DATA_ANALYSIS_DONE,
                ProjectEventType.DATA_ANALYZER_LOADED].indexOf(vProjEvt.type)>-1){

                // update progression
                this.getWorkflow().setStep('Runtime data', 80);
                this.getWorkflow().pushStatus(new StatusMessage(60, "Updating analyzer DB with discovered files"));

                // update internal DB with file from package only (at this step)
                this.analyze.updateFileIndex(
                    await this.dataAnalyzer.getIndex('PKG'), true
                );

                // when data analyzer DB is ready, start native analysis
                this.getWorkflow().setStep('App native libraries', 85);
                this.getWorkflow().pushStatus(new StatusMessage(80, "Analysis of native libraries"));

                // detect and scan libs
                // this.performNativeAnalysis(pkgScope);
                //const execFiles = await this.getDB().getFileDB().searchExecutables(pkgScope);

                const execFiles:ModelFile[] = (await this.getProjectDB().merlinSearch(
                    MerlinSearchRequest
                        .fromCondition(
                            this.merlin,
                            ModelFile.TYPE,
                            "@data.type.executable", { not:false })
                )).getAsList();

                let kp:KeyPoint;
                for(let i=0; i<execFiles.length; i++){
                    if(this.analyze.hasBeenAnalyzed(execFiles[i])){
                        // skip it or load in memory somethings
                    }else if(this.analyze.isEligibleTo(pkgScope, execFiles[i],'native:discovery')){
                        try{
                            // discover
                            await this.discoverExecutableFile(execFiles[i], true);

                            let kpid:string, dup = 0;
                            do{
                                kpid = `lib.loading.${KeyPoint.sanitizeName(execFiles[i].getName(), dup)}`;
                            }while((await this.getKeyPointManager().getKeyPoint(kpid))!=null);

                            // create empty key point
                            kp = await this.getKeyPointManager().createKeyPoint(
                                execFiles[i],
                                {
                                    name: kpid,
                                    label: `Loading of "${execFiles[i].getName()}"`,
                                    condition: KeyPointCondition.DLOPEN
                                }
                            );
                        }catch (e){
                            console.error("Cannot analyze binary file : ",execFiles[i].getUID());
                        }

                    }
                }
            }
            else if(ProjectEventType.NATIVE_ANALYSIS_DONE === vProjEvt.type){
                // start whole app analysis

                // xref analysis :
                // - indexes strings in resource files
                // - extract app icon
                // - solves reference between Resource and resource UID
                // - finds implementation of component
                // - ...
                await this.getAppAnalyzer().performXrefAnalysis();

                await this.hook.loadNativeHook();
            }
        })


        // If android or iOS bytecode code analysis
        // OS-Agnostic parsing of files contained in inputs files and archive
        // TODO : multi threading
        await this.analyze.path(
            targetPath,
            CodeLocation.APP,
            pkgScope,
            [sastTag],
            {
                createMode: this._createMode,
                openOpts: this._getOpenOptions()
            }
        );

        // trigger next steps, on data have been parsed
        this._analysis$.next({
            type: ProjectEventType.DATA_ANALYSIS_DONE,
            data: null
        })

        this.analyze.tagAllIf(
            (k,x) => {  return !internTag.match(x); },
            [sastTag]);

        this.analyze.tagIf<ModelStringValue>(
            (k,x) => {
                let e = x.src.find( s => internTag.match(s));
                return (e!=null);
            },
            "strings",
            [sastTag]);

        // save model
        //await this.pdb.saveAnalyzerDB(this.analyze.getData());
        // update DB only on first open
        if(this._createMode){
           await this.pdb.savePartialAnalyzerDB(this.analyze.getData(), sastTag); //this.tagManager.getTag("discover.internal"));
        }

        // load hooks
        await this.hook.load();

        this.getWorkflow().setStep('App resources', 60);
        this.getWorkflow().pushStatus(new StatusMessage(41, "Indexing and analysis of flat files from package"));



        // perform data analaysis or load results

        // load files from project DB
        await this.dataAnalyzer.loadIndex(pkgScope );
        // update internal DB with file from package only (at this step)
        this.analyze.updateFileIndex(
            await this.dataAnalyzer.getIndex('PKG'), true
        );

        // trigger next steps
        this._analysis$.next({
            type: ProjectEventType.DATA_ANALYZER_LOADED,
            data: null
        })


        // loadSyscall / Instr hook

        this.getWorkflow().setStep('Application topology analysis', 91);
        this.getWorkflow().pushStatus(new StatusMessage(86, "Manifest analysis"));


        if(success){
            this.setPackageName( this.appAnalyzer.getAppUid());
        }


        this.getWorkflow().pushStatus(new StatusMessage(95, "Analyzing byte arrays from target platform"));
        // index static array 
        this.analyze.updateDataBlock();


        this.getWorkflow().pushStatus(new StatusMessage(96, "Tagging fresh data and elements"));
        this.analyze.tagAllIf(
            (k,x) => {  return !internTag.match(x) && !sastTag.match(x); },
            [mixedTag,sastTag]);


        // save nodes (code only) created by static analysis
        if(this._createMode){
            await this.pdb.savePartialAnalyzerDB(this.analyze.getData(), mixedTag);
            // save strings
            //await this.pdb.updateStringValue(this.);
        }

        // scan bytecode gathered during previous instrumentation session
        // if there is not path specified
        this.getWorkflow().pushStatus(new StatusMessage(97, "Scanning data previously extracted by hooking"));

        (await this.dataAnalyzer.scan(
            this.workspace.getRuntimeFilesDir(),
            this.dataAnalyzer.getScope('DYN_BUFFER')
        )).subscribe(async (vFiles:ModelFile[])=>{
            this.analyze.updateFileIndex(
                await this.dataAnalyzer.getIndex('DYN_BUFFER'), true
            );

            this.analyze.tagAllIf(
                (k,x)=>{
                    return (!internTag.match(x)) && (!sastTag.match(x));
                },
                [dastTag,codeRtBuffTag]);
        });

        const dynBcScope = this.dataAnalyzer.getScope('DYN_BYTECODE');
        console.log("DYN_BYTECODE> ", dynBcScope);

        // TODO : rewrite or remove

        (await this.dataAnalyzer.scan(
            this.workspace.getRuntimeBcDir(),
            dynBcScope
        )).subscribe(async (vFiles:ModelFile[])=>{

            this.analyze.updateFileIndex(
                await this.dataAnalyzer.getIndex('DYN_BYTECODE'), true
            );


            const bytecodes = (await this.dataAnalyzer.getIndex('DYN_BYTECODE')).getAsList();
            let vFile:any;
            for(let vOffset=0; vOffset<bytecodes.length; vOffset++){

                vFile = bytecodes[vOffset]

                const bc = _path_.join( _path_.dirname(vFile.getPath()),"smali");
                const loc = ModelLocation.fromFile(vFile);

                Logger.info('Scanning dir : ', bc);
                if(_fs_.existsSync(bc)){

                    if( _fs_.lstatSync(bc).isDirectory()) {
                        Logger.info("Scanning previously discovered dex chunk : " + bc);
                        await this.analyze.path(bc, loc, dynBcScope);
                    }
                }

                this.analyze.tagAllIf(
                    (k,x)=>{
                        return (!internTag.match(x)) && (!sastTag.match(x));
                    },
                    [dastTag, codeRtLiveTag]);
            }
        });

        this.getWorkflow().pushStatus(new StatusMessage(23, "Tagging data previously extracted by hooking"));
        this.analyze.tagAllIf(
            (k,x)=>{
                return (!internTag.match(x)) && (!sastTag.match(x));
            },
            [dastTag]);


        if(this._createMode){
            await this.pdb.savePartialAnalyzerDB(this.analyze.getData(), dastTag);
            await this.pdb.saveStrings();
        }


        //}
        this._emit("dxc.fullscan.post_dast_tag");

        //this._emit("dxc.fullscan.post" );

        this.getWorkflow().pushStatus(new StatusMessage(24, "Deploying inspectors [POST_APP_SCAN]"));

        // deploy inspector's hooksets
        await this.deployInspectors(INSPECTOR_TYPE.POST_APP_SCAN);


        this._emit("dxc.fullscan.post" );

        this.state = ProjectState.FULLSCAN_END;

        this._emit("dxc.fullscan.post_deploy" );

        if(this._createMode){
            this._emit("dxc.fullscan.post.once" );
        }

        this.ready = true;

        this.state = ProjectState.READY;
        this.getWorkflow().pushStatus(new StatusMessage(25, "Saving project ..."));


        this._emit("dxc.fullscan.finalize");

        // update project config (icon, checksum, cert, ...)
        this.save();

        return this;
    }

    /**
     * To init and restore the Native file analyzer
     *
     * If a device is already attached to the project, the device profile is used to choose
     * relevant files
     *
     * @method
     */
    private _prepareNativeAnalyzer(){

        this.analyze.initNativeAnalyzer(); //this.dataAnalyzer.getDB()

        // restore saved state
        this.analyze.restoreNativeAnalyzer();

        if(this.device!=null){

            this.analyze.getNativeAnalyzer().configure(
                this.platform,
                this.device.getProfile().getSystemProfile().getArchitecture(),
                (this.analCfg.useDeviceABI()?
                    this.device.getProfile().getSystemProfile().getABIlist() :
                    AbiManager.from([AbiType.arm64_v8a])
                )
            );
        }else{

            // try to retrieve supported ABI from project settings
            //let devAbi = this.getAnalyzerConfiguration().getPkgAnalyzerConfig().abi;

            let devAbi = AbiManager.from([AbiType.arm64_v8a]);

            this.analyze.getNativeAnalyzer().configure(
                this.platform,
                this.engine.getSettings().getServerSettings().getDefaultArchitecture(),
                devAbi
            );
        }


    }

    /**
     * To perform primary native analysis of native executable file (shared object, dll, ELF, ...)
     *
     * @param pScope
     */
    async discoverExecutableFile(pFile:ModelFile, pSave:boolean):Promise<void>{

        Logger.info("[ANALYZER] Discover native library and executable contained into package. [[autoAnalysis="+this.analCfg.isAutoNativeAnalysis()+"]");
        //this.analyze.doNativeAnalysis(pkgScope, null, { skipAuto: this.analCfg.isAutoNativeAnalysis() });


        try{
            let o:any = {};
            if(this.os===OperatingSystem.ANDROID){
                o.jniScan = true;
            }
            const bin = await this.analyze.getNativeAnalyzer().discover(
                pFile, {
                    backend: NativeBackend.R2, // TODO :  pull from user preferences or project
                    extraOpts: o
                });

            // { skipAuto: this.analCfg.isAutoNativeAnalysis() }
            //Logger.info("[ANALYZER] Load native hook");
            //await this.hook.loadNativeHook();
        }catch(err){
            Logger.error("[ANALYZER] Analysis of native files failed : "+err.message);
            console.log(err.stack);
        }
    }

    /**
     * To perform native analysis of file contained into a specific scope
     * @param pScope
     */
    async performNativeAnalysis(pScope:DataScope):Promise<void>{

        Logger.info("[ANALYZER] Scan every native library and executable contained into package. [scope="+pScope.getInternalName()+"][autoAnalysis="+this.analCfg.isAutoNativeAnalysis()+"]");
        //this.analyze.doNativeAnalysis(pkgScope, null, { skipAuto: this.analCfg.isAutoNativeAnalysis() });

        try{
            // retrieve
            if(await this.analyze.doNativeAnalysisAsync(
                pScope,
                null,
                { skipAuto: this.analCfg.isAutoNativeAnalysis() })){


                Logger.info("[ANALYZER] Load native hook");
                // native hook are loaded only if depending files have been loaded
                await this.hook.loadNativeHook();
            }
        }catch(err){
            Logger.error("[ANALYZER] Analysis of native files failed : "+err.message);
            console.log(err.stack);
        }finally {
            this._analysis$.next({
                type: ProjectEventType.NATIVE_ANALYSIS_DONE,
                data: null
            })
        }
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
        this.inspectors = {};
        this.dataAnalyzer = null;
        this.appAnalyzer = null;
        this.application = null;
        this.device = null;


        this.state = ProjectState.CLOSED;

        return true;
    }


    /**
     * To create an event and push it to the queue.
     * The argument should be given by using the format expected by the Event constructor.
     * 
     * @param {Object} eventData The description of the event to use with the Event constructor.
     * @param {boolean} pSave to save the data
     * @function
     */
    trigger(pOptions:BusEventOptions<any>):void{
        if(this.bus!=null){
            if(this.bus.hasSubscriptionsTo(pOptions.type)){
                this.getBus().send(new BusEvent(pOptions));
            }
        }
    }

    /**
     * To get application package name
     * 
     * @returns {String} Applciation package name
     * @function
     */
    getPackageName():string{
        return this.pkg;
    }

    setPackageName( pPackageName:string):void{
        const oldValue = this.pkg;
        this.pkg = pPackageName;

        this._emit(
            DexcaliburProject.EV_TYPE.PKGNAME_CHANGE,
            {
                property: 'pkg',
                oldValue: oldValue,
                currentValue: pPackageName
            }
        );
    }


    /**
     * Retrieves the current project workspace. If the workspace does not exist, it initializes and returns a new workspace.
     *
     * @return {ProjectWorkspace} The project workspace instance.
     * @since 1.0.0
     */
    getWorkspace(): ProjectWorkspace {
        if(this.workspace!=null){
            return this.workspace;
        }

        this.workspace = new ProjectWorkspace(
            _path_.join( this.getContext().workspace.getLocation(), this.getUID() ),
            this
        );

        this.workspace.init();

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
    saveAnalyzerState(pState:AnalyzerState):any {
        const coll = this.db.getCollection(AnalyzerState.TYPE.getName(), AnalyzerState.TYPE);
        return coll.updateEntry(pState);
    }

    getProduct(pProductCode):Product {
        return LicenceManager.getProduct( this, pProductCode);
    }

    getLicenseNo():string {
        return "--";
    }

    getLicenseKey():string {
        return "--";
    }

    getStatistics():any {
        return {
            code: this.getAnalyzer().getStatistics(),
            package: null,
            app: this.application.getInfo()
        };
    }

    /**
     * To flag the project as Dirty
     * A dirty project cannot be explored nor executed
     *
     * @method
     */
    dirty(){
        this._dirty = true;
    }

    /**
     * To check if the project is drity
     * @method
     */
    isDirty():boolean {
        return this._dirty;
    }

    /**
     * Remove dirty bit
     * @method
     */
    restored(){
        this._dirty = false;
    }

    /**
     *
     * DexcaliburProjectUUID must be an UUID
     *
     * @deprecated
     * @param pUnsafe
     */
    static sanitizeUID(pUnsafe:string):string {
        return pUnsafe.replaceAll(".","_");
    }

    /**
     * TODO
     * To uninstall everything related to an inspector
     *
     * @param pInspectorFactory
     */
    async uninstallInspector(pInspectorFactory: InspectorFactory, pRemoveOptions:InspectorUninstallOptions):Promise<void> {

        // remove inspector hooks, hookset, fragment

        // r
        //this.getProjectDB().removeInspector(pInspectorFactory.getUID());
        //this.getProjectDB().removeInspectorPlugin(pInspectorFactory.getUID());
    }

    /**
     * To check if the project has multiple inputs
     *
     * @returns {boolean} TRUE if multiple, else FALSE
     * @method
     */
    hasMultipleInputs():boolean {
        return (this.inputs!=null && this.inputs.length>0);
    }

    /**
     * To get the utility class
     *
     * **This is a part of EventListenerAPI**
     *
     * @return {any} A reference to the Utils class
     * @method
     */
    getUtils():any {
        return Util;
    }

    /**
     * ============= TAG API ==================
     */

    /**
     * To add a tag to the project
     *
     * @param {Tag} vTag The tag to add
     * @method
     */
    addTag(vTag:Tag):void{
        const uuid = vTag.getUUID();
        if(this.tags.indexOf(uuid)==-1)
            this.tags.push(uuid);
    }

    /**
     * To check if the project has a specific tag
     *
     * @param {Tag} vTag Expected tag
     * @return {boolean} Returns TRUE if the tag is present else FALSE
     * @method
     */
    hasTag(vTag:Tag):boolean{
        const uuid = vTag.getUUID()
        for(let i=0; i<this.tags.length; i++){
            if(this.tags[i]===uuid){
                return true;
            }
        }
        return false;
    }

    /**
     * To get the list of tag UUID
     *
     * @return {number[]} The list of tags UUIDs
     * @method
     */
    getTags():number[]{
        return this.tags;
    }

    /**
     *
     */
    getAppUnit():Nullable<ApplicationUnitUUID> {
        return this.appUnit;
    }

    /**
     * To attach the current project to an application unit
     *
     * This operation modifies access control list and attributes of the project
     *
     * @param {ApplicationUnit} pAppUnit
     */
    attachToAppUnit(pAppUnit: ApplicationUnit):void {
        this.appUnit = pAppUnit.getUID();
        this.pkg = pAppUnit.packageID;

        if(this.getAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER)==null){
            this.setAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER);
        }

        if(this.getAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER_GRP)==null){
            this.setAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER_GRP);
        }

        if(this.getAccessAttribute(GlobalAccessControl.attr.ORG)==null){
            this.setAccessAttribute(GlobalAccessControl.attr.ORG);
        }

        // set or replace list of app_member in project
        let aam = pAppUnit.getAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER);
        if(aam!=null){
            this.setAccessAttribute(
                OrganizationAccessControl.attr.APP_MEMBER,
                aam.value
            );
        }


        aam = pAppUnit.getAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER_GRP);
        if(aam!=null){
            this.setAccessAttribute(
                OrganizationAccessControl.attr.APP_MEMBER_GRP,
                aam.value
            );
        }


        aam = pAppUnit.getAccessAttribute(GlobalAccessControl.attr.ORG);
        if(aam!=null){
            this.setAccessAttribute(
                GlobalAccessControl.attr.ORG,
                aam.value
            );
        }

    }

    /**
     * Get orgUID from owner attr
     */
    getOrgUID():Nullable<OrganizationUnitUUID> {
        try{
            let attr = this.getAccessAttribute(GlobalAccessControl.attr.ORG);
            if(attr.value.length==1){
                return attr.value[0];
            }
        }
        catch (e){
            console.log(e);
        }

        return null;
    }


    async getInputs():Promise<ProjectInput[]> {
        //return this.getContext().getProjectManager().getInputsOf()

        return [];
    }

    async resetIdleTime():Promise<void> {
        const node = await this.engine.getNodeManager().getSelfNode();
        if(node!=null){
            await node.resetIdleTime();
        }
    }

    /**
     * To get the taint analyzer initialized for this project.
     *
     *
     */
    getTaintAnalyzer():TaintAnalyzer {
        if(this.taintAnalyzer==null){
            this.taintAnalyzer = new TaintAnalyzer(this);
        }

        return this.taintAnalyzer;
    }

    getMerlinEngine():MerlinSearchAPI<any> {
        return this.merlin;
    }

    setIcon(pIcon: ApplicationIcon) {
        this.meta.icon = pIcon;
    }

    getIcon():Nullable<ApplicationIcon> {
        if(this.meta==null || this.meta.icon==null) return null;

        return this.meta.icon;
    }

    setAppPreview(pPrev:AppPreview):void {
        this.meta.appPreview = pPrev;
    }

    getDataFormatMgr():DataFormatManager {
        return this._dfm;
    }

    private _initTypes() {
        switch (this.os){
            case OperatingSystem.ANDROID:
                this.getTypeManager().initTypes(DATATYPE_CATEGORY.JAVA, Object.values(AndroidTypes));
                break;
        }
    }
    
    getInspectorEditor():InspectorEditor {
        if(this._iedit==null){
            this._iedit = new InspectorEditor(this);
        }
        return this._iedit;
    }

    async getNodeByRef(pRef:INodeRef):Promise<Nullable<INode>> {

        let node = this.getAnalyzer().searchNode(pRef.__, pRef._uid);
        if(node!=null) return node;

        console.log(`[SCANNER][MATCH NOT FOUND IN MEMORY. TRY MERLIN IN MEM] ${pRef.__} ${pRef._uid}`);
        let res:FinderResult = await (MerlinSearchRequest.getByRef(pRef,this.getMerlinEngine() )).execute(this, true);



        if(res.count()===0){
            console.log(`[SCANNER][MATCH NOT FOUND IN MEMORY. TRY MERLIN IN PDB] ${pRef.__} ${pRef._uid}`);
            res = await (MerlinSearchRequest.getByRef(pRef,this.getMerlinEngine() )).executePDB(this);
            if(res.count() === 0){
                console.log(`[SCANNER][MATCH NOT FOUND IN DB] ${pRef.__} ${pRef._uid}`);
                return null;
            }
        }


        return (res.count()>0 ? res.get(0) : null);
    }

}
DexcaliburProject.TYPE.builder(DexcaliburProject);

