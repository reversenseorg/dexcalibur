// noinspection BadExpressionStatementJS

import * as _fs_ from "fs";
import * as _fsPromise_ from "node:fs/promises"
import * as _path_ from "path";

import {Device} from "../../Device.js";
import {AnalyzerException} from "../../errors/AnalyzerException.js";
import {InputSetPurpose, IPackageAnalyzer} from "../../analyzer/IPackageAnalyzer.js";
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
    ProjectInputType,
    ProjectInputViewer
} from "../../analyzer/ProjectInput.js";
import {DexcaliburProjectException} from "../../errors/DexcaliburProjectException.js";
import Util from "../../Utils.js";
import {PackageAnalyzerException} from "../../errors/PackageAnalyzerException.js";
import {AndroidManifest} from "../AndroidManifest.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import AndroidAppAnalyzer from "../AndroidAppAnalyzer.js";
import {ApplicationIcon} from "../../organization/ApplicationUnit.js";
import {ImageFormatHelper} from "../../platform/ImageFormat.js";
import {OperatingSystem} from "../../platform/OperatingSystem.js";
import {EFileFormat} from "../../formats/common/EFileFormat.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface AndroidPackageAnalyzerOptions {
    ssa_auto:boolean;
    msa_auto:boolean;
}

/**
 * Android APK analyzer
 *
 * The purpose of this class is to perform high-level analysis of package content
 *
 * @class
 */
export class AndroidPackageAnalyzer implements IPackageAnalyzer {


    private _cfg:AndroidPackageAnalyzerOptions;

    state:AnalyzerState = new AnalyzerState({ _uid:'android-pkg'});

    private _dev:Device|null = null;

    private _project:Nullable<DexcaliburProject> = null;

    private _base_apk:Nullable<ProjectInput> = null;

    private _extra:Record<string,ProjectInput[]> = {};

    private _data:Record<string, any> = {};

    constructor(pConfig:AndroidPackageAnalyzerOptions = { msa_auto:false, ssa_auto:false }) {
        this._cfg = pConfig;

        for(let i in pConfig){
            this.state.setProperty(i, pConfig[i]);
        }

        // todo to remove
        if(this.state.getProperty("base_apks")==null){
            this.state.setProperty("base_apks", ['base.apk']);
        }

        if(this.state.getProperty("ignore_split_files")==null){
            this.state.setProperty(
                "ignore_split_files",
                [
                    'AndroidManifest.xml',
                    'META-INF',
                    'apktool.yml',
                    'unknown',
                    'stamp-cert-sha256',
                    'original',
                ]
            );
        }

    }

    async getAppIcon(): Promise<string> {

        throw new Error("Method not implemented.");
    }

