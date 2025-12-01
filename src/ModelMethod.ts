import {CONST} from "./CoreConst.js";
import ModelClass from "./ModelClass.js";
import {Modifier, ModifierFormat} from "./AccessFlags.js";
import ModelDataBlock from "./ModelDataBlock.js";
import NodeCompare from "./NodeCompare.js";
import {Savable, STUB_TYPE} from "./ModelSavable.js";
import {ModelBasicType, ModelObjectType} from "./ModelType.js";
import ModelBasicBlock from "./ModelBasicBlock.js";
import ModelCall from "./ModelCall.js";
import {ModelLocation} from "./ModelLocation.js";
import {NodeType, INode, DataSourceHelper, SerializeOptions} from "@dexcalibur/dexcalibur-orm";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {IPersistent} from "./persist/orm/IPersistent.js";
import JavaMethodHook from "./hook/JavaMethodHook.js";

import {CoreDebug} from "./core/CoreDebug.js";
import {IStringIndex} from "./core/IStringIndex.js";
import ModelInstruction from "./ModelInstruction.js";
import {ModelRegister} from "./elixir/ModelRegister.js";
import {DataType} from "./types/DataType.js";
import {RegisterType} from "./elixir/common.js";
import {ElixirInstructionBuilder} from "./elixir/ElixirInstructionBuilder.js";


/*interface LazyMethodReference {
    string|ModelMethod
};*/

/**
 * Represents an Application's Method.
 * It contains several kind of information :
 *      - the definition with teh instructions
 *      - locations of the call to this methods (cross references)
 *      - number of local variables
 *      - references to classes called, method called, field called, ...
 *      - eventually, some tags related to the method action
 *      - eventually, the value of the parameters at runtime
 *
 * @class
 */
export default class ModelMethod extends Savable implements INode,IPersistent
{
    static TYPE:NodeType = (new NodeType( "method", NodeInternalType.METHOD, [])).dataSource("MEM", "method");

    __:NodeInternalType = NodeInternalType.METHOD;
    alias:string = null;

    name:string = null;
    modifiers:Modifier = null;
    args:(ModelObjectType|ModelBasicType)[] = []; // TODO
    ret:(ModelObjectType|ModelBasicType) = null; // TODO
    instr:ModelBasicBlock[] = []; // TODO

    datas:any = []; // TODO
    switches:any = []; // TODO

    probing:boolean = null;

    hooks:JavaMethodHook[] = [];

    /**
     * Maximum number of local registers
     * Mainly used to store or model local variable
     * Exclude parameter register
     */
    locals = 0;

    registers = 0;

    params:ModelRegister[] = [];
    // new
    localsR:ModelRegister[] = [];

    enclosingClass:ModelClass = null;
    declaringClass:ModelClass|string = null; // TODO : rename for memory perfomance

    _hashcode:string = null;

    // ========= Signatures ================

    //
    __callSignature__:string = null;
    __aliasedCallSignature__:string = null;
    __signature__:string = null;
    __pretty_signature__:string = null;

    // array of MethodModel signatures
    _callers:string[]|ModelMethod[] = [];

    // store arguments values catch at runtime
    dyn:any = []; // TODO

    _useMethod:any = {};
    _useMethodCtr = 0;
    _useField:any = {};
    _useFieldCtr = 0;

    /**
     * All tags of the node
     */
    tags:number[] = [];

    isDerived = false; // TODO

    _:any = {};

    /**
     *
     *
     * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance
     * @constructor
     */
    constructor(pConfig:any = null){
        super(STUB_TYPE.METHOD);

        if(pConfig!==undefined)
            for(const i in pConfig)
                this[i]=pConfig[i];
    }

    set location (pLocation:ModelLocation) {
        this._.loc = pLocation;
    }

    get location ():ModelLocation {
        return this._.loc;
    }

    getHooks():JavaMethodHook[] {
        return this.hooks;
    }

    addLocation(pLocation:ModelLocation):void {
        this._.loc = pLocation;
    }

    getUID():string {
        return this.signature();
    }

    callSignature2():string{
        if(this.__callSignature__===null){
            let xargs = "";
            for(const i in this.args) xargs+="<"+this.args[i]._hashcode+">";

            this.__callSignature__ = this.name+"("+xargs+")"+this.ret._hashcode;
        }

        return this.__callSignature__;
    }

    aliasedCallSignature():string{
        if(this.__aliasedCallSignature__===null){
            let xargs = "";
            for(const i in this.args) xargs+=this.args[i].signature();

            this.__aliasedCallSignature__ = this.alias+"("+xargs+")"+this.ret.signature();
        }

        return this.__aliasedCallSignature__;
    }

