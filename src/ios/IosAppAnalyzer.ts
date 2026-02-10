import IosApplication from "./IosApplication.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AnalyzerState} from "../AnalyzerState.js";
import {IAppAnalyzer, NativeDiscoverOpts} from "../analyzer/IAppAnalyzer.js";
import {AppIcon} from "../AppIcon.js";
import * as  _fs_ from "fs";
import * as _path_ from "path";
import ModelResource from "../ModelResource.js";
import {IosPackageAnalyzer} from "./analyzer/IosPackageAnalyzer.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {PlistHelper} from "../formats/helpers/PlistHelper.js";
import ModelPackage from "../ModelPackage.js";
import {INode, Tag} from "@dexcalibur/dexcalibur-orm";

import * as _glob_ from "glob";
import {Nib} from "../parser/NibParser.js";
import {NibArchive} from "./NibArchive.js";
import DataScope from "../DataScope.js";
import Util from "../Utils.js";
import {PlistDocument} from "./PlistDocument.js";
import {Endpoint} from "../network/Endpoint.js";
import ModelFile from "../ModelFile.js";
import ModelCall from "../ModelCall.js";
import ModelStringValue from "../ModelStringValue.js";

export interface Bundle {
    name: string;
    path: string;
    scope: Nullable<DataScope>;
    info: Nullable<ModelResource<any>>;
    xcprivacy: Nullable<ModelResource<any>>;
    files: ModelResource<any>[];
}


export interface IosDiscoverOpts extends NativeDiscoverOpts{

}

export default class IosAppAnalyzer implements IAppAnalyzer
{
    ctx:DexcaliburProject;
    state:AnalyzerState = null;
    package:string;
    tags: Record<string, Tag> = {};
    bundle:Bundle[] = [];
    framew:Bundle[] = [];
    processed:string[] = [];

    ml:ModelPackage[] = [];
    bundles:ModelPackage[] = [];


    private _pa:IosPackageAnalyzer;



    constructor(pContext:DexcaliburProject, pOptions:any = {}) {
        this.ctx = pContext;
        if(this.ctx!=null){
            this._pa = this.ctx.packageAnalyzer as IosPackageAnalyzer;
        }
    }

    /**
     * To perform extract some data/ prepare data before platform and app analysis
     *
     * It can be used to extract/parse resources from package
     *
     * @param pNewProject
     */
    async prepareFullScan(pNewProject:boolean, pScope:Nullable<DataScope> = null):Promise<boolean>{

        const basePath= this.ctx.getWorkspace().getAppDir();

        this.tags = {
            nsbundle: this.ctx.getTagManager().getTag("objc.bundle"),
            bundle: this.ctx.getTagManager().getTag("swift.bundle"),
            iabundle: this.ctx.getTagManager().getTag("ia.coreml"),
            codesign: this.ctx.getTagManager().getTag("data.type.codesign"),
            xcprivacy: this.ctx.getTagManager().getTag("data.type.xcprivacy"),
        };

        if(pNewProject){
            await this._importBundle(basePath, pScope);
            await this._importFrameworks(basePath, pScope);

        }
        return true;
    }

