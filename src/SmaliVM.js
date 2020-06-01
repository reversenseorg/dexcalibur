'use strict';

const CLASS = require("./CoreClass.js");
const CONST = require("./CoreConst.js");
const OPCODE = require('./Opcode.js').OPCODE;
const Util = require('./Utils.js');
var Logger = require("./Logger.js")();

const SINGLE_MODE = 0x1;
const PLURAL_MODE = 0x2;
const RET_VOID = 0x100;

const CR = ""; //\n";k
const METH_INVOKE_SIGNATURE = "java.lang.reflect.Method.invoke(<java.lang.Object><java.lang.Object>[])<java.lang.Object>";
const VTYPE = {
    METH: 0x1
};


// modif : isImm
const DTYPE = {
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

const DTYPE_STRING = {};
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

const BTYPE_DTYPE = {};
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


const ATYPE_DTYPE = {};
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


const SYMBOL_OPE = {};
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


function getDataTypeOf(pType){
    //Logger.debug("getDataTypeOf: ",pType);
    if(pType instanceof CLASS.ObjectType){
        if(pType.isArray())
            return DTYPE.ARRAY;
        else
            return DTYPE.OBJECT_REF;
    }
    else if(pType instanceof VM_ClassInstance){
        return DTYPE.OBJECT_REF;
    }
    else if(pType instanceof CLASS.BasicType){
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


function castToDataType(pType, pData){
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

/**
 * 
 */
class VM_Exception extends Error
{

    constructor( pCode, pMessage){
        super(pMessage);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        this.code = pCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class Symbol
{
    static SKIPPED = true;

    constructor(pVisibility, pType, pValue, pCode=null, pSkipped=false){
        this.type = pType;
        this.value = pValue;
        this.visibility = pVisibility;
        this.code = pCode;
        this.regs = []; 
        this.symOffset = false;
        this.skipped = pSkipped;
    }

    print(){
        if(this.value instanceof VM_ClassInstance){
            return `type:${DTYPE_STRING[this.type]}, value:(ClassInstance)${this.value.parent.name}, code:${this.code}`;
        }
        else if(this.value instanceof CLASS.Class){
            return `type:${DTYPE_STRING[this.type]}, value:${this.value.name}, code:${this.code}`;
        }
        else if(this.value instanceof VM_VirtualArray){
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

    setSkipped(){
        this.skipped = true;
    }

    isSkipped(){
        return this.skipped;
    }

    setCode(pCode){
        this.code = pCode;
    }

    getCode(){
        return this.code;
    }

    hasCode(){
        return this.code != null;
    }

    getReferencedValue(){
        return this.value;
    }

    hasValue(){
        return (this.value !== null);
    }

    getValue(){
        return this.value;
    }

    setValue(pValue){
        this.value = pValue;
    }

    isThis(pMethod){
        return (pMethod instanceof CLASS.Method) 
            && (pMethod.modifiers.static==false);
    }

    isConcreteArray(){

    }

    arrayRead( pOffset){
        if(this.value != null){
            return this.value[pOffset];
        }else{
            throw Error("arrayRead : Array is undefined");
        }
    }

    arrayWrite( pOffset, pValue){
        if(this.value != null){
            this.value.write(pOffset, pValue);
        }else{
            throw Error("arrayWrite : Array is undefined");
        }
    }

    arrayWriteSymbolic( pSymbolOffset, pSymbolValue){
        this.symOffset = true;
        if(pSymbolValue.hasValue())
            this.symVal.push({ off:pSymbolOffset.getCode(), val:pSymbolValue.getValue() })
        else
            this.symVal.push({ off:pSymbolOffset.getCode(), val:pSymbolValue.getCode() })
    }

    arrayReadSymbolic( pSymbolOffset){
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

    add(pValue, pType, pOption=null){
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

    sub(pValue, pType, pOption=null){
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

    mul(pValue, pType, pOption=null){
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


    div(pValue, pType, pOption=null){
        switch(pType){
            case OPCODE.DIV_LONG_2ADDR.byte:
            case OPCODE.DIV_LONG.byte:
                return ((this.value << 32) | (pOption & 0x00000000FFFFFFFF)) / pValue;
            case OPCODE.DIV_INT_2ADDR.byte:
            case OPCODE.DIV_INT_LIT8.byte:
            case OPCODE.DIV_INT_LIT16.byte:
            case OPCODE.DIV_INT.byte:
                return this.value / pValue;
            case OPCODE.DIV_DOUBLE_2ADDR.byte:
            case OPCODE.DIV_FLOAT_2ADDR.byte:
            case OPCODE.DIV_DOUBLE.byte:
            case OPCODE.DIV_FLOAT.byte:
                return parseFloat(this.value) / parseFloat(pValue);
        }
    }

    rem(pValue, pType, pOption=null){
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
                return parseFloat(this.value) % parseFloat(pValue);
        }
    }

    
    and(pValue, pType, pOption=null){
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


    or(pValue, pType, pOption=null){
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


    xor(pValue, pType, pOption=null){
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


    shl(pValue, pType, pOption=null){
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


    shr(pValue, pType, pOption=null){
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


    ushr(pValue, pType, pOption=null){
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

class SymTable
{
    constructor(){
        this.table = {};
    }

    /**
     * To print symbol table / stack info to a string
     * @returns {String} Symbol table info
     */
    print(){
        let m= ``, k=0; 

        for(let i in this.table){
            m += `  - ${i}, ${this.table[i].print()}
`;
            k++;
        }
        
        m = `Table size : ${k}
`+m;
        return m;
    }

    getSymbols(){
        return this.table; 
    }

    addEntry(pSymbol, pVisibility, pType, pValue, pCode, pSkipped=false){
        this.table[pSymbol] =  new Symbol(
            pVisibility,
            pType,
            pValue,
            pCode,
            pSkipped
        );

        return this.table[pSymbol];
    }

    getEntry(pSymbol){
        return this.table[pSymbol];
    }

    hasEntry(pSymbol){
        return (this.table[pSymbol]!==undefined);
    }

    importSymbol(pReg, pSymbol, pExpr){
        return this.addEntry(pReg, pSymbol.visibility, pSymbol.type, pSymbol.value, pExpr, pSymbol.skipped);
    }

    setSymbol(pReg, pType, pValue, pCode=null){
        // Logger.debug("setSymbol: (reg=",pReg,", type=",pType,")");
        return this.addEntry(pReg, VTYPE.METH, pType, pValue, pCode);
    }

    getSymbol(pSymbol){
        return this.table[pSymbol];
    }

    clone(){
        let tab = new SymTable();

        for(let i in this.table){
            tab.addEntry(i, this.table[i].visibility, this.table[i].type, this.table[i].value, this.table[i].code);
        }
        return tab;
    }
}

class XNode
{
    constructor( pBasicBlock, pPrevious ){
        this.block = pBasicBlock;
        this.next = [];
        this.prev = [pPrevious];
    }
}

class State
{
    constructor( pEntrypoint){
        this.entry = pEntrypoint;
        this.current = null;
    }

    newBranch( pTarget){
        let s = this.clone();
        return s.append(pTarget);
    }

    append( pBasicBlock){
        let n = new XNode(pBasicBlock, this.current);
        this.current.next.push(n);
        this.current = n;

        return this;
    }

    clone(){

    }
}

class SavedState
{
    constructor( pTree, pLocalSymTab, pGlobalSymTab, pCurrentState){
        this.state = pTree;
        this.localSymTab = pLocalSymTab;
        this.globalSymTab = pGlobalSymTab;
        this.currentState = pCurrentState;
    }
}


class PseudoCodeMaker
{
    constructor( pVM, pEnable = true){
        this.code = [];
        this.enabled = pEnable;
        this.vm = pVM;
    }

    isEnable(){
        return this.enabled;
    }

    turnOn(){
        this.enabled = true;
    }

    turnOff(){
        this.enabled = false;
    }

    pop(){
        return this.code.pop();
    }

    getIndent(){
        return "    ".repeat(this.vm.depth);
    }

    renderConcrete( pInstance){
        switch(typeof pInstance.getConcrete()){
            case 'string':
                return `"${pInstance.getConcrete()}"`;
            default:
                return pInstance.getConcrete();
        }
    }

    writeInvoke( pMethodRef, pParamsReg){
        let v = null, rThis=null, vThis=0, rArg=null, vArg=null;

        if(pParamsReg.length > 0){
            rThis = this.vm.getRegisterName(pParamsReg[0]);
            vThis = this.vm.stack.getLocalSymbol(rThis);

        }

        // add indent
        v = this.getIndent();

        // Generate 'instance' part of the call
        if((pMethodRef instanceof CLASS.Method) && (pMethodRef.name=="<init>"))
            v += `${rThis} = new ${pMethodRef.enclosingClass.name}(`;
        else if(this.vm.method.modifiers.static==false && regX=="p0"){
            v += `this.${pMethodRef.alias!=null? pMethodRef.alias : pMethodRef.name}(`;
        }
        else if(vThis.type==DTYPE.CLASS_REF && vThis.hasCode()){
            v += `${vThis.getCode()}.${pMethodRef.alias!=null? pMethodRef.alias : pMethodRef.name}(`;
        }
        else if((vThis.getValue() instanceof VM_ClassInstance) 
                && (vThis.getValue().hasConcrete()) 
                && (typeof vThis.getValue().getConcrete() == "string")){
            v += `"${vThis.getValue().getConcrete()}".${pMethodRef.alias!=null? pMethodRef.alias : pMethodRef.name}(`;
        }
        else{
            v += `${rThis}.${pMethodRef.alias!=null? pMethodRef.alias : pMethodRef.name}(`;
        }

        // Generate arguments string
        if(pParamsReg.length > 1){
            for(let j=1; j<pParamsReg.length; j++){

                rArg = this.vm.getRegisterName(pParamsReg[j]);
                vArg = this.vm.stack.getLocalSymbol(rArg);

                if(this.vm.isImm(vArg))
                    v += `${this.vm.getImmediateValue(vArg)},`;
                else if(vArg.getValue() instanceof VM_VirtualArray){
                    v+= vArg.getValue().toString()+',';
                }
                else if(vArg.hasCode() && !vArg.isSkipped())
                    v+= `${vArg.getCode()},`;
                else if(rArg=="p0" && vArg.isThis(this.vm.method)){
                    v += `this, `;
                }
                else if((vArg.getValue() instanceof VM_ClassInstance) 
                    && (vArg.getValue().hasConcrete()) 
                    && (typeof vArg.getValue().getConcrete() == "string")){
                    v += `"${vArg.getValue().getConcrete()}",`;
                }
                else{
                    v += `${rArg},`;
                }
            } 
            v = v.substr(0, v.length-1);
        }
        v += ')';

        this.code.push(v);
    }

    
    writeIndirectInvoke( pInvokerObjRef, pInvokerArgRef, pInvokedMethod, pObj, pArgs){
        let irObj=null, irArg=null, ivObj=null, ivArg=null,  v = null, rThis=null, vThis=0, rArg=null, vArg=null;

        irObj = this.vm.getRegisterName(pInvokerObjRef);
        ivObj = this.vm.stack.getLocalSymbol(irObj); 

        irArg = this.vm.getRegisterName(pInvokerArgRef);
        ivArg = this.vm.stack.getLocalSymbol(irArg);

        if((ivArg.getValue() instanceof VM_VirtualArray) == false){
            Logger.error("[VM][PCMAKER] PseudoCode generator is not able to simplify Method.invoke() call");
            return null;
        }

        // add indent
        v = this.getIndent();

        // Generate 'instance' part of the call
        if((pInvokedMethod instanceof CLASS.Method) && (pInvokedMethod.name=="<init>")){
            // TODO : ??
            // v += `${rThis} = new ${pInvokedMethod.enclosingClass.name}(`;
            v += `new ${pInvokedMethod.enclosingClass.name}(`;
        }
        // caller is not static, p0 is 'this'
        else if(this.vm.method.modifiers.static==false && irObj=="p0"){
            v += `this.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if invoked method is statis
        else if(pInvokedMethod.modifiers.static == true){
            v += `${pInvokedMethod.enclosingClass.alias!=null? pInvokedMethod.enclosingClass.alias : pInvokedMethod.enclosingClass.name}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if instance has expr
        else if(ivObj.type==DTYPE.CLASS_REF && ivObj.hasCode()){
            v += `${ivObj.getCode()}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if object is a class instance
        else if((ivObj.getValue() instanceof VM_ClassInstance) 
                && (ivObj.getValue().hasConcrete()) 
                && (typeof ivObj.getValue().getConcrete() == "string")){
            v += `"${ivObj.getValue().getConcrete()}".${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        else{
            v += `${irObj}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }

        // read array
        ivArg = ivArg.getValue();

        // Generate arguments string
        if(ivArg.realSize() > 0){
            for(let j=0; j<ivArg.realSize(); j++){

                rArg = irArg+"["+j+"]";
                vArg = ivArg.read(j);

                if(vArg instanceof Symbol){
                    if(this.vm.isImm(vArg))
                        v += this.vm.getImmediateValue(vArg);
                    else if(vArg.getValue() instanceof VM_VirtualArray){
                        v+= vArg.getValue().toString();
                    }
                    else if(vArg.hasCode() && !vArg.isSkipped())
                        v+= vArg.getCode();
                    else if(rArg=="p0" && vArg.isThis(this.vm.method)){
                        v += `this`;
                    }
                    else if((vArg.getValue() instanceof VM_ClassInstance) 
                        && (vArg.getValue().hasConcrete()) 
                        && (typeof vArg.getValue().getConcrete() == "string")){
                        v += `"${vArg.getValue().getConcrete()}"`;
                    }
                    else{
                        v += rArg;
                    }
                }
                else if(vArg instanceof VM_ClassInstance){
                    if(vArg.hasConcrete()){
                        v+= this.vm.pcmaker.renderConcrete(vArg);
                    }else{
                        v+= rArg;
                    }
                }
                else{
                    v+= rArg;
                }
                v += ',';                
            } 
            v = v.substr(0, v.length-1);
        }
        v += ')';

        this.code.push(v);
    }

    push( pCode){
        if(this.enabled) this.code.push(pCode);
    }

    append( pMessage){
        if(this.code.length-1 >= 0)
            this.code[this.code.length-1] += pMessage;
        else
            this.code[0] = pMessage;
    }

    last(){
        if(this.enabled && this.code.length>0)
            return this.code[this.code.length-1];
        else 
            return null;
    }

    getCode(){
        return this.code;
    }
}


class VM_VirtualArray
{
    constructor( pType=null, pSize=null){
        this.type = pType;
        this.size = pSize;
        this.symbolicSize = null;
        this.value = [];
    }

    /**
     * To allocate a new array and fill it with given 'stringified' data 
     * 
     * Input must be formatted like it :
     * NUMBER   = 0123456789
     * LETTER   = abcdefABCDEF
     * HEX      = NUMBER | LETTER [ HEX ]  
     * INT      = NUMBER [ INT ] 
     * FLOAT    = <INT> '.' [ <INT> ]
     * CHAR     = "'" <ASCII_CHAR> "'"
     * HEX_STR  = '0x' <HEX>
     * ENTRY    = <CHAR> | <HEX_STR> | <INT> | <FLOAT> 
     * ARRAY    = '[' <ENTRY> [, <ENTRY> ] ']'
     * 
     * Example :
     *  [ 'n', 'u', 'l', 'l' ]
     *  [ 12, 127, 500, 30 ]
     *  [ 0x10, 0xFF, 0xbabe ]
     *  [ 0, 1. ]
     * 
     * @param {String} pArrayStr 
     */
    static fromString( pType, pArrayStr){
        const RE  = new RegExp('[\s\t]*\[[\s\t]*(?<ctn>.*)[\s\t]*\][\s\t]*');
        let m = RE.exec(pArrayStr);
        if(m == null){
            throw new VM_Exception('VM002','Unable to parse bytearray parameter: invalid format');
        }

        let arr = new VM_VirtualArray(pType, 0);
        let entries = null, el=null;
        if(m.groups.ctn.length > 0){
            entries = m.groups.ctn.split(',');
            
            console.log(entries, m);
            /*
             * write() is used instead of push() because array size is unknown
             * and we don't want throw 'array out of bound VM error'. 
             */
            for(let i=0; i<entries.length; i++){
                el = Util.trim(entries[i]);
                console.log(el);
                // char
                if(el[0] == "'" && el.length==3){
                    arr.write( arr.size, Number.parseInt( el.charCodeAt(1), 10 ) );
                }
                // hex
                else if(el.indexOf('0x')>-1){
                    if(el[0]=='-')  
                        arr.write( arr.size, - Number.parseInt( el.substr(1), 16 ));
                    else
                        arr.write( arr.size, Number.parseInt( el, 16 ));
                }
                // float
                else if(el.indexOf('.')>-1){
                    arr.write( arr.size, Number.parseFloat(el) );
                }
                // int
                else{
                    arr.write( arr.size, Number.parseInt( el, 10) );
                }
                arr.size++;
            }
        }

        console.log(arr);

        return arr;       
    }

    /**
     * To print array content
     */
    print(){
        let m='[';    
            
        m += `](size: ${this.size}, realsize:${this.value.length})`;

        return m;
    }
    
    realSize(){
        return this.value.length;
    }

    size(){
        return this.size;
    }

    getValue(){
        return this.value;
    }

    read( pOffset){
        return this.value[pOffset];
    }

    write( pOffset, pObject){
        this.value[pOffset] = pObject;
    }

    push( pObject){
        if(this.value.length >= this.size){
            throw new VM_Exception('VM003','Array out of bound');
        }

        this.value.push(pObject);
    }

    pop(){
        return this.value.pop();
    }

    fillWith( pDataBlock){
        for(let i=0; i<pDataBlock.count(); i++){
            this.value.push(pDataBlock.read(i));
        }
    }
    
    setSymbolicSize( pSize){
        this.size = null;
        this.symbolicSize = pSize;
    }

    setConcreteSize( pSize){
        this.size = pSize;
    }

    toString(){
        let v = '[', e=null;
        //console.log(this);
        for(let i=0; i<this.value.length; i++){
            e = this.value[i];
            if(e instanceof Number){
                if(e > 0x10 && e<0x7f){
                    v+=`'${String.fromCharCode(e)}'`;
                }else if(e < 0){
                    v+= e.toString(16).replace('-','-0x');
                }else{
                    v+= '0x'+e.toString(16);
                }
            }else if(e instanceof VM_ClassInstance){
                v += '<'+e.getClass().name+'@>';
            }else{
                console.log(e);
                v += '<other>';
            }
            v += ',';
        }
        if(v.length > 1)
            return v.substr(0, v.length-1)+']';
        else
            return '[]'; 

    }
}


/**
 * Class performing allocation of component such as 
 * byte array
 * 
 * @class
 * @classdesc Class performing allocation of some components
 */
class VM_Allocator
{
    constructor( pVM, pMemorySize=-1){
        this.maxMemorySize = pMemorySize;
        this.heap = [];
        this.top = 0;
        this.vm = pVM;
    }

    newArray( pType, pSize){
        this.top = this.heap.length;
        this.heap.push( new VM_VirtualArray( pType.name, pSize, this.top ));

        return this.heap[this.top];
    }
}

/**
 * Monitor gather CFG states explored or not.
 */
class Monitor
{
    constructor(){
        this.queuedStates = [];
        this.exploredStates = [];
    }

    queueState( pState){
        this.queuedStates.push(pState);
    }

    /**
     * To move state from queue to exploredState
     * 
     */
    unqueueState(){
        this.exploredStates.push( this.queuedStates.pop() );
    }
}



class VM_HeapEntry
{
    constructor( pName, pType, pValue){
        this.name = pName;
        this.type = pType;
        this.value = pValue;
    }
}



class VM_StackEntry
{
    constructor( pMethod, pObj, pArgs, pReturn = null){
        this.method = pMethod;
        this.symTab = new SymTable();
        this.ret = pReturn;
        this.stats = 0;

        this.states = {};

        this.initSymTable(pObj, pArgs);
    }

    saveState(pLabel = "root"){
        if(this.states[pLabel]==null) this.states[pLabel] = [];
        this.states[pLabel].push(this.symTab.clone());
    }

    restoreState(pLabel = "root"){
        this.symTab = this.states[pLabel];
    }

    setReturn( pReturn){
        this.ret = pReturn;
    }

    getSymbolTable(){
        return this.symTab;
    }

    getReturn(){
        return this.ret;
    }

    /**
     * Set 'this' symbol
     * @param {VM_ClassInstance} pInstance 
     */
    setThis( pInstance){
        this.symTab.setSymbol( 'p0', getDataTypeOf(pInstance), pInstance, 'this');
    }


    /**
     * To set concrete values into parameters
     * 
     * @param {Object[]} pArguments 
     * @param {Boolean} pAutoInstanciate 
     */
    setArguments( pArguments, pAutoInstanciate=false){

        if(this.method.modifiers.static) p=0;

        console.log("SetArguments", pArguments);
        for(let k in pArguments){
            this.symTab.setSymbol( k, pArguments[i].type, pArguments)
        }
    }

    addArgument( pOffset, pType, pValue){
        let p=1;
        if(this.method.modifiers.static) p=0;

        this.symTab.setSymbol( 'p'+(p+pOffset), pType, pValue, null);
    }


    /**
     * 
     * @param {Symbol} pObj Symbol pointing to an instance of the object of the method
     * @param {Symbol[]} pArgs Array of symbols from caller which are arguments of invoked method.
     */
    initSymTable(pObj, pArgs){
        Logger.debug(`[VM] Init (locals:${this.method.locals}, params:${this.method.args.length})`);

        // init parameter register
        let paramOffset = 0, arg=null, arr=null;    
        if(this.method.modifiers.static==false){
            this.symTab.setSymbol('p0', DTYPE.OBJECT_REF, pObj);   
            paramOffset = 1;
        }

        for(let i=paramOffset; i<this.method.args.length+paramOffset; i++){
            arg = this.method.args[i-paramOffset];
            Logger.debug(`initRegister: (reg=p${i}, type=${getDataTypeOf(arg)})`);
            this.symTab.setSymbol('p'+i, getDataTypeOf(arg), (pArgs[i-paramOffset]!==undefined ? pArgs[i-paramOffset].getValue() : null) ); // arg   
        }

        // init local registers
        for(let i=0; i<this.method.locals; i++){
            this.symTab.setSymbol('v'+i, DTYPE.UNDEFINED, null);
        }
    }
}


/**
 * Stack Area contains call stack and return value for each call.
 * @author FrenchYeti
 */
class VM_StackMemory
{
    constructor(){
        // keep a trace of called method
        this.callstack = [];
        this.csLen = 0;

        // when a return happens, local symbol returned by the method is push here
        // if caller move the result, symbol is popped and imported into caller's symbol table 
        this.ret = [];

        // the local symbol table of the current method is stored here
        this.symTab = null;

        this.indirect = [];
    }

    /**
     * To get string containing information about current stack memory
     * 
     * @returns {String} A string containing information
     */
    print(){
        let m=`
Call stack :
`;

        for(let i=this.callstack.length-1; i>=0; i--){
            m+=`    - ${this.callstack[i].method.signature()} (${i})
`;
        }

        m += `
Current registers/symbols :
`;

        m += this.symTab.print();

        if(this.ret.length > 0){
            m+= `
Latest values returned :
`;
            for(let i=0; i<this.ret.length; i++){
                if(this.ret[i] != RET_VOID){
                    m += `  - ${this.ret[i].print()} (${i})
`;
                }else{
                    m += `  - void (${i})
`;
                }

            }
        }

        return m;
    }

    /**
     * To track method invoked indirectly through Reflection API
     * 
     * The aim of such tracking is to help future optimization
     * 
     */
    addIndirectInvoke( pMethod, pThis, pArgs){
        this.indirect.push({ 
            method: pMethod,
            obj: pThis,
            args: pArgs
        });
    }


    lastIndirectInvoke(){
        return this.indirect.pop();
    }

    /**
     * To get the current call stack depth
     * @returns {int} The depth of current call stack. 0 means the top level function is the current function 
     */
    depth(){
        return this.callstack.length-1;
    }

    /**
     * To get current stack entry.
     * It returns the stack entry associated to current running method.
     *  
     * @returns {VM_StackEntry} The stack entry 
     */
    current(){
        return this.callstack[this.callstack.length-1];
    }

    setLocalSymbol( pName, pType, pValue, pCode=null){
        Logger.debug(`[VM] [STACK] Set local symbol ${pName}, type=${pType}, value=${pValue}, code=${pCode}`);
        return this.symTab.setSymbol( pName, pType, pValue, pCode)
    }

    getLocalSymbol( pName){
        Logger.debug(`[VM] [STACK] Get local symbol ${pName}`);
        return this.symTab.getSymbol(pName);
    }

    importLocalSymbol(pReg, pSymbol, pExpr=null){
        Logger.debug(`[VM] [STACK] Import local symbol into ${pReg}`);
        return this.symTab.importSymbol(pReg, pSymbol, (pExpr==null&&pSymbol.getCode()!=null ? pSymbol.getCode() : pExpr) );
    }


    getLocalSymbolTable(){
        return this.symTab;
    }

    clear(){
        this.callstack = [];
        this.ret = [];
    }

    add( pMethod, pObj=null, pArgs=[]){
        this.callstack.push( new VM_StackEntry( pMethod, pObj, pArgs ));
        this.symTab = this.callstack[ this.callstack.length-1 ].symTab;
        Logger.debugBgRed('[VM] [STACK] Add entry : '+pMethod.signature());
    }

    get( pMethodName){
        for(let i=0; i<this.callstack.length; i++){
            if(this.callstack[i].method.signature() ==pMethodName){
                return this.callstack[i];
            }
        }
        return null;
    }

    last(){
        if(this.callstack.length > 0){
            return this.callstack[this.callstack.length-1];
        }else
            return null;
    }

    // duplicated
    lastMethod(){
        if(this.callstack.length > 0){
            return this.callstack[this.callstack.length-1];
        }else
            return null;
    }

    lastReturn(){
        if(this.ret.length > 0){
            return this.ret[this.ret.length-1];
        }else
            return null;
    }

    /**
     * To remove a StackEntry (stack frame) from the callstack.
     * It is called systematically when a method has been successfully invoked.
     */
    pop(){
        if(this.callstack.length>1)
            this.symTab = this.callstack[this.callstack.length-2].symTab;

        return this.callstack.pop();
    }

    /**
     * 
     * @param {Symbol|int} pSymbol The resturn value
     */
    pushReturn( pSymbol){
        this.ret.push( pSymbol);
        //this.callstack[this.callstack.length-1].setReturn( pSymbol);
    }

    /** 
     * To return the latest value push into 'return stack'
     * 
     * @returns {Symbol} The symbol containing concrete data or symbolic expression of the value returned  
    */
    popReturn(){
        return this.ret.pop();
    }

    getReturn(){
        return this.callstack[this.callstack.length-1].getReturn();
    }
}


class VM_ClassInstance
{
    constructor( pClass){
        this.parent = pClass;
        this.fields = {};
        this.initalized = false;
        this.concrete = null;
    }

    isInitialized(){
        return this.initalized;
    }

    getClass(){
        return this.parent;
    }

    linkConcrete( pData){
        this.concrete = pData;
        return this;
    }

    hasConcrete(){
        return (this.concrete != null);
    }

    /**
     * To set data into an instance property
     * 
     * @param {require('./CoreClass.js').Field} pField  Field description from Analyzer  
     * @param {*} pData  Data to set
     */
    setField( pField, pData){
        this.fields[pField.name] = pData;
    }

    /**
     * To get data from a specific property of the instance
     * 
     * @param {require('./CoreClass.js').Field} pField  Field description from Analyzer  
     * @returns {*} Data
     */
    getField( pField){
        if(this.fields[pField.name] === undefined){
            return null;
        }else
            return this.fields[pField.name];
    }
    
    setConcrete( pData){
        this.concrete = pData;
        return this;
    }

    getConcrete(){
        return this.concrete;
    }
}

class VM_ClassLoader
{
    constructor( pVM){
        this.classes={};
        this.vm = pVM;
    }

    /**
     * To load a new class, only if it is necessary.
     * If the class contains static blocks, clinit() is executed. 
     * @param {*} pClass 
     */
    load( pClass, pExecClinit=true){
        let clz = null;
        
        if(pClass instanceof CLASS.Class){
            if(this.classes[pClass.name] != undefined) 
                return this.classes[pClass.name];
            clz = pClass;
        }else if(this.classes[pClass] != undefined) 
        
            return this.classes[pClass];
        else{
            clz = this.vm.context.find.get.class(pClass);
        }

        let fields = clz.getStaticFields(), clinit=null;

        // import static fields into global symbol table
        if(fields.length > 0){
            for(let i=0; i<fields.length; i++){
                this.vm.metharea.setGlobalSymbol( 
                    `${fields[i].enclosingClass.name}.${fields[i].name}`, 
                    getDataTypeOf(fields[i].type), null, 
                    `${fields[i].enclosingClass.name}.${fields[i].name}`);
            }
        }

        // execute clinit() 
        clinit = clz.getClInit();
        if((pExecClinit==true) && (clinit != null)){
            Logger.debugPink(`[VM] [CLINIT] START : Execute ${clinit.signature()} ...`);

            if(this.vm.stack.depth()==0) this.vm.pcmaker.turnOff();
            this.vm.invoke( clinit, null, null);
            if(this.vm.stack.depth()==0) this.vm.pcmaker.turnOn();

            Logger.debugPink(`[VM] [CLINIT] END :  ${clinit.signature()} has been executed`);
        }

        Logger.debugPink(`[VM] [CLASSLOADER] Class ${clz.name} loaded`);
        this.classes[clz.name] = clz;

        return clz;
    }
}

/**
 * This class manages shared memory and overall executed instructions 
 */
class VM_MethodArea
{
    constructor(){
        this.methods = {};

        /*
         Global symbol table is stored here, this table contains
          - static variables (fields)
          - loaded classes (ClassPrototype)
          - uncatched exception
        */
        this.symTab = new SymTable();
    }

    getGlobalSymbolTable(){
        return this.symTab;
    }


    setGlobalSymbol( pName, pType, pValue, pCode=null){

        Logger.debug(`[VM] [METHAREA] Set global symbol ${pName} ${(pValue!=null)? " = "+pValue : ""}`);
        return this.symTab.setSymbol( pName, pType, pValue, pCode)
    }

    getGlobalSymbol( pName){
        Logger.debug(`[VM] [METHAREA] Get global symbol ${pName}`);
        return this.symTab.getSymbol( pName);
    }

    importSymbolTable( pTable){
        this.symTab = pTable;
    }

    /** 
     * To get optimized instructions
     * @param {Method} pMethod The method containing requested instructions 
     * @returns {Object[]} An array of anonymous object containg Instruction object or BasicBlock metadata
     * @deprecated
     */
    getInstructions( pMethod){
        return this.methods[pMethod.signature()];
    }

    /**
     * 
     * @param {Method} pMethod The method to init
     */
    initMethod( pMethod){
        let v = pMethod.signature();
        if(this.methods[v]==null){
            return this.methods[v] = {
                instr: this.analyzeBlocks( pMethod)
            };
        }else
            return this.methods[v];
    }


    /**
     * To perform forward and backward analysis. It allows to identify 
     *  IF statement, GOTO, and more
     * @param {Method} pMethod 
     */
    analyzeBlocks(pMethod){
        
        let blocks =  pMethod.getBasicBlocks();

        if(blocks.length == 0) return null;

        let self = null, next=null, instrStack=[];
        let entry = blocks[0], instr=null, jump=false;


        // forward analysis
        self = entry;
        for(let i=0; i<blocks.length ; i++){

            // avoid basic blocks containing only NOP
            if(blocks[i].isNOPblock()) continue;

            // avoid basic blocks already visited
            if(blocks[i].isVisited()) continue;


            instrStack.push({ i:blocks[i], t:'b' });

            instr = blocks[i].getInstructions();  
            jump = false;
            for(let k=0; k<instr.length; k++){
                
                instrStack.push({ i:instr[k], t:'i' });

                if(instr[k].opcode.type == CONST.INSTR_TYPE.IF){
                    //console.log("IF-", instr[k]);
                    next =  pMethod.getBasicBlockByLabel(instr[k].right.name, CONST.INSTR_TYPE.IF);
                    //Logger.debug(`Block ${i} IF => Block ${next.offset}`)
                    if(blocks[i].hasSuccessor(next)==false){
                        blocks[i].addSuccessor(next);
                    }

                    if(next.hasPredecessor(blocks[i])==false){
                        next.addPredecessor(blocks[i]);
                    }
                    if((blocks[i+1] !== undefined) 
                        && (blocks[i].hasSuccessor(blocks[i+1])==false)){
                        
                       //Logger.debug(`Block ${i} ELSE => Block ${blocks[i+1].offset}`)
                        blocks[i].addSuccessor(blocks[i+1]);

                        if(blocks[i+1].hasPredecessor(blocks[i])==false){
                            blocks[i+1].addPredecessor(blocks[i]);
                        }
                    }
                    jump = true;
                }
                else if(instr[k].opcode.type == CONST.INSTR_TYPE.GOTO){
                    //Logger.debug("GOTO", instr[k]);
                    next =  pMethod.getBasicBlockByLabel(instr[k].right.name, CONST.INSTR_TYPE.GOTO);
                    //Logger.debug(`Block ${i} GOTO => Block ${next.offset}`)
                    
                    if(next == null){
                        
                        Logger.error("[VM] Basic block 'goto_"+instr[k].right.name+"' targeted by goto is not found.");
                    }

                    if(blocks[i].hasSuccessor(next)==false){
                        blocks[i].addSuccessor(next);
                    }

                    if(next.hasPredecessor(blocks[i])==false){
                        next.addPredecessor(blocks[i]);
                    }
                    jump = true;
                }
                else if(instr[k].opcode.type == CONST.INSTR_TYPE.RET){
                    //Logger.debug(`Block ${i} RETURN`)
                    jump = true;
                }
            }

            if((jump == false)
                && (blocks[i+1] !== undefined) 
                && (blocks[i].hasSuccessor(blocks[i+1])==false)){
                
                //Logger.debug(`Block ${i} CONTINUE => Block ${blocks[i+1].offset}`)
                self.addSuccessor(blocks[i+1]);
                blocks[i+1].addPredecessor(blocks[i]);
            }
            blocks[i].visit();   
        }

        Logger.debug(`[VM] Basic blocks optimization done.`)
        return instrStack;
    }
}

/**
 * Class managing the heap area. This component handle data 
 * shared by several thread. There is a single heap area per VM instance.
 * 
 * This class handles class instances, class loaders, static field, and more 
 * 
 * @class
 * @classdesc Class managing the heap area
 */
class VM_HeapArea
{
    /**
     * To constructr Heap Area
     * 
     * @param {VM} pVM The VM instance
     * @param {VM_ClassLoader} pClassLoader The default class loader
     */
    constructor( pVM, pClassLoader){
        this.heap = [];
        this.free = [];
        this.vm = pVM;
        this.classloader = pClassLoader;
    }

    /**
     * To clear heap area
     */
    clear(){
        this.heap = [];
        this.free = [];
    }

    /**
     * To load a class. 
     * 
     * Actually only built-in classloader is supported 
     * 
     * @method
     * @param {Class} pClass The class to load
     * 
     */
    loadClass( pClass){
        return this.classloader.load( pClass);
    }

    /**
     * To instanciante a new object from specified class.
     * 
     * @method
     * @param {Class} pClass the class to instanciate 
     * @param {ObjectType[]|BasicType[]|Symbol[]} pArgs Array of argument to pass to constructor 
     * @returns {VM_ClassInstance} An instance of the class
     */
    newInstance( pClass, pArgs=[], pConstructor=null){
        let ref=null, clz=null;
        
        if(pClass instanceof CLASS.Class)
            Logger.debugBgRed(`[VM] [HEAP] START : New instance of ${pClass.name}`);
        else
            Logger.debugBgRed(`[VM] [HEAP] START : New instance of ${pClass}`);

        // load class if needded
        clz = this.loadClass(pClass);

        ref = this.heap.length;
        this.heap.push( new VM_ClassInstance(clz));

        if(pClass instanceof CLASS.Class)
            Logger.debugBgRed(`[VM] [HEAP] END  : New instance of ${pClass.name}`);
        else
            Logger.debugBgRed(`[VM] [HEAP] END : New instance of ${pClass}`);

        //return ref;
        return this.heap[this.heap.length-1];
    }

    /**
     * To get an element from Heap Area
     * 
     * @method
     * @param {ObjectType} pType 
     * @param {String} pName 
     */
    get( pType, pName){
        for(let i=0; i<this.heap.length; i++){
            if((this.heap[i].type ==pType) && (this.heap[i].name == pName)){
                return this.heap[i];
            }
        }
        return null;
    }

    getObject( pRef){
        return this.heap[pRef];
    }

    add( pName, pObject, pType){
        if(this.free.length > 0){
            this.heap[this.free.pop()] = new VM_HeapEntry( pName, pType, pObject);
        }
    }

    remove( pName, pType){
        for(let i=0; i<this.heap.length; i++){
            if((this.heap[i].type == pType) && (this.heap[i].name == pName)){
                this.heap[i] = null;
                this.free.push(i);
            }
        }
    }
}


/**
 * Class describing a hook into the VM, it allows to provide custom implementation
 * of method.
 *
 * @class
 * @classdesc Class describing a hook into the VM
 */
class VM_Hook
{
    /**
     * 
     * @constructor
     * @param {String} pMethodName The signature of the method to hook
     * @param {Function} pHook 
     * @param {Boolean} pEnable 
     */
    constructor( pMethodName, pHook, pEnable=true){
        this.method = pMethodName;
        this.hook = pHook;
        this.enable = pEnable;
    }

    /**
     * To execute the hook code with the given context
     * 
     * @method
     * @param {VM} pVM The context of the VM
     * @param {VM_ClassInstance} pThis If the method is not static, the instance invoking the method. Else, if the method is static, it is NULL
     * @param {Symbol} pArgs The registers containing value of arguments
     * @return {*} Value returned by hook function
     */
    exec( pVM, pMethod, pThis, pArgs){
        return this.hook(pVM, pThis, pArgs);
    }
}

/**
 * Class logging message from the VM. 
 * 
 * It handles internal VM logs and Android logs (thanks to android.Log hooks).
 * 
 * @class
 * @classdesc Class logging message from the VM 
 */
class VM_Log
{
    constructor(){
        this.logs = [];
    }

    reset(){
        this.logs = [];
    }

    write( pMsg){
        this.logs.push(pMsg);
    }

    read(){
        return this.logs;
    }
}


/**
 * Class managing minimalist smali VM and performing partial smali execution.
 * 
 * VM instance is unique (singleton pattern). 
 * Use getInstance() to get reference. 
 * 
 * You can reset different part of the VM quickly by using softReset() or reset().
 * 
 *  - softReset() does not reset Heap Area and Method Area. It allows to reuse previously loaded class.
 *  - reset() does an hard reset. It reset Stack Memory, Method Area, Heap Area, Logger and more.   
 *  
 * 
 * @class
 * @classdesc Class managing minimalist smali VM and performing partial smali execution.
 */
class VM
{

    /**
     * Instance of the VM  
     * @member
     */
    static __instance =  null;

    constructor(pContext, pMethod = null, pLocalSize = null, pParamSize = null){
        
        this.context = pContext;

        this.logs = new VM_Log();

        // symTab is the symbol table of the current running method (the last into call stack) 
        this.symTab = null;

        this.globalSymTab = new SymTable();

        this.monitor = new Monitor();

        // class instance are stored into heap 
        this.classloader = new VM_ClassLoader(this);
        this.heap = new VM_HeapArea(this, this.classloader);
        this.stack = new VM_StackMemory();
        this.pcmaker = new PseudoCodeMaker(this, true);
        this.metharea = new VM_MethodArea();
        this.allocator = new VM_Allocator( this, -1);

        this.invokes = [];

        this.method = pMethod;
        
        this.simplify = 0;

        this.countUntreated = 0;
        this.depth = 0;
        this.savedContexts = {};
        this.visited = [];
        this.currentContext = "root";
 
        this.config = {
            loadClassFirst: false,
            mockAndroidInternals: false,
            autoInstanceArgs: false,
            simplify: 0,
            initParent: true
        };

        this.pseudocode = false;  

        this.hooks = {};
    }

    performLongBinaryOp( pOpCode, pDest, pSrc1, pSrc2){

        
        switch(pOpCode){
            case OPCODE.ADD_LONG.byte:
                
                break;

        }
    }

    performBinaryOpAddr2( pOpCode, pType, pDest, pSrc1){

    }


    /**
     * 
     * @param {*} pRegister 
     */
    prepareLong( pRegister ){
        let s = { 
            mn: this.getRegisterName({ t:pRegister.t, i:pRegister.i }),
            ln: this.getRegisterName({ t:pRegister.t, i:pRegister.i+1 }),
            v: null
        };

        s.m = this.stack.getLocalSymbol( s.mn );
        s.l = this.stack.getLocalSymbol( s.ln );

        if(this.isImm(s.m) && this.isImm(s.l)){
            s.v = (s.m << 32) & (s.l & 0x00000000FFFFFFFF);
        }

        return s;
    }

    /**
     * 
     * @param {*} pOpCode 
     * @param {*} pType 
     * @param {*} pDest 
     * @param {*} pSrc 
     */
    performBinaryOp( pOpCode, pType, pDest, pSrc1, pSrc2=null){

        let dst = null, src1 = null, src2 = null;

        src1 = { 
            m: this.stack.getLocalSymbol( this.getRegisterName({ t:pSrc1.t, i:pSrc1.i+1 })), 
            l: this.stack.getLocalSymbol( this.getRegisterName({ t:pSrc1.t, i:pSrc1.i })),
            v: null
        };

        src2 = { 
            m: this.stack.getLocalSymbol( this.getRegisterName({ t:pSrc2.t, i:pSrc2.i+1 })), 
            l: this.stack.getLocalSymbol( this.getRegisterName({ t:pSrc2.t, i:pSrc2.i })),
            v: null
        };

        if(this.isImm(src1.m) && this.isImm(src1.l)){
            src1.v = (src1.m << 32) & (src1.l & 0x00000000FFFFFFFF);
        }

        if(this.isImm(src2.m) && this.isImm(src2.l)){
            src2.v = (src2.m << 32) & (src2.l & 0x00000000FFFFFFFF);
        }

        if(src1.v !== null && src2.v !== null){
            switch(pOpCode){
                case OPCODE.ADD_LONG.byte:
                    dst = src2.m
                case OPCODE.SUB_LONG.byte:
                case OPCODE.DIV_LONG.byte:
                case OPCODE.MUL_LONG.byte:
                case OPCODE.REM_LONG.byte:
                case OPCODE.OR_LONG.byte:
                case OPCODE.XOR_LONG.byte:
                case OPCODE.AND_LONG.byte:
                    break;
                case OPCODE.SHR_LONG.byte:
                case OPCODE.SHL_LONG.byte:
                case OPCODE.USHR_LONG.byte:
                    dst = src2.m
                    break;
            }
            dst = src1.v
            this.stack.setLocalSymbol(
                this.getRegisterName({ t:pSrc1.t, i:pSrc1.i+1 }),
                DTYPE.IMM_LONG,

            );
        }
        else if(src1.v !== null){

        }
        else if(src2.v !== null){

        }
        else{

        }

        if(pType == DTYPE.IMM_LONG){
            return this.performLongBinaryOp( pOpCode, pDest, pSrc1, pSrc2);    
        }
        else if(pType == DTYPE.IMM_DOUBLE){
            return this.performLongBinaryOp( pOpCode, pDest, pSrc1, pSrc2);    
        }

        regX = this.getRegisterName(oper.right);
        regX = this.stack.getLocalSymbol(regX);

        if(this.isImm(regX)){

            regV = this.getRegisterName(oper.left[0]);
            regV = this.stack.getLocalSymbol(regV);

            if(this.isImm(regV)){
//                                this.setSymbol(regX, regX.add(regV.getValue(), oper.opcode.byte));

                
                this.stack.setLocalSymbol(
                    regV, 
                    DTYPE.IMM_NUMERIC,
                    regX[SYMBOL_OPE[oper.opcode.ope]](regV.getValue(), oper.opcode.byte),
                    `${this.getImmediateValue(regX)}${oper.opcode.ope}${this.getImmediateValue(regV)}`);

                //break;
            }
            else{

                if(regV.hasCode()){
                    this.stack.setLocalSymbol(
                        regV, 
                        DTYPE.IMM_NUMERIC,
                        null,
                        `(${regV.getCode()})${oper.opcode.ope}${this.getImmediateValue(regV)}`);

                }else{
                    this.stack.setLocalSymbol(
                        regV, 
                        DTYPE.IMM_NUMERIC,
                        null,
                        `${this.getRegisterName(oper.left[0])}${oper.opcode.ope}${this.getImmediateValue(regV)}`);    
                }
            }
        }       
        else {

            regV = this.getRegisterName(oper.left[0]);
            regV = this.stack.getLocalSymbol(regV);

            if(this.isImm(regV)){
                if(regX.hasCode()){
                    this.stack.setLocalSymbol(
                        regV, 
                        DTYPE.IMM_NUMERIC,
                        null,
                        `${this.getImmediateValue(regV)}${oper.opcode.ope}(${regX.getCode()})`);

                }else{
                    this.stack.setLocalSymbol(
                        regV, 
                        DTYPE.IMM_NUMERIC,
                        null,
                        `${this.getImmediateValue(regV)}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);
                }

                
            }
            else{
                this.stack.setLocalSymbol(
                    regV, 
                    DTYPE.IMM_NUMERIC,
                    null,
                    `${(regV.hasCode()? '('+regV.getCode()+')':this.getRegisterName(oper.left[0]))}${oper.opcode.ope}${(regX.hasCode()? '('+regV.getCode()+')':this.getRegisterName(oper.right))}`);
            }
        }

        return "";
    }
    /**
     * To write a message into VM logs.
     * 
     * @param {String} pMessage The message to log
     */
    writeLog( pMessage){
        Logger.info("[VM][LOG] "+pMessage);
        this.logs.write(pMessage);
    }

    /**
     * To read all logs from the VM
     * 
     * @returns {String[]} An array containing all log messages
     */
    readLog(){
        return this.logs.read();
    }

    /**
     * To reset context component related to code inside a method (soft reset)
     * Warning: this function not remove static field modified during previous runtime 
     * or instances created previously.
     *   
     * It can help to improve performane
     */
    softReset(){
        this.stack = new VM_StackMemory();
        this.pcmaker = new PseudoCodeMaker(this, true);
        this.allocator = new VM_Allocator( this, -1);
        this.logs.reset();

        this.savedContexts = {};
        this.visited = [];
        this.currentContext = "root";
        this.depth = 0;
    }

    /**
     * To reset VM components related to context. 
     */
    reset(){
        this.classloader = new VM_ClassLoader(this);
        this.heap = new VM_HeapArea(this, this.classloader);
        this.stack = new VM_StackMemory();
        this.pcmaker = new PseudoCodeMaker(true);
        this.metharea = new VM_MethodArea();
        this.allocator = new VM_Allocator( this, -1);
        this.logs.reset();

        this.savedContexts = {};
        this.visited = [];
        this.currentContext = "root";
    }

    /**
     * 
     * @param {Class} pClass 
     * @param {String} pName 
     * @param {Symbol[]} pArgs 
     * @returns {Method} The method with the corresponding signature, else NULL
     */
    getMethodFromClass( pClass, pName, pArgs){
        let ok = null, arg=null;
        let meths = pClass.getMethod({ name:pName }, CONST.EXACT_MATCH);

        if(meths.length==0) return null;

        for(let i=0; i<meths.length; i++){
            if(pArgs.length != meths[i].args.length) continue;
            ok = true;
            for(let j=0; j<pArgs.length; j++){
                arg = pArgs[j].getValue();
                
                if(arg instanceof CLASS.ObjectType){
                    if(arg._name != meths[i].args[j]._name) ok=false;
                }
                else if(arg instanceof CLASS.Class){
                    if(arg.name != meths[i].args[j]._name) 
                        ok=false;
                }
                else{
                    Logger.error(`[VM] [REFLECT] Method ${pName} : invalid argument type `)
                }
            }

            if(ok) return meths[i];
        }

        return null;
    }

    /**
     * To check if a hook exist into the VM for given method
     * 
     * @param {Method} pMethod An instance of Method 
     * @returns {Boolean} Return TRUE if an hook is set, else FALSE 
     */
    isHooked( pMethod){
        return (this.hooks[pMethod.signature()] instanceof VM_Hook);
    }

    /**
     * To execute the hook associate to pMethod
     * 
     * @param {*} pMethod 
     * @param {*} pThis 
     * @param {*} pObj 
     * @returns {Boolean} TRUE if hook have been executed, else FALSE 
     */
    execHook( pMethod, pThis, pArgs){
        if( this.hooks[pMethod.signature()] !== null ){
            return this.hooks[pMethod.signature()].exec( this, pMethod, pThis, pArgs);
        }else{
            return false;
        }
    }

    /**
     * To define a function called instead of specified method.
     * It allows to hook internal Android method
     *  
     * @param {String} pMethodName The name of the method to hook
     * @param {Function} pHook The callback function
     */
    defineHook( pMethodName, pHook){
        this.hooks[pMethodName] = new VM_Hook( pMethodName, pHook, true);
    }

    /**
     * To configure VM
     * @param {Object} pConfig Configuration of the VM
     */
    setConfig( pConfig){
        for(let i in pConfig){
            this.config[i] = pConfig[i];
        }
    }

    /**
     * To get an instance of the VM
     * @returns {VM} Returns an instance of the VM
     */
    static getInstance( pContext){
        if(VM.__instance==null){
            VM.__instance = new VM(pContext);
        }
        return VM.__instance;
    }

    /**
     * @deprecated
     * @param {*} pSymTab 
     */
    importGlobalSymbols( pSymTab){
        this.metharea.importSymbolTable( pSymTab); 
    }

    /**
     * 
     * @param {String} pLabel 
     */
    changeContextLabel(pLabel = "root"){
        this.currentContext = pLabel;
    }
    
    enablePseudocode(){
        this.pseudocode = true;
    }

    disablePseudocode(){
        this.pseudocode = false;
    }

    saveContext(pLabel = "root"){
        this.stack.current().saveState(pLabel);
        //this.savedContexts[pLabel] = this.stack.current().clone(); // getLocalSymbolTable().clone();
        //console.log(this.savedContexts);
        Logger.debug("[VM] [SYM] Save : "+pLabel);
    }

    restoreContext( pNextLabel){
        this.stack.current().saveState(this.currentContext);
        this.currentContext = pNextLabel;
        this.stack.current().restoreState(pNextLabel);

//        this.savedContexts[this.currentContext] = this.stack.getLocalSymbolTable();
//        this.currentContext = pNextLabel;
//        this.symTab = this.savedContexts[pNextLabel];
//        this.stack.symTab = this.savedContexts[pNextLabel];

        Logger.debug("[VM] [SYM] Archive : "+this.currentContext+", Restore :"+pNextLabel);
    }

    contextExists( pLabel){
        return (this.stack.current().hasState(pLabel) != null);
    }

    getEntrypoint(){
        return this.method;
    }

    /**
     * 
     * @param {*} pMethod 
     * @param {*} pLocalSize 
     * @param {*} pParamSize 
     * @deprecated
     */
    initRegisters(pMethod, pLocalSize, pParamSize){

        Logger.debug(`[VM][DEPRECATED] Init  (locals:${pLocalSize}, params:${pParamSize})`);

        // init parameter register
        let paramOffset = 0, arg=null;    
        if(pMethod.modifiers.static==false){
            this.setSymbol('p0', DTYPE.CLASS_REF, pMethod.enclosingClass);   
            paramOffset = 1;
        }

        for(let i=paramOffset; i<pParamSize+paramOffset; i++){
            arg = pMethod.args[i-paramOffset];
            Logger.debug("initRegister: (reg=p",i,", type=", getDataTypeOf(arg),")");
            this.setSymbol('p'+i, getDataTypeOf(arg), null); // arg   
        }


        // init local registers
        for(let i=0; i<pLocalSize; i++){
            this.setSymbol('v'+i, DTYPE.UNDEFINED, null);
        }

        this.countUntreated = 0;
    }

    /**
     * To remove "visited" flags from basic blocks.
     * It should be applied only to analyzed method, 
     * because it is involved into process making the pseudocode 
     */
    cleanVisitedBlock(){
        let block = this.method.getBasicBlocks();
        for(let i=0; i<block.length; i++){
            block[i].initVisit();
        }
    }

    /**
     * 
     * @param {*} pLevel 
     * @deprecated
     */
    setSimplifyingLevel(pLevel){
        this.simplify = pLevel;
    }

    prepareArguments( pMethod, pArgumentsValue){
        let args={}, p=0;

        if(pMethod.modifier.static==false) p=1;
        
        for(let i=0; i<pMethod.args.length; i++){

            args[p+i] = new Symbol(
                VTYPE.METH,
                getDataTypeOf(pMethod.args[i]),
                pArgumentsValue["p"+(p+i)].sym==false? pArgumentsValue["p"+(p+i)].val : null,
                null
            );
        }

        return args;
    }

    /**
     * To execute a method and to perform static analysis 
     * @param {*} pMethod 
     * @param {*} pLevel 
     */
    start( pMethod, pThis, pArguments=null, pClearHeap=false){
        let opt = null, margs=null, arr=null;

        // clean StackMemory 
        this.stack.clear();

        // If forced, clean HeapArea
        if(pClearHeap == true){
            this.heap.clear();
        }

        // init 
        this.method = pMethod 
        opt = this.metharea.initMethod(pMethod);

        if(this.config.loadClassFirst){
            this.classloader.load(this.method.enclosingClass, (this.config.initParent && pMethod.name!="<clinit>"));
            // clear stack : remove data if <clinit> has been executed
            this.stack.clear();
        }

        // init callstack with entrypoint
        this.stack.add(pMethod);
        
        // if method is not static 'this' reference should be instanciate 
        if(this.method.modifiers.static == false){
            if(pThis == null){
                this.stack.last().setThis( this.heap.newInstance(this.method.enclosingClass) );
                //console.log(this.stack.symTab.table.p0);
            }else
                this.stack.last().setThis( pThis);
        }

        // if arguments are passed, 
        //if((typeof pArguments == 'array') && pArguments.length > 0){
        //    console.log("set args");
        //    this.stack.last().setArguments(pArguments);
        //}
        // else if flag 'autoInstanceArgs' is true 
        // TODO
        // else if(this.config.autoInstanceArgs && this.method.hasArgs()){
        if(this.config.autoInstanceArgs && this.method.hasArgs()){
        
            margs = this.method.args;

            for(let i=0; i<margs.length; i++){
                if(margs[i] instanceof CLASS.ObjectType){
                    
                    if((pArguments!=null) && (pArguments["p"+i] !=null)){
                        //console.log(margs[i]);
                        if(pArguments["p"+i].val != null)
                            this.stack.last().addArgument(i, getDataTypeOf(margs[i]), 
                                this.heap.newInstance(margs[i]._name).setConcrete(pArguments["p"+i].val));
                        else if(pArguments["p"+i].notset==true)
                            this.stack.last().addArgument(i, getDataTypeOf(margs[i]), this.heap.newInstance(margs[i]._name));
                        else
                            this.stack.last().addArgument(i, getDataTypeOf(margs[i]), 
                                this.heap.newInstance(margs[i]._name));
                    }else{
                        this.stack.last().addArgument(i, getDataTypeOf(margs[i]), 
                            this.heap.newInstance(margs[i]._name));
                    }

                }else{
                    if((pArguments!=null) && (pArguments["p"+i] !=null)){
                        if(pArguments["p"+i].val != null){
                            if(getDataTypeOf(margs[i])==DTYPE.ARRAY){
                                // parse array string
                                arr = VM_VirtualArray.fromString( margs[i].type, pArguments["p"+i].val);

                                this.stack.last().addArgument(i, getDataTypeOf(margs[i]), arr);                            
                            }else
                                this.stack.last().addArgument(i, getDataTypeOf(margs[i]), castToDataType(getDataTypeOf(margs[i]), pArguments["p"+i].val));
                        }else if(pArguments["p"+i].notset==true)
                            this.stack.last().addArgument(i, DTYPE.UNDEFINED, null);
                        else
                            this.stack.last().addArgument(i, getDataTypeOf(margs[i]), null);
                    }else{
                        this.stack.last().addArgument(i, getDataTypeOf(margs[i]), null);
                    }

                    //this.stack.last().addArgument(i, margs[i], this.allocator.malloc(pArguments[i]));
                }
            }
        }
        /*else{
            console.log("nothing to do with args");
        }*/

        // clean visited blocks
        this.cleanVisitedBlock();

        // execute
        this.run(opt.instr);
    }


    /**
     * To convert operand anonymous object from Instruction into register name
     *  
     * @param {Object} pReg 
     */
    getRegisterName(pReg){
        if(pReg.t=='v')
            return "v"+pReg.i
        else
            return "p"+pReg.i;
    }
    

    getSymbol(pReg){
//        return this.symTab.getEntry(pReg); 
        return this.stack.getLocalSymbolTable().getSymbol(pReg); 
    }

    getDataTypeOf(pType){
        Logger.debug("getDataTypeOf: ",pType);
        if(pType instanceof CLASS.ObjectType){
            return DTYPE.OBJECT_REF;
        }
        else if(pType instanceof VM_ClassInstance){
            return DTYPE.OBJECT_REF;
        }
        else{
            return BTYPE_DTYPE[pType.name];
        }
    }

    importSymbol(pReg, pSymbol, pExpr){
        return this.stack.getLocalSymbolTable().addEntry(pReg, pSymbol.visibility, pSymbol.type, pSymbol.value, pExpr);
    }

    setSymbol(pReg, pType, pValue, pCode=null){
        Logger.debug("setSymbol: (reg=",pReg,", type=",pType,")");
//        return this.symTab.addEntry(pReg, VTYPE.METH, pType, pValue, pCode);
        return this.stack.getLocalSymbolTable().setSymbol(pReg, pType, pValue, pCode);
    }


    setGlobalSymbol(pName, pType, pValue, pCode=null){
        Logger.debug("setGlobalSymbol: (reg=",pName,", type=",pType,")");
//        return this.globalSymTab.addEntry(pName, VTYPE.VM, pType, pValue, pCode);
        return this.metharea.setGlobalSymbol(pReg, pType, pValue, pCode);
    }

    /**
     * To check if the Symbol/register has concrete value
     * 
     * @param {Symbol} pSymbol The symbol to check
     * @returns {Boolean} TRUE if the symbol has concrete value, else FALSE
     */
    isImm(pSymbol){
        if(pSymbol.type < DTYPE.OBJECT_REF && (pSymbol.value != null)){
            return true;
        }
        else if(pSymbol.type == DTYPE.OBJECT_REF 
            && (pSymbol.value instanceof VM_ClassInstance)
            && (pSymbol.getValue().hasConcrete())){
                return true;
        }else{
            return false;
        }
    }

    getImmediateValue(pSymbol, pSeparator="", pForce=false){
        let v="";
        switch(pSymbol.type)
        {
            case DTYPE.IMM_STRING:
                v = `"${pSymbol.value}"${pSeparator}`;
                break;
            case DTYPE.IMM_NUMERIC:
            case DTYPE.IMM_SHORT:
            case DTYPE.IMM_LONG:
            case DTYPE.IMM_DOUBLE:
            case DTYPE.IMM_FLOAT:
                v = `${pSymbol.value}${pSeparator}`;
                break;
            case DTYPE.IMM_BYTE:
                v = `(byte)0x${pSymbol.value}${pSeparator}`;
                break;
            case DTYPE.IMM_BOOLEAN:
                v = `${pSymbol.value}${pSeparator}`;
                break;
            case DTYPE.IMM_CHAR:
                v = `'${pSymbol.value}'${pSeparator}`;
                break;
            case DTYPE.OBJECT_REF:
                v = pSymbol.getValue().getConcrete();
                if(typeof v == 'string'){
                    v = `"${v}"${pSeparator}`;
                    break; 
                }
            default:
                /*if(pForce)
                    v+= this.getRegisterName(oper.left[j])+pSeparator;
                else*/
                v =`<DECOMPILER_ERROR>${pSeparator} // ${pSymbol.type}`;
                break;
        }
        return v;
    }

    moveRegister(pSrcRegister, pDestRegister){
        let src = this.stack.getLocalSymbol(pSrcRegister);
        this.stack.setLocalSymbol(pDestRegister, src.type, src.getValue(), src.getCode());
    }

    findOffsetByLabel( pStack, pLabel, pType){
        for(let i=0; i<pStack.length; i++){
            if(pStack[i].t=='b'){
                //console.log(pStack[i].i.getGotoLabel(), pLabel);
                if(pType == CONST.INSTR_TYPE.IF && pStack[i].i.getCondLabel()==pLabel){
                    return i;
                }
                else if(pType == CONST.INSTR_TYPE.GOTO && pStack[i].i.getGotoLabel()==pLabel){
                    return i;
                }
            } 
        }
        return null;
    }


    /**
     * 
     * @param {Method} pMethod 
     * @param {VM_ClassInstance} pObj 
     * @param {Symbol[]} pArgs Array of symbols containing arguments value or expr 
     */
    invoke( pMethod, pObj, pArgs){
        let opt = null;

        // execute hooks 
        if(this.isHooked(pMethod)){
            this.stack.add( pMethod, pObj, pArgs);
            console.log(this.stack.print());
            this.execHook( pMethod, pObj, pArgs);
            this.stack.pop(); 
            return null;
        }

        // If mockAndroidInternals=TRUE, ignore invoke of Android Internal emthods
        if(this.config.mockAndroidInternals && pMethod.hasTag('di')){
            Logger.debugPink(`[VM] [INVOKE] Android Internal method ignored by config (mockAndroidInternals) : ${pMethod.signature()}`);
            this.stack.pushReturn(new Symbol(
                VTYPE.METH,
                getDataTypeOf(pMethod.ret),
                null,
                null
            ))
            return null;
        }

        // add method to callstack + symtab init
        this.stack.add( pMethod, pObj, pArgs);

        // set 'this' symbol if not null
        if(pObj != null){
            this.stack.last().setThis(pObj);
        }

        // set arguments symbol (import caller symbol into symbol table of called tables)
        if((typeof pArgs == 'array') && pArgs.length > 0){
            this.stack.last().setArguments(pArgs);
        }

        // run 
        opt = this.metharea.initMethod( pMethod);
        this.run( opt.instr);

        // pop from callstack and move result to return stack
        this.stack.pop(); 

        // return, if a value is returned the value is stored  
        return this.stack.lastReturn();
    }
    

    /**
     * 
     * @param {Object[]} pStack 
     * @param {Integer} pDepth 
     */
    run( pStack, pDepth=0){
        let i=0, f=0, dec=null, msg=null, ctxRST=null, bbs=null, mode=SINGLE_MODE ;
        let indent = "    ".repeat(this.depth);

        // add emulated method to callstack;
        
        do{
           
            // instruction
            if(pStack[i].t=='i'){

                dec = this.execute(pStack, i);

                if(dec.code.length > 0  && !Util.isEmpty(dec.code, Util.FLAG_WS | Util.FLAG_CR | Util.FLAG_TB)){
                    //console.log(dec.code);

                    //ssmali = ssmali.concat(dec.code);   
                    this.pcmaker.push(dec.code[0]);   
                    Logger.debug(`[PCMAKER] ${this.pcmaker.last()}`);

                }/*else{
                    ssmali.push(`// empty block : dead code removed or block already simplified (contant propagated)`)
                }*/

                if(dec.jump != null){
                    i = this.findOffsetByLabel( pStack, dec.jump.label, dec.jump.type);

                    // if target block has multiple predecessors, 
                    // add "goto" instruction to pseudo code
                    if(pStack[i].i.hasMultiplePredecessors()){
                        this.pcmaker.push(`${indent}goto :goto_${dec.jump.label}`);   
                    }
                }
                else if(dec.inv != null){
                    if(this.stack.callstack.length==1) this.pcmaker.turnOff();

                    if( (this.config.maxdepth==-1) || (this.config.maxdepth - this.stack.depth()) > 0){
                        
                        
                        this.invoke( dec.inv.meth, dec.inv.obj, dec.inv.args);
                        
                        if(this.stack.callstack.length==1){
                            this.pcmaker.turnOn();

                            if(dec.inv.meth.signature() == METH_INVOKE_SIGNATURE
                                && this.config.simplify>0){

                                dec = this.stack.lastIndirectInvoke();

                                // replace last pseudo-code line by new one
                                this.pcmaker.pop();
                                this.pcmaker.writeIndirectInvoke( 
                                    // Method.invoke() context
                                    pStack[i].i.left[1], pStack[i].i.left[2],
                                    // invoked method
                                    dec.method, dec.obj, dec.args);

                            }
                        }
                        
                        // special case : Method.invoke() could be replace by targetde method  
                        


                    }else if(dec.inv.meth.ret != null){
                        if(this.stack.callstack.length==1) this.pcmaker.turnOn();
                        this.pcmaker.append(' // skipped, max depth reached');

                        this.stack.pushReturn( new Symbol(
                            VTYPE.METH,
                            getDataTypeOf(dec.inv.meth.ret),
                            null,
                            null,
                            Symbol.SKIPPED
                        ));
                    }
                    if(this.stack.callstack.length==1) this.pcmaker.turnOn();
                    i++;
                }
                else if(dec.ret != null){
                    break;
                }
                else{
                    i++;
                }
            }
            // enter into basic block
            else if(pStack[i].t=='b'){
                
                bbs = pStack[i].i;
                f=0;

                msg = '';
                if(bbs.isConditionalBlock()){
                    //this.restoreContext(`:cond_${bbs.getCondLabel()}`);
                    ctxRST = true;
                    //ssmali.push(`${CR}cond_${bbs.getCondLabel()}:`);
                    this.pcmaker.push(`${CR}cond_${bbs.getCondLabel()}:`);
                    msg += `cond_${bbs.getCondLabel()}`;
                    f++;
                }
                if(bbs.isCatchBlock()){
                    if(f>0){
                        //ssmali.push(`${bbs.getCatchLabel()}:`);
                        this.pcmaker.push(`:${bbs.getCatchLabel()}`);
                    }else{
                        this.pcmaker.push(`${CR}${bbs.getCatchLabel()}`);
                        f++;
                    }
                    msg += `cond_${bbs.getCatchLabel()}`;
                    this.depth++;
                }
                if(bbs.isGotoBlock()){
    
                    /*if(this.contextExists(`:cond_${bbs.getGotoLabel()}`)){
                        this.restoreContext(`:cond_${bbs.getGotoLabel()}`);
                    }*/
                    
                    if(bbs.hasMultiplePredecessors()){
                        if(f>0) 
                            this.pcmaker.push(`:goto_${bbs.getGotoLabel()}:`);
                        else{
                            this.pcmaker.push(`${CR}goto_${bbs.getGotoLabel()}:`);
                            f++;
                        }
                    }

                    msg += `goto_${bbs.getGotoLabel()}`;
                }
                if(bbs.isTryBlock()){
                    if(f==0) 
                        this.pcmaker.push(`try{`);
                    else
                        this.pcmaker.push(`${CR}try{`);
    
                    this.depth++;
                } 

                if(msg.length>0)
                    Logger.debug(`[VM] [RUN] Enter into block : ${msg}`);

                i++;
            }
            // leave basic block
            else if(pStack[i].t=='e'){
                bbs = pStack[i].i;

                if(bbs.isTryEndBlock()){
                    if(bbs.hasCatchStatement()){
                        d = bbs.getCatchStatements();
                        for(let i=0; i<d.length; i++){
                            if(d[i].getException() != null)
                                this.pcmaker.push(`${"    ".repeat(this.depth-1)}}catch(${d[i].getException().name}) ${d[i].getTarget().getCatchLabel()}`);
                            else
                                this.pcmaker.push(`${"    ".repeat(this.depth-1)}}catchall ${d[i].getTarget().getCatchLabel()}`);
                        }
    
                        this.depth--;
                    }else{
                        this.pcmakersmali.push(`} try END\n`);
                        this.depth--;
                    }
                }
                else if(bbs.isCatchBlock()){
                    this.depth--;
                }

                i++;
            }


        }while(i<pStack.length);

        if(dec.ret != null){
            if(dec.ret instanceof Symbol){
                this.stack.pushReturn(dec.ret);
//                this.stack.last().setReturn(dec.ret);
            }
        }


        if(pStack[i].t!='e' && bbs.isTryEndBlock()){
            if(bbs.hasCatchStatement()){
                d = bbs.getCatchStatements();
                for(let i=0; i<d.length; i++){
                    if(d[i].getException() != null)
                        this.pcmaker.push(`${"    ".repeat(this.depth-1)}}catch(${d[i].getException().name}) ${d[i].getTarget().getCatchLabel()}`);
                    else
                        this.pcmaker.push(`${"    ".repeat(this.depth-1)}}catchall ${d[i].getTarget().getCatchLabel()}`);
                }
            }else{
                this.pcmaker.push(`} try END\n`);
            }
        }

        return this.pcmaker;
    }

    /**
     * To execute an instruction into current context.
     * 
     * Context contains :
     *  - Heap Memory
     *  - Stack Memory
     *  - Class Loaders
     *  - Method Area
     * 
     * @param {Instruction[]} pInstrStack 
     * @param {Integer} pInstrOffset 
     */
    execute( pInstrStack, pInstrOffset){
        let ops = [], dec=[],  f={res:false}, v='', regX=null,  regV=null, regZ=null, label=null, oper=null, tmp=[];
        let state = { code:[], jump:null, ret:null, inv:null};
        let regs = {};
        let indent = "    ".repeat(this.depth);


        ops = pInstrStack;
        oper = ops[pInstrOffset].i;

        switch(oper.opcode.byte)
        {
            case OPCODE.NEW_INSTANCE.byte:

                regX = this.getRegisterName(oper.left);
                //regV = this.allocator.newInstance(oper.right)
                this.stack.setLocalSymbol(regX, DTYPE.OBJECT_REF, this.heap.newInstance( oper.right));
     
                break;

            case OPCODE.CONST.byte:
            case OPCODE.CONST_4.byte:
            case OPCODE.CONST_16.byte:
            case OPCODE.CONST_HIGH16.byte:
            case OPCODE.CONST_WIDE.byte:
            case OPCODE.CONST_WIDE_16.byte:
            case OPCODE.CONST_WIDE_32.byte:
            case OPCODE.CONST_WIDE_HIGH16.byte:
                regX = this.getRegisterName(oper.left);

                regV = this.stack.setLocalSymbol(regX, DTYPE.IMM_NUMERIC, oper.right._value, null);
                
                // assigning concret value are ommited
                if(this.simplify<1){
                    state.code.push(`${indent}${regX} = ${this.getImmediateValue(regV)};`);
                }
                break;

            case OPCODE.CONST_STRING_JUMBO.byte:
            case OPCODE.CONST_STRING.byte:
                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.setLocalSymbol(regX, DTYPE.IMM_STRING, oper.right._value, null);

                if(this.simplify<1)
                    state.code.push(`${indent}${regX} = (String) ${this.getImmediateValue(regV)};`);
                break;

            case OPCODE.CONST_CLASS.byte:
                regX = this.getRegisterName(oper.left);

                this.heap.loadClass(oper.right);

                regV = this.stack.setLocalSymbol(regX, DTYPE.CLASS_REF, oper.right, oper.right.name+".class");

                break;

            case OPCODE.ADD_INT_LIT8.byte:
            case OPCODE.ADD_INT_LIT16.byte:

            //case OPCODE.SUB .byte:
            //case OPCODE.SUB_INT_LIT16.byte:

            case OPCODE.MUL_INT_LIT8.byte:
            case OPCODE.MUL_INT_LIT16.byte:

            case OPCODE.DIV_INT_LIT8.byte:
            case OPCODE.DIV_INT_LIT16.byte:

            case OPCODE.REM_INT_LIT8.byte:
            case OPCODE.REM_INT_LIT16.byte:

            case OPCODE.AND_INT_LIT8.byte:
            case OPCODE.AND_INT_LIT16.byte:

            case OPCODE.OR_INT_LIT8.byte:
            case OPCODE.OR_INT_LIT16.byte:

            case OPCODE.XOR_INT_LIT8.byte:
            case OPCODE.XOR_INT_LIT16.byte:

            case OPCODE.SHR_INT_LIT8.byte:
            case OPCODE.SHL_INT_LIT8.byte:
            case OPCODE.USHR_INT_LIT8.byte:

                regX = this.getRegisterName(oper.left[1]);
                regV = this.stack.getLocalSymbol(regX);


                if(this.isImm(regV)){
                    regX = this.getRegisterName(oper.left[0]);
                    v = regV[SYMBOL_OPE[oper.opcode.ope]](oper.right.getValue(), oper.opcode.byte);
                    this.stack.setLocalSymbol(regX,  
                        DTYPE.IMM_NUMERIC, 
                        v, 
                        '0x'+v.toString(16));

                    regV = this.stack.getLocalSymbol(regX);
                    v = `${indent}${this.getRegisterName(oper.left[0])} = ${this.getImmediateValue(regV)};`;
                    state.code.push(v);
//                    this.pcmaker.push(v);
                }else{
                    regX = this.getRegisterName(oper.left[0]);
                    this.stack.setLocalSymbol(regX,  
                        DTYPE.IMM_NUMERIC, 
                        null, // regV[SYMBOL_OPE[oper.opcode.ope]](oper.right.getValue(), oper.opcode.byte) 
                        v = `${(regV.hasCode()? '('+regV.getCode()+')':this.getRegisterName(oper.left[1]))}${oper.opcode.ope}${oper.right.getValue()}`);

//                            this.getSymbol(regX).setCode(`${this.getRegisterName(oper.left[1])}+${oper.right.getValue()}`).
                    state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v};`);
                }
                


                if(this.simplify<1){
                    v = `${indent}${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${oper.right.getValue()};`;
                    state.code.push(v);
                }

                //dec.push(v);
                //console.log('add-int/lit8 ',v);
                break;


            case OPCODE.ADD_INT.byte:
            case OPCODE.ADD_FLOAT.byte:
                
            case OPCODE.SUB_INT.byte:
            case OPCODE.SUB_FLOAT.byte:
                
            case OPCODE.MUL_INT.byte:
            case OPCODE.MUL_FLOAT.byte:
                
            case OPCODE.DIV_INT.byte:
            case OPCODE.DIV_FLOAT.byte:
                
            case OPCODE.REM_INT.byte:
            case OPCODE.REM_FLOAT.byte:

                if(this.simplify<1){
                    v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${this.getRegisterName(oper.right)}`;
                    this.stack.setLocalSymbol(regX,  
                        DTYPE.IMM_NUMERIC, 
                        regV.add(oper.right.getValue(), oper.opcode.byte), 
                        v);
                    
                    state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v};`);
                    break;
                }else{
                    regX = this.getRegisterName(oper.right);
                    regV = this.stack.getLocalSymbol(regX);

                    if(this.isImm(regV)){
                        regX = this.getRegisterName(oper.left[1]);

                        if(this.isImm(this.getSymbol(regX)))
                            this.stack.setLocalSymbol(
                                this.getRegisterName(oper.left[0]), 
                                DTYPE.IMM_NUMERIC,
                                regV[SYMBOL_OPE[oper.opcode.ope]](this.getImmediateValue(oper.right), oper.opcode.byte),
                                v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${this.getImmediateValue(regV)};`);                    
                            
                        else{
                            v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${this.getImmediateValue(regV)};`;                    
                            this.stack.setLocalSymbol(
                                this.getRegisterName(oper.left[0]), 
                                DTYPE.IMM_NUMERIC,
                                null,
                                v);
                            //state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v};`);
                        }

                        state.code.push(`${intent}${this.getRegisterName(oper.left[0])} = ${v}`);
                        break;
                    }
                    else if(regV.hasCode()){

                        v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}(${regV.getCode()})`;
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]), 
                            DTYPE.IMM_NUMERIC,
                            null,
                            v);

                        state.code.push(`${intent}${this.getRegisterName(oper.left[0])} = ${v}`);
                        break;
                    }
                    

                    regX = this.getRegisterName(oper.left[1]);
                    regV = this.stack.getLocalSymbol(regX);
                    if(this.isImm(regV)){
                        regX = this.stack.getLocalSymbol(this.getRegisterName(oper.left[0]));
                        // ${indent}${this.getRegisterName(oper.left[0])} = 
                        v = `${this.getImmediateValue(oper.left[1])}${oper.opcode.ope}${this.getRegisterName(oper.right)}`;
                        
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]), 
                            DTYPE.IMM_NUMERIC,
                            null,
                            v);

                        //regX.setCode(`${this.getImmediateValue(oper.left[1])}+${this.getRegisterName(oper.right)}`);
                        // state.code.push(v);
                        
                        state.code.push(`${intent}${this.getRegisterName(oper.left[0])} = ${v}`);
                        break;
                    }
                    else if(regV.hasCode()){

                        //v = `${indent}${this.getRegisterName(oper.left[0])} = ${regV.getCode()}+${this.getRegisterName(oper.right)};`;
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]), 
                            DTYPE.IMM_NUMERIC,
                            null,
                            v = `${regV.getCode()}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);
                        
                        state.code.push(`${intent}${this.getRegisterName(oper.left[0])} = ${v}`);
                        //state.code.push(v);
                    }
                    else{
                        //v = `${indent}${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getRegisterName(oper.right)};`;
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]), 
                            DTYPE.IMM_NUMERIC,
                            null,
                            v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);
                        
                        state.code.push(`${intent}${this.getRegisterName(oper.left[0])} = ${v}`);
                            //state.code.push(v);
                    }
                }
                break;

            case OPCODE.ADD_INT_2ADDR.byte:
            case OPCODE.ADD_FLOAT_2ADDR.byte:

            case OPCODE.SUB_INT_2ADDR.byte:
            case OPCODE.SUB_FLOAT_2ADDR.byte:

            case OPCODE.MUL_INT_2ADDR.byte:
            case OPCODE.MUL_FLOAT_2ADDR.byte:

            case OPCODE.DIV_INT_2ADDR.byte:
            case OPCODE.DIV_FLOAT_2ADDR.byte:

            case OPCODE.REM_INT_2ADDR.byte:
            case OPCODE.REM_FLOAT_2ADDR.byte:

            case OPCODE.AND_INT_2ADDR.byte:
            case OPCODE.AND_LONG_2ADDR.byte:

            case OPCODE.OR_INT_2ADDR.byte:
            case OPCODE.OR_LONG_2ADDR.byte:

            case OPCODE.XOR_INT_2ADDR.byte:
            case OPCODE.XOR_LONG_2ADDR.byte:

            case OPCODE.SHL_INT_2ADDR.byte:
            case OPCODE.SHL_LONG_2ADDR.byte:

            case OPCODE.SHR_INT_2ADDR.byte:
            case OPCODE.SHR_LONG_2ADDR.byte:

            case OPCODE.USHR_INT_2ADDR.byte:
            case OPCODE.USHR_LONG_2ADDR.byte:
                if(this.simplify<1){
                    v = `${this.getRegisterName(oper.left[0])}${oper.opcode.ope}${this.getRegisterName(oper.right)}`;

                    this.stack.setLocalSymbol(
                        this.getRegisterName(oper.left[0]), 
                        DTYPE.IMM_NUMERIC,
                        null,
                        v);

                    state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v};`);
                }else{
                    regX = this.getRegisterName(oper.right);
                    regX = this.stack.getLocalSymbol(regX);

                    if(this.isImm(regX)){

                        regV = this.getRegisterName(oper.left[0]);
                        regV = this.stack.getLocalSymbol(regV);

                        if(this.isImm(regV)){
//                                this.setSymbol(regX, regX.add(regV.getValue(), oper.opcode.byte));

                            
                            this.stack.setLocalSymbol(
                                regV, 
                                DTYPE.IMM_NUMERIC,
                                regX[SYMBOL_OPE[oper.opcode.ope]](regV.getValue(), oper.opcode.byte),
                                `${this.getImmediateValue(regX)}${oper.opcode.ope}${this.getImmediateValue(regV)}`);

                            break;
                        }
                        else{

                            if(regV.hasCode()){
                                this.stack.setLocalSymbol(
                                    regV, 
                                    DTYPE.IMM_NUMERIC,
                                    null,
                                    `(${regV.getCode()})${oper.opcode.ope}${this.getImmediateValue(regV)}`);

                            }else{
                                this.stack.setLocalSymbol(
                                    regV, 
                                    DTYPE.IMM_NUMERIC,
                                    null,
                                    `${this.getRegisterName(oper.left[0])}${oper.opcode.ope}${this.getImmediateValue(regV)}`);    
                            }
                        }
                    }       
                    else {

                        regV = this.getRegisterName(oper.left[0]);
                        regV = this.stack.getLocalSymbol(regV);

                        if(this.isImm(regV)){
                            if(regX.hasCode()){
                                this.stack.setLocalSymbol(
                                    regV, 
                                    DTYPE.IMM_NUMERIC,
                                    null,
                                    `${this.getImmediateValue(regV)}${oper.opcode.ope}(${regX.getCode()})`);

                            }else{
                                this.stack.setLocalSymbol(
                                    regV, 
                                    DTYPE.IMM_NUMERIC,
                                    null,
                                    `${this.getImmediateValue(regV)}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);
                            }

                            break;
                        }
                        else{
                            this.stack.setLocalSymbol(
                                regV, 
                                DTYPE.IMM_NUMERIC,
                                null,
                                `${(regV.hasCode()? '('+regV.getCode()+')':this.getRegisterName(oper.left[0]))}${oper.opcode.ope}${(regX.hasCode()? '('+regV.getCode()+')':this.getRegisterName(oper.right))}`);
                        }
                    }
                }
                
                break;

            // long numbers are stored over two 32bits registers
            // <op> < 
            case OPCODE.ADD_LONG.byte:
            case OPCODE.SUB_LONG.byte:
            case OPCODE.DIV_LONG.byte:
            case OPCODE.MUL_LONG.byte:
            case OPCODE.REM_LONG.byte:
            case OPCODE.OR_LONG.byte:
            case OPCODE.XOR_LONG.byte:
            case OPCODE.AND_LONG.byte:
                regs.src1 = this.prepareLong(oper.left[1]);
                regs.src2 = this.prepareLong(oper.right);
                regs.val = null;
                regs.code = { m:null, l:null };

                // if both long are concrete
                if(regs.src1.v!==null && regs.src2.v!==null){

                    regs.val= regs.src1.m[SYMBOL_OPE[oper.opcode.ope]]( 
                        regs.src2.v, oper.opcode.byte, regs.src1.l.getValue());
                }
                else if(regs.src1.v !== null){
                    regs.code.m = `(${regs.src1.v}${oper.opcode.ope}${regs.src2.mn})`;
                    regs.code.l = `(${regs.src1.v}${oper.opcode.ope}${regs.src2.ln}) & 0xFFFFFFFF`;
                }
                else if(regs.src2.v !== null){
                    regs.code.m = `(${regs.src1.mn}${oper.opcode.ope}${regs.src2.v})`;
                    regs.code.l = `(${regs.src1.ln}${oper.opcode.ope}${regs.src2.v}) & 0xFFFFFFFF`;
                }
                else{
                    regs.code.m = `(${regs.src1.mn}${oper.opcode.ope}${regs.src2.mn})`;
                    regs.code.l = `(${regs.src1.ln}${oper.opcode.ope}${regs.src2.ln}) & 0xFFFFFFFF`;
                }
                

                this.stack.setLocalSymbol(
                    this.getRegisterName({ t:oper.left[0].t, i:oper.left[0].i }),  
                    DTYPE.IMM_LONG, 
                    regs.val!==null? (regs.val >> 32) & 0xFFFFFFFF : null, 
                    regs.code.m);
                this.stack.setLocalSymbol(
                    this.getRegisterName({ t:oper.left[0].t, i:oper.left[0].i+1 }),  
                    DTYPE.IMM_NUMERIC, 
                    regs.val!==null? regs.val & 0x00000000FFFFFFFF : null, 
                    regs.code.l);
                    

                break;

            case OPCODE.SHR_LONG.byte:
            case OPCODE.SHL_LONG.byte:
            case OPCODE.USHR_LONG.byte:
                
                //TODO
                break

            case OPCODE.ADD_LONG_2ADDR.byte:
            case OPCODE.SUB_LONG_2ADDR.byte:
            case OPCODE.DIV_LONG_2ADDR.byte:
            case OPCODE.MUL_LONG_2ADDR.byte:
            case OPCODE.REM_LONG_2ADDR.byte:
            case OPCODE.OR_LONG_2ADDR.byte:
            case OPCODE.XOR_LONG_2ADDR.byte:
            case OPCODE.AND_LONG_2ADDR.byte:
                regs.src1 = this.prepareLong(oper.left);
                regs.src2 = this.prepareLong(oper.right);
                regs.val = null;
                regs.code = { m:null, l:null };

                // if both long are concrete
                if(regs.src1.v!==null && regs.src2.v!==null){

                    regs.val= regs.src1.m[SYMBOL_OPE[oper.opcode.ope]]( 
                        regs.src2.v, oper.opcode.byte, regs.src1.l.getValue());
                }
                else if(regs.src1.v !== null){
                    regs.code.m = `(${regs.src1.v}${oper.opcode.ope}${regs.src2.mn})`;
                    regs.code.l = `(${regs.src1.v}${oper.opcode.ope}${regs.src2.ln}) & 0xFFFFFFFF`;
                }
                else if(regs.src2.v !== null){
                    regs.code.m = `(${regs.src1.mn}${oper.opcode.ope}${regs.src2.v})`;
                    regs.code.l = `(${regs.src1.ln}${oper.opcode.ope}${regs.src2.v}) & 0xFFFFFFFF`;
                }
                else{
                    regs.code.m = `(${regs.src1.mn}${oper.opcode.ope}${regs.src2.mn})`;
                    regs.code.l = `(${regs.src1.ln}${oper.opcode.ope}${regs.src2.ln}) & 0xFFFFFFFF`;
                }
                
                this.stack.setLocalSymbol(
                    this.getRegisterName({ t:oper.left.t, i:oper.left.i }),  
                    DTYPE.IMM_LONG, 
                    regs.val!==null? (regs.val >> 32) & 0xFFFFFFFF : null, 
                    regs.code.m);
                this.stack.setLocalSymbol(
                    this.getRegisterName({ t:oper.left.t, i:oper.left.i+1 }),  
                    DTYPE.IMM_NUMERIC, 
                    regs.val!==null? regs.val & 0x00000000FFFFFFFF : null, 
                    regs.code.l);
                break;

            case OPCODE.SHR_LONG_2ADDR.byte:
            case OPCODE.SHL_LONG_2ADDR.byte:
            case OPCODE.USHR_LONG_2ADDR.byte:
                // TODO : not supported
                break;

            case OPCODE.NEG_LONG.byte:
                // TODO : not supported
                break;

            // long numbers are stored over two 32bits registers
            // <op> v0, 
            case OPCODE.ADD_DOUBLE.byte:
            case OPCODE.SUB_DOUBLE.byte:
            case OPCODE.DIV_DOUBLE.byte:
            case OPCODE.MUL_DOUBLE.byte:
            case OPCODE.REM_DOUBLE.byte:
                // TODO : not supported
                break

            case OPCODE.ADD_DOUBLE_2ADDR.byte:
            case OPCODE.SUB_DOUBLE_2ADDR.byte:
            case OPCODE.DIV_DOUBLE_2ADDR.byte:
            case OPCODE.MUL_DOUBLE_2ADDR.byte:
            case OPCODE.REM_DOUBLE_2ADDR.byte:
                // TODO : not supported
                break;

                
            case OPCODE.NEG_INT.byte:
            case OPCODE.NEG_FLOAT.byte:
            case OPCODE.NEG_DOUBLE.byte:

                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);

                if(regV.getValue() !== null){
                    this.stack.setLocalSymbol(
                        this.getRegisterName(oper.left), 
                        regV.type,
                        -regV.getValue(),
                        `${this.getImmediateValue(regV)}${oper.opcode.ope}(${regX.getCode()})`);
                }
                else if(regV.hasCode()){
                    this.stack.setLocalSymbol(
                        this.getRegisterName(oper.left), 
                        regV.type,
                        null,
                        `-(${regV.getCode()})`);
                }
                else{
                    this.stack.setLocalSymbol(
                        this.getRegisterName(oper.left), 
                        regV.type,
                        null,
                        `-${regX}`);
                }

                break;

            // int-to-<op>  <dest>, <src>
            case OPCODE.INT_TO_BYTE.byte:
                
                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                if(this.isImm(regV))
                    v = regV.getValue() & 0x000000FF;

                this.stack.setLocalSymbol( 
                    this.getRegisterName(oper.left), DTYPE.IMM_BYTE, v, `(byte) ${regX}`
                );
            
                break;
            
            case OPCODE.INT_TO_CHAR.byte:
                
                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                if(this.isImm(regV))
                    v = regV.getValue() & 0x000000FF;

                this.stack.setLocalSymbol( 
                    this.getRegisterName(oper.left), DTYPE.IMM_CHAR, v, `(char) ${regX}`
                );
            
                break;
            case OPCODE.INT_TO_FLOAT.byte:
                
                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                if(this.isImm(regV))
                    v = regV.getValue();

                this.stack.setLocalSymbol( 
                    this.getRegisterName(oper.left), DTYPE.IMM_FLOAT, v, `(float) ${regX}`
                );
            
                break;
                
            case OPCODE.INT_TO_SHORT.byte:
                
                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                if(this.isImm(regV))
                    v = regV.getValue() & 0x0000FFFF;

                this.stack.setLocalSymbol( 
                    this.getRegisterName(oper.left), DTYPE.IMM_SHORT, v, `(short) ${regX}`
                );
            
                break;

            // cast involving multiple registers
            case OPCODE.INT_TO_LONG.byte:
                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                if(this.isImm(regV))
                    v = regV.getValue() & 0x0000FFFF;

                // <dest> = <src>
                this.stack.setLocalSymbol( 
                    this.getRegisterName(oper.left), DTYPE.IMM_LONG, 0x00000000, `(long) ${regX}`
                );
                // <dest>+1 = 0x00000000
                this.stack.setLocalSymbol( 
                    this.getRegisterName({ t:oper.left.t, i:oper.left.i+1 }), DTYPE.IMM_NUMERIC, v, `((long)${regX} >> 32)`
                );

                break;
                
            // verify :
            // 0x cafebabe deadbeef => v0 = cafebabe ; v1 = deadbeef

            case OPCODE.INT_TO_DOUBLE.byte:
                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                if(this.isImm(regV))
                    v = regV.getValue() & 0x0000FFFF;

                // <dest> = <src>
                this.stack.setLocalSymbol( 
                    this.getRegisterName(oper.left), DTYPE.IMM_DOUBLE, v, `(long) ${regX}`
                );
                // <dest>+1 = 0x00000000
                this.stack.setLocalSymbol( 
                    this.getRegisterName({ t:oper.left.t, i:oper.left.i+1 }), DTYPE.IMM_NUMERIC, 0x00000000, `((long)${regX} >> 32)`
                );

                break;

            case OPCODE.MOVE_RESULT.byte:
            case OPCODE.MOVE_RESULT_WIDE.byte:

                regX = this.getRegisterName(oper.left);
                    
                //if(this.stack.ret.length > 0){
        
                regV = this.stack.popReturn();

                if(this.pcmaker.isEnable()){

                    v = this.pcmaker.last();
                    this.pcmaker.pop();
                    this.pcmaker.push(`${indent}${regX} = ${v.substr(indent.length,v.length)}`);
                    this.stack.importLocalSymbol(regX, regV, v);
                }else if(regV != null){
                    this.stack.importLocalSymbol(regX, regV, null);
                }  

                /*}else{
                    Logger.debug("move-result skipped");
                }*/
        
                break;

            case OPCODE.MOVE_RESULT_OBJECT.byte:

                regX = this.getRegisterName(oper.left);

                if(this.stack.ret.length > 0){

                    regV = this.stack.popReturn();

                    if(this.pcmaker.isEnable()){
                        //onsole.log(v);
                        v = this.pcmaker.pop();
                        this.pcmaker.push(`${indent}${regX} = ${v.substr(indent.length,v.length)}`);
                        this.stack.importLocalSymbol(regX, regV, `${v.substr(indent.length,v.length)}`);
                    }else{
                        this.stack.importLocalSymbol(regX, regV, null);
                    }
                }else{
                    Logger.debug("move-result skipped");
                }


                break;

            case OPCODE.MOVE.byte:
            case OPCODE.MOVE_16.byte:
            case OPCODE.MOVE_FROM16.byte:
            case OPCODE.MOVE_OBJECT.byte:
            case OPCODE.MOVE_OBJECT_16.byte:
            case OPCODE.MOVE_OBJECT_FROM16.byte:
            case OPCODE.MOVE_WIDE.byte:
            case OPCODE.MOVE_WIDE_16.byte:
            case OPCODE.MOVE_WIDE_FROM16.byte:
                this.moveRegister(
                    this.getRegisterName(oper.right), 
                    this.getRegisterName(oper.left)
                );
                break;

            case OPCODE.AGET.byte:
            case OPCODE.AGET_BOOLEAN.byte:
            case OPCODE.AGET_BYTE.byte:
            case OPCODE.AGET_CHAR.byte:
            case OPCODE.AGET_OBJECT.byte:
            case OPCODE.AGET_SHORT.byte:
            case OPCODE.AGET_WIDE.byte:
                
                regX = this.stack.getLocalSymbol( this.getRegisterName(oper.right) ); // offset
                regV = this.stack.getLocalSymbol( this.getRegisterName(oper.left[1]) ); // array

                //  TODO:  Index Out-Of-Bound
                if(this.isImm(regX)){
                    console.log(regX);
                    if(regV.getValue() instanceof VM_VirtualArray){
                        //console.log("imm - imm", regX, regX.getValue());
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]),
                            ATYPE_DTYPE[oper.opcode.byte],
//                            regV.arrayRead(regX.getValue()),
                            regV.getValue().read(regX.getValue()),
                            v = `${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${regX.getValue()}]`);
                    }else{
                        //console.log("imm - sym", regX, regX.getValue());
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]),
                            ATYPE_DTYPE[oper.opcode.byte],
                            null,
                            v = `${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${regX.getValue()}]`);
                    }
                }
                else{
                    this.stack.setLocalSymbol(
                        this.getRegisterName(oper.left[0]),
                        ATYPE_DTYPE[oper.opcode.byte],
                        null,
                        v = `${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${regX.hasCode()?regX.getCode():this.getRegisterName(oper.right)}]`);
                }

                state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v}`);
                break;


            case OPCODE.APUT.byte:
            case OPCODE.APUT_BOOLEAN.byte:
            case OPCODE.APUT_BYTE.byte:
            case OPCODE.APUT_CHAR.byte:
            case OPCODE.APUT_OBJECT.byte:
            case OPCODE.APUT_SHORT.byte:
            case OPCODE.APUT_WIDE.byte:
                regX = this.stack.getLocalSymbol( this.getRegisterName(oper.right) ); // offset 
                regV = this.stack.getLocalSymbol( this.getRegisterName(oper.left[1]) ); // array
                regZ = this.stack.getLocalSymbol( this.getRegisterName(oper.left[0]) ); // value

                // TODO : Index Out-Of-Bound, Out-Of-Memory 
                if(this.isImm(regX)){ // concrete offset
                    console.log('put concrete value');
                    if(regV.getValue() instanceof VM_VirtualArray){ // concrete value
                        console.log('put array',this.isImm(regZ),regZ.type < DTYPE.OBJECT_REF, (regZ.value != null));
                        if(this.isImm(regZ))
                            regV.arrayWrite(regX.getValue(), regZ.getValue());
                        else
                            regV.arrayWrite(regX.getValue(), regZ);
                    }else{
                        Logger.debug("Non concrete array detected");
                        console.log("Non concrete array detected");
                    }
                }else{
                    console.log('put symbolic value')
                    // offset, // value
                    regV.arrayWriteSymbolic(regX, regZ);
                }

                if(regX.getValue()!=null){
                    label = regX.getValue(); 
                }else{
                    label = regX.hasCode()? regX.getCode() : this.getRegisterName(oper.right);
                }
                

                if(regV.getValue() == null){

                    v = `${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${label}] = `;
                    
                    if(this.isImm(regZ)){
                        v += `${this.isImm(regZ)? this.getImmediateValue(regZ):this.getRegisterName(oper.left[0])};`;
                    }else if(regZ.hasCode()){
                        v += `(${regZ.getCode()});`;
                    }else{
                        v += `${this.getRegisterName(oper.left[0])};`;
                    }

                    state.code.push(v);
                }
                break;

            case OPCODE.MOVE_EXCEPTION.byte:
                // nothing todo
                break;

            case OPCODE.MONITOR_ENTER.byte:
                state.code.push(`// monitor-enter`);
                // nothing todo
                break;
            case OPCODE.MONITOR_EXIT.byte:
                state.code.push(`// monitor-exit`);
                // nothing todo
                break;
            case OPCODE.THROW.byte:
                state.code.push(`${indent}throw ${this.getRegisterName(oper.left)}`);
                // nothing todo
                break;
            case OPCODE.INVOKE_STATIC_RANGE.byte:

                // init invoke
                state.inv = { meth:oper.right, obj:null, args:[] };

                v = `${indent}${oper.right.enclosingClass.alias!=null?oper.right.enclosingClass.alias:oper.right.enclosingClass.name}.${oper.right.alias!=null?oper.right.alias:oper.right.name}( `;
                
                /*
                if(oper.left[0].t != oper.left[1].t){
                    // TODO : Invalid range
                }*/

                if(oper.left.length > 0){
                    // parseInt(oper.left[0].i,10
                    for(let j=parseInt(oper.left[0].i,10); j<parseInt(oper.left[1].i,10)+1; j++){
                        regX = oper.left[0].t+j;
                        regV = this.stack.getLocalSymbol(regX);
                        
                        //console.log(this.stack.print());
                        // add args
                        state.inv.args.push(regV);

                        //console.log(regV, this.isImm(regV), this.getImmediateValue(regV) );
                        if(this.isImm(regV))
                            v+= this.getImmediateValue(regV)+', ';
                        else if(regV.hasCode() && !regV.isSkipped())
                            v+= `${regV.getCode()}, `;
                        else
                            v+= regX+', ';

                    }
                    v = v.substr(0, v.length-2);
                }
                v += ')';
                state.code.push(v);
                f.res = true;
                this.invokes.push(pInstrOffset);
                break;

            case OPCODE.INVOKE_STATIC.byte:

                // init invoke
                state.inv = { meth:oper.right, obj:null, args:[] };

