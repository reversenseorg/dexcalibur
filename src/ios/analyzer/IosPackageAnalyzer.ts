// noinspection BadExpressionStatementJS

import * as _fs_ from "fs";
import * as _path_ from "path";

import {Device} from "../../Device.js";
import {AnalyzerException} from "../../errors/AnalyzerException.js";
import {InputSetPurpose, IPackageAnalyzer} from "../../analyzer/IPackageAnalyzer.js";
import {AnalyzerState} from "../../AnalyzerState.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {Nullable} from "../../core/IStringIndex.js";
import TargetApp from "../../common/TargetApp.js";
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
import {PackageAnalyzerException} from "../../errors/PackageAnalyzerException.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {ApplicationIcon} from "../../organization/ApplicationUnit.js";
import {InternZipUtils} from "../../util/InternZipUtils.js";
import {PlistHelper} from "../../formats/helpers/PlistHelper.js";
import ModelResource from "../../ModelResource.js";
import {RuntimeSecurityException} from "../../errors/RuntimeSecurityException.js";
import {ImageFormatHelper} from "../../platform/ImageFormat.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {Cgbi} from "../../parser/CgbiParser.js";
import {OperatingSystem} from "../../platform/OperatingSystem.js";
import {EFileFormat} from "../../formats/common/EFileFormat.js";
import {PlistDocument} from "../PlistDocument.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface IosPackageAnalyzerOptions {

}

/**
 * Android APK analyzer
 *
 * The purpose of this class is to perform high-level analysis of package content
 *
 * @class
 */
export class IosPackageAnalyzer implements IPackageAnalyzer {


    private _cfg:IosPackageAnalyzerOptions;

    state:AnalyzerState = new AnalyzerState({ _uid:'ios-pkg'});

    private _dev:Device|null = null;

    private _project:Nullable<DexcaliburProject> = null;

    private _main:Nullable<ProjectInput> = null;

    private _extra:Record<string,ProjectInput[]> = {};

    private _data:Record<string, any> = {};

