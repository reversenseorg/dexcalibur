import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import {Modifier} from "../AccessFlags.js";
import {OPCODE, OpcodeValue} from "../Opcode.js";
import DDVM_ClassInstance from "./DDVM_ClassInstance.js";
import {DDVM_TypeHelper, DTYPE, DTYPE_STRING} from "./DDVM_TypeHelper.js";
import DDVM_VirtualArray from "./DDVM_VirtualArray.js";
import DDVM_Exception from "./DDVM_Exception.js";



/**
 * @class
 */
export default class DDVM_Symbol
{
    static SKIPPED:boolean = true;

    type:any = null;
    value:any = null;
    code:any = null;
    regs:any = [];
    symOffset:any = false;
    symVal:any = null;
    skipped:any = null;

    /**
     *
     * @constructor
     * @param pType
     * @param pValue
     * @param pCode
     * @param pSkipped
     */
    constructor(pType:any, pValue:any, pCode:any=null, pSkipped:boolean=false){
        this.type = pType;
        this.value = pValue;
        this.code = pCode;
        this.regs = [];
        this.symOffset = false;
        this.skipped = pSkipped;
    }

    print():string{
        if(this.value instanceof DDVM_ClassInstance){
            return `type:${DTYPE_STRING[this.type]}, value:(ClassInstance)${this.value.parent.name}, code:${this.code}`;
        }
        else if(this.value instanceof ModelClass){
            return `type:${DTYPE_STRING[this.type]}, value:${this.value.name}, code:${this.code}`;
        }
        else if(this.value instanceof DDVM_VirtualArray){
            return `type:${DTYPE_STRING[this.type]}, value:${this.value.print()}, code:${this.code}`;
        }
        else if(this.value != null){
            switch(this.type){
                case DTYPE.CLASS_REF:
                case DTYPE.FIELD_REF:
                    return `type:${DTYPE_STRING[this.type]}, value:${this.value.signature()}, code:${this.code}`;
                default:
                    return  `type:${DTYPE_STRING[this.type]}, value:${this.value}, code:${this.code}`;
            }

        }
        else{
            return `type:${DTYPE_STRING[this.type]}, value:NULL, code:${this.code}`;
        }
    }

    toJsonObject():any {
        const o:any = {
            type: this.type,
            _type :DTYPE_STRING[this.type],
            value: null,
            code: this.code
        };

        return o;
    }

    setSkipped():void{
        this.skipped = true;
    }

    isSkipped():boolean{
        return this.skipped;
    }

    setCode(pCode:number):void{
        this.code = pCode;
    }

    getCode():any{
        return this.code;
    }

    hasCode():boolean{
        return this.code != null;
    }

    getReferencedValue():any{
        return this.value;
    }

    /**
     * Alias of hasValue()
     *
     * @method
     * @returns {boolean} TRUE if concrete value of the symbol is known, else FALSE
     */
    hasConcrete():boolean {
        return this.hasValue();
    }

    hasValue():boolean{
        return (this.value !== null);
    }

    getValue():any{
        return this.value;
    }

    setValue(pValue:any):void{
        this.value = pValue;
    }

    isThis(pMethod:ModelMethod):boolean{
        return (pMethod instanceof ModelMethod)
            && pMethod.isStatic();
    }

    isConcreteArray():void{
        throw new Error('[DDVM] isConcreteArray(): Not implemented ');
    }

    arrayRead( pOffset:number):any{
        if(this.value != null){
            return this.value[pOffset];
        }else{
            throw new DDVM_Exception('R004',"array-read : Array is undefined");
        }
    }

    arrayWrite( pOffset:number, pValue:any):void{
        if(this.value != null){
            this.value.write(pOffset, pValue);
        }else{
            throw new DDVM_Exception('R003',"array-write : Array is undefined");
        }
    }

    arrayWriteSymbolic( pSymbolOffset:DDVM_Symbol, pSymbolValue:DDVM_Symbol):void{
        this.symOffset = true;
        if(pSymbolValue.hasValue())
            this.symVal.push({ off:pSymbolOffset.getCode(), val:pSymbolValue.getValue() })
        else
            this.symVal.push({ off:pSymbolOffset.getCode(), val:pSymbolValue.getCode() })
    }

    arrayReadSymbolic( pSymbolOffset):any{
        // solve offset
        if(this.value.length == 1){
            return this.value[0];
        }
        else if(this.symVal.length == 1){
            return this.symVal[0];
        }
        else{
            // solve
            return null;
        }
    }

