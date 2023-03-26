

// modif : isImm
import {CONST} from "../CoreConst.js";
import {OPCODE} from "../Opcode.js";
import {ModelBasicType, ModelObjectType} from "../ModelType.js";
import DDVM_ClassInstance from "./DDVM_ClassInstance.js";

export const DTYPE = {
    IMM_STRING: 0x1,
    IMM_NUMERIC: 0x2,
    IMM_FLOAT: 0x3,
    IMM_BOOLEAN: 0x4,
    IMM_BYTE: 0x5,
    IMM_CHAR: 0x6,
    IMM_SHORT: 0x7,
    IMM_DOUBLE: 0x8,
    IMM_LONG: 0x9,
    OBJECT_REF: 0x20,
    CLASS_REF: 0x21,
    FIELD_REF: 0x22,
    THIS: 0x23,
    ARRAY: 0x24,
    FIELD: 0x25,
    INSTANCE: 0x26,
    WRAPPED_HOOK_RESULT: 0x2a,
    VOID: 0x30,
    UNDEFINED: 0x31,
};

export const DTYPE_STRING = {};
DTYPE_STRING[DTYPE.IMM_STRING] = "String";
DTYPE_STRING[DTYPE.IMM_NUMERIC] = "int|long|short";
DTYPE_STRING[DTYPE.IMM_FLOAT] = "float|double";
DTYPE_STRING[DTYPE.IMM_BOOLEAN] = "boolean";
DTYPE_STRING[DTYPE.IMM_BYTE] = "byte";
DTYPE_STRING[DTYPE.IMM_LONG] = "long";
DTYPE_STRING[DTYPE.IMM_DOUBLE] = "double";
DTYPE_STRING[DTYPE.IMM_SHORT] = "short";
DTYPE_STRING[DTYPE.OBJECT_REF] = "ObjectReference";
DTYPE_STRING[DTYPE.CLASS_REF] = "ClassReference";
DTYPE_STRING[DTYPE.FIELD_REF] = "FieldReference";
DTYPE_STRING[DTYPE.VOID] = "void";
DTYPE_STRING[DTYPE.UNDEFINED] = "NotInitialized";
DTYPE_STRING[DTYPE.THIS] = "this";
DTYPE_STRING[DTYPE.IMM_CHAR] = "char";
DTYPE_STRING[DTYPE.ARRAY] = "Array";
DTYPE_STRING[DTYPE.FIELD] = "Field";
DTYPE_STRING[DTYPE.INSTANCE] = "ClassInstance";
DTYPE_STRING[DTYPE.WRAPPED_HOOK_RESULT] = "WrappedHookResult";

export const BTYPE_DTYPE = {};
BTYPE_DTYPE[CONST.JAVA.T_BOOL] = DTYPE.IMM_BOOLEAN;
BTYPE_DTYPE[CONST.JAVA.T_CHAR] = DTYPE.IMM_CHAR;
BTYPE_DTYPE[CONST.JAVA.T_INT] = DTYPE.IMM_NUMERIC;
BTYPE_DTYPE[CONST.JAVA.T_LONG] = DTYPE.IMM_LONG;
BTYPE_DTYPE[CONST.JAVA.T_SHORT] = DTYPE.IMM_SHORT;
BTYPE_DTYPE[CONST.JAVA.T_BYTE] = DTYPE.IMM_BYTE;
BTYPE_DTYPE[CONST.JAVA.T_FLOAT] = DTYPE.IMM_FLOAT;
BTYPE_DTYPE[CONST.JAVA.T_DOUBLE] = DTYPE.IMM_DOUBLE;
BTYPE_DTYPE[CONST.JAVA.T_OBJ] = DTYPE.OBJECT_REF;
BTYPE_DTYPE[CONST.JAVA.T_VOID] = DTYPE.VOID;


