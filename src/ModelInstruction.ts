import { CONST } from "./CoreConst";
import ModelBasicBlock from "./ModelBasicBlock";
import ModelMethod from "./ModelMethod";
import {Savable, STUB_TYPE} from "./ModelSavable";
import {ModelRegisterReference} from "./ModelReference";
import {NodeType} from "./persist/orm/NodeType";
import {NodeInternalType} from "./NodeInternalType";

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

    // line number into source (.jav, .kotlin, ...) file. Its a metadata
    iline:number = null;

    // operands
    opcode:any = null;
    left:any = null;
    right:any = null;

    // experimental
    read:any = false;

    // info
    offset:number = 0;

    // VM
    value:any = null;


    constructor(pConfig:any=null) {
        super(STUB_TYPE.INSTR);

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }
    
    getLine():number{
        return this.iline;
    }

    eval(vm:any){
        throw new Error('ModelInstruction : eval is not supported (deprecated)');
        //vm.restore(this.operands);
        //this.opcode.eval(vm,this.operands);
    }
Ò
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

    toJsonObject():any{
        let o:any = {};
        o.raw = this._raw;
        o.offset = this.offset;
        o.location = { offset:this.offset, bb:null };
        o.method = "";

        if(this._parent instanceof ModelBasicBlock){
            o.location.bb = this._parent.offset;
            if(this._parent._parent instanceof ModelMethod){
                o.method = this._parent._parent.signature();
            }
        }
        //o.parent =  this.parent.toJsonObject();
        return o;
    };

    toString():string{
        return this._raw;
    }
}
