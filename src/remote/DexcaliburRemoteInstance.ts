import {IDexcaliburEngine, IDexcaliburProjectMap} from "../IDexcaliburEngine";
import Configuration from "../Configuration";
import DeviceManager from "../DeviceManager";
import InspectorManager from "../InspectorManager";
import PlatformManager from "../PlatformManager";
import DexcaliburProject from "../DexcaliburProject";
import DexcaliburRegistry from "../DexcaliburRegistry";
import {Settings} from "../Settings";
import {TerminalServer} from "../TerminalServer";
import {External} from "../external/External";
import {UserService} from "../user/UserService";
import WebServer from "../WebServer";
import {Workflow} from "../Workflow";
import DexcaliburWorkspace from "../DexcaliburWorkspace";
import {IpcMode} from "../DexcaliburServerChildProcess";

export class DexcaliburRemoteInstance implements IDexcaliburEngine {


    closeProject(pProject: DexcaliburProject): boolean {
        return false;
    }

    createWorkspace(pPath: string): void {
    }

    deleteProject(pUID: string): boolean {
        return false;
    }

    disableIPC(): void {
    }

    enableIPC(pMode: IpcMode): void {
    }

    getActiveProjects(): IDexcaliburProjectMap {
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

    openProject(pUID: string): Promise<DexcaliburProject> {
        return Promise.resolve(undefined);
    }

}