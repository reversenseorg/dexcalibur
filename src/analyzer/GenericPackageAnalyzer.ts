import {InputSetPurpose, IPackageAnalyzer, PrepareOptions} from "./IPackageAnalyzer.js";
import {PackageAnalyzerOptions} from "../AnalyzerConfiguration.js";
import {AnalyzerState} from "../AnalyzerState.js";
import {Device} from "../Device.js";
import {Nullable} from "../core/IStringIndex.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AnalyzerException} from "../errors/AnalyzerException.js";
import TargetApp from "../common/TargetApp.js";
import StatusMessage from "../StatusMessage.js";
import * as Log from "../Logger.js";
import {ProjectInput} from "./ProjectInput.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 *
 */
export class GenericPackageAnalyzer implements IPackageAnalyzer {

    private _cfg:PackageAnalyzerOptions;

    state:AnalyzerState = null;

    private _dev:Nullable<Device> = null;

    private _project:Nullable<DexcaliburProject> = null;

    constructor(pConfig:PackageAnalyzerOptions) {
        this._cfg = pConfig;
    }

    getAppIcon(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getVersion(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getPkgID(): Promise<string> {
        throw new Error("Method not implemented.");
    }

    getAppName(): Promise<string> {
        throw new Error("Method not implemented.");
    }

    getMinPlatform() {
        throw new Error("Method not implemented.");
    }
    getTargetPlatform() {
        throw new Error("Method not implemented.");
    }

    async attachInput(pInput:ProjectInput):Promise<any> {

    }

    setProject(pProject:DexcaliburProject):void {
        this._project = pProject;
    }

    setDevice(pDevice:Device){
        this._dev = pDevice;
    }

    async free():Promise<void>{
        // nothing to do
    }

    /**
     * The purpose of this function is to search splitted APK,
     * and merge all into a single workspace.
     *
     * @param {any} pOptions
     */
    async prepareTargetPackage(pOptions:PrepareOptions):Promise<TargetApp> {

        if(this._project==null){
            throw AnalyzerException.CANNOT_PREPARE_PKG("Project is not configured");
        }

        const projectWS = this._project.getWorkspace();
        const platform = this._project.getPlatform();
        let targetApp:TargetApp = this._project.workspace.changeMainAppBinary(
            pOptions.path,
            pOptions.extractOpts.type
        );

        // load it : decompress file, disass dex files
        this._project.getWorkflow().pushStatus(new StatusMessage(2, "Start to extract application data"));

        Logger.info("[PROJECT][TARGET APP] Path : "+targetApp.getPath())

        // get right extraction helper
        const success = await platform.extractApp(
            targetApp,
            projectWS.getApkDir(),
            pOptions.extractOpts
        );

        // start analysis ?
        if(success){
            this._project.getWorkflow().pushStatus(new StatusMessage(5, "app extracted."));
        }

        return targetApp;

    }

    /**
     * To restore the analyzer state
     *
     * @param {AnalyzerState} pState
     */
    restoreState(pState:AnalyzerState):boolean {
        if(pState != null){
            this.state = pState;
            return true;
        }

        return false;
    }

    getInputsFor(pPurpose: InputSetPurpose): ProjectInput[] {
        return [];
    }
}