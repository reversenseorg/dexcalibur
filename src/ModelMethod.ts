import {CONST} from "./CoreConst";
import ModelClass from "./ModelClass";
import {Modifier, ModifierFormat} from "./AccessFlags";
import ModelDataBlock from "./ModelDataBlock";
import NodeCompare from "./NodeCompare";
import {Savable, STUB_TYPE} from "./ModelSavable";
import {ModelBasicType, ModelObjectType} from "./ModelType";
import ModelBasicBlock from "./ModelBasicBlock";
import ModelCall from "./ModelCall";


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
export default class ModelMethod extends Savable
{

    alias:string = null;

    name:string = null;
    modifiers:Modifier = null;
    args:(ModelObjectType|ModelBasicType)[] = []; // TODO
    ret:(ModelObjectType|ModelBasicType) = null; // TODO
    instr:ModelBasicBlock[] = []; // TODO

    datas:any = []; // TODO
    switches:any = []; // TODO

    probing:boolean = false;

    locals:number = 0;
    registers:number = 0;
    params:any = [];

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

    _useClass:any = {};
    _useClassCtr:number = 0;
    _useMethod:any = {};
    _useMethodCtr:number = 0;
    _useField:any = {};
    _useFieldCtr:number = 0;

    tags:any = []; // TODO

    isDerived:boolean = false; // TODO

    /**
     *
     *
     * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance
     * @constructor
     */
    constructor(pConfig:any = null){
        super(STUB_TYPE.METHOD);

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }

    callSignature2():string{
        if(this.__callSignature__===null){
            let xargs:string = "";
            for(let i in this.args) xargs+="<"+this.args[i]._hashcode+">";

            this.__callSignature__ = this.name+"("+xargs+")"+this.ret._hashcode;
        }

        return this.__callSignature__;
    }

    aliasedCallSignature():string{
        if(this.__aliasedCallSignature__===null){
            let xargs:string = "";
            for(let i in this.args) xargs+=this.args[i].signature();

            this.__aliasedCallSignature__ = this.alias+"("+xargs+")"+this.ret.signature();
        }

        return this.__aliasedCallSignature__;
    }

    callSignature():string{
        if(this.__callSignature__===null){
            let xargs:string = "";
            for(let i in this.args) xargs+=this.args[i].signature();

            this.__callSignature__ = this.name+"("+xargs+")"+this.ret.signature();
        }

        return this.__callSignature__;
    }

    hashCode():string{
        let xargs:string = "";
        for(let i in this.args) xargs+="<"+this.args[i]._hashcode+">";
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

        let xargs:string = "", hash:string ="";

        for(let i in this.args) xargs+=""+this.args[i].signature()+"";

        //if(this.fqcn !== undefined)
        //    hash = this.fqcn+"."+this.name+"("+xargs+")"+this.ret.signature();
        //else{
            //console.log(this.ret);
            hash = this.enclosingClass.name+"."+this.name+"("+xargs+")"+this.ret.signature();
        //}

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

        let xargs:string = "", hash:string ="";

        for(let i in this.args) xargs+=""+this.args[i].signature()+""; // signatureFactory(ppt, seed)

        //if(this.fqcn !== undefined)
        //    hash = this.fqcn+"."+this[seed]+"("+xargs+")"+this.ret.signatureFactory(ppt, seed);
        //else{
            //console.log(this.ret);
            hash = this.enclosingClass[seed]+"."+this[seed]+"("+xargs+")"+this.ret.signature(); //signatureFactory(ppt, seed);
        //}
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
        t += "\n\t.locals:<int>\tGet the number de locals";
        t += "\n\t.regiters:\tGet the number de registers";
        t += "\n";

        console.log(t)
    }


    setupMissingTag():any{
        return (this.tags.push(CONST.TAG.MISSING));
    }

    removeMissingTag(){
        if(this.tags.length==1)
            this.tags = [];
        else{
            let i:number = this.tags.indexOf(CONST.TAG.MISSING);
            let arr:string[] = this.tags.slice(0,i);
            if(i+1<this.tags.length){
                arr = arr.concat(this.tags.slice(i+1,this.tags.length-i-1));
            }
            this.tags = arr;
        }
    }

   isMissingClass():boolean{
        return (this.tags.indexOf(CONST.TAG.MISSING)>-1);
    }


    countUsedMethods():number{
        return this._useMethodCtr;
    }

