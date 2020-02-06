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
    OBJECT_REF: 0x6,
    CLASS_REF: 0x7,
    FIELD_REF: 0x8,
    VOID: 0x9,
    UNDEFINED: 0xa,
    THIS: 0xb,
    IMM_CHAR: 0xc,
    ARRAY: 0xd,
    FIELD: 0xe,
    INSTANCE: 0xf,
    WRAPPED_HOOK_RESULT: 0x10
};

const DTYPE_STRING = {};
DTYPE_STRING[DTYPE.IMM_STRING] = "String";
DTYPE_STRING[DTYPE.IMM_NUMERIC] = "int|long|short";
DTYPE_STRING[DTYPE.IMM_FLOAT] = "float|double";
DTYPE_STRING[DTYPE.IMM_BOOLEAN] = "boolean";
DTYPE_STRING[DTYPE.IMM_BYTE] = "byte";
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
BTYPE_DTYPE[CONST.JAVA.T_CHAR] = DTYPE.IMM_NUMERIC;
BTYPE_DTYPE[CONST.JAVA.T_INT] = DTYPE.IMM_NUMERIC;
BTYPE_DTYPE[CONST.JAVA.T_LONG] = DTYPE.IMM_NUMERIC;
BTYPE_DTYPE[CONST.JAVA.T_SHORT] = DTYPE.IMM_FLOAT;
BTYPE_DTYPE[CONST.JAVA.T_BYTE] = DTYPE.IMM_BYTE;
BTYPE_DTYPE[CONST.JAVA.T_FLOAT] = DTYPE.IMM_FLOAT;
BTYPE_DTYPE[CONST.JAVA.T_DOUBLE] = DTYPE.IMM_FLOAT;
BTYPE_DTYPE[CONST.JAVA.T_OBJ] = DTYPE.OBJECT_REF;
BTYPE_DTYPE[CONST.JAVA.T_VOID] = DTYPE.VOID;


const ATYPE_DTYPE = {};
ATYPE_DTYPE[OPCODE.AGET.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.AGET_BOOLEAN.byte] = DTYPE.IMM_BOOLEAN;
ATYPE_DTYPE[OPCODE.AGET_BYTE.byte] = DTYPE.IMM_BYTE;
ATYPE_DTYPE[OPCODE.AGET_CHAR.byte] = DTYPE.IMM_CHAR;
ATYPE_DTYPE[OPCODE.AGET_OBJECT.byte] = DTYPE.OBJECT_REF;
ATYPE_DTYPE[OPCODE.AGET_SHORT.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.AGET_WIDE.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.APUT.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.APUT_BOOLEAN.byte] = DTYPE.IMM_BOOLEAN;
ATYPE_DTYPE[OPCODE.APUT_BYTE.byte] = DTYPE.IMM_BYTE;
ATYPE_DTYPE[OPCODE.APUT_CHAR.byte] = DTYPE.IMM_CHAR;
ATYPE_DTYPE[OPCODE.APUT_OBJECT.byte] = DTYPE.OBJECT_REF;
ATYPE_DTYPE[OPCODE.APUT_SHORT.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.APUT_WIDE.byte] = DTYPE.IMM_NUMERIC;


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
        return DTYPE.OBJECT_REF;
    }
    else if(pType instanceof VM_ClassInstance){
        return DTYPE.OBJECT_REF;
    }
    else{
        return BTYPE_DTYPE[pType.name];
    }
}


function castToDataType(pType, pData){
    switch(pType){
        case DTYPE.IMM_NUMERIC:
            return parseInt(pData,10);
        case DTYPE.IMM_FLOAT:
            return parseFloat(pData);
        case DTYPE.IMM_STRING:
        case DTYPE.IMM_CHAR:
            return pData+"";
        default:
            return pData;
    }
}


