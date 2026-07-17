/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {NodeInternalType, Nullable} from "@reversense/dxc-core-api";
import ModelFile from "./ModelFile.js";
import ModelCpuInstruction from "./ModelCpuInstruction.js";
import * as Log from './Logger.js';
import {ModelVariable} from "./ModelVariable.js";
import {ModelNativeRef} from "./ModelNativeRef.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    IStringIndex,
    NodeProperty, NodePropertyState,
    NodeType,
    SerializeOptions,
    Tag
} from "@reversense/dexcalibur-orm";

import {IPersistent} from "./persist/orm/IPersistent.js";
import {NativeAnalyzerCommands} from "./analyzer/NativeAnalyzerCommands.js";
import {AbstractHook} from "./hook/AbstractHook.js";

import {CoreDebug} from "./core/CoreDebug.js";
import {INodeRef} from "./INode.js";
import NativeFunctionHook from "./hook/NativeFunctionHook.js";
import {MemoryAddress} from "./memory/MemoryAddress.js";

export interface ModelFunctionList {
    [pAddress:string] :ModelFunction
}


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
        [NativeAnalyzerCommands.FUNC_CMD.DISASS]: ['instr'],
        [NativeAnalyzerCommands.FUNC_CMD.XREF]: ['instr'],
        [NativeAnalyzerCommands.FUNC_CMD.DECOMPILE]: ['dec']
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
            (new NodeProperty("src")).type(DbDataType.BLOB).def(null),
            (new NodeProperty("dec")).type(DbDataType.STRING).def(null),
            (new NodeProperty("stack")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("sz")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("instr"))
                .type(DbDataType.BLOB)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return null;
                    const ins:any[] = [];
                    for(let i=0; i<x.p.length; i++){
                        ins.push(x.p[i].toJsonObject());
                    }
                    return ins;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p==null) return [];
                    const ins:ModelCpuInstruction[] = [];
                    for(let i=0; i<x.p.length; i++){
                        ins.push(new ModelCpuInstruction(x.p[i]));
                    }
                    return ins;

                })
                .def([]),
            (new NodeProperty("tags")).type(DbDataType.STRING).def([]),

            (new NodeProperty("regvars"))
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return null;
                    const ins:any[] = [];
                    for(let i=0; i<x.p.length; i++){
                        ins.push(x.p[i].toJsonObject());
                    }
                    return ins;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p==null) return [];
                    const ins:ModelVariable[] = [];
                    for(let i=0; i<x.p.length; i++){
                        ins.push(ModelVariable.fromObject(x.p[i]));
                    }
                    return ins;
                })
                .def([])
                .type(DbDataType.BLOB),

            (new NodeProperty("spvars"))
                .def([])
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return null;
                    const ins:any[] = [];
                    for(let i=0; i<x.p.length; i++){
                        ins.push(x.p[i].toJsonObject());
                    }
                    return ins;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p==null) return [];
                    const ins:ModelVariable[] = [];
                    for(let i=0; i<x.p.length; i++){
                        ins.push(ModelVariable.fromObject(x.p[i]));
                    }
                    return ins;
                })
                .type(DbDataType.BLOB),

            (new NodeProperty("cref"))
                .type(DbDataType.STRING),

            (new NodeProperty("dref"))
                .type(DbDataType.BLOB),

            (new NodeProperty("xcref"))
                .type(DbDataType.BLOB),

            (new NodeProperty("xdref"))
                .type(DbDataType.BLOB),

            (new NodeProperty("args"))
                .type(DbDataType.BLOB)
                .def([])
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return null;
                    const ins:any[] = [];
                    for(let i=0; i<x.p.length; i++){
                        ins.push(x.p[i].toJsonObject());
                    }
                    return ins;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p==null) return [];
                    const ins:ModelVariable[] = [];
                    for(let i=0; i<x.p.length; i++){
                        ins.push(ModelVariable.fromObject(x.p[i]));
                    }
                    return ins;
                }),


            (new NodeProperty("ctype")).type(DbDataType.STRING)
        ])).dataSource("MEM", "func");

    __:NodeInternalType = NodeInternalType.FUNC;

    sz:number = -1;

    /**
     * Count of basic blocks
     */
    bbs:number = -1;

    addr:number = -1;

    name: string = null;

    symbol:string = null;


    dec:string = null;

    /**
     * Function's arguments
     */
    args:ModelVariable[] = [];

    ret:ModelVariable = null;

    src:Nullable<INodeRef> = null;

    /**
     * Local variables bound to register
     */
    regvars:ModelVariable[] = [];

    /**
     * Local variables from stack
     */
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

    instr:ModelCpuInstruction[] = [];

    alias:string = null;

    hooks:NativeFunctionHook[] = []

    // signature
    __s:string = null;

    _s:any = {};

    tags:number[] = []; // TODO

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
            if(this.src != null){
                this.__s = (this.src._uid);
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
        this.instr = pInstrs;
    }

    addArguments(pVar:ModelVariable[], pReset = true):void {
        if(pReset){
            this.args = [];
        }
        pVar.map( (v:ModelVariable)=>{
            if(v.isRegister()){
                this.args.push(v);
            }else if(v.isOnStack()){
                this.args.push(v);
            }
        });
    }

    addLocalVars(pVar:ModelVariable[]):void {
        pVar.map( (v:ModelVariable)=>{
            if(v.isRegister()){
                this.regvars.push(v);
            }else if(v.isOnStack()){
                this.spvars.push(v);
            }
        });
    }


    addDecompile(pCode:string):void {
        Logger.info("Set decompiled code : ",pCode);
        this.dec = pCode;
    }

    getAddr():number {
        return this.addr;
    }

    getMemoryAddress():MemoryAddress {
        return new MemoryAddress(BigInt(this.addr));
    }

    /**
     *
     * @param pFile
     */
    setDeclaringFile(pFile:ModelFile):void{
        this.src = {
            _uid: pFile.getUID(),
            __: pFile.__
        };
    }


    getDeclaringFile():INodeRef {
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

    hasTag(vTag:Tag):boolean{
        const uuid = vTag.getUUID()
        for(let i=0; i<this.tags.length; i++){
            if(this.tags[i]===uuid){
                return true;
            }
        }
        return false;
    }

    getTags():number[]{
        return this.tags;
    }

    addTag(vTag:Tag){
        this.tags.push(vTag.getUUID());
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
        const excl:IStringIndex<boolean> = {};
        exclude.map(x => excl[x]=true );
        let obj:any = this.toJsonObject({ include:fields, exclude:excl });

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

    toJsonObject(pOptions?:SerializeOptions){
        let fields = (pOptions!=null) ? pOptions.include : null;
        let exclude = (pOptions!=null) ? Object.keys(pOptions.exclude) : null;
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

                if(exclude!=null  && exclude.indexOf(i)>-1) continue;
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
                        obj.src = this.src;
                        /*
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
                            this.instr.map( vInstr => { obj.instr.push(vInstr.toJsonObject({ exclude:{func:true}})) });
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
        CoreDebug.checkJsonSerialize(obj, "ModelFunction");
        return obj;
    }

    isDisassembled() {
        return (this.instr != null && this.instr.length > 0);
    }

    isDecompiled() {
        return (this.dec != null && this.dec.length > 0);
    }

    getDisassembly():ModelCpuInstruction[] {
        return this.instr;
    }

    getDecompiled():string {
        return this.dec;
    }
}
ModelFunction.TYPE.builder(ModelFunction);