    countUsedClasses():number{
        return this._useClassCtr;
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
                case "_useClass":
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

        // raw impport
        super.import(obj);

        // modifiers
        this.modifiers =  obj.modifiers;

        // restore return type
        console.log(obj);
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
            for(let i in this){

                if(exclude.indexOf(i)>-1) continue;
                // if(fields != null && fields.indexOf(i)==-1) continue;

                switch(i){
                    case "_useClass":
                        obj._useClass = [];
                        for(let j in this._useClass){
                            if(this._useClass[i] != undefined)
                                obj._useClass.push(this._useClass[i].name);
                        }
                        break;
                    case "_useMethod":
                        obj._useMethod = [];
                        for(let j in this._useMethod){
                            if(this._useMethod[i] != undefined){
                                obj._useMethod.push(i); //this._useMethod[i].__signature__);
                            }
                        }
                        break;
                    case "_useField":
                        obj._useField = [];
                        for(let j in this._useField){
                            if(this._useField[i] != undefined)
                                obj._useField.push(this._useField[i].__signature__);
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
                    case "__signature__":
                    case "__callSignature__":
                    case "__aliasedCallSignature":
                    case "name":
                    case "alias":
                    case "locals":
                    case "registers":
                    case "params":
                    case "tags":
                        obj[i] = this[i];
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
                    case "modifiers":
                        if(this.modifiers != null)
                            obj.modifiers = ModifierFormat.toJsonObject(this.modifiers); //this.modifiers.toJsonObject();
                        else
                            obj.modifiers = null;

                        break;
                }
            }
        }
        return obj;
    }

    disass(pConfig:any, pDisassembler:any){

        if(pConfig != null){
            if(pConfig.pretty == true)
                return pDisassembler.methodPretty(this);
            else if(pConfig.raw == true)
                return pDisassembler.methodRaw(this);
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
        for(let i:number=0; i<this.instr.length; i++){
            if(i==offset) return this.instr[i];
        }
        return null;
   }

   getModifier():Modifier{
        return this.modifiers;
    }

   getInstr(offsetBB:number,offsetInstr:number){
        for(let i:number=0; i<this.instr.length; i++){
            if(i == offsetBB){
                for(let j:number=0; j<this.instr[i].stack.length; j++){
                    if(j == offsetInstr){
                        return this.instr[i].stack[j];
                    }
                }
            }
        }
        return null;
    }

   getInstrNearTo(offsetBB:number,offsetInstr:number,windowSize:number=3):ModelBasicBlock[]{
        let min:number = offsetInstr-windowSize;
        let max:number = offsetInstr+windowSize;
        let instr:ModelBasicBlock[] = [];

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
   addTag(tag:string){
    this.tags.push(tag);
}
   hasTag(tagName:string):boolean{
    return (this.tags.indexOf(tagName) > -1);
}
   getTags():string[]{
    return this.tags;
}
   getCallers():string[]|ModelMethod[]{
    return this._callers;
}
   addCaller(meth:ModelMethod){
    if(this._callers.indexOf(meth.signature() as any) == -1)
        this._callers.push(meth.signature() as any);
}
   getMethodUsed():any{
    return this._useMethod;
}
   addMethodUsed(method:ModelMethod, call:ModelCall){
        if(this._useMethod[method.signature()] == null)
            this._useMethod[method.signature()] = [];

        this._useMethod[method.signature()].push(call);
    }
    getClassUsed():any{
        return this._useClass;
    }

    getFieldUsed():any{
        return this._useField;
    }

   getTryStartBlock(pLabel:string):ModelBasicBlock{
        let bb:ModelBasicBlock[] = this.getBasicBlocks();
        for(let i=0; i<bb.length; i++){
            if(bb[i].getTryStartLabel()==pLabel){
                return bb[i];
            }
        }
        return null;
    }

   getTryEndBlock(pLabel:string):ModelBasicBlock{
        let bb:ModelBasicBlock[] = this.getBasicBlocks();
        for(let i=0; i<bb.length; i++){
            if(bb[i].getTryEndLabel()==pLabel){
                return bb[i];
            }
        }
        return null;
    }


   getCatchBlock(pLabel:string):ModelBasicBlock{
        let bb:ModelBasicBlock[] = this.getBasicBlocks();
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
                for(let i:number=0; i<this.instr.length; i++){
                    //console.log(this.instr[i]);
                    if(this.instr[i].isConditionalBlock() && this.instr[i].cond_name==pLabel)
                        return this.instr[i];
                }
                break;
            case CONST.INSTR_TYPE.GOTO:
                for(let i:number=0; i<this.instr.length; i++){
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
}
