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

import DexcaliburProject, {DexcaliburProjectUUID} from "./DexcaliburProject.js";
import {IpcMode} from "./DexcaliburServerChildProcess.js";
import Configuration from "./Configuration.js";
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import DeviceManager from "./DeviceManager.js";
import {Workflow, WorkflowUUID} from "./Workflow.js";
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
import {Nullable} from "@reversense/dxc-core-api";
import {EngineNodeUUID} from "./core/EngineNode.js";

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
    newWorkflow(pUser:UserAccount, pProjectUID:DexcaliburProjectUUID,
                pNode:Nullable<EngineNodeUUID>,
                pStart:boolean, pName:string):Promise<Workflow>;

    getWorkflow(pUID:WorkflowUUID):Workflow;
    onNewWorkflow( pUID:WorkflowUUID, pCallback:any):void;
    listProjectsOf( pUser:UserAccount):Promise<Record<string,DexcaliburProject>>;

}