    callSignature():string{
        if(this.__callSignature__===null){
            let xargs = "";
            for(const i in this.args) xargs+=this.args[i].signature();

            this.__callSignature__ = this.name+"("+xargs+")"+this.ret.signature();
        }

        return this.__callSignature__;
    }

    hashCode():string{
        let xargs = "";
        for(const i in this.args) xargs+="<"+this.args[i]._hashcode+">";
        return this.enclosingClass.name+"|"+this.name+"|"+xargs+"|"+this.ret._hashcode;
    }

    dump(){
        console.log("\t"+this._hashcode);
    }

    getName(){
        return this.name;
    }

    /**
     * To build a strings containing the method canonical name, with the arguments types and orders,
     * and the return type. This signature acts as a primary key into the DB and it is the
     * unique identifier of a object, here a method.
     *
     * Be aware if you modify it you can break the engine !!
     *
     * @return {String} The method signature
     * @function
     */
    signature():string{
        if(this.__signature__ !== null) return this.__signature__;

        let xargs:string = "", hash:string;

        for(let i in this.args) xargs+=""+this.args[i].signature()+"";

            hash = this.enclosingClass.name+"."+this.name+"("+xargs+")"+this.ret.signature();


        this.__signature__  = hash;
        this.callSignature();

        return hash;
    }

    prettySignature(override:boolean=false):string{
        if(!override && this.__pretty_signature__ != null){
            return this.__pretty_signature__;
        }
        this.__pretty_signature__ = this.signatureFactory("__alias_signature__","alias");
        return this.__pretty_signature__;
    }

    // this.signatureFactory("__signature__","name")
    // this.signatureFactory("__alias_signature__","alias")
    /**
     * To generate a signature from 'seed'
     * @param ppt The name of the property where the signature should be stored
     * @param seed The property involved into signature
     */
    signatureFactory(ppt:string, seed:string):string{
        if(this[ppt] !== null) return this[ppt];

        let xargs:string = "", hash:string;

        for(let i in this.args) xargs+=""+this.args[i].signature()+""; // signatureFactory(ppt, seed)

            hash = this.enclosingClass[seed]+"."+this[seed]+"("+xargs+")"+this.ret.signature(); //signatureFactory(ppt, seed);

        this[ppt]  = hash;
        return hash;
    }

    sprint():string{
        let s:string="\t"+ModifierFormat.sprintModifier(this.modifiers)+" "+this.ret.sprint()+" "+this.name+"(";
        for(let i:number=0; i<this.args.length; i++){
            s+=((i>1)?",":"")+this.args[i].sprint();
        }
        return s+")";
    }

    help(){
        let t:string="+-------------------- HELP --------------------+";
        t += "\n[-- Methods : ]";
        t += "\n\t.callSignature()\tGet the java signature of arguments part";
        t += "\n\t.signature()\tGet the java signature of the field";
        t += "\n\t.disass()\tShow the method contents in a gdb-style";
        t += "\n\t.help()\tThis help";
        t += "\n[-- Properties : ]";
        t += "\n\t.name:<string>\tGet the short name of the method";
        t += "\n\t.enclosingClass:<Class>\tGet the enclosing class";
        t += "\n\t.modifiers:<AccessFlags>\tGet the modifiers";
        t += "\n\t.args:<*Type>[]\tGet the argument types";
        t += "\n\t.ret:<*Type>\tGet the type of return value";
        t += "\n\t.locals:<int>\tGet the number of locals";
        t += "\n\t.regiters:\tGet the number of registers";
        t += "\n";

        console.log(t)
    }






    countUsedMethods():number{
        return this._useMethodCtr;
    }

    countUsedFields():number{
        return this._useFieldCtr;
    }

    getDataBlocks():ModelDataBlock[]{
        return this.datas;
    }