    constructor(pConfig:IosPackageAnalyzerOptions = {}) {
        this._cfg = pConfig;

        for(let i in pConfig){
            this.state.setProperty(i, pConfig[i]);
        }

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
            case ProjectInputLocation.REMOTE:
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
        if(this._main==null){
            throw DexcaliburProjectException.APP_FILE_OT_FOUND();
        }

        let targetApp:TargetApp;
        let basePath:string;

        // pull main IPA
        if(this._main.type==ProjectInputType.REGULAR_FILE){
            basePath = await this.pullInput(this._main);
        }else{
            basePath = await this.writeBuffer(this._main);
        }

        // clone  Project input
        let baseInput:ProjectInput = JSON.parse(JSON.stringify(this._main));
        baseInput.data = basePath;

        // extract Base APK
        targetApp = this._project.getWorkspace().changeMainAppBinary(
            baseInput.data as string,
            'bin'
        );


        this._project.getWorkflow().pushStatus(new StatusMessage(2, "Start to extract application data"));

        Logger.info("[PROJECT][TARGET APP] Path : "+targetApp.getPath())

        await IosPackageAnalyzer.extractApp(
            targetApp,
            this._project.workspace.getAppDir()
        );

        const icon = await this.extractAppIcon(
            this._project.workspace.getAppDir()
        );


        if(icon!=null){
            this._project.setIcon(icon);
        }

        this._project.meta.versionName = await this.getVersion();
        this._project.meta.hash = this.getAppChecksum();
        this._project.meta.label = await this.getAppName();
        this._project.meta.version = this.getVersion();

        this._project.os = OperatingSystem.IOS;

        this._project.meta.minOs = await this.getMinPlatform();
        this._project.meta.targetOs = await this.getTargetPlatform();

        await this.state.save();
        this._project.getWorkflow().pushStatus(new StatusMessage(5, "app extracted."));

        return targetApp;
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
    static async extractApp(pTargetApp: TargetApp|string, pOutDir: string, pOptions:any = null):Promise<void> {

        try{
            // unzip
            const path = (typeof pTargetApp==="string")? pTargetApp : pTargetApp.getPath();
            await InternZipUtils.unzipArchive(path, pOutDir);

            // extract icon

        }catch (err){
            console.error(err);
            throw PackageAnalyzerException.CANNOT_EXTRACT_APP('ios', (pTargetApp instanceof TargetApp? pTargetApp.getPath() : pTargetApp));
        }

        return ;
    }


    /**
     * Clean tempory files
     */
    async free():Promise<void>{
        // nothing to do
    }

    /**
     * To attach new input to the analyzer instance
     *
     * It doesnt update state
     *
     * @param pInput
     */
    async attachInput(pInput: ProjectInput): Promise<any> {

        // IMPORTANT => stateful , don't read from internal state (reserved for stateless action)
        switch (pInput.purpose){
            case ProjectInputPurpose.MAIN:
                this._main = pInput;
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
                this._main = tmpInp;
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
     * At very early stage of a new project, or when searching
     * comptabile device/platform
     *
     * Useful to pre-scan a file to preconfigure a project
     *
     * @returns {Promise<void>}
     * @async
     */
    async extractInputsTemporary():Promise<void> {

        this._data.extracted = false;

        if(this._main==null){
            throw new Error("[IOS] Cannot perform temp extract from package : no inputs");
        }

        this._data.dir = DexcaliburEngine.getInstance().getWorkspace().createTempFolder('prj-new-')+'_';

        await IosPackageAnalyzer.extractApp(
            this._main.data as string,
            this._data.dir
        );

        this._data.extracted = true;

    }

    /**
     * To extract metadata from temporary inputs
     *
     *
     *
     * Useful to pre-scan a file to preconfigure a project
     *
     * @returns {Promise<void>}
     * @async
     */
    static async extractInfoTemporary(pPath:string, pOutput:string):Promise<any> {

        // create temporary analyzer output
        const tanal = new IosPackageAnalyzer();
        tanal.attachTempInput(pPath, ProjectInputPurpose.MAIN);

        await IosPackageAnalyzer.extractApp( pPath, pOutput );

        const meta = {
            version: await tanal.getVersion(),
            name: await tanal.getAppName(),
            os: OperatingSystem.IOS,
            fmt: EFileFormat.IPA,
            minOs: await tanal.getMinPlatform(),
            targetOs: await tanal.getTargetPlatform(),
            pkgId: await tanal.getPkgID(),
            sha256: tanal.getAppChecksum(),
            icons: {
                icon: await tanal.extractAppIcon(pOutput)
            }
        }

        return meta;
    }

    _getAppBinName(pFolder = null):Nullable<string> {
        const base = _path_.normalize(pFolder!=null ? pFolder : this._data.dir);

        return _fs_.readdirSync(_path_.join(base,'Payload'))
            .find(x => (x!='..' && x!='.' && x.endsWith('.app')));

    }

    _getAppPath(pFolder = null):string {
        if(this._data.pl!=null) return this._data.pl;

        const base = _path_.normalize(pFolder!=null ? pFolder : this._data.dir);
        const d =  this._getAppBinName(pFolder);

        if(d==null){
            throw new Error("[PACKAGE ANALYZER] Ios : Cannot found *.app path");
        }

        const app = _path_.normalize(_path_.join(base,'Payload',d));

        if(app.indexOf(base)!=0){
            throw RuntimeSecurityException.PATH_TRAVERSAL_IS_FORBIDDEN();
        }

        if(!_fs_.existsSync(_path_.join(app,'Info.plist'))){
            throw new Error("[PACKAGE ANALYZER] Ios : Cannot find valid path to Info.plist");
        }

        return this._data.pl = _path_.normalize(_path_.join(base,'Payload',d));
    }
    /**
     *
     * @param pFolder
     */
    async extractAppIcon(pFolder:string):Promise<Nullable<ApplicationIcon>> {

        if(this._data._icon!=null) return this._data._icon;

        const iconInfo:any = (await this._getPkgInfo('CFBundleIcons'));
        let name:string, ic:string[];

        if(iconInfo==null) return null;

        if(iconInfo['CFBundlePrimaryIcon']!=null){
            name = iconInfo['CFBundlePrimaryIcon']['CFBundleIconName'];
            ic = iconInfo['CFBundlePrimaryIcon']['CFBundleIconFiles'];
        }

        const appPath = this._getAppPath(pFolder);
        let files:string[] = [], vFile:string;

        try{
            files = _fs_.readdirSync(appPath);

            let parser:Cgbi.Parser = new Cgbi.Parser();

            for(let i = 0; i < files.length; i++) {
                vFile = files[i];


                if( (ic.length>0 && vFile.startsWith(ic[0]))  || (name!=null && vFile.startsWith(name)) ){

                    const p = _path_.join(appPath,vFile);
                    const d = parser.encodeAsPng( _fs_.readFileSync(p), 0);

                    if(_fs_.existsSync( _path_.join(appPath,vFile+".decoded"))){
                        _fs_.rmSync( _path_.join(appPath,vFile+".decoded"));
                    }
                    _fs_.writeFileSync( _path_.join(appPath,vFile+".decoded"), d );

                    console.log(`DECODING ICON : ${p} INTO \n ${_path_.join(appPath,vFile+".decoded")}`);

                    if(_fs_.existsSync(p)){
                        return {
                            name: vFile,
                            format: ImageFormatHelper.fromFileName(vFile),
                            data: d.toString('base64')
                        };
                    }else{
                        return null;
                    }
                }
            }
        }catch(e){
            console.error(e);
        }

        return null;
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

    /**
     * To parse the iTunesMetadata plist at the root of package
     */
    async extractPkgInfo(pRootFolder:string):Promise<ModelResource<any>> {

        let path = _path_.join(this._getAppPath(pRootFolder),"Info.plist");
        if(!_fs_.existsSync(path)){
            Logger.info("[PACKAGE ANALYZER] Ios : Info.plist not found. ");
            return null;
        }

        return await PlistHelper.parseFile(path);
    }

    /**
     * To parse the iTunesMetadata plist at the root of package
     */
    async extractItunesInfo(pRootFolder:string):Promise<ModelResource<PlistDocument>> {
        let path = _path_.join(pRootFolder,"iTunesMetadata.plist");
        if(!_fs_.existsSync(path)){
            Logger.info("[PACKAGE ANALYZER] Ios : iTunesMetadata.plist not found. ");
            return null;
        }
        return await PlistHelper.parseFile(path);
    }


    /**
     * To parse the iTunesMetadata plist at the root of package
     */
    async _getItunesMeta():Promise<{ pkginfo: ModelResource<any>, itunes: ModelResource<any> }> {
        if(!this._data.extracted){
            await this.extractInputsTemporary();
        }

        if(this._data.itunes===undefined){
            this._data.itunes = await this.extractItunesInfo(this._data.dir);
        }
        if(this._data.pkginfo===undefined){
            this._data.pkginfo = await this.extractPkgInfo(this._data.dir);
        }

        return {
            pkginfo: this._data.pkginfo,
            itunes: this._data.itunes,
        };
    }

    /**
     * Return minimal platform object according to manifest (and more) data
     */
    async getMinPlatform():Promise<string> {
        return await this._getPkgInfo<string>('MinimumOSVersion');
    }

    /**
     * Return minimal platform object according to manifest (and more) data
     */
    async getTargetPlatform():Promise<string> {
        return await this._getPkgInfo<string>('MinimumOSVersion');
    }

    async getVersion():Promise<string> {
        let id = await this._getPkgInfo<string>('CFBundleShortVersionString');

        if(id==null){
            id = await this._getItunesInfo<string>('bundleShortVersionString');
        }

        return id;
    }

    async getAppIcon():Promise<any> {
        return this._data._icon;
    }

    async getPkgID():Promise<Nullable<string>> {
        let id = await this._getPkgInfo<string>('CFBundleIdentifier');

        if(id==null){
            id = await this._getItunesInfo<string>('softwareVersionBundleId');
        }

        return id;
    }

    /**
     * To retrieve a value from an entry in the itunesmetadata.plist
     * @param pKey
     * @private
     */
    private async _getItunesInfo<T>(pKey:any):Promise<Nullable<T>> {
        let s:any = (await this._getItunesMeta());
        if(s.itunes==null || s.itunes.value==null) return null;
        s = s.itunes.value.data[pKey];

        return ((s!=null && s.__===NodeInternalType.STRING) ? s.value : s);
    }

    /**
     * To retrieve a value from an entry in the itunesmetadata.plist
     * @param pKey
     * @private
     */
    private async _getPkgInfo<T>(pKey:any):Promise<Nullable<T>> {
        let s:any = (await this._getItunesMeta());
        if(s.pkginfo==null || s.pkginfo.value==null) return null;
        s = s.pkginfo.value.data[pKey];
        return ((s!=null && s.__===NodeInternalType.STRING) ? s.value : s);
    }

    async getAppName():Promise<string> {
        let id = await this._getPkgInfo<string>('CFBundleDisplayName');
        if(id==null) id = await this._getItunesInfo<string>('bundleDisplayName');
        return id ;
    }

    getAppChecksum() {
        return "";
    }
}