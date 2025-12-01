import {CONST} from "./CoreConst.js";
import ModelBasicBlock from "./ModelBasicBlock.js";
import ModelMethod from "./ModelMethod.js";
import {Savable, STUB_TYPE} from "./ModelSavable.js";
import {NodeType, NodeUtils, SerializeOptions} from "@dexcalibur/dexcalibur-orm";

import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "./core/CoreDebug.js";
import {SecurityZone} from "./security/SecurityZone.js";
import {CodeLabel, ModelRegisterReference} from "./ModelReference.js";
import {ModelBasicType, ModelObjectType} from "./ModelType.js";
import ModelConstantValue from "./ModelConstantValue.js";
import {ElixirOpcodeDefinition} from "./Opcode.js";
import {Operand} from "./elixir/common.js";

/**
 * Represents an instruction from the Application bytecode
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance
 * @constructor
 */
export default class ModelInstruction extends Savable
{
    static TYPE:NodeType = new NodeType( "code_instr", NodeInternalType.INSTRUCTION, []);
    __:NodeInternalType = NodeInternalType.INSTRUCTION;

    _raw:string = null;
    _call:any = null;
    _parent:any = null;

    // location into parser file (line number)
    // oline:number;
    // operands
    opcode:Nullable<ElixirOpcodeDefinition> = null;
    left:any = null;
    right:any = null;

    // experimental
    read:any = false;

    // VM
    value:any = null;


    /**
     @since 1.13.0
     */
    destination?: Operand;
    operands: Operand[];

    // info
    offset:number = 0;
    // line number into source (.jav, .kotlin, ...) file. Its a metadata
    iline:Nullable<number> = null;

    constructor(pConfig:any=null) {
        super(STUB_TYPE.INSTR);

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];

        if((this as any).raw!=null) this._raw = (this as any).raw;
    }
    
    getLine():number{
        return this.iline;
    }

    getRaw():string {
        return this._raw;
    }

    eval(vm:any){
        throw new Error('ModelInstruction : eval is not supported (deprecated)');
        //vm.restore(this.operands);
        //this.opcode.eval(vm,this.operands);
    }

    setCalledObj(obj:any){
        this._call = obj;
    }

    /**
     * To check if the instruction uses a string
     * @method
     */
    isUsingString():boolean{
        return (this.right !== undefined) && (this.opcode.reftype==CONST.OPCODE_REFTYPE.STRING);
    }

    /**
     * To check if the instruction calls a field
     * @method
     */
    isCallingField():boolean{
        return (this.right !== undefined) && (this.opcode.reftype==CONST.OPCODE_REFTYPE.FIELD);
    }

    /**
     * To check if the instruction perform a static call
     * @method
     */
    isStaticCall():boolean{
        return (this.opcode.flag & CONST.OPCODE_TYPE.STATIC_CALL)>0;
    }

    /**
     * To check if the instruction sets a field
     * @method
     */
    isSetter():boolean{
        return (this.opcode.type==CONST.INSTR_TYPE.SETTER);
    }

    /**
     * To check if the instruction gets a field
     * @method
     */
    isGetter():boolean{
        return (this.opcode.type==CONST.INSTR_TYPE.GETTER);
    }

    /**
     * To check if the instruction is a NOP
     * @method
     */
    isNOP():boolean{
        return (this.opcode.type==CONST.INSTR_TYPE.NOP);
    }

    /**
     * To check if the instruction performs a call
     * @method
     */
    isDoingCall():boolean{
        return (this.right !== undefined) && (this.opcode.reftype==CONST.OPCODE_REFTYPE.METHOD);
    }

    /**
     * To check if the instruction declares a type
     * @method
     */
    isReferencingType():boolean{
        return (this.right !== undefined) && (this.opcode.reftype==CONST.OPCODE_REFTYPE.TYPE);
    }

    dump(pIndent:number=0){
        console.log(("\t".repeat(pIndent))+this.opcode);
    }

    printRaw(pIndent:number=2){
        console.log(("\t".repeat(pIndent))+this._raw);
    }

    exportType():string{
        return CONST.INSTR_TYPE_LABEL[this.opcode.type];
    }

    toJsonObject(pOpts?:SerializeOptions, pZone:SecurityZone = SecurityZone.PUBLIC):any{
        let o:any = {};
        o.raw = this._raw;

        if(this.iline!=null) o.iline = this.iline

        o.offset = this.offset;
        o.location = { offset:this.offset, bb:null };
        o.opcode = this.opcode;

        o.right = ModelInstruction.operandToJson(this.right);
        o.left = ModelInstruction.operandToJson(this.left);

        if(pZone==SecurityZone.PUBLIC){
            if(this._parent instanceof ModelBasicBlock){
                o.location.bb = this._parent.offset;
                if(this._parent._parent instanceof ModelMethod){
                    o.method = this._parent._parent.signature();
                }
            }
        }else if(pZone==SecurityZone.PRIVATE){

        }

        //o.parent =  this.parent.toJsonObject();
        CoreDebug.checkJsonSerialize(o,"ModelInstruction");
        return o;
    };

    static fromJsonObject(pObj:any):ModelInstruction{
        let i = new ModelInstruction(pObj);

        ["right","left"].map(x => {
            if(i[x]!=null){
                if(Array.isArray(i[x])){
                    i[x] = i[x].map(k => ModelInstruction.operandFromJson(k))
                }else{
                    i[x] = ModelInstruction.operandFromJson(i[x]);
                }
            }
        });

        return i;
    }

    toString():string{
        return this._raw;
    }

    static operandFromJson(pOpe:any):any {
        if(pOpe.__ === NodeInternalType.OBJECT_TYPE){
            return ModelObjectType.fromJsonObject(pOpe);
        }else if(pOpe.__ === NodeInternalType.PRIMITIVE_TYPE){
            return ModelBasicType.fromJsonObject(pOpe);
        }else if(pOpe.$ == STUB_TYPE.VALUE_CONST){
            return new ModelConstantValue(pOpe._value,pOpe.tags);
        }else if(typeof pOpe==='string'){
            return new CodeLabel(pOpe);
        }else if(pOpe.t!=null && pOpe.i!=null){
            return new ModelRegisterReference(pOpe.t,pOpe.i);
        }else if(pOpe.hasOwnProperty('__')){
            return pOpe; //NodeUtils.asNodeRef(pVal); // noderef
        }else {
            return null;
        }
    }

    static _operandSingleValToRaw(pVal:any):any {
        if(pVal instanceof ModelRegisterReference){
            return pVal;
        }else if(pVal instanceof ModelObjectType){
            return pVal.toJsonObject();
        }else if(pVal instanceof ModelBasicType){
            return pVal.toJsonObject();
        }else if(pVal instanceof ModelConstantValue){
            return pVal.toJsonObject();
        }else if(pVal instanceof CodeLabel){
            return (pVal as CodeLabel).name;
        }else if(pVal.hasOwnProperty('__')){
            return NodeUtils.asNodeRef(pVal); // noderef
        }else {
            return null;
        }
    }

    static operandToJson(pOperand: any) {
        if(pOperand==null) return null;

        if(Array.isArray(pOperand)){
            return pOperand.map(p => this._operandSingleValToRaw(p));
        }else {
            return this._operandSingleValToRaw(pOperand);
        }

    }
}
ModelInstruction.TYPE.builder(ModelInstruction);