    compare(meth:ModelMethod):NodeCompare{
        let diff = [];

        for(let i in this){
            switch(i){
                case "_useMethod":
                case "_useField":
                case "_callers":
                case "tags":
                case "alias":
                case "__aliasedCallSignature":
                    // TODO : Not yet supported
                    break;
                case "__signature__":
                case "__callSignature__":
                case "name":
                case "locals":
                case "registers":
                case "tags":
                    // TODO : add tag compare
                    /*if(this.tags.length>0){
                        diff.push({ ppt:"tags", old:this[i], new:meth.params });
                    }*/
                    break;
                case "params":
                    if(this.params != meth.params){
                        diff.push({ ppt:i, old:this[i], new:meth.params });
                    }
                    break;
                case "instr":
                    if(this.instr.length != meth.instr.length){
                        diff.push({ ppt:"instr", old:this.instr.length, new:meth.instr.length });
                    }
                    break;
                case "args":
                    if(this.args.length != meth.args.length){
                        diff.push({ ppt:"args", old:this.args.length, new:meth.args.length });
                        break;
                    }else{
                        // TODO
                        /*for(let j=0; j<this.args.length; j++){
                            if(this.args[j] )
                            obj.args.push(this.args[j].toJsonObject());
                        }*/
                    }
                    /*obj.args = [];
                    if(this.args.length != meth)
                    for(let j in this.args){
                        obj.args.push(this.args[j].toJsonObject());
                    }*/
                    break;
                case "ret":
                    if(this.ret.signature() != meth.ret.signature()){
                        diff.push({ ppt:"ret", old:this.ret.signature(), new:meth.ret.signature() });
                    }
                    break;
                case "enclosingClass":
                    if(this.enclosingClass.getName() != meth.enclosingClass.getName()){
                        diff.push({ ppt:"enclosingClass", old:this.enclosingClass.getName(), new:meth.enclosingClass.getName() });
                    }
                    // TODO
                    //            obj.enclosingClass = (this.enclosingClass!=null)? this.enclosingClass.name : "";
                    break;
                case "modifiers":
    //                obj.modifiers = this.modifiers.toJsonObject([
    //                    "public","private","protected","abstract","native","final","constructor","static"]);
                    break;
            }
        }
        return new NodeCompare(this, meth, ((diff.length>0)? diff : null));
    }


