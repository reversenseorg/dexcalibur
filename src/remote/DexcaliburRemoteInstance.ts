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

import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import Configuration from "../Configuration.js";
import DeviceManager from "../DeviceManager.js";
import InspectorManager from "../InspectorManager.js";
import PlatformManager from "../platform/PlatformManager.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import DexcaliburRegistry from "../DexcaliburRegistry.js";
import {Settings} from "../Settings.js";
import {TerminalServer} from "../TerminalServer.js";
import {External} from "../external/External.js";
import {UserService} from "../user/UserService.js";
import WebServer from "../WebServer.js";
import {Workflow, WorkflowUUID} from "../Workflow.js";
import DexcaliburWorkspace from "../DexcaliburWorkspace.js";
import {IpcMode} from "../DexcaliburServerChildProcess.js";
import {UserAccount} from "../user/UserAccount.js";
import {EngineDatabase} from "../database/EngineDatabase.js";
import {ProjectInput} from "../analyzer/ProjectInput.js";
import {Nullable} from "@reversense/dxc-core-api";
import {EngineNodeUUID} from "../core/EngineNode.js";

export class DexcaliburRemoteInstance implements IDexcaliburEngine {


    closeProject(pUser:UserAccount, pProject: DexcaliburProject): boolean {
        return false;
    }

    createWorkspace(pPath: string): void {
    }

    deleteProject(pUserAccount:UserAccount, pUID: string): Promise<boolean> {
        return Promise.resolve(false);

    }

    disableIPC(): void {
    }

    enableIPC(pMode: IpcMode): void {
    }

    getActiveProjects( pUserAccount:Nullable<UserAccount>): Record<DexcaliburProjectUUID, DexcaliburProject> {
        return {};
    }

    getConfiguration(): Configuration {
        return undefined;
    }

    getDeviceManager(): DeviceManager {
        return undefined;
    }

    getInspectorManager(): InspectorManager {
        return undefined;
    }

    getLocalFridaVersion(): string {
        return "";
    }

    getPlatformManager(): PlatformManager {
        return undefined;
    }

    getProject(pProjectUID: string): DexcaliburProject {
        return undefined;
    }

    getProjects(): string[] {
        return [];
    }

    getRegistry(): DexcaliburRegistry {
        return undefined;
    }

    getEngineDB(): EngineDatabase {
        return undefined;
    }

    getSettings(): Settings.GlobalSettings {
        return undefined;
    }

    getTerminalServer(): TerminalServer {
        return undefined;
    }

    getToolManager(): External.ToolManager {
        return undefined;
    }

    getUserService(): UserService {
        return undefined;
    }


    getWorkflow(pUID: string): Workflow {
        return undefined;
    }

    getWorkspace(): DexcaliburWorkspace {
        return undefined;
    }

    newProject(pUID: string, pInputs:ProjectInput[], pDevice: any): Promise<DexcaliburProject> {
        return Promise.resolve(undefined);
    }

    newWorkflow(pUser:UserAccount, pProjectUID:DexcaliburProjectUUID,
                pNode:Nullable<EngineNodeUUID> = null,
                pStart = false, pName:string = ''): Promise<Workflow> {
        return undefined;
    }

    onNewWorkflow(pUID: WorkflowUUID, pCallback: any): void {
    }

    openProject(pUserAccount:UserAccount, pUID: string): Promise<DexcaliburProject> {
        return Promise.resolve(undefined);
    }

    /**
     *
     * @param pUser
     */
    async listProjectsOf( pUser:UserAccount):Promise<Record<string,DexcaliburProject>> {
        /*const PUIDS = this.workspace.listProjects();
        let map:DexcaliburProjectMap = {};
        PUIDS.map( (vUID:string)=>{
            try{
                // only authorized user can read metadata
                map[vUID] = DexcaliburProject.getInformationOf( this, vUID, pUser);
            }catch(err){}
        });*/
        return null;
    }

}