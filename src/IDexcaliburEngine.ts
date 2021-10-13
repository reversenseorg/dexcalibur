import DexcaliburProject from "./DexcaliburProject";
import {IpcMode} from "./DexcaliburServerChildProcess";
import {DexcaliburProjectMap} from "./DexcaliburEngine";
import Configuration from "./Configuration";
import DexcaliburWorkspace from "./DexcaliburWorkspace";
import DeviceManager from "./DeviceManager";
import {Workflow} from "./Workflow";
import InspectorManager from "./InspectorManager";
import PlatformManager from "./PlatformManager";
import WebServer from "./WebServer";
import {Settings} from "./Settings";
import {UserService} from "./user/UserService";
import {TerminalServer} from "./TerminalServer";
import DexcaliburRegistry from "./DexcaliburRegistry";
import {External} from "./external/External";
import {UserAccount} from "./user/UserAccount";


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