    import(obj:any){

        // raw import
        super.import(obj);

        // modifiers
        this.modifiers =  obj.modifiers;

        // restore return type
        if(Object.values(CONST.WORDS).indexOf(obj.ret.name)>-1){
            this.ret = (new ModelBasicType()).import(obj.ret);
        }else{
            this.ret = (new ModelObjectType()).import(obj.ret);
        }
        // restore args type
        for(let i=0; i<obj.args.length ; i++){
            if(Object.values(CONST.WORDS).indexOf(obj.args[i].name)>-1){
                this.args[i] = (new ModelBasicType()).import(obj.args[i]);
            }else{
                this.args[i] = (new ModelObjectType()).import(obj.args[i]);
            }
        }
    }


//   toJsonObject(fields:string[]=[],exclude:string[]=[]){
   toJsonObject(pOptions:SerializeOptions = {include:[],exclude:{} }){
        let fields:any[] = pOptions.include;
        let exclude:IStringIndex<any> = pOptions.exclude;

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
            for(let i in this){

                if(exclude!=null && exclude[i]>-1) continue;
                // if(fields != null && fields.indexOf(i)==-1) continue;

                switch(i){
                    case "_useMethod":
                        obj._useMethod = [];
                        for(let j in this._useMethod){
                            if(this._useMethod[j] != undefined){
                                obj._useMethod.push(j); //this._useMethod[i].__signature__);
                            }
                        }
                        break;
                    case "_useField":
                        obj._useField = [];
                        for(let j in this._useField){
                            if(this._useField[j] != undefined)
                                obj._useField.push(this._useField[j].__signature__);
                        }
                        break;
                    case "_callers":
                        obj._callers = [];
                        for(let j=0; j<this._callers.length ; j++){
                            if(this._callers[j] != undefined)
                                if(this._callers[j] instanceof ModelMethod){
                                    //console.log("Callers -> ",this._callers[i].signature());
                                    obj._callers.push((this._callers[j] as ModelMethod).signature());
                                }else{
                                    obj._callers.push(this._callers[j]);
                                }

                        }
                        break;
                    case "__":
                    case "__signature__":
                    case "__callSignature__":
                    case "__aliasedCallSignature":
                    case "name":
                    case "alias":
                    case "locals":
                    case "registers":
                    case "params":
                    case "tags":
                    case "probing":
                        obj[i] = this[i];
                        break;
                    case "hooks":
                        obj.hooks = [];
                        this.hooks.map(x => obj.hooks.push( x.getGUID() ));
                        break;
                    case "instr":
                        // basic blocks data are not serialized
                        break;
                    case "args":
                        obj.args = [];
                        for(let j in this.args){
                            obj.args.push(this.args[j].toJsonObject());
                        }
                        break;
                    case "ret":
                        obj.ret = this.ret.toJsonObject();
                        break;
                    case "enclosingClass":
                        obj.enclosingClass = (this.enclosingClass!=null)? this.enclosingClass.name : "";
                        break;
                    case "_":
                        if(this._.loc != null){
                            obj.location = this._.loc.toJsonObject();
                        }
                        break;
                    case "modifiers":
                        if(this.modifiers != null)
                            obj.modifiers = ModifierFormat.toJsonObject(this.modifiers); //this.modifiers.toJsonObject();
                        else
                            obj.modifiers = null;

                        break;
                }
            }
        }
       CoreDebug.checkJsonSerialize(obj, "ModelMethod");
        return obj;
    }

    disass(pConfig:any, pDisassembler:any){

        if(pConfig != null){
            if(pConfig.pretty == true)
                return pDisassembler.methodPretty(this);
            else if(pConfig.raw == true){
                return pDisassembler.methodRaw(this);
            }
        }else{
            return pDisassembler.method(this);
        }
    }


    getTaggedBlock(tag:string){
        for(let i in this.instr){
            if(this.instr[i].tag==tag) return this.instr[i];
        }
        return null;
    }

    getBasicBlocks():ModelBasicBlock[]{
        return this.instr;
    }

    getBlock(offset:number):ModelBasicBlock{
       if (offset >= 0 && offset < this.instr.length)
           return this.instr[offset];
        return null;
    }

    getModifier():Modifier{
        return this.modifiers;
    }

    getInstr(offsetBB:number, offsetInstr:number){
        let block = this.getBlock(offsetBB);
        if (block != null)
            return block.getInstruction(offsetInstr);
        return null;
    }

    /**
     * To gather instructions before and after the instruction at offset `offsetInstr` in basic block `offsetBB`
     * of the current method
     *
     * @param offsetBB
     * @param offsetInstr
     * @param windowSize
     */
    getInstrNearTo(offsetBB:number,offsetInstr:number,windowSize:number=3):ModelInstruction[]{
        let min:number = offsetInstr-windowSize;
        let max:number = offsetInstr+windowSize;
        let instr:ModelInstruction[] = [];

        for(let i:number=0; i<this.instr.length; i++){
            if(i == offsetBB){
                for(let j:number=0; j<this.instr[i].stack.length; j++){
                    if(j > min && j < max){
                        instr.push(this.instr[i].stack[j]);
                    }
                }
            }
        }
        return instr;
    }

    newImplementationBy(cls:ModelClass):ModelMethod{
        let meth:any = new ModelMethod();

        // partial deep copy :
        //  - primitive value are copied
        //  - object are passed by reference
        for(let i in this){
            if(typeof this[i] != "function"){
                meth[i]=this[i];
            }
        }
        meth.isDerived = true;
        meth.declaringClass = cls;

        return meth as ModelMethod;
    }

    setProbing(flag:boolean){
        this.probing = flag;
    }

    addCallValue(dyn:any){
        this.dyn.push(dyn);
        return this;
    }

    getCallValues(dyn:any){
        return this.dyn;
    }

    getAlias():string{
        return this.alias;
    }
    setAlias(name:string){
        this.alias = name;
        this.__aliasedCallSignature__ = this.aliasedCallSignature();
    }
    setEnclosingClass(cls:ModelClass){
        this.enclosingClass = cls;
    }
    getEnclosingClass():ModelClass{
        return this.enclosingClass;
    }
    setReturnType(rettype:ModelObjectType|ModelBasicType){
        this.ret = rettype;
    }
    getReturnType():ModelObjectType|ModelBasicType{
        return this.ret;
    }
    setArgsType(argsType:any){
        this.args = argsType;
    }
    getArgsType():(ModelObjectType|ModelBasicType)[]{
        return this.args;
    }
    hasArgs():boolean{
        return this.args.length > 0;
    }

    getCallers():string[]|ModelMethod[]{
        return this._callers;
    }
    addCaller(meth:ModelMethod){
        let f:boolean = false;
        const m = meth.signature();

        for(let i=0; i<this._callers.length; i++){
            if((this._callers[i] as ModelMethod).signature()===m){
                f = true;
                break;
            }
        }

        if(!f){
            this._callers.push(meth as any);
        }

    //if(this._callers.indexOf(meth.signature() as any) == -1)
    //    this._callers.push(meth.signature() as any);
    }
    getMethodUsed():any{
       return this._useMethod;
    }
    addMethodUsed(method:ModelMethod, call:ModelCall){
        if(this._useMethod[method.signature()] == null)
            this._useMethod[method.signature()] = [];
        this._useMethod[method.signature()].push(call);
    }
    getFieldUsed():any{
        return this._useField;
    }
    getTryStartBlock(pLabel:string):ModelBasicBlock{
        const bb:ModelBasicBlock[] = this.getBasicBlocks();
        for(let i=0; i<bb.length; i++){
            if(bb[i].getTryStartLabel()==pLabel){
                return bb[i];
            }
        }
        return null;
    }

    getTryEndBlock(pLabel:string):ModelBasicBlock{
       const bb:ModelBasicBlock[] = this.getBasicBlocks();
        for(let i=0; i<bb.length; i++){
            if(bb[i].getTryEndLabel()==pLabel){
                return bb[i];
            }
        }
        return null;
    }

    getCatchBlock(pLabel:string):ModelBasicBlock{
        const bb:ModelBasicBlock[] = this.getBasicBlocks();
        for(let i=0; i<bb.length; i++){
            if(bb[i].getCatchLabel()==pLabel){
                return bb[i];
            }
        }
        return null;
    }

    getBasicBlockByLabel(pLabel:string, pType:number):ModelBasicBlock{
        //if(pType == CONST.INSTR_TYPE.IF){
        switch(pType)
        {
            case CONST.INSTR_TYPE.IF:
                for(let i=0; i<this.instr.length; i++){
                    //console.log(this.instr[i]);
                    if(this.instr[i].isConditionalBlock() && this.instr[i].cond_name==pLabel)
                        return this.instr[i];
                }
                break;
            case CONST.INSTR_TYPE.GOTO:
                for(let i=0; i<this.instr.length; i++){
                    if(this.instr[i].isGotoBlock() && this.instr[i].goto_name==pLabel)
                        return this.instr[i];
                }
                break;
        }

        return null;
    }
    appendDataBlock(pBlock:ModelDataBlock, callback:any=null){
        pBlock.setParent(this, this.datas.length);
        this.datas.push(pBlock);
        if(callback != null) callback(this, pBlock);
    }

    appendBasicBlock(pBlock:ModelBasicBlock, callback:any=null){
        pBlock.offset = this.instr.length;
        this.instr.push(pBlock);
        if(callback != null) callback(this, pBlock);
    }

    /*
    appendBlock(block:any, callback:any=null){
        if(block instanceof ModelBasicBlock){
            block.offset = this.instr.length;
            this.instr.push(block);
            if(callback != null) callback(this, block);
        }
        else if(block instanceof ModelDataBlock){
            block.setParent(this, this.datas.length);
            this.datas.push(block);
            if(callback != null) callback(this, block);
        }
    }*/

    getDataBlockByTag( pTag:string):ModelDataBlock[]{
        let ds:ModelDataBlock[] = []
        for(let i=0; i<this.datas.length; i++){
            if(this.datas[i].tags.indexOf(pTag)>-1)
                ds.push(this.datas[i]);
        }
        return ds;
    }

    getDataBlockByName( pName:string):any{
        for(let i:number=0; i<this.datas.length; i++){
            if(this.datas[i].name == pName)
                return this.datas[i];
        }
        return null;
    }

    isStatic():boolean{
        return (this.modifiers & Modifier.STATIC)==Modifier.STATIC;
    }

    hasModifier(pMod:number):boolean {
        return (this.modifiers & pMod)==pMod;
    }

    /**
     *
     * @param dataType
     * @param initialValue
     * @param paramName
     */
    declareParameter(pDataType: DataType, pDefaultValue: any, pName: string, pId:number):ModelRegister {
        const reg: ModelRegister = new ModelRegister({
            type: RegisterType.PARAMETER,
            id: pId,
            dataType: pDataType,
            name: pName || `p${this.params.length}`,
            initialValue: pDefaultValue
        });

        let param:ModelRegister;
        let found = false;
        for(let i=0; i<this.params.length; i++){
            param = this.params[i];
            if( param.type===RegisterType.PARAMETER && param.id===pId){
                found = true;
                param.setInitialValue(pDefaultValue);
            }
        }

        if(!found) this.params.push(reg);

        return reg;

    }

    /**
     * Generates an initialization block that initializes registers with their predefined values.
     * The initialization process may also include metadata for specific instructions, such as line numbers and comments.
     *
     * @return {ModelBasicBlock} A ModelBasicBlock containing the initialization instructions for the registers.
     */
    generateInitializationBlock(): ModelBasicBlock {
        const initBlock = new ModelBasicBlock({

        });

        const createInitInstr = (vRegister:ModelRegister)=>{
            const instr = ElixirInstructionBuilder.initRegister(
                initBlock,
                vRegister
            );

            return instr;
        }

        this.params.map((vP)=>{
            if(vP.initialValue!==undefined){
                initBlock.addInstruction(createInitInstr(vP));
            }
        });
        this.localsR.map((vP)=>{
            if(vP.initialValue!==undefined){
                initBlock.addInstruction(createInitInstr(vP));
            }
        });

        return initBlock;
    }
}
ModelMethod.TYPE.builder(ModelMethod);