class VM_Exception
{
    constructor(){

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

    add(pValue, pType){
        switch(pType){
            case OPCODE.ADD_INT_2ADDR.byte:
            case OPCODE.ADD_LONG_2ADDR.byte:
            case OPCODE.ADD_INT_LIT8.byte:
            case OPCODE.ADD_INT_LIT16.byte:
            case OPCODE.ADD_INT.byte:
            case OPCODE.ADD_LONG.byte:
                return parseInt(this.value) + parseInt(pValue);
            case OPCODE.ADD_DOUBLE_2ADDR.byte:
            case OPCODE.ADD_FLOAT_2ADDR.byte:
            case OPCODE.ADD_DOUBLE.byte:
            case OPCODE.ADD_FLOAT.byte:
                return parseFloat(this.value) + parseFloat(pValue);
        }
    }

    sub(pValue, pType){
        switch(pType){
            case OPCODE.SUB_INT_2ADDR.byte:
            case OPCODE.SUB_LONG_2ADDR.byte:
            case OPCODE.SUB_INT_LIT8.byte:
            case OPCODE.SUB_INT_LIT16.byte:
            case OPCODE.SUB_INT.byte:
            case OPCODE.SUB_LONG.byte:
                return parseInt(this.value) - parseInt(pValue);
            case OPCODE.SUB_DOUBLE_2ADDR.byte:
            case OPCODE.SUB_FLOAT_2ADDR.byte:
            case OPCODE.SUB_DOUBLE.byte:
            case OPCODE.SUB_FLOAT.byte:
                return parseFloat(this.value) - parseFloat(pValue);
        }
    }

    mul(pValue, pType){
        switch(pType){
            case OPCODE.MUL_INT_2ADDR.byte:
            case OPCODE.MUL_LONG_2ADDR.byte:
            case OPCODE.MUL_INT_LIT8.byte:
            case OPCODE.MUL_INT_LIT16.byte:
            case OPCODE.MUL_INT.byte:
            case OPCODE.MUL_LONG.byte:
                return parseInt(this.value) * parseInt(pValue);
            case OPCODE.MUL_DOUBLE_2ADDR.byte:
            case OPCODE.MUL_FLOAT_2ADDR.byte:
            case OPCODE.MUL_DOUBLE.byte:
            case OPCODE.MUL_FLOAT.byte:
                return parseFloat(this.value) * parseFloat(pValue);
        }
    }


    div(pValue, pType){
        switch(pType){
            case OPCODE.DIV_INT_2ADDR.byte:
            case OPCODE.DIV_LONG_2ADDR.byte:
            case OPCODE.DIV_INT_LIT8.byte:
            case OPCODE.DIV_INT_LIT16.byte:
            case OPCODE.DIV_INT.byte:
            case OPCODE.DIV_LONG.byte:
                return parseInt(this.value) / parseInt(pValue);
            case OPCODE.DIV_DOUBLE_2ADDR.byte:
            case OPCODE.DIV_FLOAT_2ADDR.byte:
            case OPCODE.DIV_DOUBLE.byte:
            case OPCODE.DIV_FLOAT.byte:
                return parseFloat(this.value) / parseFloat(pValue);
        }
    }

    rem(pValue, pType){
        switch(pType){
            case OPCODE.REM_INT_2ADDR.byte:
            case OPCODE.REM_LONG_2ADDR.byte:
            case OPCODE.REM_INT_LIT8.byte:
            case OPCODE.REM_INT_LIT8.byte:
            case OPCODE.REM_INT_LIT16.byte:
            case OPCODE.REM_INT.byte:
            case OPCODE.REM_LONG.byte:
                return parseInt(this.value) % parseInt(pValue);
            case OPCODE.REM_DOUBLE_2ADDR.byte:
            case OPCODE.REM_FLOAT_2ADDR.byte:
            case OPCODE.REM_DOUBLE.byte:
            case OPCODE.REM_FLOAT.byte:
                return parseFloat(this.value) % parseFloat(pValue);
        }
    }

    
    and(pValue, pType){
        switch(pType){
            case OPCODE.AND_INT_2ADDR.byte:
            case OPCODE.AND_LONG_2ADDR.byte:
            case OPCODE.AND_INT_LIT8.byte:
            case OPCODE.AND_INT_LIT16.byte:
            case OPCODE.AND_INT.byte:
            case OPCODE.AND_LONG.byte:
                return parseInt(this.value) & parseInt(pValue);
        }
    }


    or(pValue, pType){
        switch(pType){
            case OPCODE.OR_INT_2ADDR.byte:
            case OPCODE.OR_LONG_2ADDR.byte:
            case OPCODE.OR_INT_LIT8.byte:
            case OPCODE.OR_INT_LIT16.byte:
            case OPCODE.OR_INT.byte:
            case OPCODE.OR_LONG.byte:
                return parseInt(this.value) | parseInt(pValue);
        }
    }


    xor(pValue, pType){
        switch(pType){
            case OPCODE.XOR_INT_2ADDR.byte:
            case OPCODE.XOR_LONG_2ADDR.byte:
            case OPCODE.XOR_INT_LIT8.byte:
            case OPCODE.XOR_INT_LIT16.byte:
            case OPCODE.XOR_INT.byte:
            case OPCODE.XOR_LONG.byte:
                return parseInt(this.value) ^ parseInt(pValue);
        }
    }


    shl(pValue, pType){
        switch(pType){
            case OPCODE.SHL_INT_2ADDR.byte:
            case OPCODE.SHL_LONG_2ADDR.byte:
            case OPCODE.SHL_INT_LIT8.byte:
            case OPCODE.SHL_INT_LIT16.byte:
            case OPCODE.SHL_INT.byte:
            case OPCODE.SHL_LONG.byte:
                return parseInt(this.value) << parseInt(pValue);
        }
    }


    shr(pValue, pType){
        switch(pType){
            case OPCODE.SHR_INT_2ADDR.byte:
            case OPCODE.SHR_LONG_2ADDR.byte:
            case OPCODE.SHR_INT_LIT8.byte:
            case OPCODE.SHR_INT_LIT16.byte:
            case OPCODE.SHR_INT.byte:
            case OPCODE.SHR_LONG.byte:
                return parseInt(this.value) >> parseInt(pValue);
        }
    }


    ushr(pValue, pType){
        switch(pType){
            case OPCODE.USHR_INT_2ADDR.byte:
            case OPCODE.USHR_LONG_2ADDR.byte:
            case OPCODE.USHR_INT_LIT8.byte:
            case OPCODE.USHR_INT_LIT16.byte:
            case OPCODE.USHR_INT.byte:
            case OPCODE.USHR_LONG.byte:
                return parseInt(this.value) >>> parseInt(pValue);
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
    constructor( pType, pSize){
        this.type = pType;
        this.size = pSize;
        this.value = [];
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

    write( pOffset, pObject){
        this.value[pOffset] = pObject;
    }

    push( pObject){
        this.value.push(pObject);
    }

    pop(){
        return this.value.pop();
    }
}

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
        let paramOffset = 0, arg=null;    
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
        console.log("Get current",this.print());
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
                this.vm.metharea.setGlobalSymbol( fields[i].name, getDataTypeOf(fields[i].type), null, fields[i].name);
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
 * 
 */
class VM_HeapArea
{
    constructor( pVM, pClassLoader){
        this.heap = [];
        this.free = [];
        this.vm = pVM;
        this.classloader = pClassLoader;
    }

    /**
     * to clear heap area
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
     * @param {Class} pClass The class to load
     */
    loadClass( pClass){
        return this.classloader.load( pClass);
    }

    /**
     * 
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
 * To define a hook into the VM, it allows to provide custom implementation
 * of method.
 *
 */
class VM_Hook
{
    constructor( pMethodName, pHook, pEnable=true){
        this.method = pMethodName;
        this.hook = pHook;
        this.enable = pEnable;
    }

    /**
     * To execute the hook code with the given context
     * @param {VM} pVM The context of the VM
     * @param {VM_ClassInstance} pThis If the method is not static, the instance invoking the method. Else, if the method is static, it is NULL
     * @param {Symbol} pArgs The registers containing value of arguments
     */
    exec( pVM, pMethod, pThis, pArgs){
        return this.hook(pVM, pThis, pArgs);
    }
}

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

/*
Minimalist Smali VM
*/
class VM
{
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
        this.branch = null;
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


    importGlobalSymbols( pSymTab){
        this.metharea.importSymbolTable( pSymTab); 
    }

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
        let opt = null, margs=null;

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
                console.log(this.stack.symTab.table.p0);
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
                        if(pArguments["p"+i].val != null)
                            this.stack.last().addArgument(i, getDataTypeOf(margs[i]), castToDataType(getDataTypeOf(margs[i]), pArguments["p"+i].val));
                        else if(pArguments["p"+i].notset==true)
                            this.stack.last().addArgument(i, DTYPE.UNDEFINED, null);
                        else
                            this.stack.last().addArgument(i, getDataTypeOf(margs[i]), null);
                    }else{
                        this.stack.last().addArgument(i, getDataTypeOf(margs[i]), null);
                    }

                    //this.stack.last().addArgument(i, margs[i], this.allocator.malloc(pArguments[i]));
                }
            }

            console.log(this.stack.symTab.table.p0);
            console.log(this.stack.symTab.table.p1);
        }
        else{
            console.log("nothing to do with args");
        }

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
                                // replace last pseudo-code line by new one
                                this.pcmaker.pop();

                                this.pcmaker.writeInvoke( dec.inv.meth, dec.inv.obj, dec.inv.args);

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
        let indent = "    ".repeat(this.depth);

        let localSymTab = this.stack.getLocalSymbolTable();
        let globalSymTab = this.metharea.getGlobalSymbolTable(); 

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

                regV = this.stack.setLocalSymbol(regX, DTYPE.IMM_NUMERIC, oper.right._value);
                
                // assigning concret value are ommited
                if(this.simplify<1){
                    state.code.push(`${indent}${regX} = ${this.getImmediateValue(regV)};`);
                }
                break;

            case OPCODE.CONST_STRING_JUMBO.byte:
            case OPCODE.CONST_STRING.byte:
                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.setLocalSymbol(regX, DTYPE.IMM_STRING, oper.right._value);

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

                if(this.simplify<1){
                    v = `${indent}${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${oper.right.getValue()};`;
                    state.code.push(v);

                }else{
                    regX = this.getRegisterName(oper.left[1]);
                    regV = this.stack.getLocalSymbol(regX);

                    if(this.isImm(regV)){
                        regX = this.getRegisterName(oper.left[0]);
                        this.stack.setLocalSymbol(regX,  
                            DTYPE.IMM_NUMERIC, 
                            regV[SYMBOL_OPE[oper.opcode.ope]](oper.right.getValue(), oper.opcode.byte), 
                            this.getImmediateValue(regV));

                        v = `${indent}${this.getRegisterName(oper.left[0])} = ${this.getImmediateValue(regX)};`;
                        state.code.push(v);
                    }else{
                        regX = this.getRegisterName(oper.left[0]);
                        this.stack.setLocalSymbol(regX,  
                            DTYPE.IMM_NUMERIC, 
                            null, // regV[SYMBOL_OPE[oper.opcode.ope]](oper.right.getValue(), oper.opcode.byte) 
                            v = `${(regV.hasCode()? '('+regV.getCode()+')':this.getRegisterName(oper.left[1]))}${oper.opcode.ope}${oper.right.getValue()}`);

//                            this.getSymbol(regX).setCode(`${this.getRegisterName(oper.left[1])}+${oper.right.getValue()}`).
                        state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v};`);
                    }
                }
                //dec.push(v);
                //console.log('add-int/lit8 ',v);
                break;


            case OPCODE.ADD_INT.byte:
            case OPCODE.ADD_LONG.byte:
            case OPCODE.ADD_DOUBLE.byte:
            case OPCODE.ADD_FLOAT.byte:
                
            case OPCODE.SUB_INT.byte:
            case OPCODE.SUB_LONG.byte:
            case OPCODE.SUB_DOUBLE.byte:
            case OPCODE.SUB_FLOAT.byte:
                
            case OPCODE.MUL_INT.byte:
            case OPCODE.MUL_LONG.byte:
            case OPCODE.MUL_DOUBLE.byte:
            case OPCODE.MUL_FLOAT.byte:
                
            case OPCODE.DIV_INT.byte:
            case OPCODE.DIV_LONG.byte:
            case OPCODE.DIV_DOUBLE.byte:
            case OPCODE.DIV_FLOAT.byte:
                
            case OPCODE.REM_INT.byte:
            case OPCODE.REM_LONG.byte:
            case OPCODE.REM_DOUBLE.byte:
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
            case OPCODE.ADD_LONG_2ADDR.byte:
            case OPCODE.ADD_DOUBLE_2ADDR.byte:
            case OPCODE.ADD_FLOAT_2ADDR.byte:

            case OPCODE.SUB_INT_2ADDR.byte:
            case OPCODE.SUB_LONG_2ADDR.byte:
            case OPCODE.SUB_DOUBLE_2ADDR.byte:
            case OPCODE.SUB_FLOAT_2ADDR.byte:

            case OPCODE.MUL_INT_2ADDR.byte:
            case OPCODE.MUL_LONG_2ADDR.byte:
            case OPCODE.MUL_DOUBLE_2ADDR.byte:
            case OPCODE.MUL_FLOAT_2ADDR.byte:

            case OPCODE.DIV_INT_2ADDR.byte:
            case OPCODE.DIV_LONG_2ADDR.byte:
            case OPCODE.DIV_DOUBLE_2ADDR.byte:
            case OPCODE.DIV_FLOAT_2ADDR.byte:

            case OPCODE.REM_INT_2ADDR.byte:
            case OPCODE.REM_LONG_2ADDR.byte:
            case OPCODE.REM_DOUBLE_2ADDR.byte:
            case OPCODE.REM_FLOAT_2ADDR.byte:
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

            case OPCODE.MOVE_RESULT.byte:
            case OPCODE.MOVE_RESULT_WIDE.byte:

                regX = this.getRegisterName(oper.left);
                console.log(this.stack.print());
                    
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

                console.log(this.stack.print());
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
                if(oper.left[1] == undefined){
                    console.log(oper);
                }
                regV = this.stack.getLocalSymbol( this.getRegisterName(oper.left[1]) ); // array

                //  TODO:  Index Out-Of-Bound
                if(this.isImm(regX)){
                    if(regV.getValue() instanceof VM_VirtualArray){
                        //console.log("imm - imm", regX, regX.getValue());
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]),
                            ATYPE_DTYPE[oper.opcode.byte],
                            regV.arrayRead(regX.getValue()),
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
                    if(regV.getValue() instanceof VM_VirtualArray){ // concrete value
                        if(this.isImm(regZ))
                            regV.arrayWrite(regX.getValue(), regZ.getValue());
                        else
                            regV.arrayWrite(regX.getValue(), regZ);
                    }else{
                        Logger.debug("Non concrete array detected");
                    }
                }else{
                    // offset, // value
                    regV.arrayWriteSymbolic(regX, regZ);
                }

                if(regX.getValue()!=null){
                    label = regX.getValue(); 
                }else{
                    label = regX.hasCode()? regX.getCode() : this.getRegisterName(oper.right);
                }
                
                v = `${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${label}] = `;
                
                if(this.isImm(regZ)){
                    v += `${this.isImm(regZ)? this.getImmediateValue(regZ):this.getRegisterName(oper.left[0])};`;
                }else if(regZ.hasCode()){
                    v += `(${regZ.getCode()});`;
                }else{
                    v += `${this.getRegisterName(oper.left[0])};`;
                }


                state.code.push(v);
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
                    console.log(oper.left);
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

                /*
                //console.log(indent.length);
                if((oper.right instanceof CLASS.Method) && (oper.right.name=="<init>"))
                    v = `${indent}${regX} = new ${oper.right.enclosingClass.name}(`;
                else if(this.method.modifiers.static==false && regX=="p0"){
                    v = `${indent}this.${oper.right.alias!=null? oper.right.alias : oper.right.name}(`;
                    f.res = true;
                    this.invokes.push(pInstrOffset);
                }
                else if(regV.type==DTYPE.CLASS_REF && regV.hasCode()){
                    v = `${indent}${regV.getCode()}.${oper.right.alias!=null? oper.right.alias : oper.right.name}(`;
                    f.res = true;
                    this.invokes.push(pInstrOffset);
                }
                else if((regV.getValue() instanceof VM_ClassInstance) 
                        && (regV.getValue().hasConcrete()) 
                        && (typeof regV.getValue().getConcrete() == "string")){
                    v = `${indent}"${regV.getValue().getConcrete()}".${oper.right.alias!=null? oper.right.alias : oper.right.name}(`;
                    f.res = true;
                    this.invokes.push(pInstrOffset);
                }
                else{
                    v = `${indent}${regX}.${oper.right.alias!=null? oper.right.alias : oper.right.name}(`;
                    f.res = true;
                    this.invokes.push(pInstrOffset);
                }
            

                if(oper.left.length > 1){
                    for(let j=1; j<oper.left.length; j++){

                        tmp = this.getRegisterName(oper.left[j]);
                        regV = this.stack.getLocalSymbol(tmp);

                        state.inv.args.push(regV);

                        if(this.isImm(regV))
                            v += `${this.getImmediateValue(regV)},`;
                        else if(regV.hasCode())
                            v+= `${regV.getCode()},`;
                        else if(regV.isThis(this.method)){
                            v += `this, `;
                        }
                        else if((regV.getValue() instanceof VM_ClassInstance) 
                            && (regV.getValue().hasConcrete()) 
                            && (typeof regV.getValue().getConcrete() == "string")){
                            v += `"${regV.getValue().getConcrete()}",`;
                        }
                        else{
                            v += `${tmp},`;
                        }
                    } 
                    v = v.substr(0, v.length-1);
                }
                v += ')';
                state.code.push(v);*/




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
                regZ = globalSymTab.getSymbol(oper.right.type._name)
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

                if(this.simplify<1){
                    state.code.push(`${indent}${regX} = ${v};`);
                }

                break;

            case OPCODE.IPUT.byte:
            case OPCODE.IPUT_BOOLEAN.byte:
            case OPCODE.IPUT_BYTE.byte:
            case OPCODE.IPUT_CHAR.byte:
            case OPCODE.IPUT_OBJECT.byte:
            case OPCODE.IPUT_SHORT.byte:
            case OPCODE.IPUT_WIDE.byte:
                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.stack.getLocalSymbol(regX);   
                    regZ = this.getRegisterName(oper.left[1]); 
                    
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
    
                        v = `${regV.endsWith(".String")?"":"("+regV+")"} ${label}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;

                        if(regZ.getValue() instanceof VM_ClassInstance){
                            regZ.getValue().setField( oper.right, this.stack.getLocalSymbol(regX));
                        }else{
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
                    globalSymTab.setSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`, 
                        DTYPE.FIELD, 
                        regV.getValue(), 
                        `${v[0]} = ${v[1]}`);
                }
                else if(regV.hasCode()){
                    v = [`${oper.right.enclosingClass.name}.${oper.right.name}`,regV.getCode()];
                    globalSymTab.setSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`, 
                        DTYPE.FIELD, 
                        null, 
                        `${v[0]} = ${v[1]}`);
                }
                else{
                    v = [`${oper.right.enclosingClass.name}.${oper.right.name}`,regX];
                    globalSymTab.setSymbol(
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

                if(this.simplify>0){
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

                if(this.simplify>0){
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

                if(this.simplify>0){
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

                if(this.simplify>0){
                    if(this.isImm(this.stack.getLocalSymbol(regX)))
                        regX = this.getImmediateValue(this.stack.getLocalSymbol(regX));
                    if(this.isImm(this.stack.getLocalSymbol(regV)))
                        regV = this.getImmediateValue(this.stack.getLocalSymbol(regV));
                }

                state.code.push(`${indent}if( ${regX} >= ${regV} ) ${label}`);
                break;
            case OPCODE.IF_GT.byte:                
                regX = this.getRegisterName(oper.left[0]);
                regV = this.getRegisterName(oper.left[1]);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.simplify>0){
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
                
                if(this.simplify>0){
                    if(this.isImm(this.stack.getLocalSymbol(regX)))
                        regX = this.getImmediateValue(this.stack.getLocalSymbol(regX));
                    if(this.isImm(this.stack.getLocalSymbol(regV)))
                        regV = this.getImmediateValue(this.stack.getLocalSymbol(regV));
                }
                    
                state.code.push(`${indent}if( ${regX} <= ${regV} ) ${label}`);
                break;

            // IF zero
            case OPCODE.IF_EQZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);

                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.simplify>0){
                    if(this.isImm(regV))
                        state.code.push(`${indent}if( ${this.getImmediateValue(regV)} == 0 ) ${label}`);
                    else if(regV.type == DTYPE.OBJECT_REF){
                        state.code.push(`${indent}if( ${regX} != null ) ${label}`);
                    }else{
                        state.code.push(`${indent}if( ${regX} == 0 ) ${label}`);
                    }
                }else
                    state.code.push(`if( ${regX} == 0 ) ${label}`);
                break;
            case OPCODE.IF_NEZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.simplify>0 && this.isImm(regV))
                    state.code.push(`${indent}if( ${this.getImmediateValue(regV)} != 0 ) ${label}`);
                else{
                    state.code.push(`${indent}if( ${regX} != 0 ) ${label}`);
                }break;
            case OPCODE.IF_LTZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.simplify>0 && this.isImm(regV))
                    state.code.push(`${indent}if( ${this.getImmediateValue(regV)} < 0 )`);
                else
                    state.code.push(`${indent}if( ${regX} < 0 ) ${label}`);
                break;
            case OPCODE.IF_GEZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.simplify>0 && this.isImm(regV))
                    state.code.push(`${indent}if( ${this.getImmediateValue(regV)} >= 0 ) ${label}`);
                else
                    state.code.push(`${indent}if( ${regX} >= 0 ) ${label}`);
                break;
            case OPCODE.IF_GTZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.simplify>0 && this.isImm(regV))
                    state.code.push(`${indent}if( ${this.getImmediateValue(regV)} > 0 ) ${label}`);
                else
                    state.code.push(`${indent}if( ${regX} > 0 ) ${label}`);
                break;
            case OPCODE.IF_LEZ.byte:                
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);
                
                label = `:cond_${oper.right.name}`;
                this.saveContext(label);

                if(this.simplify>0 && this.isImm(regV))
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

                    if(this.simplify<1){
                        state.code.push(`${indent} ${regV} = ${v}`);
                    }
                }else{
                    // TODO : track unitiliazed array
                }

                break;

            /*
            case OPCODE.FILL_ARRAY_DATA.byte:

                break;*/

            case OPCODE.GOTO.byte:
            case OPCODE.GOTO_16.byte:
            case OPCODE.GOTO_32.byte:                
                label = `:goto_${oper.right.name}`;
                //console.log("GOTO save state for ",label);
                //console.log(this.stack.current());
                this.saveContext(label);
                if(this.simplify<1){
                    state.code.push(`${indent}goto ${label}`);
                }else{
                    // get basic block 
                    state.jump = {type:CONST.INSTR_TYPE.GOTO, label:oper.right.name};
                }
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


                if(this.simplify<5){
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

                state.code.push(`${indent}${regZ} = ${v};`);
                this.stack.setLocalSymbol(
                    regZ, 
                    DTYPE.ARRAY, 
                    this.allocator.newArray(oper.right, regV.getValue()), 
                    null);

                //state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = new ${oper.right._name}[${regX}];`);
                
                break;
            case OPCODE.CHECK_CAST.byte:

                regV = this.stack.getLocalSymbol( this.getRegisterName(oper.left));

                // check regV type against oper.right

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