    /**
     * To modelise a Swift package from this folder
     *
     * @param pPath
     * @param pCtx
     */
    async _importSwiftBundle(pPath:string, pFile:string, pCtx:any):Promise<ModelPackage>{
        const pkg = new ModelPackage({
            name: "swift:"+pPath,
            sname: pFile,
            children: [],
            tags: [
                this.tags.bundle.getUUID()
            ]
        });

        return pkg;
    }
    /**
     *
     * @param pBase
     */
    async _importBundle(pBase:string, pScope:Nullable<DataScope> = null):Promise<void>{

        let dir:string;
        let bundle:Bundle; let info:string, pkg:ModelPackage;

        const meta = [['info','Info.plist'],['xcprivacy','PrivacyInfo.xcprivacy']];
        const appBase = this._pa._getAppPath(pBase);
        const dirs = _fs_.readdirSync(appBase);
        const appDir = this._pa._getAppBinName(pBase);
        const appPath = _path_.join(appBase,'..','..');



        for(let i=0; i<dirs.length; i++) {
            if(dirs[i].endsWith(".bundle")){
                dir = _path_.join(appBase, dirs[i]);


                bundle = {
                    name: dirs[i].substring(0, dirs[i].lastIndexOf(".bundle")),
                    path: `/Payload/${appDir}/${dirs[i]}`,
                    scope: pScope,
                    files: [],
                    info: null,
                    xcprivacy: null
                };

                for(let i=0;i<meta.length;i++){
                    info = _path_.join(dir, meta[i][1])
                    if(_fs_.existsSync( info)){
                        bundle[meta[i][0]] = await PlistHelper.parseFile(info, 0, this.ctx);
                        if(bundle[meta[i][0]]!=null){
                            (bundle[meta[i][0]] as ModelResource<any>).name = meta[i][1];
                            (bundle[meta[i][0]] as ModelResource<any>)._uid = info.substring(appPath.length);
                        }
                        this.processed.push(info)
                    }
                }



                pkg = new ModelPackage({
                    sname: bundle.name,
                    name: dirs[i],
                    children: [],
                    tags: [
                        this.tags.nsbundle.getUUID(),
                        this.tags.bundle.getUUID()
                    ]
                });

                if(bundle.xcprivacy!=null) pkg.childAppend(bundle.xcprivacy);
                if(bundle.info!=null) pkg.childAppend(bundle.info);

                if(pScope!=null) pkg.scope = pScope;


                await this._importResourceBundle(dir, bundle, pkg);

                this.bundles.push(pkg);

                this.ctx.getProjectDB().save(pkg);

            }

            /*else if(dirs[i] == "Frameworks"){
                await this._importFrameworks( _path_.join(appBase, dirs[i]));
            }*/
        }

    }

    async importMeta():Promise<boolean>{

        return true;
    }