    async getVersion(): Promise<string> {
        if(this._data._version!=null) return this._data._version;

        if(this._data._rawManifest!=null){
            // short access for package temporary extracted
            const ver = /android:versionName="([^"]+)"/.exec(this._data._rawManifest);
            return Promise.resolve( ver!=null && ver[1]!=null ? ver[1] : "");

        } else if(this._data.manifest!=null){
            // standard access
            const manifest = await this.getManifest();
            return manifest.getAttr('android:versionName');
        } else{
            throw PackageAnalyzerException.CANNOT_EXTRACT_VER('android',null);
        }
    }

    async getPkgID(): Promise<string> {

        let id:Nullable<string> = null;

        if(this._data._rawManifest!=null){
            const m = /package="([^"]+)"/.exec(this._data._rawManifest);
            if(m!=null && m[1]!=null) id = m[1];
        }

        if(id==null && this._data.manifest!=null){
            id = (await this.getManifest()).getAttr('package');
        }

        if(id==null){
            throw PackageAnalyzerException.CANNOT_EXTRACT_PKGID('android',null);
        }

        return id;
    }

    setProject(pProject:DexcaliburProject):void {
        this._project = pProject;
        this.state.setContext(pProject);
    }

    setDevice(pDevice:Device){
        this._dev = pDevice;
    }


    /**
     * To pull a project input, it depends on input type and location.
     *
     * Following case are supported :
     *
     * | Location | Behavior |
     * | -------- | -------- |
     * | ProjectInputLocation.LOCAL | Return absolute path to a local file |
     * | ProjectInputLocation.DEVICE | Pull the input from the remote device using absolute path, and return absolute path to tmp local file |
     * | ProjectInputLocation.REMOTE | Not implemented. TODO : Pull a remote file over HTTPS+Proxy |
     *
     * @param {ProjectInput} pProjectInput Input to pull
     * @returns {Promise<string>} Promise of an absolute path to a file where the input is locally stored
     * @method
     * @async
     */
    async pullInput(pProjectInput:ProjectInput):Promise<string> {

        let path:string;

        switch (pProjectInput.location){
            case ProjectInputLocation.DB_PRJ:
                path = _path_.join(this._project.getWorkspace().getPath(), pProjectInput.getPath());
                break;
            case ProjectInputLocation.LOCAL:
                path = pProjectInput.data as string;
                break;
            case ProjectInputLocation.DEVICE:
                path = this._project.getDevice().pullTemp(pProjectInput.data as string);
                break;
            case ProjectInputLocation.REMOTE:
                throw new Error("Input location not implemented");
            default:
                throw new Error("Input location not supported");
        }

        if(!_fs_.existsSync(path)){
            throw DexcaliburProjectException.APP_FILE_OT_FOUND();
        }

        return path;
    }

    /**
     * To read a buffer-based project input and store it into a file
     * @param pInput
     * @async
     */
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
     * The purpose of this function is to search split APK,
     * and merge all into a single workspace.
     *
     * IMPORTANT : don't use state based data (_base_apk, _extra) because this operation set the initial state
     *
     * Steps :
     * - Pull main APK from device
     *
     * @return {Promise<TargetApp>} Target app
     * @async
     * @method
     */
    async prepareTargetPackage():Promise<TargetApp> {

        if(this._project==null){
            throw AnalyzerException.CANNOT_PREPARE_PKG("Project is not configured");
        }
        if(this._base_apk==null){
            throw DexcaliburProjectException.APP_FILE_OT_FOUND();
        }
        /* if(this._project.getDevice() == null){
            throw DexcaliburProjectException.TARGET_DEVICE_NOT_FOUND();
        }*/

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

        // clone  Project input
        let baseInput:ProjectInput = JSON.parse(JSON.stringify(this._base_apk));
        baseInput.data = basePath;

        // if enabled, search split apk on target device
        if((this._cfg.ssa_auto===true) && (device!=null)){

            if(device == null){
                throw AnalyzerException.ANDROID_SEARCH_SPLITTED_DEV_FAIL();
            }

            if(baseInput.location!=ProjectInputLocation.DEVICE){
                throw new Error("Cannot search splitted APK : project inputs is not binded to a device");
            }
            if(baseInput.type!=ProjectInputType.REGULAR_FILE){
                throw new Error("Cannot search splitted APK : main project input must be a path to a regular file");
            }

            // search app pkg folder
            const appBin = _path_.posix.dirname(this._base_apk.data as string);
            const tmpBin = this._project.getWorkspace().getInputDir();

            // list folder content
            const files = await device.getDefaultBridge().listFiles(appBin);

            let dist:string;
            let splittedRes:ProjectInput;

            // pull every file
            for(let i=0;i<files.length;i++){

                dist = _path_.join(tmpBin, files[i].n);
                try{
                    device.pull(files[i].p, dist);


                    splittedRes = ProjectInput.from({
                        data: dist,
                        location: ProjectInputLocation.LOCAL,
                        purpose: ProjectInputPurpose.EXTRA,
                        type: ProjectInputType.REGULAR_FILE,
                        extractOpts: {type:'bin'},
                        originalName: files[i].n
                    });


                    if(_fs_.lstatSync(dist).isDirectory()){
                        splittedRes.type = ProjectInputType.FOLDER;
                    }

                    if(this.state.getProperty("base_apks").indexOf(files[i].n)>-1){
                        splittedRes.purpose = ProjectInputPurpose.MAIN;
                        baseInput = splittedRes;
                    }else{

                    }

                    splittedInput.push(splittedRes);
                }catch(err){
                    Logger.error(err.message);
                }
            }


            Logger.info(ProjectInputViewer.printList(splittedInput));
        }

        // extract Base APK
        targetApp = this._project.getWorkspace().changeMainAppBinary(
            baseInput.data as string,
            'bin'
        );


        this._project.getWorkflow().pushStatus(new StatusMessage(2, "Start to extract application data"));

        Logger.info("[PROJECT][TARGET APP] Path : "+targetApp.getPath())

        // get right app helper
        const success = await  this._project.platform.extractApp(
            targetApp,  this._project.workspace.getApkDir(),
            {type:'bin'});



        // if enabled, merge package from splittedInput, this._base_apk  and  this._extra
        // into a single folder.
        if(this._cfg.msa_auto===true){
            // override options with options corresponding to freshly crafted package
            await this.mergeSplitApks(
                baseInput,
                this._extra,
                splittedInput
            );
            //opts.path = o.path;
        }




        const icon = await this.extractAppIcon(
            this._project.workspace.getApkDir()
        );

        if(icon!=null){
            this._project.setIcon(icon);
        }




        // start analysis ?
        if(success){

            this.state.setProperty("_base_apk", targetApp.toJsonObject());
            this.state.setProperty("_extra_apk", splittedInput);
            await this.state.save();

            //
            this._project.getWorkflow().pushStatus(new StatusMessage(5, "app extracted."));
        }



        return targetApp;
    }

    /**
     * To extract and merge several project inputs in order to build a folder
     * containing whole package as it was not split.
     *
     * Final folder MUST be repackageable
     *
     * @param {ProjectInput} pBaseApk Base APK
     * @param {Record<string, ProjectInput[]>} pExtra   Extra project inputs
     * @param {ProjectInput[]} pSplitApks Splitted APK and extra inputs from SSA (Search Split APKs) step
     * returns {Promise<ProjectInput>} Promise of consolidated project input. It points to a folder
     * @async
     * @method
     */
    async mergeSplitApks(pBaseApk:ProjectInput, pExtra:Record<string, ProjectInput[]>, pSplitApks:ProjectInput[]){

        let extraBundle:ProjectInput, tmpApp:TargetApp, extractDest:string, extra:string, splitCtn:string[];
        const ignore = this.state.getProperty("ignore_split_files");
        const dest = this._project.workspace.getApkDir();

        // pBaseApk has been already extracted to apk dir into project workspace
        for(let i=0; i<pSplitApks.length; i++){

            extraBundle = pSplitApks[i];

            if((extraBundle.data as string).endsWith(".apk")){

                try{
                    // extract APK into tmp folder, and merge content with apk folder
                    tmpApp = new TargetApp("bin", extraBundle.data as string);

                    extractDest = _path_.join(
                        this._project.workspace.getTmpDir(),
                        Util.now()+"_"+_path_.basename(extraBundle.data as string)
                    );

                    // extract apk
                    await AndroidPackageAnalyzer.extractApk(tmpApp.getPath(), extractDest, {
                        force: true,
                        match: true,
                        type: 'bin'
                    });

                    // search data to copy

                    splitCtn = _fs_.readdirSync(extractDest);
                    for(let k=0; k<splitCtn.length; k++){
                        if(ignore.indexOf(splitCtn[k])==-1){
                            await _fsPromise_.cp(
                                _path_.join(extractDest,splitCtn[k])+_path_.sep,
                                _path_.join(dest,splitCtn[k])+_path_.sep,
                                {
                                    recursive:true,
                                    force: true
                                }
                            )
                        }
                    }


                }catch(err){
                    Logger.error(err.message, err.stack);
                }

            }else if(extraBundle.type==ProjectInputType.FOLDER){

                extra = _path_.basename(extraBundle.data as string);
                // copy directory
                if(ignore.indexOf(extra)==-1){

                    await _fsPromise_.cp(
                        extraBundle.data as string +_path_.sep,
                        _path_.join(dest,extra)+_path_.sep,
                        {
                            recursive:true,
                            force: true
                        }
                    )

                }
            }
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
        /*return await ApkHelper.extract(pTargetApp.getPath(), pOutDir, {
            extractOpts: {
                force: true,
                match: true,
                ...pOptions
            },
            javaOpts: {
                disableZip64ExtraFieldValidation: true
            }
        });*/
        return await AndroidPackageAnalyzer.extractApk(pTargetApp.getPath(), pOutDir, pOptions);
    }

    /**
     * To extract an APK to the output dir
     *
     * @param pTargetApp
     * @param pOutDir
     * @param pOptions
     */
    static async extractApk(pApkPath:string, pOutDir: string, pOptions:any):Promise<boolean> {
        return await ApkHelper.extract(pApkPath, pOutDir, {
            extractOpts: {
                force: true,
                match: true,
                ...pOptions
            },
            javaOpts: {
                disableZip64ExtraFieldValidation: true
            }
        });
    }


    /**
     * Clean tempory files
     */
    async free():Promise<void>{
        // nothing to do
    }

    /**
     * To attach new input to an package analyzer instance
     *
     * It doesnt update state
     *
     * @param pInput
     */
    async attachInput(pInput: ProjectInput): Promise<any> {

        // IMPORTANT => stateful , don't read from internal state (reserved for stateless action)
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

    /**
     * To attach new input to the analyzer instance
     *
     * It doesnt update state
     *
     * @param pInput
     */
    attachTempInput(pPath: string, pPurpose:ProjectInputPurpose):void {

        const tmpInp = new ProjectInput({
            data: pPath,
            location: ProjectInputLocation.LOCAL,
            type: ProjectInputType.REGULAR_FILE,
            extractOpts: {type:'bin'},
            purpose: pPurpose
        })

        switch (pPurpose){
            case ProjectInputPurpose.MAIN:
                this._base_apk = tmpInp;
                break;
            case ProjectInputPurpose.EXTRA:
                if(this._extra.external==null){
                    this._extra.external = [];
                }
                this._extra.external.push(tmpInp);
                break;
        }
    }

    getBaseApkFromState():Nullable<ProjectInput> {
        const data:any = this.state.getProperty('_base_apk');
        if(data==null) return null;

        const app = TargetApp.fromJsonObject(data);

        return app.toProjectInput();
    }

    getExtraApkFromState():ProjectInput[] {
        const data = this.state.getProperty('_extra_apk');
        if(data==null) return [];

        return data.map( x => new ProjectInput(x));
    }

    /**
     * To gather the list of APKs/files to install in order to execute the app
     *
     * Files are restored from state
     *
     * @return
     */
    getInputFilesToInstall():{ role:string, path:string, tmp:boolean}[]  {

        const o:{ role:string, path:string, tmp:boolean}[] = [];

        const baseAPK = this.getBaseApkFromState()
        const extra = this.getExtraApkFromState()


        if(typeof baseAPK.data=='string'){
            o.push({ role:"base", path:baseAPK.data, tmp:false });
        }else if(baseAPK.data != null){
            // write buffer into temporary location
            const basePath = this._project.getWorkspace().createTmpPath(".apk");
            try{
                _fs_.writeFileSync(basePath,baseAPK.data);
                o.push({ role:"base", path:basePath, tmp:true });
            }catch(err){
                throw new Error("[PACKAGE ANALYZER] Base package cannot be prepared from buffer");
            }

        }else{
            throw new Error("[PACKAGE ANALYZER] Base package cannot be retrieved");
        }

        if(extra!=null){
            if(Array.isArray(extra)){
                extra.map(x => {
                    if(typeof x.data=='string'){
                        o.push({ role:"extra", path:x.data, tmp:false });
                    }else if(x.data != null){
                        // write buffer into temporary location
                        const extraPath = this._project.getWorkspace().createTmpPath(".apk","config.");
                        try{
                            _fs_.writeFileSync(extraPath,x.data);
                            o.push({ role:"extra", path:extraPath, tmp:true });
                        }catch(err){
                            throw new Error("[PACKAGE ANALYZER] Extra packages cannot be prepared from buffer");
                        }
                    }
                })
            }
        }


        return o;
    }

    /**
     * To prepare a set of ProjectInput for a specifc purpose
     *
     * @param {InputSetPurpose} pPurpose The purpose of the set
     * @returns {ProjectInput[]} A set of project inputs
     * @throws {PackageAnalyzerException}
     * @method
     */
    getInputsFor(pPurpose: InputSetPurpose): ProjectInput[] {
        let inputs:ProjectInput[] = [];


        switch (pPurpose){
            case InputSetPurpose.INSTALL:

                const base = this.getBaseApkFromState()
                const extra = this.getExtraApkFromState()

                if(base==null){
                    throw PackageAnalyzerException.MAIN_INPUT_NOT_FOUND();
                }
                inputs.push(base);

                if(extra.length>-1){
                    inputs = inputs.concat(extra);
                }
                break;
        }

        return  inputs;
    }

    /**
     * To extract metadata from temporary inputs
     *
     * Useful to pre-scan a file to preconfigure a project
     *
     * @returns {Promise<void>}
     * @async
     */
    async extractInputsTemporary():Promise<void> {

        this._data.extracted = false;

        if(this._base_apk==null){
            throw new Error("Cannot extract package temporary : no inputs");
        }

        this._data.dir = DexcaliburEngine.getInstance().getWorkspace().createTempFolder('prj-new-');

        console.log(this._base_apk);

        const success = await AndroidPackageAnalyzer.extractApk(
            this._base_apk.data as string,
            this._data.dir, {
                force: true,
                match: true,
                type: 'bin'
            }
        );

        if(success==false){
            throw new Error("Cannot extract package temporary  ")
        }

        this._data.extracted = true;

    }

    /**
     * To extract metadata from temporary inputs
     *
     * Useful to pre-scan a file to preconfigure a project
     *
     * @returns {Promise<void>}
     * @async
     */
    static async extractInfoTemporary(pPath:string, pOutput:string):Promise<any> {

        // create temporary analyzer output
        const tanal = new AndroidPackageAnalyzer({
            msa_auto: false,
            ssa_auto: false
        });

        tanal.attachTempInput(pPath, ProjectInputPurpose.MAIN);

        const success = await AndroidPackageAnalyzer.extractApk( pPath, pOutput, {
            force: true,
            match: true,
            type: 'bin'
        });

        if(success==false){
            throw new Error("Cannot extract package temporary.")
        }

        await tanal._readManifest(pOutput);
        await tanal._readStringsRsc(pOutput);

        return  {
            version: await tanal.getVersion(),
            name: await tanal.getAppName(),
            os: OperatingSystem.ANDROID,
            fmt: EFileFormat.APK,
            minOs: await tanal.getMinPlatform(),
            targetOs: await tanal.getTargetPlatform(),
            pkgId: await tanal.getPkgID(),
            icons: {
                icon: await tanal.extractAppIcon(pOutput)
            }
        };
    }

    /**
     *
     * @param pFolder
     */
    async extractAppIcon(pFolder:string):Promise<Nullable<ApplicationIcon>> {

        let icon:Nullable<ApplicationIcon> = null;

        // icons
        const opts = ["-xxxhdpi","-xxhdpi","-xhdpi","-hdpi","","-mdpi"];

        let mipmapPath:string;
        let files:string[];

        for(let i=0;i<opts.length; i++){
            mipmapPath = _path_.join(pFolder,"res","mipmap"+opts[i]);

            if(!_fs_.existsSync(mipmapPath)) continue;

            try{
                files = _fs_.readdirSync(mipmapPath);

                files.map((vFile)=>{
                    if(/ic_launcher/.test(vFile)){
                        const p = _path_.join(mipmapPath,vFile);
                        if(_fs_.existsSync(p)){
                            icon = {
                                name: vFile,
                                format: ImageFormatHelper.fromFileName(vFile),
                                data:  _fs_.readFileSync(p).toString('base64')
                            };
                        }else{
                            return null;
                        }
                    }
                });
            }catch(e){}


            if(icon!=null) break;
        }

        return icon;
    }
    /**
     * to destroy this object  and release resource
     */
    async destroy():Promise<void> {
        if(this._data.dir!=null && _fs_.existsSync(this._data.dir)){
            _fs_.rmdirSync(this._data.dir);
        }

        delete this._data;
    }

    async getManifest():Promise<AndroidManifest> {
        if(!this._data.extracted){
            await this.extractInputsTemporary();
        }

        if(this._data.manifest==null){
            const manifestPath = _path_.join(this._data.dir,"AndroidManifest.xml");

            if(!_fs_.existsSync(manifestPath)){
                throw new Error("Manifest not found");
            }

            const data:any = await AndroidAppAnalyzer._parseXmlFile(manifestPath);
            this._data.manifest = AndroidManifest.fromXml(data.manifest);
        }

        return this._data.manifest
    }

    /**
     * Return minimal platform object according to manifest (and more) data
     */
    async getMinPlatform():Promise<string> {
        const manifest = await this.getManifest();
        return manifest.getMinSdkVersion();
    }

    /**
     * Return minimal platform object according to manifest (and more) data
     */
    async getTargetPlatform():Promise<string> {
        const manifest = await this.getManifest();
        return manifest.getTargetSdkVersion();
    }

    async getAppName():Promise<string> {

        let appName:Nullable<string> = null;

        if(this._data._rawManifest!=null){
            const m = /android:label="([^"]+)"/.exec(this._data._rawManifest);
            if(m!=null && m[1]!=null) appName = m[1];
        }

        if(appName==null && this._data.manifest!=null){
            appName = (await this.getManifest()).getAttr('android:label');
        }

        if(appName==null){
            throw PackageAnalyzerException.CANNOT_EXTRACT_NAME('android',null);
        }

        // try to resolve app name
        if(appName.startsWith("@string/") && this._data._rawStrings!=null){
            const label = (new RegExp(`<string name="${appName.substring(8)}">([^<]+)</string>`))
                .exec(this._data._rawStrings);

            if(label!=null){
                return label[1];
            }else{
                return appName;
            }
        }else{
            return appName;
        }
    }


    private async _readManifest(pOutput: string) {
        const p = _path_.join(pOutput,"AndroidManifest.xml");
        if(!_fs_.existsSync(p)){
            throw new Error("Cannot extract AndroidManifest.xml from package.")
        }
        this._data._rawManifest = _fs_.readFileSync(p, { encoding: "utf8" });
    }

    private async _readStringsRsc(pOutput: string) {
        const p = _path_.join(pOutput,"res","values","strings.xml");
        if(!_fs_.existsSync(p)){
            throw new Error("Cannot extract strings.xml from package.")
        }
        this._data._rawStrings = _fs_.readFileSync(p, { encoding: "utf8" });
    }
}