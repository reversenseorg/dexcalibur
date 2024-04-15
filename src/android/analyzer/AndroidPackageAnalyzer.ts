import * as _fs_ from "fs";
import * as _path_ from "path";

import {Device} from "../../Device.js";
import {AndroidPackageAnalyzerConfig} from "./AndroidPackageAnalyzerConfig.js";
import {AnalyzerException} from "../../errors/AnalyzerException.js";
import {IPackageAnalyzer, PrepareOptions} from "../../analyzer/IPackageAnalyzer.js";
import {AnalyzerState} from "../../AnalyzerState.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {Nullable} from "../../core/IStringIndex.js";
import TargetApp from "../../common/TargetApp.js";
import ApkHelper from "../../ApkHelper.js";
import StatusMessage from "../../StatusMessage.js";
import * as Log from "../../Logger.js";
import {
    ProjectInput,
    ProjectInputLocation,
    ProjectInputPurpose,
    ProjectInputType
} from "../../analyzer/ProjectInput.js";
import {DexcaliburProjectException} from "../../errors/DexcaliburProjectException.js";
import Util from "../../Utils.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 *
 */
export class AndroidPackageAnalyzer implements IPackageAnalyzer {

    private _cfg:AndroidPackageAnalyzerConfig;

    state:AnalyzerState = new AnalyzerState();

    private _dev:Device|null = null;

    private _project:Nullable<DexcaliburProject> = null;

    private _base_apk:Nullable<ProjectInput> = null;

    private _extra:Record<string,ProjectInput[]> = {};



    constructor(pConfig:AndroidPackageAnalyzerConfig) {
        this._cfg = pConfig;

        for(let i in pConfig){
            this.state.setProperty(i, pConfig[i]);
        }
    }

    setProject(pProject:DexcaliburProject):void {
        this._project = pProject;
    }

    setDevice(pDevice:Device){
        this._dev = pDevice;
    }


    async pullInput(pProjectInput:ProjectInput):Promise<string> {

        let path:string;

        switch (pProjectInput.location){
            case ProjectInputLocation.LOCAL:
                path = pProjectInput.data as string;
                break;
            case ProjectInputLocation.DEVICE:
                path = this._project.getDevice().pullTemp(pProjectInput.data as string);
                break;
            case ProjectInputLocation.REMOTE:
                throw new Error("Input location not implemented");
                break;
            default:
                throw new Error("Input location not supported");
                break;
        }

        if(!_fs_.existsSync(path)){
            throw DexcaliburProjectException.APP_FILE_OT_FOUND();
        }

        return path;
    }


    async writeBuffer(pInput:ProjectInput):Promise<string> {
        if((pInput.type!=ProjectInputType.BUFFER)||(!Buffer.isBuffer(pInput.data))){
            throw new Error("Project Input is not a buffer");
        }

        const fpath = _path_.join(
            this._project.getWorkspace().getTmpDir(),
            'base_apk_buffer_'+Util.now()+'.bin'
        );

        _fs_.writeFileSync( fpath, pInput.data, {encoding:"binary"});


        if(_fs_.existsSync(fpath)){
            throw DexcaliburProjectException.APP_FILE_OT_FOUND();
        }

        return
    }



