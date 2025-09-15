import * as _fs_ from "fs";

import DexcaliburProject from "../DexcaliburProject.js";
import DexcaliburDVM from "../android/DexcaliburDVM.js";
import {DexcaliburVM} from "../DexcaliburVM.js";
import * as Log from "../Logger.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Architecture} from "../Architecture.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {IAppAnalyzer} from "../analyzer/IAppAnalyzer.js";
import AndroidAppAnalyzer from "../android/AndroidAppAnalyzer.js";
import {AnalyzerState} from "../AnalyzerState.js";
import IosAppAnalyzer from "../ios/IosAppAnalyzer.js";
import {AnalyzerException} from "../errors/AnalyzerException.js";
import {Nullable} from "../core/IStringIndex.js";
import KeyPointManager from "../hook/KeyPointManager.js";
import TargetApp from "../common/TargetApp.js";
import {IPackageAnalyzer} from "../analyzer/IPackageAnalyzer.js";
import {AndroidPackageAnalyzer} from "../android/analyzer/AndroidPackageAnalyzer.js";
import {PackageAnalyzerOptions} from "../AnalyzerConfiguration.js";
import {KernelInfo} from "./kernels/common/Kernel.js";
import {KernelInfoFactory} from "./kernels/common/KernelFactory.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DbDataType, DbKeyType, NodeProperty, NodePropertyState, NodeType} from "@dexcalibur/dexcalibur-orm";
import {Resource} from "../common/Resource.js";
import {IosPackageAnalyzer} from "../ios/analyzer/IosPackageAnalyzer.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
const PLATFORM_RE = new RegExp('(?<source>[^_.]+)_(?<name>[^_.]+)_(?<version>[^_.]+)_(?<vendor>[^_.]+)\.(?<format>[^.]+)');
const LOCAL_PLATFORM_RE = new RegExp('(?<source>[^_.]+)_(?<name>[^_.]+)_(?<version>[^_.]+)_(?<vendor>[^_.]+)');

export interface PlatformOptions {
    uid?:string;
    name?:string;
    version?:string;
    source?:string;
    vendor?:string;
    model?:string;
    format?:string;
    path?:string;
    hash?:string;
    size?:number;
    remoteURL?:string;
    localPath?:string;
    official?:boolean;
    resource?:Resource;
    installed?:boolean;
    stub?:boolean;
    os?:OperatingSystem;
    arch?:Architecture;
    apiVersion?:string;
    binaryPath?:string;
    download_url?:string;
    sha?:string;
    kInfo?:Nullable<KernelInfo>;
}
/**
 * Represent a target platform
 *
 * @class
 */
export default class Platform
{
    __ = NodeInternalType.PLATFORM_PPT;

    static TYPE:NodeType = (new NodeType( "platform", NodeInternalType.PLATFORM_PPT, [
        (new NodeProperty("uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("version")).type(DbDataType.STRING).def(""),
        (new NodeProperty("source")).type(DbDataType.STRING).def(""),
        (new NodeProperty("vendor")).type(DbDataType.STRING).def(""),
        (new NodeProperty("model")).type(DbDataType.STRING).def([]),
        (new NodeProperty("format")).type(DbDataType.BOOLEAN).def(true),
        (new NodeProperty("path")).type(DbDataType.STRING).def([]),
        (new NodeProperty("hash")).type(DbDataType.STRING).def([]),
        (new NodeProperty("size")).type(DbDataType.NUMERIC).def([]),
        (new NodeProperty("os")).type(DbDataType.STRING).def(null),
        (new NodeProperty("arch")).type(DbDataType.STRING).def(null),
        (new NodeProperty("official")).type(DbDataType.BOOLEAN).def(false),
        (new NodeProperty("apiVersion")).type(DbDataType.STRING).def([]),
        (new NodeProperty("binaryPath")).type(DbDataType.STRING).def([]),
        (new NodeProperty("resource")).type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                if(x.p!=null){
                    return (x.p as Resource).toJsonObject();
                }else{
                    return null;
                }
            })
            .wakeUp((x:NodePropertyState)=>{
                if(x.p!=null){
                    return new Resource(x.p);
                }else{
                    return null;
                }
            })
            .def(null),


        (new NodeProperty("remoteURL")).volatile().type(DbDataType.STRING).def(null),
        (new NodeProperty("localPath")).volatile().type(DbDataType.STRING).def(null),
        (new NodeProperty("installed")).volatile().type(DbDataType.STRING).def(null),
        (new NodeProperty("stub")).volatile().type(DbDataType.STRING).def(null)
    ]));

    static SUPPORTED_FILE_FMT = ["apk","ipa","so","bin","dmg"];

