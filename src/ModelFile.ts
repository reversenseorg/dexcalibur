
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


const TO_JSON:Function = function (vSrc:any, vTarget:any):any{
    return function(ppt:string){
        Logger.info("auto json")

        if(vSrc[ppt]==undefined){
            Logger.info('error : ppt undefined : ',ppt);
            return;
        }

        if(Array.isArray(vSrc[ppt])){
            vTarget[ppt] = [];
            vSrc[ppt].map(TO_JSON(vSrc[ppt],vTarget[ppt]));
        }
        else if(vSrc[ppt].toJsonObject !== undefined){
            vTarget[ppt] = vSrc[ppt].toJsonObject();
        }
        else{
            vTarget[ppt] = vSrc[ppt]
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
    fn_list:ModelFunctionList = {};

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

        if(pOpts.cmd!=null) {
            o.__p = {};

            pOpts.cmd.split(':').map(
                TO_JSON( this.__p, o.__p)
            );
        } else{
            o.__p.sections = [];
            this.__p.sections.map( (sec:ModelExecutableSection) => {
                o.__p.sections.push( sec.toJsonObject() );
            });

            o.__p.fn_list = {};
            for(let i  in this.__p.fn_list){
                o.__p.fn_list[i] = this.fn_list[i].toJsonObject();
            }
        }

        for(let i in this){
            switch(i){
                case '__p':
                    o.__p = {};
                    for(let k in this.__p){
                        if(typeof this.__p[k]=='object'){
                            if(typeof this.__p[k]['toJsonObject'] === 'function'){
                                o.__p[k] = this.__p[k].toJsonObject();
                            }else{
                                o.__p[k] = this.__p[k];
                            }
                        }else
                            o.__p[k] = this.__p[k];
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



    setProgramSection(pSection:ModelExecutableSection[]):void{
        this.__p.sections = pSection;
    }

    hasFuncs():boolean {
        return this.__p.hasOwnProperty('fn_list');
    }

    addFunc(pAddress:number, pFunc:ModelFunction):void {
        //this.fn_list["0x"+pAddress.toString(16)] = pFunc;
        this.__p.fn_list["0x"+pAddress.toString(16)] = pFunc;
        pFunc.setDeclaringFile(this);
    }

    appendFunctions(pFuncs:ModelFunction[]):void {
        if(!this.hasFuncs())
            this.__p.fn_list = {};

        pFuncs.map( vFn => {
            this.__p.fn_list["0x"+vFn.getAddr().toString(16)] = vFn;
        });
    }

    /**
     * To get all native function declared into the file
     */
    getFunctions():ModelFunction[] {
        //return Object.values(this.fn_list);
        return Object.values(this.__p.fn_list);
    }

    getFuncAt(pAddress:number|string):ModelFunction {
        if(!this.hasFuncs() || !this.__p.fn_list.hasOwnProperty(pAddress)){
            throw new Error("Function not found at ["+pAddress+"]");
        }

        return this.__p.fn_list[pAddress];
    }
}