    /**
     * The purpose of this function is to search splitted APK,
     * and merge all into a single workspace.
     *
     * @param {any} pOptions
     */
    async prepareTargetPackage():Promise<TargetApp> {

        if(this._project==null){
            throw AnalyzerException.CANNOT_PREPARE_PKG("Project is not configured");
        }
        if(this._base_apk==null){
            throw DexcaliburProjectException.APP_FILE_OT_FOUND();
        }
        if(this._project.getDevice() == null){
            throw DexcaliburProjectException.TARGET_DEVICE_NOT_FOUND();
        }

        const device = this._project.getDevice();
        let targetApp:TargetApp;
        let basePath:string;
        let splittedInput:ProjectInput[] = [];

        // pull main APK
        if(this._base_apk.type==ProjectInputType.REGULAR_FILE){
            basePath = await this.pullInput(this._base_apk);
        }else{
            basePath = await this.writeBuffer(this._base_apk);
        }

        console.log(this._cfg);

        if(this._cfg.mustSearchSplittedAPK()){

            if(device == null){
                throw AnalyzerException.ANDROID_SEARCH_SPLITTED_DEV_FAIL();
            }

            if(this._base_apk.location!=ProjectInputLocation.DEVICE){
                throw new Error("Cannot search splitted APK : project inputs is not binded to a device");
            }
            if(this._base_apk.type!=ProjectInputType.REGULAR_FILE){
                throw new Error("Cannot search splitted APK : main project input must be a path to a regular file");
            }

            // search app pkg folder
            const appBin = _path_.posix.dirname(this._base_apk.data as string);
            const tmpBin = this._project.getWorkspace().getInputDir();

            // list folder content
            const files = await device.getDefaultBridge().listFiles(appBin);
            let dfiles:any[];
            let dist:string, ddist:string, tmpdist:string;

            // pull every file
            for(let i=0;i<files.length;i++){

                // pull 1st level dir
                /*if(files[i]._t!="d"){

                    dfiles = await device.getDefaultBridge().listFiles(files[i].p);
                    tmpdist = _path_.join(tmpBin, files[i].n)

                    _fs_.mkdirSync(tmpdist, 0o666);

                    for(let k=0;i<dfiles.length;k++){
                        ddist = _path_.join(tmpBin, dfiles[k].n);
                        try{
                            device.pull( dfiles[k].p, ddist);
                            splittedInput.push({
                                data: ddist,
                                location: ProjectInputLocation.LOCAL,
                                purpose: ProjectInputPurpose.EXTRA,
                                type: ProjectInputType.REGULAR_FILE,
                                extractOpts: {type:'bin'}
                            });
                        }catch(err){
                            console.log(err)
                        }
                    }

                }else{*/
                    dist = _path_.join(tmpBin, files[i].n);
                    try{
                        device.pull(files[i].p, dist);
                        splittedInput.push({
                            data: dist,
                            location: ProjectInputLocation.LOCAL,
                            purpose: ProjectInputPurpose.EXTRA,
                            type: ProjectInputType.REGULAR_FILE,
                            extractOpts: {type:'bin'}
                        });
                    }catch(err){
                        console.log(err)
                    }
                //}
            }

            console.log(splittedInput);
        }

        /*
        if(this._cfg.mustMergeSplittedAPK()){
            // override options with options corresponding to freshly crafted package
            const o = await this.mergeSplittedApks();
            opts.path = o.path;
            opts.extractOpts = o.extractOpts;
        }
         */


        targetApp = this._project.getWorkspace().changeMainAppBinary(
            basePath,
            'bin'
        );


        // load it : decompress file, disass dex files
        this._project.getWorkflow().pushStatus(new StatusMessage(2, "Start to extract application data"));

        Logger.info("[PROJECT][TARGET APP] Path : "+targetApp.getPath())

        // get right app helper
        const success = await  this._project.platform.extractApp(
            targetApp,  this._project.workspace.getApkDir(),
            {type:'bin'});

        // start analysis ?
        if(success){
            this._project.getWorkflow().pushStatus(new StatusMessage(5, "app extracted."));
        }

        return targetApp;
    }

    /**
     *
     */
    async mergeSplittedApks():Promise<PrepareOptions> {
        return {
            path: "",
            extractOpts: { type: 'bin' }
        }
    }

    /**
     * To restore the analyzer state
     *
     * @param {AnalyzerState} pState
     */
    restoreState(pState:AnalyzerState):boolean {

        if(pState != null){
            if(Object.keys(pState.state).length>0){
                this.state = pState;
            }
            return true;
        }

        return false;
    }


    /**
     * To extract an APK to the output dir
     *
     * @param pTargetApp
     * @param pOutDir
     * @param pOptions
     */
    static async extractApp(pTargetApp: TargetApp, pOutDir: string, pOptions:any):Promise<boolean> {
        return await ApkHelper.extract(pTargetApp.getPath(), pOutDir, {
            force: true,
            match: true,
            ...pOptions
        });
    }


    /**
     * Clean tempory files
     */
    async free():Promise<void>{
        // nothing to do
    }

    /**
     *
     * @param pInput
     */
    async attachInput(pInput: ProjectInput): Promise<any> {

        switch (pInput.purpose){
            case ProjectInputPurpose.MAIN:
                this._base_apk = pInput;
                break;
            case ProjectInputPurpose.EXTRA:
                if(this._extra.external==null){
                    this._extra.external = [];
                }
                this._extra.external.push(pInput);
                break;
        }

    }
}