    hasMissingMeta():boolean {
        return false;
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

    async scan(path:string):Promise<IosApplication>{
        return new IosApplication(this.ctx);
    }

    getDefaultTargetPath(): string {
        return this.ctx.getWorkspace().getAppDir();
    }

    getAppUid(): string {
        return this.package;
    }

    getPackageName():string {
        return this.package;
    }

    postScan() {

    }

    async extractAppIcons(): Promise<AppIcon[]> {
        const icons:AppIcon[] = [];

        return icons;
    }

    async performXrefAnalysis():Promise<any>{
        // todo
    }

    /**
     *
     */
    isReady():boolean {
        // check if IPA content is available in filesystem
        const base = this.ctx.getWorkspace().getAppDir();
        return _fs_.existsSync(_path_.join(base,'META-INF','com.apple.ZipMetadata.plist'));
    }

    async importToSlave():Promise<any> {
        // todo
        return true;
    }

    private async _importResourceBundle(pFolder: string, pInfo: Bundle, pBundleModel: ModelPackage) {

        let arch:NibArchive, res:any;

        const nibParser = new Nib.Parser();
        const vFiles:any[] = _glob_.default.sync(pFolder+"/**/*", {
            dot:true,
            nodir: false,
            //ignore: pSkipIf,
            absolute: true
        });

        let boards:Record<string, any> = {}, b:string, rsc:INode;

        for(let i=0; i<vFiles.length; i++) {
            if(vFiles[i].endsWith(".storyboardc")){
                b =_path_.basename(vFiles[i]);
                boards[b] = new ModelResource<any>({
                    name: b,
                    location: null//DataLocation
                });
            }
        }
    }

    private async _importFrameworks(pFolder: string, pScope:Nullable<DataScope> = null) {
        // todo
    }

    _extractTransportsInfo(pInfo:ModelResource<PlistDocument>):Endpoint[] {
        const list = Util.readValue(
            pInfo.value.data,
            "NSAppTransportSecurity.NSExceptionDomains"
        );
        const data:Endpoint[] =[];

        Object.keys(list).map(k=>{
            data.push(new Endpoint({
                host: k,
                allowInsecureHttp: (list[k].NSExceptionAllowsInsecureHTTPLoads),
                allowInsecureHttpTemp: (list[k].NSTemporaryExceptionAllowsInsecureHTTPLoads),
                minTLSVersion: (list[k].NSTemporaryExceptionMinimumTLSVersion),
                includeSubdomains: (list[k].NSIncludesSubdomains),
            }));
        });

        return data;
    }

    async getPathContext(vPath:string, vFile:string, vIsDir:boolean, vCtx:any):Promise<any> {

        let pkg:ModelPackage;
        vCtx.file = null;

        if(vIsDir==false){
            return await this.getFileContext(vPath, vFile, vCtx);
        }


        if(vCtx.payload==null) {
            vCtx.payload = this._pa._getAppPath(this.ctx.getWorkspace().getAppDir());
        }


        if(vCtx.tags==null) vCtx.tags = {};

        // if parent folder is Payload/ folder clean tags
        if(_path_.dirname(vPath)===vCtx.payload){
            vCtx.tags = {};
        }

        let sbomTag:Nullable<string> = null;

        if(vFile.endsWith(".bundle") && vIsDir){
            pkg = this.bundles.find(x => x.name == vFile);
            if(pkg!=null){
                vCtx.exclude = this.processed;
            }
        }else if(vFile.endsWith(".framework") && vIsDir){
            pkg= new ModelPackage({
                sname: vFile.substring(0, vFile.lastIndexOf(".framework")),
                name: vFile,
                tags: Object.values(vCtx.tags).map((x:Tag) => x.getUUID())
            });

            vCtx.exclude = this.processed;
        }else if(vFile.endsWith(".mlmodelc") && vIsDir){
            // CoreML
            pkg= new ModelPackage({
                sname: vFile.substring(0, vFile.lastIndexOf(".mlmodelc")),
                name: vFile,
                tags: [this.tags.iabundle.getUUID()]
            });

        }else if(vFile==="Frameworks" && vIsDir){
            if(vCtx.tags[this.tags.nsbundle.getUID()]==undefined){
                vCtx.tags[this.tags.nsbundle.getUID()]=this.tags.nsbundle;
            }
        }else if(vFile==="_CodeSignature" && vIsDir){
            pkg= new ModelPackage({
                sname: vFile,
                name: vFile,
                tags: [this.tags.codesign.getUUID()]
            });
            /*if(vCtx!=null && vCtx.self!=null){
                // check if bundle is a child of vCtx.self
                if(vCtx.self.__===ModelPackage.TYPE.getType() && ){

                }
            }*/
        }else if(vFile==="Watch" && vIsDir){
            // skip
            vCtx.excludeAll = true;
        }else if(vIsDir){
            const s = _path_.join(vPath,'Package.swift');
            if(_fs_.existsSync(s)){
                pkg = await this._importSwiftBundle(vPath, vFile, vCtx);
                sbomTag  = (this.tags.bundle as Tag).getUID();
            }
        }

        if(vCtx.tags[this.tags.nsbundle.getUID()]!=null){
            sbomTag  = this.tags.nsbundle.getUID();
        }

        if(pkg!=null){

            Object.values(vCtx.tags).map((t:Tag)=>{
                if(pkg.tags.indexOf(t.getUUID())==-1){
                    pkg.tags.push(t.getUUID());
                }
            });

            if(vCtx.self!=null){
                switch (vCtx.self.__){
                    case NodeInternalType.PACKAGE:
                        // update parent
                        (vCtx.self as ModelPackage).childAppend(pkg);
                        vCtx.self = await this.ctx.getProjectDB().save(
                            vCtx.self,null, ['name','sname','alias','children','tags']);

                        break;
                }
            }

            pkg = await this.ctx.getProjectDB().save(
                pkg,null,['name','sname','alias','children','tags']) as ModelPackage;

            if(sbomTag!=null){
                this.ctx.trigger({
                    type: "app.package.new",
                    data: {
                        pkg: pkg,
                        sbomType: sbomTag,
                    }
                });
            }


            // propagate tags
            vCtx.self = pkg;
        }


        return vCtx;
    }

    /**
     *
     * @param vPath
     * @param vFile
     * @param vCtx
     * @private
     */
    private async getFileContext(vPath: string, vFile: string, vCtx: any) {

        if(vFile.endsWith(".xcprivacy")){
            vCtx.file = { tags:[this.tags.xcprivacy.getUUID()] };
        }

        return vCtx;
    }

    /**
     * To perform extra discovery of native files in app packages
     *
     * @param {ModelFile} pFile
     * @param pExtra
     */
    async performNativeDiscover(pFile:ModelFile, pExtra:{ sysc:ModelCall[], strings:ModelStringValue[]},
                          pOptions:IosDiscoverOpts):Promise<any> {
        return true;
    }
}