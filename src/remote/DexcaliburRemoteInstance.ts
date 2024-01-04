import {IDexcaliburEngine, IDexcaliburProjectMap} from "../IDexcaliburEngine.js";
import Configuration from "../Configuration.js";
import DeviceManager from "../DeviceManager.js";
import InspectorManager from "../InspectorManager.js";
import PlatformManager from "../PlatformManager.js";
import DexcaliburProject from "../DexcaliburProject.js";
import DexcaliburRegistry from "../DexcaliburRegistry.js";
import {Settings} from "../Settings.js";
import {TerminalServer} from "../TerminalServer.js";
import {External} from "../external/External.js";
import {UserService} from "../user/UserService.js";
import WebServer from "../WebServer.js";
import {Workflow} from "../Workflow.js";
import DexcaliburWorkspace from "../DexcaliburWorkspace.js";
import {IpcMode} from "../DexcaliburServerChildProcess.js";
import {UserAccount} from "../user/UserAccount.js";
import {DexcaliburProjectMap} from "../DexcaliburEngine.js";
import {EngineDatabase} from "../database/EngineDatabase.js";

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

    getActiveProjects( pUserAccount:UserAccount): IDexcaliburProjectMap {
        return undefined;
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


    getWorkflow(pUID: string, pExternal: boolean): Workflow {
        return undefined;
    }

    getWorkspace(): DexcaliburWorkspace {
        return undefined;
    }

    newProject(pUID: string, pApkPath: string, pDevice: any): Promise<DexcaliburProject> {
        return Promise.resolve(undefined);
    }

    newWorkflow(pName: string): Workflow {
        return undefined;
    }

    onNewWorkflow(pUID: string, pCallback: any, pExternal: boolean): void {
    }

    openProject(pUserAccount:UserAccount, pUID: string): Promise<DexcaliburProject> {
        return Promise.resolve(undefined);
    }

    /**
     *
     * @param pUser
     */
    listProjectsOf( pUser:UserAccount):DexcaliburProjectMap {
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