    /**
     * Perform arithmetic add operation
     *
     * @param pValue
     * @param pType
     * @param pOption
     */
    add(pValue:any, pType:OpcodeValue, pOption:any=null):number{
        switch(pType){

            case OPCODE.ADD_LONG_2ADDR.byte:
            case OPCODE.ADD_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) + pValue;
            case OPCODE.ADD_INT_2ADDR.byte:
            case OPCODE.ADD_INT_LIT8.byte:
            case OPCODE.ADD_INT_LIT16.byte:
            case OPCODE.ADD_INT.byte:
                return this.value + pValue;
            case OPCODE.ADD_DOUBLE_2ADDR.byte:
            case OPCODE.ADD_FLOAT_2ADDR.byte:
            case OPCODE.ADD_DOUBLE.byte:
            case OPCODE.ADD_FLOAT.byte:
                return parseFloat(this.value) + parseFloat(pValue);
        }
    }

    sub(pValue:number, pType:OpcodeValue, pOption:any=null):number{
        switch(pType){
            case OPCODE.SUB_LONG_2ADDR.byte:
            case OPCODE.SUB_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) - pValue;
            case OPCODE.SUB_INT_2ADDR.byte:
            case OPCODE.SUB_INT_LIT8.byte:
            case OPCODE.SUB_INT_LIT16.byte:
            case OPCODE.SUB_INT.byte:
                return this.value - pValue;
            case OPCODE.SUB_DOUBLE_2ADDR.byte:
            case OPCODE.SUB_FLOAT_2ADDR.byte:
            case OPCODE.SUB_DOUBLE.byte:
            case OPCODE.SUB_FLOAT.byte:
                return this.value - pValue;
        }
    }

    mul(pValue:number, pType:OpcodeValue, pOption:any=null):number{
        switch(pType){
            case OPCODE.MUL_LONG.byte:
            case OPCODE.MUL_LONG_2ADDR.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) * pValue;
            case OPCODE.MUL_INT_2ADDR.byte:
            case OPCODE.MUL_INT_LIT8.byte:
            case OPCODE.MUL_INT_LIT16.byte:
            case OPCODE.MUL_INT.byte:
                return this.value * pValue;
            case OPCODE.MUL_DOUBLE_2ADDR.byte:
            case OPCODE.MUL_FLOAT_2ADDR.byte:
            case OPCODE.MUL_DOUBLE.byte:
            case OPCODE.MUL_FLOAT.byte:
                return this.value * pValue;
        }
    }


    div(pValue:number, pType:OpcodeValue, pOption:any=null):number{
        switch(pType){
            case OPCODE.DIV_LONG_2ADDR.byte:
            case OPCODE.DIV_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) / (pValue);
            case OPCODE.DIV_INT_2ADDR.byte:
            case OPCODE.DIV_INT_LIT8.byte:
            case OPCODE.DIV_INT_LIT16.byte:
            case OPCODE.DIV_INT.byte:
                return this.value / pValue;
            case OPCODE.DIV_DOUBLE_2ADDR.byte:
            case OPCODE.DIV_FLOAT_2ADDR.byte:
            case OPCODE.DIV_DOUBLE.byte:
            case OPCODE.DIV_FLOAT.byte:
                return parseFloat(this.value) / parseFloat(pValue+"");
        }
    }

    rem(pValue:number, pType:OpcodeValue, pOption:any=null):number{
        switch(pType){
            case OPCODE.REM_LONG_2ADDR.byte:
            case OPCODE.REM_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) % pValue;
            case OPCODE.REM_INT_2ADDR.byte:
            case OPCODE.REM_INT_LIT8.byte:
            case OPCODE.REM_INT_LIT16.byte:
            case OPCODE.REM_INT.byte:
                return this.value % pValue;
            case OPCODE.REM_DOUBLE_2ADDR.byte:
            case OPCODE.REM_FLOAT_2ADDR.byte:
            case OPCODE.REM_DOUBLE.byte:
            case OPCODE.REM_FLOAT.byte:
                return parseFloat(this.value) % parseFloat(pValue+""); // +"" added
        }
    }


    and(pValue:number, pType:OpcodeValue, pOption:any=null):number{
        switch(pType){
            case OPCODE.AND_LONG_2ADDR.byte:
            case OPCODE.AND_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) & pValue;
            case OPCODE.AND_INT_2ADDR.byte:
            case OPCODE.AND_INT_LIT8.byte:
            case OPCODE.AND_INT_LIT16.byte:
            case OPCODE.AND_INT.byte:
                return this.value & pValue;
        }
    }


    or(pValue:number, pType:OpcodeValue, pOption:any=null):number{
        switch(pType){
            case OPCODE.OR_LONG_2ADDR.byte:
            case OPCODE.OR_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) | pValue;
            case OPCODE.OR_INT_2ADDR.byte:
            case OPCODE.OR_INT_LIT8.byte:
            case OPCODE.OR_INT_LIT16.byte:
            case OPCODE.OR_INT.byte:
                return this.value | pValue;
        }
    }


    xor(pValue:number, pType:OpcodeValue, pOption=null):number{
        switch(pType){
            case OPCODE.XOR_LONG_2ADDR.byte:
            case OPCODE.XOR_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) ^ pValue;
            case OPCODE.XOR_INT_2ADDR.byte:
            case OPCODE.XOR_INT_LIT8.byte:
            case OPCODE.XOR_INT_LIT16.byte:
            case OPCODE.XOR_INT.byte:
                return this.value ^ pValue;
        }
    }


    shl(pValue:number, pType:OpcodeValue, pOption=null):number{
        switch(pType){
            case OPCODE.SHL_LONG_2ADDR.byte:
            case OPCODE.SHL_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) << pValue;
            case OPCODE.SHL_INT_2ADDR.byte:
            case OPCODE.SHL_INT_LIT8.byte:
            case OPCODE.SHL_INT_LIT16.byte:
            case OPCODE.SHL_INT.byte:
                return this.value << pValue;
        }
    }


    shr(pValue:number, pType:OpcodeValue, pOption=null):number{
        switch(pType){
            case OPCODE.SHR_LONG_2ADDR.byte:
            case OPCODE.SHR_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) >> pValue;
            case OPCODE.SHR_INT_2ADDR.byte:
            case OPCODE.SHR_INT_LIT8.byte:
            case OPCODE.SHR_INT_LIT16.byte:
            case OPCODE.SHR_INT.byte:
                return this.value >> pValue;
        }
    }


    ushr(pValue:number, pType:OpcodeValue, pOption=null):number{
        switch(pType){
            case OPCODE.USHR_LONG_2ADDR.byte:
            case OPCODE.USHR_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) >>> pValue;
            case OPCODE.USHR_INT_2ADDR.byte:
            case OPCODE.USHR_INT_LIT8.byte:
            case OPCODE.USHR_INT_LIT16.byte:
            case OPCODE.USHR_INT.byte:
                return this.value >>> pValue;
        }
    }
}