import {NodeInternalType} from "./NodeInternalType";
import {ModelBasicType, ModelObjectType} from "./ModelType";
import ModelFile from "./ModelFile";
import ModelCpuInstruction from "./ModelCpuInstruction";

export interface ModelFunctionList {
    [pAddress:string] :ModelFunction
}



import * as Log from './Logger';
import {ModelVariable} from "./ModelVariable";
import {ModelNativeRef} from "./ModelNativeRef";
import {NodeType} from "./persist/orm/NodeType";
import {NodeProperty, NodePropertyState} from "./persist/orm/NodeProperty";
import {DbDataType, DbKeyType, DbSerialize} from "./persist/orm/DbAbstraction";
import ModelFileSection from "./ModelFileSection";
import {IPersistent} from "./persist/orm/IPersistent";
import {NativeAnalyzerCommands} from "./analyzer/NativeAnalyzerCommands";
import {INode} from "./INode";
import {DataSourceHelper} from "./DataSourceHelper";
import {DataType} from "./types/DataType";
import NativeFunctionHook from "./hook/NativeFunctionHook";
import {AbstractHook} from "./hook/AbstractHook";
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
export class ModelFunction implements INode, IPersistent {

    static CMD_MAPPING = {
        [NativeAnalyzerCommands.FUNC_CMD.DISASS]: ['instr']
    };

    static TYPE:NodeType = (new NodeType(
        "func_native",
        NodeInternalType.FUNC,
        [
            (new NodeProperty("__s")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
            //(new NodeProperty("_uid")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
            (new NodeProperty("name")).type(DbDataType.STRING).def(null),
            (new NodeProperty("symbol")).type(DbDataType.STRING).def(null),
            (new NodeProperty("alias")).type(DbDataType.STRING).def(null),
            (new NodeProperty("nbbs")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("addr")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("edges")).type(DbDataType.INTEGER).def(0),
            (new NodeProperty("src")).single(ModelFile.TYPE),
            (new NodeProperty("stack")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("sz")).type(DbDataType.INTEGER).def(-1),

            (new NodeProperty("regvars"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : null)})
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)}),

            (new NodeProperty("spvars"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : null)})
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)}),

            (new NodeProperty("cref"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : null)})
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)}),

            (new NodeProperty("dref"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : null)})
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)}),

            (new NodeProperty("xcref"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : null)})
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)}),

            (new NodeProperty("xdref"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : null)})
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)}),


            (new NodeProperty("ctype")).type(DbDataType.STRING)
        ])).dataSource(DataSourceHelper.MEM, "func");

    __:NodeInternalType = NodeInternalType.FUNC;

    sz:number = -1;

    /**
     * Count of basic blocks
     */
    bbs:number = -1;

    addr:number = -1;

    name: string = null;

    symbol:string = null;

    /**
     * Same as regvars
     */
    args:ModelVariable[] = [];
    ret:ModelVariable = null;

    src:ModelFile|string = null;

    /**
     *
     */
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
    alias:string = null;
    hooks:any[] = []

    // signature
    __s:string = null;

    _s:any = {};

    tags:any = []; // TODO

    constructor(pConfig:any = null){

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];

    }

    setReturn( pType:ModelVariable){
        this.ret = pType;
    }

    getReturn():ModelVariable {
        return this.ret;
    }

    setParams( pVars:ModelVariable[]){
        this.args = pVars;
    }

    getParams():ModelVariable[] {
        return this.args;
    }

    getUID():string {
        return this.signature();
    }

    /**
     * A function is volatile, if it has not been defined into a library file
     *
     */
    isVolatile():boolean {
        return (this.src == null);
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
            if(ModelFile.TYPE.is(this.src )){
                this.__s = (this.src as ModelFile).getUID();
            }else if(typeof this.src === 'string'){
                this.__s = (this.src as string);
            }else{
                this.__s = '<unknow>';
            }

            this.__s += ':'+this.name; //+':0x'+this.addr.toString(16);
        }

        Logger.debug("[MODEL FUNCTION] Signature() : ",this.__s);

        return this.__s;
    }

    /**
     * To get the symbol of this function
     *
     * @return {string} the symbol
     * @method
     * @since 1.0.0
     */
    getSymbol():string {
        return this.symbol;
    }

    /**
     * To get the internal name as returned by the decompiler/disass backend
     *
     * @return {string} the internal function identifier
     * @method
     * @since 1.0.0
     */
    getInternalName():string {
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

    /**
     *
     * @param pFile
     */
    setDeclaringFile(pFile:ModelFile):void{
        this.src = pFile;
    }


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


    hasTag(tagName:string):boolean{
        return (this.tags.indexOf(tagName) > -1);
    }

    getTags():string[]{
        return this.tags;
    }

    addTag(tag:string){
        this.tags.push(tag);
    }

    /**
     * To set an alias and update the aliased signature
     *
     * @param {String} name The alias value
     * @function
     */
    setAlias(name:string){
        this.alias = name;
        //this.aliasedSignature(true);
    }

    toJsonObjectWithCmd(pCommand:string[],fields:string[]=[],exclude:string[]=[]){
        let obj:any = this.toJsonObject(fields,exclude);
        //let filt:string[] = [];

        obj.__ = this.__;
        for(let i=0; i<pCommand.length; i++){
            if( ModelFunction.CMD_MAPPING[pCommand[i]] != null){
                ModelFunction.CMD_MAPPING[pCommand[i]].map( vAttr => {
                    Logger.raw("Prepare model fun json object w/ : "+vAttr);
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
                    case "args":
                    case "regvars":
                    case "spvars":
                    case "bpvars":
                        obj[i] = [];
                        // @ts-ignore
                        (this[i] as any[]).map( (vVar:ModelVariable) => { if(vVar!=null) obj[i].push(vVar.toJsonObject()) })
                        break;
                    case "cref":
                    case "xcref":
                    case "dref":
                    case "xdref":
                        obj[i] = [];
                        // @ts-ignore
                        (this[i] as any[]).map( (vVar:ModelNativeRef) => {
                            if(vVar!=null)
                                obj[i].push(vVar)
                        })
                        break;

                    case "ret":
                        obj.ret = (this.ret!=null ? this.ret.toJsonObject() : null)
                        break;
                    case "src":
                        if(typeof this.src === 'string'){
                            obj.src = this.src;
                        }else{
                            obj.src = this.src.getUID();
                        }
                        /*
                        if(ModelFile.TYPE.is(this.src)){
                            obj.src = (this.src as ModelFile).getUID();
                        }else
                            obj.src = this.src;*/
                        break;
                    case "instr":
                        if(this.instr!=null && Array.isArray(this.instr)){ // @ts-ignore
                            obj.instr = [];
                            this.instr.map( vInstr => { obj.instr.push(vInstr.toJsonObject(['func'])) });
                        }
                        break;
                    case 'hooks':
                        obj.hooks = [];
                        this.hooks.map( (vHook:AbstractHook)=>{ obj.hooks.push( vHook.getGUID() )});
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
ModelFunction.TYPE.builder(ModelFunction);
