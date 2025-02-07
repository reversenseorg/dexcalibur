import DexcaliburProject, {DexcaliburProjectUUID} from "./DexcaliburProject.js";
import {IpcMode} from "./DexcaliburServerChildProcess.js";
import Configuration from "./Configuration.js";
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import DeviceManager from "./DeviceManager.js";
import {Workflow} from "./Workflow.js";
import InspectorManager from "./InspectorManager.js";
import PlatformManager from "./platform/PlatformManager.js";
import WebServer from "./WebServer.js";
import {Settings} from "./Settings.js";
import {UserService} from "./user/UserService.js";
import {TerminalServer} from "./TerminalServer.js";
import DexcaliburRegistry from "./DexcaliburRegistry.js";
import {External} from "./external/External.js";
import {UserAccount} from "./user/UserAccount.js";
import {EngineDatabase} from "./database/EngineDatabase.js";
import {ProjectInput} from "./analyzer/ProjectInput.js";
import {Nullable} from "@dexcalibur/dxc-core-api";

export interface IDexcaliburEngine {
    closeProject( pUser:UserAccount, pProject:DexcaliburProject):boolean;
    deleteProject( pUser:UserAccount, pUID:string):Promise<boolean>;
    disableIPC():void;
    enableIPC(pMode:IpcMode):void;
    getActiveProjects(pUser:UserAccount):Record<DexcaliburProjectUUID, DexcaliburProject>;
    getConfiguration():Configuration;
    getSettings():Settings.GlobalSettings;
    getUserService(): UserService;
    getWorkspace():DexcaliburWorkspace;
    //getWebserver():WebServer;
    getDeviceManager():DeviceManager;
    getInspectorManager():InspectorManager;
    getPlatformManager():PlatformManager;
    getTerminalServer():TerminalServer;
    getToolManager():External.ToolManager;
    getEngineDB():EngineDatabase;
    getRegistry():DexcaliburRegistry;
    createWorkspace( pPath:string):void;
    getProjects():string[];
    getProject(pProjectUID:DexcaliburProjectUUID):Nullable<DexcaliburProject>;
    // ( pUser:UserAccount, pUID:string):Promise<DexcaliburProject>;
    newProject( pUID:DexcaliburProjectUUID, pInputs:ProjectInput[], pDevice:any):Promise<DexcaliburProject>;
    getLocalFridaVersion():string;
    newWorkflow(pName:string):Workflow;
    getWorkflow(pUID:string, pExternal:boolean):Workflow;
    onNewWorkflow( pUID:string, pCallback:any, pExternal:boolean):void;
    listProjectsOf( pUser:UserAccount):Promise<Record<string,DexcaliburProject>>;

}