    uid:string = null;
    name:string = null;
    version:string = null;
    source:string = null;
    vendor:string = null;
    model:string = null;
    format:string = null;
    path:string = null;
    hash:string = null;
    size:number = null;
    remoteURL:string = null;
    localPath:string = null;
    official:boolean = false;

    resource:Resource = null;
    installed = false;
    stub = false;

    // TODO : os + arch
    os:OperatingSystem = null;
    arch:Architecture = null;

    apiVersion:string = null;
    binaryPath:string = null;

    download_url:string = null;
    sha:string = null;

    kInfo:Nullable<KernelInfo> = null;

    constructor(pPlatformConfig:PlatformOptions = {}){

        for(const i in pPlatformConfig)
            this[i] = pPlatformConfig[i];

    }


    private _detectOS(){
        switch(this.name){
            case "androidapi":
                this.os = OperatingSystem.ANDROID;
                // attach Linux kernel
                break;
            case "ios":
                this.os = OperatingSystem.IOS;
                break;
        }
    }

    static fromRemoteName( pName:string):Platform{
        const matches:any = PLATFORM_RE.exec(pName);

        if(matches[0] === pName){
            const platform =  new Platform({
                source: matches.groups.source,
                name: matches.groups.name,
                version: matches.groups.version,
                vendor: matches.groups.vendor,
                format: matches.groups.format
            });
            platform._detectOS();
            return platform;
        }else{
            return null;
        }

    }



    /**
     * To create a platform from a name
     *
     * @param {string} pName Local platform name
     */
    static fromLocalName( pName:string):Platform{
        // parse platform name
        const matches:any = LOCAL_PLATFORM_RE.exec(pName);

        if(matches != null && matches[0] === pName){
            const platform = new Platform({
                source: matches.groups.source,
                name: matches.groups.name,
                version: matches.groups.version,
                vendor: matches.groups.vendor
            });
            platform._detectOS();
            return platform;
        }else{
            Logger.raw(`invalid platform name = ${pName}`);
            return null;
        }
    }

    getOS():OperatingSystem {
        return this.os;
    }

    setSize( pSize:number){
        this.size = pSize;
    }

    setHash( pHash:string){
        this.hash = pHash;
    }

    setRemotePath( pPath:string){
        this.remoteURL = pPath;
    }

    getRemotePath():string{
        return this.remoteURL;
    }

    setLocalPath( pPath:string){
        this.localPath = pPath;
        this.installed = (_fs_.existsSync(pPath) == true);
    }

    getLocalPath():string{
        return this.localPath;
    }

    getUID():string{
        if(!this.stub)
            return this.uid = `${this.source}_${this.name}_${this.version}_${this.vendor}`;
        else
            return this.uid;
    }

    /**
     * To return the name of the folder where the  
     * Platform  is stored.
     */
    getInternalName():string{
        // TODO : add file path check in order to avoid traversal path
        return this.name+"_"+this.version; //apiVersion;
    }

    isAndroid():boolean{
        return this.name.indexOf("android")>-1;
    }

    isIOS():boolean{
        return this.name.indexOf('ios')>-1;
    }

    is( pType:string[]|string):boolean{
        if(Array.isArray(pType))
            return pType.filter( val => this.name.indexOf(val)>-1).length>0;
        else
            return this.name.indexOf(pType)>-1;
    }

    /**
     * To check if two platforms are the same
     *
     * @param {Platform} pPlatform Platform to compare to
     * @returns {boolean}
     * @method
     */
    equal(pPlatform:Platform):boolean {
        return (pPlatform!=null)&&(this.uid===pPlatform.uid);
    }

    isStub():boolean {
        return this.stub;
    }

    isVmSupported(){
        if(this.isAndroid())
            return true;
        else
            return false;
    }

    getNewDexcaliburVM( pContext:DexcaliburProject):DexcaliburVM{
        if(this.isAndroid())
            return new DexcaliburDVM(pContext);
        else
            throw new Error('This platform not supports partial emulation or symbolic execution');
    }

    getPublicVersion():string{
        return this.name+":"+this.version;
    } 

    getApiVersion():string{
        return this.apiVersion;
    } 

    /**
     * @deprecated
     * @param {*} pPath 
     */
    setPath( pPath:string){
        this.path = pPath;
    }

    getBinPath():string{
        return this.binaryPath;
    }

    setBinPath(path:string){
        this.binaryPath = path;
    }

    checkInstall():boolean{
        if(this.installed===true){
            return this.installed;
        }

        return this.installed = _fs_.existsSync(this.localPath);
    }


    toJsonObject():any{
        const o:any = {};

        for(const i in this){
            if(typeof this[i] == 'function') continue;
            o[i] = this[i];
        }
        CoreDebug.checkJsonSerialize(o, "Platform");
        return o;
    }

