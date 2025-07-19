import * as _path_ from 'path';
import {EncodedDataType} from "./FileTypes.js";
import ModelFileSection from "./ModelFileSection.js";
import DataScope from "./DataScope.js";
import ModelExecutableSection, {ModelExecutableSectionOptions} from "./ModelExecutableSection.js";
import {ModelFunction, ModelFunctionList} from "./ModelFunction.js";
import * as Log from './Logger.js';
import {IPersistent} from "./persist/orm/IPersistent.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    SerializeOptions,
    Tag,
    ValidationRule
} from "@dexcalibur/dexcalibur-orm";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CryptoUtils} from "./CryptoUtils.js";

import {CoreDebug} from "./core/CoreDebug.js";
import {SecurityZone} from "./security/SecurityZone.js";
import {Nullable} from "./core/IStringIndex.js";
import {Metadata, MetadataType} from "./audit/common/Metadata.js";
import {MetadataTopic} from "./audit/common/ControlAssessment.js";




let Logger:Log.Logger = Log.newLogger() as Log.Logger;


const TO_JSON:Function = function (vSrc:any, vTarget:any, vInArray:boolean=false):any{

    return function(ppt:any){
        Logger.info("auto json")


        if(!vInArray){

            Logger.info("[MODEL FILE::TO_JSON] "+ppt);
            if(vSrc[ppt]==undefined) {
                Logger.info('error : ppt undefined : ', ppt, JSON.stringify(vSrc));
                return;
            }

            if(Array.isArray(vSrc[ppt])){
                vTarget[ppt] = [];
                vSrc[ppt].map(TO_JSON(vSrc[ppt],vTarget[ppt],true));
            }
            else if(vSrc[ppt].toJsonObject !== undefined){
                vTarget[ppt] = vSrc[ppt].toJsonObject();
            }
            else if(typeof vSrc[ppt] === 'object'){
                vTarget[ppt] = {}
                for(let i in vSrc[ppt]){
                    if(typeof vSrc[ppt][i] === 'object'){

                    }
                }
            }
            else{
                vTarget[ppt] = vSrc[ppt]
            }
        }else{

            Logger.info("[MODEL FILE::TO_JSON] Exporting ",ppt.toJsonObject,JSON.stringify(ppt));
            if(Array.isArray(ppt)){
                let p:any[]=[];
                ppt.map(TO_JSON(ppt,p,true));
                vTarget.push(p);
            }
            else if(ppt.toJsonObject !== undefined){
                //Logger.info(ppt.name);
                //Logger.info(ppt.toJsonObject());
                vTarget.push(ppt.toJsonObject());
            }
            else{
                vTarget.push(ppt);
            }
        }

    }
};

export enum ModelFileType {
    FILE = 'f',
    FOLDER = 'd'
}

export interface ModelFileOptions {
    _r?:string;
    _uid?:string;
    name?:string;
    type?:string;
    size?:number;
    path?:string;
    location?:string;
    tags?:number[];
    _d?:string;
    scope?:DataScope;
    sections?:ModelExecutableSection[];
    chunks?:ModelFileSection[];
    sectionsOpts?:ModelExecutableSectionOptions[];
    __p?:any;
    __t?:any[];
    f_list?:ModelFunctionList;
    entropy?:number
}


/**
 * Represent a file which exists into Application data,
 * at rest or at runtime
 *
 * @class
 */
export default class ModelFile implements INode,IPersistent {