//                console.log(this.stack.print());

                v = `${indent}${oper.right.enclosingClass.alias!=null?oper.right.enclosingClass.alias:oper.right.enclosingClass.name}.${oper.right.alias!=null?oper.right.alias:oper.right.name}( `;
                if(oper.left.length > 0){
                    for(let j=0; j<oper.left.length; j++){
                        regX = this.getRegisterName(oper.left[j]);
                        regV = this.stack.getLocalSymbol(regX);

                        // add args
                        state.inv.args.push(regV);

                        if(this.isImm(regV))
                            v+= this.getImmediateValue(regV)+', ';
                        else if(regV.hasCode() && !regV.isSkipped())
                            v+= `${regV.getCode()}, `;
                        else
                            v+= regX+', ';

                    } 
                    v = v.substr(0, v.length-2);
                }
                v += ')';
                state.code.push(v);
                f.res = true;
                this.invokes.push(pInstrOffset);
                break;

            
            case OPCODE.INVOKE_SUPER.byte:
            case OPCODE.INVOKE_VIRTUAL.byte:
            case OPCODE.INVOKE_DIRECT.byte:
            case OPCODE.INVOKE_INTERFACE.byte:
                regX = this.getRegisterName(oper.left[0]);
                regV = this.stack.getLocalSymbol(regX);


                console.log("invoke "+oper.right.signature());
                // init invoke
                state.inv = { meth:oper.right, obj:regV, args:[] };

                if(oper.left.length > 1){
                    for(let j=1; j<oper.left.length; j++){

                        tmp = this.getRegisterName(oper.left[j]);
                        regV = this.stack.getLocalSymbol(tmp);

                        state.inv.args.push(regV);
                    } 
                }

                this.pcmaker.writeInvoke( oper.right, oper.left);
                break;

            case OPCODE.IGET.byte:
            case OPCODE.IGET_BYTE.byte:
            case OPCODE.IGET_CHAR.byte:
            case OPCODE.IGET_OBJECT.byte:
            case OPCODE.IGET_SHORT.byte:
            case OPCODE.IGET_WIDE.byte:
            case OPCODE.IGET_BOOLEAN.byte:
                regX = this.getRegisterName(oper.left[0]);
                regV = oper.right.type._name;
                
                // read get
                regZ = this.stack.getLocalSymbol(this.getRegisterName(oper.left[1]));

                if(regZ.type == DTYPE.OBJECT_REF){

                    label = (this.getRegisterName(oper.left[1])=="p0")? "this": this.getRegisterName(oper.left[1]) ;

                    if(regZ.getValue() instanceof VM_ClassInstance){
                        v = `${regV.endsWith(".String")?"":"("+regV+")"} ${label}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                        this.stack.setLocalSymbol(regX, getDataTypeOf( oper.right.type), regZ.getValue().readField(oper.right), v);
                    }else{
                        v = `${regV.endsWith(".String")?"":"("+regV+")"} ${label}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                        this.stack.setLocalSymbol(regX, getDataTypeOf( oper.right.type), null, v);
                    }

                    state.code.push(`${indent}${regX} = ${v};`);
                    Logger.debug(`${indent}${regX} = ${v};`);

                }else{
                    // error => subject should be an object ref
                    Logger.error(`[VM][EXEC] Invalid '${oper.opcode.instr}' instruction : ${this.getRegisterName(oper.left[1])} is not an object reference`);
                }

                /*
                this.stack.setLocalSymbol(regX, getDataTypeOf( oper.right.type), null, v);

                if(this.getRegisterName(oper.left[1])=="p0" && (this.method.modifiers.static==false)){
                    if(oper.right.enclosingClass.name == this.method.enclosingClass.name){
                        v = `${regV.endsWith(".String")?"":"("+regV+")"} this.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                    }else{
                        v = `${regV.endsWith(".String")?"":"("+regV+")"} p0.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                    }
                }else{
                        v = `${regV.endsWith(".String")?"":"("+regV+")"} ${this.getRegisterName(oper.left[1])}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                }

                if(this.simplify<1){
                    this.stack.setLocalSymbol(regX, DTYPE.FIELD_REF, null, v);
                    state.code.push(`${indent}${regX} = ${v};`);
                }else{
                    this.stack.setLocalSymbol(regX, DTYPE.FIELD_REF, null, v);
                    Logger.debug(`${indent}${regX} = ${v};`);
                }*/
                //co
                break;

            case OPCODE.SGET.byte:
            case OPCODE.SGET_BYTE.byte:
            case OPCODE.SGET_CHAR.byte:
            case OPCODE.SGET_OBJECT.byte:
            case OPCODE.SGET_SHORT.byte:
            case OPCODE.SGET_WIDE.byte:
            case OPCODE.SGET_BOOLEAN.byte:
                regX = this.getRegisterName(oper.left);
                regZ = this.metharea.getGlobalSymbol(oper.right.enclosingClass.name+'.'+oper.right.name);
                regV = oper.right.type._name;
            
                v = `${regV.endsWith(".String")?"":"("+regV+")"} ${oper.right.enclosingClass.alias!=null?oper.right.enclosingClass.alias:oper.right.enclosingClass.name}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                

                if(this.isImm(regZ)){
                    this.stack.setLocalSymbol(regX, regZ.type, regZ.getValue(), null);
                }
                else if(regZ.hasCode()){
                    this.stack.setLocalSymbol(regX, regZ.type, null, regZ.getCode());
                }
                else{
                    this.stack.importLocalSymbol(regX, regZ);
                }

                if(this.config.simplify<1)
                    state.code.push(`${indent}${regX} = ${v};`);
                

                break;

            case OPCODE.IPUT.byte:
            case OPCODE.IPUT_BOOLEAN.byte:
            case OPCODE.IPUT_BYTE.byte:
            case OPCODE.IPUT_CHAR.byte:
            case OPCODE.IPUT_OBJECT.byte:
            case OPCODE.IPUT_SHORT.byte:
            case OPCODE.IPUT_WIDE.byte:
                
                    // data
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.stack.getLocalSymbol(regX);   
                    // instance
                    regZ = this.getRegisterName(oper.left[1]); 
                    regZ = this.stack.getLocalSymbol(regZ); 

                    
                    /*
                    if(regV.hasCode()){
                        regX = `(${regV.getCode()})`;
                    }

                    if(this.getRegisterName(oper.left[1])=="p0" && (this.method.modifiers.static==false)){
                        if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                            v = `${indent}this.${oper.right.name} = ${regX};`;
                        else
                            v = `${indent}p0.${oper.right.name} = ${regX}`;

                    }else{
                        regV = this.stack.getLocalSymbol(this.getRegisterName(oper.left[1]));
                        if(regV.hasCode()){
                            v = `${indent}(${regV.getCode()}).${oper.right.name} = ${regX};`;
                        }else{
                            v = `${indent}${this.getRegisterName(oper.left[1])}.${oper.right.name} = ${regX};`;
                        }
                    }

                    // -------------

                    if(this.getRegisterName(oper.left[1])=="p0"){
                        if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                            v = `${indent}this.${oper.right.name} = ${regX};`;
                        else
                            v = `${indent}p0.${oper.right.name} = ${regX}`;

                    }else{
                        regV = this.stack.getLocalSymbol(this.getRegisterName(oper.left[1]));
                        if(regV.hasCode()){
                            v = `${indent}(${regV.getCode()}).${oper.right.name} = ${regX};`;
                        }else{
                            v = `${indent}${this.getRegisterName(oper.left[1])}.${oper.right.name} = ${regX};`;
                        }
                    }*/

                    if(regZ.type == DTYPE.OBJECT_REF){

                        label = (this.getRegisterName(oper.left[1])=="p0")? "this": this.getRegisterName(oper.left[1]) ;

//                        v = `${regV.endsWith(".String")?"":"("+regV+")"} ${label}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                        v = `${label}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;


                        if(regV.getValue() instanceof VM_ClassInstance){
                            if( !regV.endsWith(".String") ){
                                v = "("+regV+") "+v;
                            }

                            regZ.getValue().setField( oper.right, this.stack.getLocalSymbol(regX));
                        }
                        /*else if(regZ.getValue() instanceof VM_VirtualArray){
                            
                            regZ.getValue().setField( oper.right, this.stack.getLocalSymbol(regX));
                        }*/
                        else{
                            //  ClassInstance => not defined
                            regZ.getValue().setField( oper.right, this.stack.getLocalSymbol(regX));
                        }
    
                        label = this.stack.getLocalSymbol(regX);

                        if(this.isImm(label)){
                            state.code.push(`${indent}${v} = ${label.getValue()};`);
                            Logger.debug(`${indent}${v} = ${label.getValue()};`);
                        }
                        else if(label.hasCode()){
                            state.code.push(`${indent}${v} = ${label.getCode()};`);
                            Logger.debug(`${indent}${v} = ${label.getCode()};`);
                        }
                        else{
                            state.code.push(`${indent}${v} = ${regX};`);
                            Logger.debug(`${indent}${v} = ${regX};`);
                        }
    
                    }else{
                        // error => subject should be an object ref
                        Logger.error(`[VM][EXEC] Invalid '${oper.opcode.instr}' instruction : ${this.getRegisterName(oper.left[1])} is not an object reference`);
                    }



                    //co
                    //this.setSymbol(`${this.getRegisterName(oper.left[1])}.${oper.right.name}`, DTYPE.FIELD_REF, oper.right.name, v);
                    //state.code.push(v);
                    break;

            case OPCODE.SPUT.byte:
            case OPCODE.SPUT_BOOLEAN.byte:
            case OPCODE.SPUT_BYTE.byte:
            case OPCODE.SPUT_CHAR.byte:
            case OPCODE.SPUT_OBJECT.byte:
            case OPCODE.SPUT_SHORT.byte:
            case OPCODE.SPUT_WIDE.byte:
            
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol( regX);
                
                if(this.isImm(regV)){
                    v = [`${indent}${oper.right.enclosingClass.name}.${oper.right.name}`,this.getImmediateValue(regV)];
                    this.metharea.setGlobalSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`, 
                        DTYPE.FIELD, 
                        regV.getValue(), 
                        `${v[0]} = ${v[1]}`);
                }
                else if(regV.getValue() instanceof VM_VirtualArray){
                    v = [`${oper.right.enclosingClass.name}.${oper.right.name}`,regV.getValue().toString()];
                    this.metharea.setGlobalSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`, 
                        DTYPE.FIELD, 
                        regV.getValue(), 
                        `${v[0]} = ${v[1]}`);
                }
                else if(regV.hasCode()){
                    v = [`${oper.right.enclosingClass.name}.${oper.right.name}`,regV.getCode()];
                    this.metharea.setGlobalSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`, 
                        DTYPE.FIELD, 
                        null, 
                        `${v[0]} = ${v[1]}`);
                }
                else{
                    v = [`${oper.right.enclosingClass.name}.${oper.right.name}`,regX];
                    this.metharea.setGlobalSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`, 
                        DTYPE.FIELD, 
                        null, 
                        `${v[0]} = ${v[1]}`);
                }
/*
                if(this.getRegisterName(oper.left)=="p0" && (this.method.modifiers.static==false)){
                    if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                        v = `${indent}this.${oper.right.name} = ${regX};`;
                    else
                        v = `${indent}p0.${oper.right.name} = ${regX}`;

                }else{
                    v = `${indent}${this.getRegisterName(oper.left)}.${oper.right.name} = ${regX};`;
                }*/

                //co
                state.code.push(`${indent}${v[0]} = ${v[1]}`);

                break;

            case OPCODE.RETURN.byte:
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);

                if((regX=="p0") && (this.method.modifiers.static==false)){
                    if(oper.right.enclosingClass.name == this.method.enclosingClass.name){
                        v = `${indent}return this;`;
                    }else if(this.simplify >= 1 && this.isImm(regV)){
                        v = `${indent}return ${this.getImmediateValue(regV)};`;
                    }else 
                        v = `${indent}return p0;`;

                }else if(this.simplify >= 1 && this.isImm(regV))
                    v = `${indent}return ${this.getImmediateValue(regV)};`;
                else if(regV.getValue()!=null && regV.getValue().hasConcrete()){
                    v = `${indent}return ${regX}; // ${regV.getValue().getConcrete()} `;
                }else{
                    v = `${indent}return ${regX};`;
                }

                state.ret = regV;
                state.code.push(v);
                break;
            case OPCODE.RETURN_OBJECT.byte:
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                if(this.getRegisterName(oper.left)=="p0" && (this.method.modifiers.static==false)){
                    if(oper.right.enclosingClass.name == this.method.enclosingClass.name){
                        v = `${indent}return this;`;
                        //state.ret = regV;
                    }else if(this.simplify >= 1 && this.isImm(regV)){
                        v = `${indent}return ${this.getImmediateValue(regV)};`;
                        //state.ret = regV.getValue();  
                    }else{
                        v = `${indent}return p0;`;
                        //state.ret = regV;
                    }
                }
                else{

                    if((regV.getValue() instanceof VM_ClassInstance) && regV.getValue().hasConcrete()){
                        v = `${indent}return ${regX}; // ${regV.getValue().getConcrete()} `;
                    }
                    else if( regV.getValue() != null){
                        v = `${indent}return ${regX}; // ${regV.getValue()} `;
                    }else
                        v = `${indent}return ${regX};`;
                }

                state.ret = regV;
                state.code.push(v);
                break;
            case OPCODE.RETURN_WIDE.byte:

                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);

                if(this.isImm(regV)){
                    state.ret = new Symbol(VTYPE.METH, DTYPE.IMM_NUMERIC, new BigInt(regV.value), null );
                }else{
                    state.ret = regV;
                }
                state.code.push(`${indent}return <TODO>;`);
                break;

            case OPCODE.RETURN_VOID.byte:
                
                state.ret = RET_VOID;
                state.code.push(`${indent}return ;`);
                break;
            
            // IF multi
            case OPCODE.IF_EQ.byte:                
                regX = this.getRegisterName(oper.left[0]);
                regV = this.getRegisterName(oper.left[1]);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.config.simplify>0){
                    if(this.isImm(this.stack.getLocalSymbol(regX)))
                        regX = this.getImmediateValue(this.stack.getLocalSymbol(regX));
                    if(this.isImm(this.stack.getLocalSymbol(regV)))
                        regV = this.getImmediateValue(this.stack.getLocalSymbol(regV));
                }

                state.code.push(`${indent}if( ${regX} == ${regV} ) ${label}`);
                break;
            case OPCODE.IF_NE.byte:                
                regX = this.getRegisterName(oper.left[0]);
                regV = this.getRegisterName(oper.left[1]);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.config.simplify>0){
                    if(this.isImm(this.stack.getLocalSymbol(regX)))
                        regX = this.getImmediateValue(this.stack.getLocalSymbol(regX));
                    if(this.isImm(this.stack.getLocalSymbol(regV)))
                        regV = this.getImmediateValue(this.stack.getLocalSymbol(regV));
                }

                state.code.push(`${indent}if( ${regX} != ${regV} ) ${label}`);
                break;
            case OPCODE.IF_LT.byte:                
                regX = this.getRegisterName(oper.left[0]);
                regV = this.getRegisterName(oper.left[1]);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.config.simplify>0){
                    if(this.isImm(this.stack.getLocalSymbol(regX)))
                        regX = this.getImmediateValue(this.stack.getLocalSymbol(regX));
                    if(this.isImm(this.stack.getLocalSymbol(regV)))
                        regV = this.getImmediateValue(this.stack.getLocalSymbol(regV));
                }

                state.code.push(`${indent}if( ${regX} < ${regV} ) ${label}`);
                break;
            case OPCODE.IF_GE.byte:                
                regX = this.getRegisterName(oper.left[0]);
                regV = this.getRegisterName(oper.left[1]);

                label = `:cond_${oper.right.name}`;
                this.saveContext(label);
                
                if(this.config.simplify>=0){
                    regX = this.stack.getLocalSymbol(regX);
                    regV = this.stack.getLocalSymbol(regV);

                    if(regX==null || regV==null){
                        // impossible to identify valid path :  queueing two path TRUE and FALSE paths 
                        //this.getContext(label).updateIf();
                        Logger.debug("IF_GE : impossible");
                        state.code.push(`${indent}if( ${this.getRegisterName(oper.left[0])} <= ${this.getRegisterName(oper.left[1])} ) ${label}`);
                        state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        break;
                    }

                    if(this.isImm(regX) && this.isImm(regV)){
                        if(regX.type !== regV.type){
                            // need autocast
                        }
                        if(regX.getValue() >= regV.getValue()){
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        }
                        state.code.push(`${indent}if( ${regX.getValue()} <= ${regV.getValue()} ) ${label}`);
                        Logger.debug("IF_GE : cmp is done");

                    }else{
                        // impossible to identify valid path :  queueing two path TRUE and FALSE paths 
                        // default is TRUE path, FALSE is queued
                        if(CONST.VM.DEFAULT_PATH){
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        } 

                        state.code.push(`${indent}if( ${this.getRegisterName(oper.left[0])} <= ${this.getRegisterName(oper.left[1])} ) ${label}`);
                        // else continue to execute
                        Logger.debug("IF_GE : default path");

                    }
                }
                break;
            case OPCODE.IF_GT.byte:                
                regX = this.getRegisterName(oper.left[0]);
                regV = this.getRegisterName(oper.left[1]);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.config.simplify>0){
                    if(this.isImm(this.stack.getLocalSymbol(regX)))
                        regX = this.getImmediateValue(this.stack.getLocalSymbol(regX));
                    if(this.isImm(this.stack.getLocalSymbol(regV)))
                        regV = this.getImmediateValue(this.stack.getLocalSymbol(regV));
                }

                state.code.push(`${indent}if( ${regX} > ${regV} ) ${label}`);
                break;
            case OPCODE.IF_LE.byte:                
                regX = this.getRegisterName(oper.left[0]);
                regV = this.getRegisterName(oper.left[1]);

                label = `:cond_${oper.right.name}`;
                this.saveContext(label);
                
                if(this.config.simplify>0){
                    regX = this.stack.getLocalSymbol(regX);
                    regV = this.stack.getLocalSymbol(regV);

                    if(regX==null || regV==null){
                        // impossible to identify valid path :  queueing two path TRUE and FALSE paths 
                        //this.getContext(label).updateIf();
                        state.code.push(`${indent}if( ${this.getRegisterName(oper.left[0])} <= ${this.getRegisterName(oper.left[1])} ) ${label}`);
                        break;
                    }

                    if(this.isImm(regX) && this.isImm(regV)){
                        if(regX.type !== regV.type){
                            // need autocast
                        }
                        if(regX.getValue() < regV.getValue()){
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        }
                        state.code.push(`${indent}if( ${regX.getValue()} <= ${regV.getValue()} ) ${label}`);

                    }else{
                        // impossible to identify valid path :  queueing two path TRUE and FALSE paths 
                        // default is TRUE path, FALSE is queued
                        if(CONST.VM.DEFAULT_PATH){
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        } 

                        state.code.push(`${indent}if( ${this.getRegisterName(oper.left[0])} <= ${this.getRegisterName(oper.left[1])} ) ${label}`);
                        // else continue to execute
                    }
                }
                    
                break;

            // IF zero
            case OPCODE.IF_EQZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                label = `:cond_${oper.right.name}`;
                //this.saveContext(label);

                if(this.config.simplify>0){
                    console.log(regV);
                    if(this.isImm(regV)){
                        // FALSE case
                        if(regV.getValue() !== null){
                            v = `// ${regX}=${this.getImmediateValue(regV)} is not null, so "if(${regX} == 0)" was FALSE. Continue ...`;
                        }
                        // TRUE case
                        else{
                            v = `// ${regX} is null, so "if(${regX} == 0)" was TRUE. Jump to ${label}`;
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        }
                    }else if(regV.type == DTYPE.OBJECT_REF){
                        console.log(regV);
                        // FALSE case
                        if(regV.getValue() instanceof VM_ClassInstance){

                            v = `// ${regX}=(ClassInstance)${regV.getValue().parent.name} is not null, so "if(${regX} == 0)" was FALSE. Continue ...`;
                            
                            //v = `${indent}if( ${regV.getValue().getConcrete()} != null ) ${label}`;
                        }
                        // TRUE
                        else{
                            v = `// ${regX}(${regV.hasCode()? regV.getCode():"NULL object"}) is null, so "if(${regX} == 0)" was TRUE. Jump to ${label}`;
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        }
                        /*
                        // Unknown case
                        else if(regV.hasCode()){
                            v = `${indent}if( ${regV.getCode()} != null ) ${label}`;
                        }
                        // TRUE case
                        else{
                            v = `// ${regX}(ref) is null, so "if(${regX} == 0)" was TRUE. Jump to ${label}`;
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        }*/
                    }else{
                        // Unknown case
                        v = `${indent}if( ${regX} == 0 ) ${label}`;
                        this.saveContext(label);
                        state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                    }
                }else{
                    v = `if( ${regX} == 0 ) ${label}`;
                }

                if(v != null)
                    state.code.push(v);

                break;

            case OPCODE.IF_NEZ.byte:      
                /*
                 if ( x != 0 ) 
                 if ( x != null )
                 */          
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                
                if(this.config.simplify>0){
                    if(this.isImm(regV)){
                        // TRUE case
                        if(regV.getValue() !== null){
                            v = `// ${regX}=${this.getImmediateValue(regV)} is not null, so "if(${regX} != 0)" was TRUE. Continue ...`;
                        }
                        // FALSE case
                        else{
                            v = `// ${regX} is null, so "if(${regX} != 0)" was FALSE. Jump to ${label}`;
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                        }
                    }else if(regV.type == DTYPE.OBJECT_REF){
                        // TRUE case
                        if(regV.getValue() instanceof VM_ClassInstance){

                            v = `// ${regX}=(ClassInstance)${regV.getValue().parent.name} is not null, so "if(${regX} != 0)" was TRUE. Continue ...`;
                            state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                            
                            //v = `${indent}if( ${regV.getValue().getConcrete()} != null ) ${label}`;
                        }
                        // Unknown case
                        else if(regV.hasCode()){
                            v = `${indent}if( ${regV.getCode()} != null ) ${label}`;
                        }
                        // FALSE case
                        else{
                            v = `// ${regX}(ref) is null, so "if(${regX} == 0)" was FALSE. Jump to ${label}`;
                        }
                    }else{
                        // Unknown case
                        v = `${indent}if( ${regX} != 0 ) ${label}`;
                        this.saveContext(label);
                        state.jump = {type:CONST.INSTR_TYPE.IF, label:oper.right.name};
                    }
                }else{
                    v = `if( ${regX} != 0 ) ${label}`;
                }

                if(v != null)
                    state.code.push(v);
                
                
                break;
            case OPCODE.IF_LTZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.config.simplify>0 && this.isImm(regV))
                    state.code.push(`${indent}if( ${this.getImmediateValue(regV)} < 0 )`);
                else
                    state.code.push(`${indent}if( ${regX} < 0 ) ${label}`);
                break;
            case OPCODE.IF_GEZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.config.simplify>0 && this.isImm(regV))
                    state.code.push(`${indent}if( ${this.getImmediateValue(regV)} >= 0 ) ${label}`);
                else
                    state.code.push(`${indent}if( ${regX} >= 0 ) ${label}`);
                break;
            case OPCODE.IF_GTZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.config.simplify>0 && this.isImm(regV))
                    state.code.push(`${indent}if( ${this.getImmediateValue(regV)} > 0 ) ${label}`);
                else
                    state.code.push(`${indent}if( ${regX} > 0 ) ${label}`);
                break;
            case OPCODE.IF_LEZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.config.simplify>0 && this.isImm(regV))
                    state.code.push(`${indent}if( ${this.getImmediateValue(regV)} <= 0 ) ${label}`);
                else
                    state.code.push(`${indent}if( ${regX} <= 0 ) ${label}`);
                break;
            
            case OPCODE.ARRAY_LENGTH.byte:
                regX = this.getRegisterName(oper.right);
                regX = this.stack.getLocalSymbol(regX);
                
                regV = this.getRegisterName(oper.left);

                if(regX.getValue() instanceof VM_VirtualArray){
                    this.stack.setLocalSymbol(
                        regV,
                        DTYPE.IMM_NUMERIC,
                        v = regX.getValue().realSize(),
                        null
                    );

                    if(this.config.simplify<1){
                        state.code.push(`${indent} ${regV} = ${v}`);
                    }
                }else{
                    // TODO : track unitiliazed array
                }

                break;

            
            case OPCODE.FILL_ARRAY_DATA.byte:
                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                if(regV.getValue() instanceof VM_VirtualArray){
                    //console.log(oper.right.name);
                    v = this.method.getDataBlockByName(':array_'+oper.right.name);
                    regV.getValue().fillWith(v);
                    if(this.config.simplify<1){
                        state.code.push(`${indent} ${regX} = ${regV.getValue().toString()}`);
                    }
                }else{
                    throw VM_Exception('VM001','fill-array-data cannot be executed : '+regX+' is not an array');
                }
                
                break;

            case OPCODE.GOTO.byte:
            case OPCODE.GOTO_16.byte:
            case OPCODE.GOTO_32.byte:                
                label = `:goto_${oper.right.name}`;
                //console.log("GOTO save state for ",label);
                //console.log(this.stack.current());
                this.saveContext(label);
                //if(this.simplify<1){
                // state.code.push(`${indent}goto ${label}`);
                //}else{
                    // get basic block 
                    state.jump = {type:CONST.INSTR_TYPE.GOTO, label:oper.right.name};
                //}
                break;

            case OPCODE.ARRAY_LENGTH.byte:
                regX = this.getRegisterName( oper.right );
                regV = this.stack.getLocalSymbol( regX);
                v = null;


                if(regV != undefined){
                    if(regV.hasValue() && (regV.getReferencedValue() instanceof VM_VirtualArray)){
                        this.stack.setLocalSymbol( 
                            this.getRegisterName(oper.left), 
                            DTYPE.IMM_NUMERIC, 
                            regV.getReferencedValue().size(), 
                            v = `${regX}.length`)
                    }
                    else if(regV.hasCode()){
                        this.stack.setLocalSymbol( 
                            this.getRegisterName(oper.left), 
                            DTYPE.IMM_NUMERIC, 
                            null, 
                            v = `${regV.getCode()}.length`)
                    }else{
                        this.stack.setLocalSymbol( 
                            this.getRegisterName(oper.left), 
                            DTYPE.IMM_NUMERIC, 
                            null, 
                            v = `${regX}.length`)
                    }
                    v = `${this.getRegisterName(oper.left)} = ${v}`;
                }else{
                    Logger.debug("[VM] array-length called with undefined array");
                    this.throwError(regX, regV, oper, "array is undefined");    
                    v = `${oper._raw} // array-length called with undefined array `; 
                }


                if(this.config.simplify<5){
                    state.code.push(v);
                }

                break;

            case OPCODE.NEW_ARRAY.byte:
                regX = this.getRegisterName( oper.left[1] ); // size
                regZ = this.getRegisterName( oper.left[0] ); // where the array should be stored
                regV = this.stack.getLocalSymbol( regX);

                //console.log(oper.right);
                if(oper.right instanceof CLASS.BasicType){
                    v = oper.right._name;
                }else{
                    v = oper.right.name;
                }

                if(this.isImm(regV))
                    v = `new ${v}[${this.getImmediateValue(regV)}]`;
                else if(regV.hasCode())
                    v = `new ${v}[${regV.getCode()}]`;
                else
                    v = `new ${v}[${regX}]`;


                if(this.config.simplify<1){
                    state.code.push(`${indent}${regZ} = ${v};`);
                    //this.pcmaker.optimize(regZ);
                }

                if( regV.getValue() !== null){
                    this.stack.setLocalSymbol(
                        regZ, 
                        DTYPE.ARRAY, 
                        this.allocator.newArray(oper.right, regV.getValue()), 
                        null);
                }else{
                    this.stack.setLocalSymbol(
                        regZ, 
                        DTYPE.ARRAY, 
                        this.allocator.newArray(oper.right).setSymbolicSize(regV.getCode()), 
                        null);
                }


                //state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = new ${oper.right._name}[${regX}];`);
                
                break;
            case OPCODE.CHECK_CAST.byte:

                regV = this.stack.getLocalSymbol( this.getRegisterName(oper.left));

                
                console.log(regV);

                //if( regV.getValue().name !== oper.right.name && 

                break;

            

            case OPCODE.NOP.byte:
                break;
            default:
                this.countUntreated++;
        }

        if(state.code[0]=="") state.code.shift();


        return state;
    }


    throwError( pRegister, pSymbol, pInstruction, pMessage){
        // TODO
        Logger.error(`[VM][ERROR] "${pRegister}" into [${pInstruction.toString()}] : ${pMessage}`);
    }
}



module.exports = {
    VM: VM,
    Symbol: Symbol,
    SymbolTable: SymTable,
    DTYPE: DTYPE,
    VTYPE: VTYPE
};