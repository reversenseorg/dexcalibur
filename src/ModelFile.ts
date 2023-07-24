import * as _path_ from 'path';
import * as OS from 'os';
import {EncodedDataType} from "./FileTypes.js";
import ModelFileSection from "./ModelFileSection.js";
import DataScope from "./DataScope.js";
import ModelExecutableSection from "./ModelExecutableSection.js";
import {ModelFunction, ModelFunctionList} from "./ModelFunction.js";
import * as Log from './Logger.js';
import {IPersistent} from "./persist/orm/IPersistent.js";
import {DbDataType, DbKeyType, DbSerialize} from "./persist/orm/DbAbstraction.js";
import {NodeType} from "./persist/orm/NodeType.js";
import {NodeProperty} from "./persist/orm/NodeProperty.js";
import {NodeInternalType} from "./NodeInternalType.js";
import {ValidationRule} from "./Validator.js";
import {INode} from "./INode.js";
import {CryptoUtils} from "./CryptoUtils.js";
import {Tag} from "./tags/Tag.js";
import {CoreDebug} from "./core/CoreDebug.js";


let UIDS:string[]=[];


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
            (new NodeProperty("_r")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
            (new NodeProperty("_uid")).type(DbDataType.STRING).addValidationRule(ValidationRule.newRegexpAssert(/^[a-zA-Z0-9_]+:[a-f0-9]{32}$/)), //.key(DbKeyType.PRIMARY),
            (new NodeProperty("name")).type(DbDataType.STRING).def(null),
            (new NodeProperty("type")).type(DbDataType.STRING).def(null),
            (new NodeProperty("size")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("path")).type(DbDataType.STRING).def(null),
            (new NodeProperty("location")).type(DbDataType.STRING).def(null),
            (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON),
            (new NodeProperty("_d")).type(DbDataType.STRING).def('f'),

            (new NodeProperty("scope")).single(DataScope.TYPE),
                /*
                .type(DbDataType.STRING)
                .def(null)
                .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? (x.p as DataScope).getInternalName() : null )})
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ?  x.p : null )}),*/
            // (x.ctx as DexcaliburProject).getDataAnalyzer().getScope(x.p)

            (new NodeProperty("sections")).volatile().multiple(ModelFileSection.TYPE).type(DbDataType.STRING).serialize(DbSerialize.JSON),

            (new NodeProperty("__p")).volatile().type(DbDataType.STRING).serialize(DbSerialize.JSON),
            (new NodeProperty("__t")).volatile().type(DbDataType.STRING).serialize(DbSerialize.JSON),
            (new NodeProperty("f_list")).volatile()
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
    private _r:string = null;

    name: string = null;
    type: string = null;
    size: number = -1;
    path: string = null;
    location: string = null;
    tags:number[] = [];
    //trueFile:boolean = false;

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


    sections: ModelExecutableSection[] = [];
    f_list: ModelFunctionList = {};

    /**
     * Additional properties/link for this node
     */
    __p: any = {};
    __t: any[] = [];



    /**
     *
     * @param {Object} pConfig
     * @constructor
     */
    constructor(pConfig: any = null) {

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
    hasRelDir(pPath:string):boolean {
        return this.hasDir(pPath,true);
    }

    hasDir( pPath:string, pRelative:boolean = false):boolean {
        if(pRelative){
            return _path_.dirname(this._r)==pPath;
        }else{
            return _path_.dirname(this.path)==pPath;
        }
    }

    generateUID(): void {
        this._uid = this.scope.getInternalName()+':'+CryptoUtils.md5(this._r);
        //this._uid = CryptoUtils.md5(this.path);
        //do{ this._uid=_md5( Util.randString(6, Util.ALPHANUM) }while( UIDS.indexOf(this._uid)>-1);
    }

    getSize(): number {
        return this.size;
    }

    getPath(): string {
        return this.path;
    }

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
    appendSection(pFileSection: ModelFileSection): void {
        if (this.__p.m == null) this.__p.m = [];

        this.__p.m.push(pFileSection);
    }

    /**
     * To get all sections
     *
     * @return {ModelFileSection[]} data fragment contained into the file
     * @method
     * @since 1.0.0
     */
    getSections(): ModelFileSection[] {
        return this.__p.m;
    }


    isExecutable(): boolean {
        return (['ELF'].indexOf(this.type) > -1);
    }

    toJsonObject(pOpts: any = {}) {
        let o: any = new Object();


        if(pOpts!=null && pOpts.hasOwnProperty('cmd')) {
            o.__p = {};

            //TO_JSON( this.__p, o.__p)
            pOpts.cmd.split(':').map(
                (vCmd:string)=>{
                  switch(vCmd){
                      case "sections":
                          o.__p.sections = [];
                          if(this.__p.sections!=null)
                            this.__p.sections.map( vSec => { o.__p.sections.push(vSec.toJsonObject() )});
                          break;
                      case "f_list":
                          o.__p.f_list = {};
                          if(this.__p.f_list!=null)
                            for(let addr in this.__p.f_list)
                                o.__p.f_list[addr] = this.__p.f_list[addr].toJsonObject();
                          break;
                  }
                }
            );
        }


        if(o.__p==null) o.__p = {};
        for (let i in this) {
            switch (i) {
                case "sections":
                    o.sections = [];
                    if(this.sections!=null)
                        this.sections.map( vSec => { o.sections.push(vSec.toJsonObject() )});
                    break;
                case "f_list":
                    o.f_list = {};
                    if(this.f_list!=null)
                        for(const addr in this.f_list)
                            o.f_list[addr] = this.f_list[addr].toJsonObject();
                    break;
                case '__p':
                    o.__p = {};
                    for (let k in this.__p) {
                        switch (k) {
                            case "sections":
                                o.__p.sections = [];
                                if(this.__p.sections!=null)
                                    this.__p.sections.map( vSec => { o.__p.sections.push(vSec.toJsonObject() )});
                                break;
                            case "f_list":
                                o.__p.f_list = {};
                                if(this.__p.f_list!=null)
                                    for(let addr in this.__p.f_list)
                                        o.__p.f_list[addr] = this.__p.f_list[addr].toJsonObject();
                                break;
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
        this.__p.sections = pSection;
        return this.__p.sections.length;
    }

    hasFuncs(): boolean {
        return this.__p.hasOwnProperty('f_list');
    }

    appendFunctions(pFuncs: ModelFunction[]): void {
        try {
            //Logger.info("R2>Functions extracted (1) ");
            //Logger.info("R2 Functions extracted : ",JSON.stringify(pFuncs));

            if (this.__p.f_list == undefined)
                this.__p.f_list = {};

            pFuncs.map(vFn => {
                vFn.signature();
                this.__p.f_list["0x" + vFn.getAddr().toString(16)] = vFn;
            });
        } catch (err) {
            Logger.error("[ModelFile] " + err.message)
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

    addTag(vTag:Tag){
        const uuid = vTag.getUUID();
        if(this.tags.indexOf(uuid)==-1)
            this.tags.push(uuid);
    }
}

ModelFile.TYPE.builder(ModelFile);