    static TYPE:NodeType = new NodeType(
        "files",
        NodeInternalType.FILE,
        [
            (new NodeProperty("_r")).type(DbDataType.STRING), //.key(DbKeyType.COMPOSITE,1), // path relative to scope root
            (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY).addValidationRule(ValidationRule.newRegexpAssert(/^[a-zA-Z0-9_]+:[a-f0-9]{32}$/)), //.key(DbKeyType.PRIMARY),
            (new NodeProperty("name")).type(DbDataType.STRING).def(null),
            (new NodeProperty("type")).type(DbDataType.STRING).def(null),
            (new NodeProperty("size")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("entropy")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("path")).type(DbDataType.STRING).def(null),
            (new NodeProperty("location")).type(DbDataType.STRING).def(null),
            (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
            (new NodeProperty("meta")).type(DbDataType.STRING).def([]),
            (new NodeProperty("_d")).type(DbDataType.STRING).def('f'),
            (new NodeProperty("data")).type(DbDataType.STRING).def({}),
            (new NodeProperty("scope")).single(DataScope.TYPE)/*.key(DbKeyType.COMPOSITE,0)*/.def("PKG"),


            (new NodeProperty("sections"))
                .type(DbDataType.STRING)
                .def([])
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return null;

                    const sect:any[] = [];
                    for(let i=0; i<x.p.length; i++){
                        sect.push(x.p[i].toJsonObject());
                    }
                    return sect;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p==null) return [];

                    const sect:ModelExecutableSection[] = [];
                    let s:ModelFileSection;
                    for(let i=0; i<x.p.length; i++){
                        sect.push(new ModelExecutableSection(x.p));
                    }
                    return sect;

                 }),//.multiple(ModelFileSection.TYPE).type(DbDataType.STRING),
            (new NodeProperty("chunks"))
                .type(DbDataType.STRING)
                .def([])
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return null;
                    const sect:any[] = [];
                    for(let i=0; i<x.p.length; i++){
                        sect.push(x.p[i].toJsonObject());
                    }
                    return sect;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p==null) return [];

                    const chks:ModelFileSection[] = [];
                    let s:ModelFileSection;
                    for(let i=0; i<x.p.length; i++){
                        s = new ModelFileSection(x.p[i].o,x.p[i].t)
                        s.l = x.p[i].l;
                        chks.push(s);
                    }
                    return chks;

                }),//.multiple(ModelFileSection.TYPE).type(DbDataType.STRING),

            (new NodeProperty("__p"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return {};

                    let p:any = {};

                    for(let k in x.p){
                        switch (k){
                            case "f_list":
                            case "m":
                            case "sections":
                                /*ignore*/
                                break;
                            case "tags":
                            default:
                                p[k] = x.p[k];
                                break;
                        }
                    }

                    return p;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p==null) return {};

                    let p:any = {};
                    for(let k in x.p){
                        switch (k){
                            case "f_list": /*ignore*/ break;
                            case "m":
                                //p[k] = x.p[k].map((s:any) => new ModelFileSection(s.o,s.t));
                                break;
                            case "sections":
                                //p[k] = x.p[k].map((s:any) => new ModelExecutableSection(s));
                                break;
                            case "tags":
                            default:
                                p[k] = x.p[k];
                                break;
                        }
                    }
                }), //.serialize(DbSerialize.JSON),
            (new NodeProperty("__t")).type(DbDataType.STRING).def(null), //.serialize(DbSerialize.JSON),
            (new NodeProperty("f_list")).type(DbDataType.STRING).def(null)
    ]);


    __:NodeInternalType = NodeInternalType.FILE;

    _uid: string = null;

    /**
     * Object type
     * @type {string}
     * @field
     * @public
     */
    _d: string = ModelFileType.FILE;

    /**
     * Relative path to Scope's base path
     * @type {string}
     * @field
     * @private
     */
    _r:string = null;

    name: string = null;
    type: string = null;
    size: number = -1;
    path: string = null;
    location: string = null;
    tags:number[] = [];
    //trueFile:boolean = false;

    meta:Metadata[] = [];

    /**
     * Scope including this file.
     *
     * Some commons scopes are package, app data folder, device FS, folders where dex buffers are downloaded, ...
     *
     * @type {DataScope}
     * @field
     */
    scope: DataScope = null;
    // scope (app package, app data, device file, ...)


    chunks:ModelFileSection[] = [];
    sections: ModelExecutableSection[] = [];

    f_list: ModelFunctionList = {};

    /**
     * Additional properties/link for this node
     */
    __p: any = {};
    __t: any[] = [];

    entropy:number = -1;

    data:any = null;

    /**
     *
     * @param {Object} pConfig
     * @constructor
     */
    constructor(pConfig:Nullable<ModelFileOptions> = null) {

        //this.trueFile = false;

        if (pConfig != null) {
            for (let i in pConfig) {
                switch (i){
                    case 'path':
                        this.path = _path_.normalize(pConfig.path);
                        break;
                    default:
                        this[i] = pConfig[i];
                        break;
                }

                /*
                if(i!=="type")
                    this[i] = pConfig[i];
                else{
                    if(pConfig.type instanceof EncodedDataType)
                        this.type = pConfig.type;
                    else
                        this.type = new EncodedDataType(pConfig.type);
                }*/
            }

            if (this._uid == null && this.scope != null) {
                if(this._r != null){
                    this.generateUID();
                }else{
                    // update UID
                    this.setScope(this.scope);
                }

            }
        }
    }

    tagAs(pTag:string){
        if(!this.__p.hasOwnProperty('tag')) this.__p.tag = [];
        if(this.__p.tag.indexOf(pTag)==-1){
            this.__p.tag.push(pTag);
        }
    }

    getUID(): string {
        return this._uid;
    }

    /**
     * To compute the path relative to the scope according to final context
     * (device or host).
     *
     * Because the OS of a device can be linux-based and host Windows
     *
     *
     * @param pBasePath
     * @private
     */
    private _computePathRelativeToScope(): string {
        /*const sp = _path_.normalize(this.scope.getBasePath());
        if(OS.platform()==='win32'){
            const rp = this.path.substr(sp.length);
            rp.split(_path_.sep);
            if(this.scope.)
            return rp.split(_path_.sep).join('')

        }else{*/
            return this.path.substr(this.scope.getBasePath().length);
       // }
    }

    setScope(pScope: DataScope): void {
        this.scope = pScope;
        this._r = this._computePathRelativeToScope(); // path.substr( pScope.getBasePath().length);
        this.generateUID();
    }

    getScope():DataScope {
        return this.scope;
    }

    /**
     * Alias to {ModelFile.hasDir()} with pChRootDataScope = TRUE
     *
     * To check if the file represented by this instance has pPath
     * as parent directory. The data scope is the new root folder.
     *
     *
     *
     * @param {string} pPath Path of parent directory to check
     */
    hasRelDir(pPath:string):boolean {
        return this.hasDir(pPath,true);
    }

    /**
     * To check if the file respresented by this instance has pPath
     * as parent directory
     *
     * @param {string} pPath Path of parent directory to check
     * @param {boolean} pChRootDataScope Default FALSE. TRUE to change root folder to DataScope root
     * @return {boolean} TRUE if the cuurent file has pPath as parent directory
     * @method
     */
    hasDir( pPath:string, pChRootDataScope:boolean = false):boolean {
        let dirname = this.path;
        if(pChRootDataScope){
            dirname = _path_.dirname(this._r);
        }

        if(dirname==='.') dirname = _path_.sep;

        return (dirname==pPath);
    }

    generateUID(): void {
        this._uid = this.scope.getInternalName()+':'+CryptoUtils.md5(this._r);
    }

    getSize(): number {
        return this.size;
    }

    getPath(): string {
        return this.path;
    }

    /**
     * To get the path of the file inside Dexcalibur workspace
     *
     * @return {string} Absolute path
     * @method
     */
    getRealPath():string {
        return this.path;
    }

    getRelativePath():string {
        return this._r;
    }

    getName(): string {
        return this.name;
    }

    getType(): EncodedDataType | string {
        return this.type;
    }

    hasExt(ext: string): boolean {
        return (_path_.extname(this.path) == ext); //   ext( this.type != null)&&(this.type.ext==ext);
    }

    /**
     * @deprecated
     * @param mime
     */
    hasMIME(mime: string): boolean {
        throw new Error("hadMIME() is deprecated");
//        return (this.type != null)&&(this.type.mime==mime);
    }

    /**
     * To append a section to the list of section
     *
     * A section is a data range containing data of the same format
     *
     * @param pFileSection
     */
    appendChunk(pFileSection: ModelFileSection): void {
        if (this.chunks == null) this.chunks = [];

        this.chunks.push(pFileSection);
    }

    /**
     * To get all sections
     *
     * @return {ModelFileSection[]} data fragment contained into the file
     * @method
     * @since 1.0.0
     */
    getChunks(): ModelFileSection[] {
        return this.chunks;
    }

    /**
     * To get all sections
     *
     * @return {ModelFileSection[]} data fragment contained into the file
     * @method
     * @since 1.0.0
     */
    getSections(): ModelExecutableSection[] {
        return this.sections;
    }


    isExecutable(): boolean {
        return (['ELF'].indexOf(this.type) > -1);
    }

    /**
     *
     * @param pOpts
     */
    toJsonObject(pOpts: SerializeOptions = {extra:{ }}, pSecurityZone = SecurityZone.PRIVATE) {
        let o: any = new Object();


        if(pOpts!=null && pOpts.extra!=null && pOpts.extra.hasOwnProperty('cmd')) {

            o.__p = {};

            //TO_JSON( this.__p, o.__p)
            pOpts.extra.cmd.split(':').map(
                (vCmd:string)=>{
                  switch(vCmd){
                      case "sections":
                          o.__p.sections = [];
                          if(this.sections!=null)
                            this.sections.map((vSec:any) => {
                                if(vSec!=null) o.__p.sections.push(vSec.toJsonObject() )
                            });
                          break;
                      case "f_list":
                          o.__p.f_list = {};
                          if(this.__p!=null && this.__p.f_list!=null){
                              for(let addr in this.__p.f_list)
                                  o.__p.f_list[addr] = this.__p.f_list[addr].toJsonObject();
                          }

                          break;
                  }
                }
            );
        }


        if(o.__p==null) o.__p = {};
        for (let i in this) {
            switch (i) {
                case "path":
                    if(pSecurityZone==SecurityZone.PRIVATE){
                        o.path = this.path;
                    }
                    break;
                case "sections":
                    o.sections = [];
                    if(this.sections!=null) {
                        this.sections.map(vSec => {
                            if (vSec != null){
                                o.sections.push(vSec.toJsonObject())
                            }
                        });
                    }
                    break;
                case "chunks":
                    o.chunks = [];
                    if(this.chunks!=null) {
                        this.chunks.map(vSec => {
                            if (vSec != null){
                                o.chunks.push(vSec.toJsonObject())
                            }
                        });
                    }
                    break;
                case "f_list":
                    /*o.f_list = {};
                    if(this.f_list!=null)
                        for(const addr in this.f_list)
                            o.f_list[addr] = this.f_list[addr].toJsonObject();*/
                    break;
                case '__p':
                    o.__p = {};
                    if(this.__p==null) continue;
                    for (let k in this.__p) {
                        switch (k) {
                            /*case "sections":
                                o.__p.sections = [];
                                if(this.__p.sections!=null)
                                    this.__p.sections.map( (vSec) => {
                                            if(vSec!=null) o.__p.sections.push(vSec.toJsonObject() )
                                    });
                                break;
                            case "f_list":
                                o.__p.f_list = {};
                                if(this.__p.f_list!=null)
                                    for(let addr in this.__p.f_list)
                                        o.__p.f_list[addr] = this.__p.f_list[addr].toJsonObject();
                                break;*/
                            default:
                                if (typeof this.__p[k] == 'object') {
                                    if (typeof this.__p[k]['toJsonObject'] === 'function') {
                                        o.__p[k] = this.__p[k].toJsonObject();
                                    } else {
                                        o.__p[k] = this.__p[k];
                                    }
                                } else
                                    o.__p[k] = this.__p[k];
                                break;
                        }

                    }
                    break;
                case '__t':
                default:
                    o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "ModelFile");

        return o;
    }


    setProgramSection(pSection: ModelExecutableSection[]): number {
        this.sections = pSection;
        return this.sections.length;
    }

    hasFuncs(): boolean {
        return this.__p.hasOwnProperty('f_list');
    }

    appendFunctions(pFuncs: ModelFunction[]): void {
        try {
            //Logger.info("R2>Functions extracted (1) ");
            //Logger.info("R2 Functions extracted : ",JSON.stringify(pFuncs));

            if(this.__p == null){
                this.__p = {};
            }

            if (this.__p.f_list == null){
                this.__p.f_list = {};
            }

            pFuncs.map(vFn => {
                vFn.signature();
                this.__p.f_list["0x" + vFn.getAddr().toString(16)] = vFn;
            });
        } catch (err) {
            Logger.error("[ModelFile] appendFunction : " + err.message)
        }

    }

    /**
     * To get all native function declared into the file
     */
    getFunctions(): ModelFunction[] {
        //return Object.values(this.fn_list);
        return Object.values(this.__p.f_list);
    }

    getFuncAt(pAddress: number | string): ModelFunction {
        if (!this.hasFuncs() || !this.__p.f_list.hasOwnProperty(pAddress)) {
            throw new Error("Function not found at [" + pAddress + "]");
        }

        return this.__p.f_list[pAddress];
    }


    isSerializable(obj) {
        return true; //(obj.serialize !=null) && (typeof obj.serialize==='function');
    }

    /**
     *
     * @param pObj
     */
    static serialize(pObj: ModelFile): any {
        return pObj.toJsonObject();
    }


    /**
     *
     * @param pObj
     */
    static unserialize(pData: any): ModelFile {
        return new ModelFile(pData);
    }


    hasScope(pScope: DataScope) {
        return (pScope.equals(this.scope));
    }


    /**
     * To clone the current instance, and patch
     * @param {any} pData Patches
     *
     */
    clone(pData:any = null):ModelFile {
        let o:ModelFile = new ModelFile(this);

        if(pData!=null)
            for(let i in pData) o[i] = pData[i];

        return o;
    }

    /**
     * To tag a file
     *
     * Quietly ignore missing/null tag
     *
     * @param vTag
     */
    addTag(vTag:Tag){
        if(vTag==null) return;

        const uuid = vTag.getUUID();
        if(this.tags.indexOf(uuid)==-1)
            this.tags.push(uuid);
    }

    addMeta(pType:MetadataType, pKey:MetadataTopic, pValue:any):void {
        this.meta.push({
            type: pType,
            key: pKey,
            value: pValue
        });
    }

    removeMeta(pKey:MetadataTopic):void {
        this.meta = this.meta.filter(x => (x.key!=pKey));
    }

    getMetaByTopic(pKey:MetadataTopic):Nullable<Metadata> {
        return this.meta.find((x)=> x.key===pKey);
    }

    getEntropy():number {
        return this.entropy;
    }
}

ModelFile.TYPE.builder(ModelFile);