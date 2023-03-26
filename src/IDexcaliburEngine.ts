import DexcaliburProject from "./DexcaliburProject.js";
import {IpcMode} from "./DexcaliburServerChildProcess.js";
import {DexcaliburProjectMap} from "./DexcaliburEngine.js";
import Configuration from "./Configuration.js";
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import DeviceManager from "./DeviceManager.js";
import {Workflow} from "./Workflow.js";
import InspectorManager from "./InspectorManager.js";
import PlatformManager from "./PlatformManager.js";
import WebServer from "./WebServer.js";
import {Settings} from "./Settings.js";
import {UserService} from "./user/UserService.js";
import {TerminalServer} from "./TerminalServer.js";
import DexcaliburRegistry from "./DexcaliburRegistry.js";
import {External} from "./external/External.js";
import {UserAccount} from "./user/UserAccount.js";


export interface IDexcaliburProjectMap {
    [uid:string] :DexcaliburProject
}

export interface IDexcaliburEngine {
    closeProject( pUser:UserAccount, pProject:DexcaliburProject):boolean;
    deleteProject( pUser:UserAccount, pUID:string):boolean;
    disableIPC():void;
    enableIPC(pMode:IpcMode):void;
    getActiveProjects(pUser:UserAccount):IDexcaliburProjectMap;
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
    getRegistry():DexcaliburRegistry;
    createWorkspace( pPath:string):void;
    getProjects():string[];
    getProject(pProjectUID:string):DexcaliburProject;
    openProject( pUser:UserAccount, pUID:string):Promise<DexcaliburProject>;
    newProject( pUID:string, pApkPath:string, pDevice:any):Promise<DexcaliburProject>;
    getLocalFridaVersion():string;
    newWorkflow(pName:string):Workflow;
    getWorkflow(pUID:string, pExternal:boolean):Workflow;
    onNewWorkflow( pUID:string, pCallback:any, pExternal:boolean):void;
    listProjectsOf( pUser:UserAccount):DexcaliburProjectMap;
}