    /**
     * To instanciate  a new app analyzer adapted to platform OS
     * or app type.
     *
     * It restores also known states.
     *
     * @param {DexcaliburProject} pProject Project context
     * @return {IAppAnalyzer} Instance of application analyzer
     * @method
     */
    async newAppAnalyzer(pProject:DexcaliburProject, pOptions:any = {}):Promise<IAppAnalyzer> {

        let appAnalyzer:IAppAnalyzer;
        let stateName:string;
        let state:Nullable<AnalyzerState> = null;

        Logger.info("PLATFORM > newAppAnalyzer > ",this.os);
        switch(this.os){
            case OperatingSystem.FIRE_OS:
            case OperatingSystem.ANDROID:
                appAnalyzer = new AndroidAppAnalyzer(pProject,pOptions);
                stateName = 'android-app';
                break;
            case OperatingSystem.IOS:
                appAnalyzer = new IosAppAnalyzer(pProject,pOptions);
                stateName = 'ios-app';
                break;
            default:
                throw AnalyzerException.PLATFORM_NOT_SUPPORTED(this.os);
        }

        appAnalyzer.restoreState(await pProject.getProjectDB().getAnalyzerState(stateName));

        return appAnalyzer;
    }

    /**
     * To instanciate  a new package analyzer adapted to platform OS
     * or app type.
     *
     * It restores also known states.
     *
     * @param {DexcaliburProject} pProject Project context
     * @param {Nullable<PackageAnalyzerOptions>} pOptions Options
     * @return {IAppAnalyzer} Instance of application analyzer
     * @method
     */
    async newPackageAnalyzer(pProject:DexcaliburProject, pOptions:Nullable<PackageAnalyzerOptions> = null):Promise<IPackageAnalyzer> {

        let pkgAnalyzer:IPackageAnalyzer;
        let stateName:string;
        let state:Nullable<AnalyzerState> = null;

        const opts = (pOptions==null)? pProject.getAnalyzerConfiguration().getPkgAnalyzerConfig() :pOptions;

        Logger.info("PLATFORM > newPackageAnalyzer > ",this.os);
        switch(this.os){
            case OperatingSystem.ANDROID:
                pkgAnalyzer = new AndroidPackageAnalyzer(opts);
                stateName = 'android-pkg';
                break;
            case OperatingSystem.IOS:
                pkgAnalyzer = new IosPackageAnalyzer(opts);
                stateName = 'ios-pkg';
                break;
            default:
                throw AnalyzerException.PLATFORM_NOT_SUPPORTED(this.os);
        }

        pkgAnalyzer.restoreState(await pProject.getProjectDB().getAnalyzerState(stateName));
        pkgAnalyzer.setProject(pProject);

        return pkgAnalyzer;
    }

    async newKeyPointManager(pProject:DexcaliburProject):Promise<KeyPointManager> {

        if(this.os==OperatingSystem.ANDROID||this.isAndroid()){
            return await KeyPointManager.newForAndroid(pProject);
        }
        else if(this.os==OperatingSystem.IOS||this.isIOS()){
            return  await KeyPointManager.newForIOS(pProject);
        }
        else {
            throw AnalyzerException.PLATFORM_NOT_SUPPORTED(this.os);
        }
    }

    /**
     * To extract application data from binary file by delegating it to PackageAnalyzer for each platform
     *
     *
     * It can be useless with some file format
     *
     * @param pTargetApp
     * @param pOutDir
     * @param pOptions
     */
    async extractApp(pTargetApp: TargetApp, pOutDir: string, pOptions:any) {
        if(this.os==OperatingSystem.ANDROID||this.isAndroid()){
            return await AndroidPackageAnalyzer.extractApp(pTargetApp, pOutDir, {
                force: true,
                match: true,
                ...pOptions
            });
        }
        else {
            return true;
            //throw AnalyzerException.EXTRACT_NOT_SUPPORTED(pTargetApp.type,this.os);
        }
        // ipa helper, tizen helper, dmg helper,  bin helper, ...
    }

    getDefaultFileType() {
        if(this.os==OperatingSystem.ANDROID||this.isAndroid()){
            return "apk"
        }
        else {
            return "bin";
        }
    }

    /**
     * To get kernel model linked to this instance
     *
     * If a kernel is not yet identified, it searchs it
     *
     * @return {Nullable<Kernel>}
     * @method
     */
    getKernelModel():Nullable<KernelInfo> {
        if(this.kInfo == null){
            this.kInfo = KernelInfoFactory.find(this.os, this.arch, null);
        }

        return this.kInfo;
    }
}
