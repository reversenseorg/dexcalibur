import {NodeType} from "./NodeType";
import {ModelBasicType, ModelObjectType} from "./ModelType";
import ModelFile from "./ModelFile";
import ModelCpuInstruction from "./ModelCpuInstruction";

export interface ModelFunctionList {
    [pAddress:string] :ModelFunction
}


const CMD_ATTR_MAPPING = {
    f_disass: ['instr']
}


import * as Log from './Logger';
import {ModelVariable} from "./ModelVariable";
import {ModelNativeRef} from "./ModelNativeRef";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const TO_JSON:Function = function (vSrc:any, vTarget:any, vInArray:boolean=false):any{

    return function(ppt:any){
        Logger.info("[ModelFunc] auto json : ",ppt,(vInArray?'true':'false'));


        if(!vInArray){
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
            else{
                vTarget[ppt] = vSrc[ppt]
            }
        }else{
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
 * Represents a function
 *
 * TODO : the ModelMethod class should extends ModelFunction class,
 * TODO : because a POO method is like a function specialization
 */
export class ModelFunction {

    _t:NodeType = NodeType.FUNC;

    sz:number = -1;

    /**
     * Count of basic blocks
     */
    bbs:number = -1;

    addr:number = -1;

    name: string = null;

    args:(ModelObjectType|ModelBasicType)[] = [];
    ret:(ModelObjectType|ModelBasicType) = null;

    src:ModelFile|string = null;

    regvars:ModelVariable[] = [];
    spvars:ModelVariable[] = [];
    bpvars:ModelVariable[] = [];

    xcref:ModelNativeRef[] = [];
    xdref:ModelNativeRef[] = [];
    cref:ModelNativeRef[] = [];
    dref:ModelNativeRef[] = [];

    stack?:number = -1;
    ctype:string = null;

    nbbs:number = -1;
    edges:number = -1;
    _r2_s:string = null;

    probing?:boolean;

    instr:ModelCpuInstruction[];

    // signature
    __s:string = null;

    _s:any = {};

    constructor(pConfig:any = null){

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];

    }

    /**
     * To get signature of the function
     *
     * @return {string} Signature of the method
     * @method
     * @since 1.0.0
     */
    signature():string{
        if(this.__s==null){
            if(this.src instanceof ModelFile){
                this.__s = this.src.getUID();
            }else if(this.src != null){
                this.__s = this.src;
            }else{
                this.__s = '<unknow>';
            }

            this.__s += ':'+this.name; //+':0x'+this.addr.toString(16);
        }

        return this.__s;
    }

    getSymbol():string {
        return this.name;
    }

    addDisass(pInstrs:ModelCpuInstruction[]):void {
        Logger.info("Set disassembled instr : ",JSON.stringify(pInstrs));
        this.instr = pInstrs;
    }

    getDisass():ModelCpuInstruction[] {
        return this.instr;
    }

    getAddr():number {
        return this.addr;
    }

    /*
    setDeclaringFile(pFile:ModelFile):void{
        this._s.df = pFile;
    }*/
    getDeclaringFile():ModelFile|string{
        return this.src;
    }

    appendStat( pName:string, pValue:any):void {
        this._s[pName] = pValue;
    }

    getStat(pName:string):any {
        return this._s[pName];
    }


    getSignature():string {
        return this.__s;
    }

    toJsonObjectWithCmd(pCommand:string[],fields:string[]=[],exclude:string[]=[]){
        let obj:any = this.toJsonObject(fields,exclude);

        for(let i=0; i<pCommand.length; i++){
            if( CMD_ATTR_MAPPING[pCommand[i]] != null){
                CMD_ATTR_MAPPING[pCommand[i]].map( vAttr => {
                    if(typeof this[vAttr] === 'object'){
                        if(this[vAttr].hasOwnProperty('toJsonObject')){
                            obj[vAttr] = this[vAttr].toJsonObject();
                        }else{
                            obj[vAttr] = this[vAttr];
                        }
                    }else{
                        obj[vAttr] = this[vAttr];
                    }
                })
            }
        }

        return obj;
    }

    toJsonObject(fields:string[]=[],exclude:string[]=[]){
        let obj:any = {};
        if(fields != null && fields.length>0){
            for(let i:number=0; i<fields.length; i++){
                if(this[fields[i]] != null && this[fields[i]].toJsonObject != null){
                    obj[fields[i]] = this[fields[i]].toJsonObject();
                }else{
                    obj[fields[i]] = this[fields[i]];
                }
            }
        }else{

            //Object.keys(this).map(TO_JSON(obj,this));

            for(let i in this){

                if(exclude.indexOf(i)>-1) continue;
                // if(fields != null && fields.indexOf(i)==-1) continue;

                switch(i){
                    case "regvars":
                    case "spvars":
                    case "bpvars":
                    case "instr":
                        obj[i] = [];
                        // @ts-ignore
                        (this[i] as any[]).map( (vVar:ModelVariable) => { if(vVar!=undefined) obj[i].push(vVar.toJsonObject()) })
                        break;
                    case "cref":
                    case "xcref":
                    case "dref":
                    case "xdref":
                        obj[i] = [];
                        // @ts-ignore
                        (this[i] as any[]).map( (vVar:ModelVariable) => {
                            if(vVar!=undefined)
                                obj[i].push(vVar)
                        })
                        break;
                    case "src":
                        if(this.src instanceof ModelFile)
                            { // @ts-ignore
                                obj.src = this.src.getUID();
                            }
                        else
                            obj.src = this.src;
                        break;
                    case "instr":
                        if(this.instr!=null && Array.isArray(this.instr)){ // @ts-ignore
                            obj.instr = [];
                            this.instr.map( vInstr => { obj.instr.push(vInstr.toJsonObject(['func'])) });
                        }
                        break;
                    default:
                        obj[i] = this[i]
                        break;
                }
            }

        }
        return obj;
    }
}
