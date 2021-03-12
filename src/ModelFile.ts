
import * as _path_ from 'path';
import * as _md5_ from 'md5';
import {EncodedDataType} from "./FileTypes";
import ModelFileSection from "./ModelFileSection";
import Util from "./Utils";
import DataScope from "./DataScope";
import ModelExecutableSection from "./ModelExecutableSection";
import {ModelFunction, ModelFunctionList} from "./ModelFunction";


let UIDS:string[]=[];


import * as Log from './Logger';
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



/**
 * Represent a file which exists into Application data,
 * at rest or at runtime
 *
 * @class
 */
export default class ModelFile
{
    _uid:string = null;
    _d:string = 'f';

    name:string = null;
    type:string = null;
    size:number = -1;
    path:string = null;
    location:string = null;
    //trueFile:boolean = false;

    scope:DataScope = null;
    // scope (app package, app data, device file, ...)


    sections:ModelExecutableSection[] = [];
    f_list:ModelFunctionList = {};

    /**
     * Additional properties/link for this node
     */
    __p:any = {};
    __t:any[] = [];


    /**
     *
     * @param {Object} pConfig
     * @constructor
     */
    constructor(pConfig:any=null){

        //this.trueFile = false;

        if(pConfig != null){
            for(let i in pConfig){

                this[i] = pConfig[i];
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

            if(this._uid==null && this.scope!==null &&  this.path!=null){
                this.generateUID();
            }
        }
    }

    getUID():string {
        return this._uid;
    }

    setScope(pScope:DataScope):void {
        this.scope = pScope;
        this.generateUID();
    }

    generateUID():void {
        this._uid = _md5_(this.path);

        //do{ this._uid=_md5( Util.randString(6, Util.ALPHANUM) }while( UIDS.indexOf(this._uid)>-1);
    }

    getSize():number{
        return this.size;
    }

    getPath():string{
        return this.path;
    }

    getName():string{
        return this.name;
    }

    getType():EncodedDataType|string{
        return this.type;
    }

    hasExt(ext:string):boolean{
        return (_path_.extname(this.path)==ext); //   ext( this.type != null)&&(this.type.ext==ext);
    }

    /**
     * @deprecated
     * @param mime
     */
    hasMIME(mime:string):boolean{
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
    appendSection(pFileSection:ModelFileSection):void {
        if(this.__p.m==null) this.__p.m = [];

        this.__p.m.push(pFileSection);
    }

    /**
     * To get all sections
     *
     * @return {ModelFileSection[]} data fragment contained into the file
     * @method
     * @since 1.0.0
     */
    getSections():ModelFileSection[] {
        return this.__p.m;
    }

    static unserialize(o):ModelFile {
        return new ModelFile(o);
    }

    isExecutable():boolean {
        return (['ELF'].indexOf(this.type)>-1);
    }

    toJsonObject(pOpts:any= {}){
        let o:any = new Object();

        /*if(pOpts.cmd!=null) {
            o.__p = {};

            //TO_JSON( this.__p, o.__p)
            pOpts.cmd.split(':').map(
                (vCmd:string)=>{
                  switch(vCmd){
                      case "sections":
                          o.__p.sections = [];
                          this.__p.sections.map( vSec => { o.__p.sections.push(vSec.toJsonObject() )});
                          break;
                      case "f_list":
                          o.__p.f_list = {};
                          for(let addr in this.__p.f_list) o.__p.f_list[addr] = this.__p.f_list[addr].toJsonObject();
                          break;
                  }
                }
            );
        }*/

        Logger.info(JSON.stringify(this.__p.f_list));

        for(let i in this){
            switch(i){
                case '__p':
                    o.__p = {};
                    for(let k in this.__p){
                        switch(k){
                            case "sections":
                                o.__p.sections = [];
                                this.__p.sections.map( (sec:ModelExecutableSection) => {
                                    o.__p.sections.push( sec.toJsonObject() );
                                });
                                break;
                            case "f_list":
                                o.__p.f_list = {};
                                for(let i  in this.__p.f_list){
                                    o.__p.f_list[i] = this.__p.f_list[i].toJsonObject();
                                }
                                break;
                            default:
                                if(typeof this.__p[k]=='object'){
                                    if(typeof this.__p[k]['toJsonObject'] === 'function'){
                                        o.__p[k] = this.__p[k].toJsonObject();
                                    }else{
                                        o.__p[k] = this.__p[k];
                                    }
                                }else
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

        return o;
    }



    setProgramSection(pSection:ModelExecutableSection[]):number{
        this.__p.sections = pSection;
        return this.__p.sections.length;
    }

    hasFuncs():boolean {
        return this.__p.hasOwnProperty('f_list');
    }

    appendFunctions(pFuncs:ModelFunction[]):void {
        try{
            //Logger.info("R2>Functions extracted (1) ");
            //Logger.info("R2 Functions extracted : ",JSON.stringify(pFuncs));

            if(this.__p.f_list==undefined)
                this.__p.f_list = {};

            pFuncs.map( vFn => {
                vFn.signature();
                this.__p.f_list["0x"+vFn.getAddr().toString(16)] = vFn;
            });
        }catch(err){
            Logger.error("[ModelFile] "+err.message)
        }

    }

    /**
     * To get all native function declared into the file
     */
    getFunctions():ModelFunction[] {
        //return Object.values(this.fn_list);
        return Object.values(this.__p.f_list);
    }

    getFuncAt(pAddress:number|string):ModelFunction {
        if(!this.hasFuncs() || !this.__p.f_list.hasOwnProperty(pAddress)){
            throw new Error("Function not found at ["+pAddress+"]");
        }

        return this.__p.f_list[pAddress];
    }
}