export const ATYPE_DTYPE = {};
ATYPE_DTYPE[OPCODE.AGET.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.AGET_BOOLEAN.byte] = DTYPE.IMM_BOOLEAN;
ATYPE_DTYPE[OPCODE.AGET_BYTE.byte] = DTYPE.IMM_BYTE;
ATYPE_DTYPE[OPCODE.AGET_CHAR.byte] = DTYPE.IMM_CHAR;
ATYPE_DTYPE[OPCODE.AGET_OBJECT.byte] = DTYPE.OBJECT_REF;
ATYPE_DTYPE[OPCODE.AGET_SHORT.byte] = DTYPE.IMM_SHORT;
ATYPE_DTYPE[OPCODE.AGET_WIDE.byte] = DTYPE.IMM_LONG;
ATYPE_DTYPE[OPCODE.APUT.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.APUT_BOOLEAN.byte] = DTYPE.IMM_BOOLEAN;
ATYPE_DTYPE[OPCODE.APUT_BYTE.byte] = DTYPE.IMM_BYTE;
ATYPE_DTYPE[OPCODE.APUT_CHAR.byte] = DTYPE.IMM_CHAR;
ATYPE_DTYPE[OPCODE.APUT_OBJECT.byte] = DTYPE.OBJECT_REF;
ATYPE_DTYPE[OPCODE.APUT_SHORT.byte] = DTYPE.IMM_SHORT;
ATYPE_DTYPE[OPCODE.APUT_WIDE.byte] = DTYPE.IMM_LONG;


export const SYMBOL_OPE = {};
SYMBOL_OPE[CONST.LEX.TOKEN.ADD] = 'add';
SYMBOL_OPE[CONST.LEX.TOKEN.SUB] = 'sub';
SYMBOL_OPE[CONST.LEX.TOKEN.MUL] = 'mul';
SYMBOL_OPE[CONST.LEX.TOKEN.DIV] = 'div';
SYMBOL_OPE[CONST.LEX.TOKEN.REM] = 'rem';
SYMBOL_OPE[CONST.LEX.TOKEN.NOT] = 'not';
SYMBOL_OPE[CONST.LEX.TOKEN.OR] = 'or';
SYMBOL_OPE[CONST.LEX.TOKEN.AND] = 'and';
SYMBOL_OPE[CONST.LEX.TOKEN.XOR] = 'xor';
SYMBOL_OPE[CONST.LEX.TOKEN.SHR] = 'shr';
SYMBOL_OPE[CONST.LEX.TOKEN.SHL] = 'shl';
SYMBOL_OPE[CONST.LEX.TOKEN.USHR] = 'ushr';


export const RET_VOID = 0x100;

export class DDVM_TypeHelper
{
    static getDataTypeOf(pType:any):any{


        //Logger.debug("getDataTypeOf: ",pType);
        if(pType instanceof ModelObjectType){
            if(pType.isArray())
                return DTYPE.ARRAY;
            else
                return DTYPE.OBJECT_REF;
        }
        else if(pType instanceof DDVM_ClassInstance){
            return DTYPE.OBJECT_REF;
        }
        else if(pType instanceof ModelBasicType){
            if(pType.isArray !=undefined && pType.isArray())
                return DTYPE.ARRAY;
            else
                return BTYPE_DTYPE[pType.name];
        }
        // basic type
        else{
            return BTYPE_DTYPE[pType.name];
        }
    }

    static castToDataType(pType:any, pData:any):any{
        switch(pType){
            case DTYPE.IMM_BYTE:
            case DTYPE.IMM_LONG:
            case DTYPE.IMM_SHORT:
            case DTYPE.IMM_NUMERIC:
                return parseInt(pData,10);
            case DTYPE.IMM_DOUBLE:
            case DTYPE.IMM_FLOAT:
                return parseFloat(pData);
            case DTYPE.IMM_STRING:
            case DTYPE.IMM_CHAR:
                return pData+"";
            default:
                return pData;
        }
    }
}
