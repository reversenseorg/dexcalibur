'use strict';

const CLASS = require("./CoreClass.js");
const CONST = require("./CoreConst.js");
const OPCODE = require('./Opcode.js').OPCODE;
var Logger = require("./Logger.js")();

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
};


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
ATYPE_DTYPE[OPCODE.AGET_OBJECT.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.AGET_SHORT.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.AGET_WIDE.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.APUT.byte] = DTYPE.IMM_NUMERIC;
ATYPE_DTYPE[OPCODE.APUT_BOOLEAN.byte] = DTYPE.IMM_BOOLEAN;
ATYPE_DTYPE[OPCODE.APUT_BYTE.byte] = DTYPE.IMM_BYTE;
ATYPE_DTYPE[OPCODE.APUT_CHAR.byte] = DTYPE.IMM_CHAR;
ATYPE_DTYPE[OPCODE.APUT_OBJECT.byte] = DTYPE.IMM_NUMERIC;
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

class Symbol
{
    constructor(pVisibility, pType, pValue, pCode=null){
        this.type = pType;
        this.value = pValue;
        this.visibility = pVisibility;
        this.code = pCode;
        this.regs = []; 
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
        if(this.value instanceof VirtualArray)
            return '[]';
        else
            return this.value;
    }

    isThis(pMethod){
        return (pMethod instanceof CLASS.Method) && (pMethod.modifiers.static==false);
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
            this.value[pOffset] = pValue;
        }else{
            throw Error("arrayWrite : Array is undefined");
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
        this.table = [];
    }

    addEntry(pSymbol, pVisibility, pType, pValue, pCode){
        this.table[pSymbol] =  new Symbol(
            pVisibility,
            pType,
            pValue,
            pCode
        );

        return this.table[pSymbol];
    }

    getEntry(pSymbol){
        return this.table[pSymbol];
    }

    hasEntry(pSymbol){
        return (this.table[pSymbol]!==undefined);
    }

    clone(){
        let tab = new SymTable();

        for(let i in this.table){
            tab.addEntry(i, this.table[i].visibility, this.table[i].type, this.table[i].value, this.table[i].code);
        }
        return tab;
    }
}


class VM
{
    constructor(pMethod, pLocalSize, pParamSize){
        //this.code = [];
        this.registers = {};
        this.symTab = new SymTable();
        this.invokes = [];
        this.method = pMethod;
        this.simplify = 0;
        this.countUntreated = 0;
        this.branch = null;
        this.depth = 0;
        this.savedContexts = {};
        this.visited = [];
        this.currentContext = "root";
        this.allocator = new Allocator();
 
        this.initRegisters(pMethod, pLocalSize, pParamSize);
    }

    changeContextLabel(pLabel = "root"){
        this.currentContext = pLabel;
    }
    
    saveContext(pLabel = "root"){
        this.savedContexts[pLabel] = this.symTab.clone();
        //console.log(this.savedContexts);
    }

    restoreContext( pNextLabel){
        this.savedContexts[this.currentContext] = this.symTab;
        this.currentContext = pNextLabel;
        this.symTab = this.savedContexts[pNextLabel];
    }

    getEntrypoint(){
        return this.method;
    }

    initRegisters(pMethod, pLocalSize, pParamSize){

        Logger.debug(`[VM] Init (locals:${pLocalSize}, params:${pParamSize}`);

        // init parameter register
        let paramOffset = 0, arg=null;    
        if(pMethod.modifiers.static==false){
            this.setSymbol('p0', DTYPE.CLASS_REF, pMethod.enclosingClass);   
            paramOffset = 1;
        }

        for(let i=paramOffset; i<pParamSize+paramOffset; i++){
            arg = pMethod.args[i-paramOffset];
            Logger.debug("initRegister: (reg=p",i,", type=",this.getDataTypeOf(arg),")");
            this.setSymbol('p'+i, this.getDataTypeOf(arg), null); // arg   
        }


        // init local registers
        for(let i=0; i<pLocalSize; i++){
            this.setSymbol('v'+i, DTYPE.UNDEFINED, null);
        }

        this.countUntreated = 0;
    }

    cleanVisitedBlock(){
        let block = this.method.getBasicBlocks();
        for(let i=0; i<block.length; i++){
            block[i].initVisit();
        }
    }

    setSimplifyingLevel(pLevel){
        this.simplify = pLevel;
    }
/*
    setContext(pCode){
        this.code = pCode;
    }*/

    run(pInstruction){
        pInstruction.opcode.eval(pVm, pInstruction);
    }

    getRegisterName(pReg){
        if(pReg.t=='v')
            return "v"+pReg.i
        else
            return "p"+pReg.i;
    }

    getSymbol(pReg){
        return this.symTab.getEntry(pReg); //this.registers[pReg];
    }

    getDataTypeOf(pType){
        Logger.debug("getDataTypeOf: ",pType);
        if(pType instanceof CLASS.ObjectType){
            return DTYPE.OBJECT_REF;
        }else{
            return BTYPE_DTYPE[pType.name];
        }
    }


    setSymbol(pReg, pType, pValue, pCode=null){
        Logger.debug("setSymbol: (reg=",pReg,", type=",pType,")");
        return this.symTab.addEntry(pReg, VTYPE.METH, pType, pValue, pCode);
    }

    isImm(pSymbol){
        return pSymbol.type < DTYPE.OBJECT_REF && (pSymbol.value != null);
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
            /*case DTYPE.FIELD_REF:
                console.log(tmp);
                v+= `${tmp.code},`;
                break;*/
            default:
                /*if(pForce)
                    v+= this.getRegisterName(oper.left[j])+pSeparator;
                else*/
                v =`<DECOMPILER_ERROR>${pSeparator}`;
                break;
        }
        return v;
    }

    moveRegister(pSrcRegister, pDestRegister){
        let src = this.getSymbol(pSrcRegister);
        this.setSymbol(pDestRegister, src.type, src.getValue(), src.getCode());
    }


    run(pBlock){
        let ops = [], dec=[],  f={res:false}, v='', regX=null,  regV=null, regZ=null, label=null, oper=null, tmp=[];
        let indent = "    ".repeat(this.depth);

        ops = pBlock.getInstructions();  ;  
        dec.push("");
        for(let k=0; k<ops.length; k++){
            v = '';
            oper = ops[k];
            switch(oper.opcode.byte)
            {
                case OPCODE.NEW_INSTANCE.byte:

                    regX = this.getRegisterName(oper.left);
                    this.setSymbol(regX, DTYPE.CLASS_REF, oper.right.name);
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
                    regV = this.setSymbol(regX, DTYPE.IMM_NUMERIC, oper.right._value);
                    if(this.simplify<1)
                        dec.push(`${indent}${regX} = ${this.getImmediateValue(regV)};`);
                    break;

                case OPCODE.CONST_STRING_JUMBO.byte:
                case OPCODE.CONST_STRING.byte:
                    
                    regX = this.getRegisterName(oper.left);
                    regV = this.setSymbol(regX, DTYPE.IMM_STRING, oper.right._value);

                    if(this.simplify<1)
                        dec.push(`${indent}${regX} = (String) ${this.getImmediateValue(regV)};`);
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
                        dec.push(v);

                    }else{
                        regX = this.getRegisterName(oper.left[1]);
                        regV = this.getSymbol(regX);

                        if(this.isImm(regV)){
                            regX = this.getRegisterName(oper.left[0]);
                            this.setSymbol(regX,  
                                DTYPE.IMM_NUMERIC, 
                                regV[SYMBOL_OPE[oper.opcode.ope]](oper.right.getValue(), oper.opcode.byte), 
                                this.getImmediateValue(regV));

                            v = `${indent}${this.getRegisterName(oper.left[0])} = ${this.getImmediateValue(regX)};`;
                            dec.push(v);
                        }else{
                            regX = this.getRegisterName(oper.left[0]);
                            this.setSymbol(regX,  
                                DTYPE.IMM_NUMERIC, 
                                regV[SYMBOL_OPE[oper.opcode.ope]](oper.right.getValue(), oper.opcode.byte), 
                                `${(regV.hasCode()? '('+regV.getCode()+')':this.getRegisterName(oper.left[1]))}${oper.opcode.ope}${oper.right.getValue()}`);

//                            this.getSymbol(regX).setCode(`${this.getRegisterName(oper.left[1])}+${oper.right.getValue()}`).
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
                        this.setSymbol(regX,  
                            DTYPE.IMM_NUMERIC, 
                            regV.add(oper.right.getValue(), oper.opcode.byte), 
                            v);
                        
                        dec.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v};`);
                        
                    }else{
                        regX = this.getRegisterName(oper.right);
                        regV = this.getSymbol(regX);

                        if(this.isImm(regV)){
                            regX = this.getRegisterName(oper.left[1]);

                            if(this.isImm(this.getSymbol(regX)))
                                this.setSymbol(
                                    this.getRegisterName(oper.left[0]), 
                                    DTYPE.IMM_NUMERIC,
                                    regV[SYMBOL_OPE[oper.opcode.ope]](this.getImmediateValue(oper.right), oper.opcode.byte));
                            else{
                                v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${this.getImmediateValue(regV)};`;                    
                                this.setSymbol(
                                    this.getRegisterName(oper.left[0]), 
                                    DTYPE.IMM_NUMERIC,
                                    null,
                                    v);
                                //dec.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v};`);
                            }
                            break;
                        }
                        else if(regV.hasCode()){

                            v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}(${regV.getCode()})`;
                            this.setSymbol(
                                this.getRegisterName(oper.left[0]), 
                                DTYPE.IMM_NUMERIC,
                                null,
                                v);

//                            dec.push(v);
                            break;
                        }
                        

                        regX = this.getRegisterName(oper.left[1]);
                        regV = this.getSymbol(regX);
                        if(this.isImm(regV)){
                            regX = this.getSymbol(this.getRegisterName(oper.left[0]));
                            // ${indent}${this.getRegisterName(oper.left[0])} = 
                            v = `${this.getImmediateValue(oper.left[1])}${oper.opcode.ope}${this.getRegisterName(oper.right)}`;
                            
                            this.setSymbol(
                                this.getRegisterName(oper.left[0]), 
                                DTYPE.IMM_NUMERIC,
                                null,
                                v);

                            //regX.setCode(`${this.getImmediateValue(oper.left[1])}+${this.getRegisterName(oper.right)}`);
                           // dec.push(v);

                            break;
                        }
                        else if(regV.hasCode()){

                            //v = `${indent}${this.getRegisterName(oper.left[0])} = ${regV.getCode()}+${this.getRegisterName(oper.right)};`;
                            this.setSymbol(
                                this.getRegisterName(oper.left[0]), 
                                DTYPE.IMM_NUMERIC,
                                null,
                                `${regV.getCode()}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);
                            //dec.push(v);
                        }
                        else{
                            //v = `${indent}${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getRegisterName(oper.right)};`;
                            this.setSymbol(
                                this.getRegisterName(oper.left[0]), 
                                DTYPE.IMM_NUMERIC,
                                null,
                                `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);
                            //dec.push(v);
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

                        this.setSymbol(
                            this.getRegisterName(oper.left[0]), 
                            DTYPE.IMM_NUMERIC,
                            null,
                            v);

                        dec.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v};`);
                    }else{
                        regX = this.getRegisterName(oper.right);
                        regX = this.getSymbol(regX);

                        if(this.isImm(regX)){

                            regV = this.getRegisterName(oper.left[0]);
                            regV = this.getSymbol(regV);

                            if(this.isImm(regV)){
//                                this.setSymbol(regX, regX.add(regV.getValue(), oper.opcode.byte));

                                
                                this.setSymbol(
                                    regV, 
                                    DTYPE.IMM_NUMERIC,
                                    regX[SYMBOL_OPE[oper.opcode.ope]](regV.getValue(), oper.opcode.byte),
                                    `${this.getImmediateValue(regX)}${oper.opcode.ope}${this.getImmediateValue(regV)}`);

                                break;
                            }
                            else{

                                if(regV.hasCode()){
                                    this.setSymbol(
                                        regV, 
                                        DTYPE.IMM_NUMERIC,
                                        null,
                                        `(${regV.getCode()})${oper.opcode.ope}${this.getImmediateValue(regV)}`);
    
                                }else{
                                    this.setSymbol(
                                        regV, 
                                        DTYPE.IMM_NUMERIC,
                                        null,
                                        `${this.getRegisterName(oper.left[0])}${oper.opcode.ope}${this.getImmediateValue(regV)}`);    
                                }
                            }
                        }       
                        else {

                            regV = this.getRegisterName(oper.left[0]);
                            regV = this.getSymbol(regV);

                            if(this.isImm(regV)){
                                if(regX.hasCode()){
                                    this.setSymbol(
                                        regV, 
                                        DTYPE.IMM_NUMERIC,
                                        null,
                                        `${this.getImmediateValue(regV)}${oper.opcode.ope}(${regX.getCode()})`);
    
                                }else{
                                    this.setSymbol(
                                        regV, 
                                        DTYPE.IMM_NUMERIC,
                                        null,
                                        `${this.getImmediateValue(regV)}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);
                                }

                                break;
                            }
                            else{
                                this.setSymbol(
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

                    v = dec[dec.length-1];

                    if(this.invokes.length > 0){
                        regV = this.invokes.pop();

                        if(ops[regV]==undefined){
                            this.setSymbol(regX, this.getDataTypeOf(ops[k-1].right.ret), null, v);
                        }else
                            this.setSymbol(regX, this.getDataTypeOf(ops[regV].right.ret), null, v);

                        /*    
                        if(ops[regV]==undefined){
                            this.setSymbol(regX, DTYPE.IMM_NUMERIC, ops[k-1].right.ret);
                        }else
                            this.setSymbol(regX, DTYPE.IMM_NUMERIC, ops[regV].right.ret);*/
                    }else{
                        Logger.debug("move-result skipped");
                        //this.setSymbol(regX, DTYPE.IMM_NUMERIC, null);
                        break;
                    }

                    dec.pop();
                    if(f.res == true){
                        dec.push(`${indent}${regX} = ${v.substr(indent.length,v.length)}`);
                        f.res = false;
                    }


                    break;

                case OPCODE.MOVE_RESULT_OBJECT.byte:

                    regX = this.getRegisterName(oper.left);
                    if(this.invokes.length > 0){
                        regV = this.invokes.pop();
                        v = dec[dec.length-1];
                        if(ops[regV]==undefined){

                            this.setSymbol(regX, DTYPE.OBJECT_REF, ops[k-1].right.ret, null); //v);
                        }else
                            this.setSymbol(regX, DTYPE.OBJECT_REF, ops[regV].right.ret, null); //v);
                    }else{

                        Logger.debug("move-result-object skipped => semantic error");
                        //this.setSymbol(regX, DTYPE.IMM_NUMERIC, null);
                        break;
                    }

                    if(f.res == true){
                        dec.pop();
                        //if(this.simplify<5){
                            dec.push(`${indent}${regX} = ${v.substr(indent.length,v.length)}`);
                        //}
                        f.res = false;
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
                    this.moveRegister(this.getRegisterName(oper.right), this.getRegisterName(oper.left));
                    break;

                case OPCODE.AGET.byte:
                case OPCODE.AGET_BOOLEAN.byte:
                case OPCODE.AGET_BYTE.byte:
                case OPCODE.AGET_CHAR.byte:
                case OPCODE.AGET_OBJECT.byte:
                case OPCODE.AGET_SHORT.byte:
                case OPCODE.AGET_WIDE.byte:
                    regX = this.getSymbol( this.getRegisterName(oper.right) );
                    if(oper.left[1] == undefined){
                        console.log(oper);
                    }
                    regV = this.getSymbol( this.getRegisterName(oper.left[1]) );

                    if(this.isImm(regX)){
                        if(this.isImm(regV)){
                            this.setSymbol(
                                this.getRegisterName(oper.left[0]),
                                ATYPE_DTYPE[oper.opcode.byte],
                                regV.arrayRead(regX.getValue()),
                                `${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${regX.getValue()}]`);
                        }else{
                            this.setSymbol(
                                this.getRegisterName(oper.left[0]),
                                ATYPE_DTYPE[oper.opcode.byte],
                                null,
                                `${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${regX.getValue()}]`);
                        }
                    }
                    else{
                        console.log(oper.left[1]);
                        this.setSymbol(
                            this.getRegisterName(oper.left[0]),
                            ATYPE_DTYPE[oper.opcode.byte],
                            null,
                            `${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${regX.hasCode()?regX.getCode():this.getRegisterName(oper.right)}]`);
                    }
                    break;


                case OPCODE.APUT.byte:
                case OPCODE.APUT_BOOLEAN.byte:
                case OPCODE.APUT_BYTE.byte:
                case OPCODE.APUT_CHAR.byte:
                case OPCODE.APUT_OBJECT.byte:
                case OPCODE.APUT_SHORT.byte:
                case OPCODE.APUT_WIDE.byte:
                    regX = this.getSymbol( this.getRegisterName(oper.right) );
                    regV = this.getSymbol( this.getRegisterName(oper.left[1]) );
                    regZ = this.getSymbol( this.getRegisterName(oper.left[0]) );

                    if(this.isImm(regX)){
                        if(this.isImm(regV)){
                            if(this.isImm(regZ))
                                regV.arrayWrite(regX.getValue(), regZ.getValue());
                            else
                                regV.arrayWrite(regX.getValue(), regZ);
                        }
                    }

                    dec.push(`${regV.hasCode()?regV.getCode():this.getRegisterName(oper.left[1])}[${regX.hasCode()?regX.getCode():this.getRegisterName(oper.right)}] = ${this.isImm(regZ)? this.getImmediateValue(regZ):this.getRegisterName(oper.left[0])};`);
                    break;

                case OPCODE.MOVE_EXCEPTION.byte:
                    // nothing todo
                    break;

                case OPCODE.MONITOR_ENTER.byte:
                    dec.push(`// monitor-enter`);
                    // nothing todo
                    break;
                case OPCODE.MONITOR_EXIT.byte:
                    dec.push(`// monitor-exit`);
                    // nothing todo
                    break;
                case OPCODE.THROW.byte:
                    dec.push(`${indent}throw ${this.getRegisterName(oper.left)}`);
                    // nothing todo
                    break;
                case OPCODE.INVOKE_STATIC.byte:

                    v = `${indent}${oper.right.enclosingClass.alias!=null?oper.right.enclosingClass.alias:oper.right.enclosingClass.name}.${ops[k].right.alias!=null?ops[k].right.alias:ops[k].right.name}( `;
                    if(oper.left.length > 0){
                        for(let j=0; j<oper.left.length; j++){
                            regX = this.getRegisterName(oper.left[j]);
                            regV = this.getSymbol(regX);

                            if(this.isImm(regV))
                                v+= this.getImmediateValue(regV)+', ';
                            else if(regV.hasCode())
                                v+= `${regV.getCode()}, `;
                            else
                                v+= regX+', ';

                        } 
                        v = v.substr(0, v.length-2);
                    }
                    v += ')';
                    dec.push(v);
                    f.res = true;
                    this.invokes.push(k);
                    break;

                case OPCODE.INVOKE_VIRTUAL.byte:
                case OPCODE.INVOKE_DIRECT.byte:
                case OPCODE.INVOKE_INTERFACE.byte:
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getSymbol(regX);

                    //console.log(indent.length);
                    if((oper.right instanceof CLASS.Method) && (oper.right.name=="<init>"))
                        v = `${indent}${regX} = new ${oper.right.enclosingClass.name}(`;
                    else if(this.method.modifiers.static==false && regX=="p0"){
                        v = `${indent}this.${oper.right.alias!=null? oper.right.alias : oper.right.name}(`;
                        f.res = true;
                        this.invokes.push(k);
                    }
                    else if(this.method.modifiers.static==true && regX=="p0"){
                        v = `${indent}${regV.getValue()._name}.${oper.right.alias!=null? oper.right.alias : oper.right.name}(`;
                        f.res = true;
                        this.invokes.push(k);
                    }
                    else if(regV.hasCode()){
                        v = `${indent}(${regV.getCode()}).${oper.right.alias!=null? oper.right.alias : oper.right.name}(`;
                        f.res = true;
                        this.invokes.push(k);
                    }
                    else{
                        v = `${indent}${regX}.${oper.right.alias!=null? oper.right.alias : oper.right.name}(`;
                        f.res = true;
                        this.invokes.push(k);
                    }

                    if(oper.left.length > 1){
                        for(let j=1; j<oper.left.length; j++){

                            tmp = this.getRegisterName(oper.left[j]);
                            regV = this.getSymbol(tmp);

                            if(this.isImm(regV))
                                v += `${this.getImmediateValue(regV)},`;
                            else if(regV.hasCode())
                                v+= `${regV.getCode()},`;
                            else{
                                v += `${tmp},`;
                            }
                        } 
                        v = v.substr(0, v.length-1);
                    }
                    v += ')';
                    dec.push(v);
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
                        this.setSymbol(regX, DTYPE.FIELD_REF, null, v);
                        dec.push(`${indent}${regX} = ${v};`);
                    }else{
                        this.setSymbol(regX, DTYPE.FIELD_REF, null, v);
                        Logger.debug(`${indent}${regX} = ${v};`);
                    }
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
                    regV = oper.right.type._name;
                
                    v = `${regV.endsWith(".String")?"":"("+regV+")"} ${oper.right.enclosingClass.alias!=null?oper.right.enclosingClass.alias:oper.right.enclosingClass.name}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                    

                    if(this.simplify<1){
                        this.setSymbol(regX, DTYPE.FIELD_REF, oper.right, v);
                        dec.push(`${indent}${regX} = ${v};`);
                    }else{
                        this.setSymbol(regX, DTYPE.FIELD_REF, oper.right, v);
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
                        regV = this.getSymbol(regX);    
                        
                        if(regV.hasCode()){
                            regX = `(${regV.getCode()})`;
                        }

                        if(this.getRegisterName(oper.left[1])=="p0" && (this.method.modifiers.static==false)){
                            if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                                v = `${indent}this.${oper.right.name} = ${regX};`;
                            else
                                v = `${indent}p0.${oper.right.name} = ${regX}`;
    
                        }else{
                            regV = this.getSymbol(this.getRegisterName(oper.left[1]));
                            if(regV.hasCode()){
                                v = `${indent}(${regV.getCode()}).${oper.right.name} = ${regX};`;
                            }else{
                                v = `${indent}${this.getRegisterName(oper.left[1])}.${oper.right.name} = ${regX};`;
                            }
                        }
    
                        //co
                        //this.setSymbol(`${this.getRegisterName(oper.left[1])}.${oper.right.name}`, DTYPE.FIELD_REF, oper.right.name, v);
                        dec.push(v);
                        break;

                case OPCODE.SPUT.byte:
                case OPCODE.SPUT_BOOLEAN.byte:
                case OPCODE.SPUT_BYTE.byte:
                case OPCODE.SPUT_CHAR.byte:
                case OPCODE.SPUT_OBJECT.byte:
                case OPCODE.SPUT_SHORT.byte:
                case OPCODE.SPUT_WIDE.byte:
                
                    regX = this.getRegisterName(oper.left[0]);
                        
                    if(this.getRegisterName(oper.left[1])=="p0" && (this.method.modifiers.static==false)){
                        if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                            v = `${indent}this.${oper.right.name} = ${regX};`;
                        else
                            v = `${indent}p0.${oper.right.name} = ${regX}`;

                    }else{
                        v = `${indent}${this.getRegisterName(oper.left[1])}.${oper.right.name} = ${regX};`;
                    }

                    //co
                    //this.setSymbol(`${this.getRegisterName(oper.left[1])}.${oper.right.name}`, DTYPE.FIELD_REF, oper.right.name, v);
                    dec.push(v);
                    break;

                case OPCODE.RETURN.byte:
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);

                    if((regX=="p0") && (this.method.modifiers.static==false)){
                        if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                            v = `${indent}return this;`;
                        else if(this.simplify >= 1 && this.isImm(regV))
                            v = `${indent}return ${this.getImmediateValue(regV)};`;
                        else 
                            v = `${indent}return p0;`;

                    }else if(this.simplify >= 1 && this.isImm(regV))
                        v = `${indent}return ${this.getImmediateValue(regV)};`;
                    else{

                        v = `${indent}return ${regX};`;
                    }

                    dec.push(v);
                    break;
                case OPCODE.RETURN_OBJECT.byte:
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    
                    if(this.getRegisterName(oper.left)=="p0" && (this.method.modifiers.static==false)){
                        if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                            v = `${indent}return this;`;
                        else if(this.simplify >= 1 && this.isImm(regV))
                            v = `${indent}return ${this.getImmediateValue(regV)};`;
                        else 
                            v = `${indent}return p0;`;

                    }
                    else{
                        v = `${indent}return ${regX};`;
                    }

                    dec.push(v);
                    break;
                case OPCODE.RETURN_WIDE.byte:
                    dec.push(`${indent}return <TODO>;`);
                    break;
                case OPCODE.RETURN_VOID.byte:
                    dec.push(`${indent}return ;`);
                    break;
                
                // IF multi
                case OPCODE.IF_EQ.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} == ${regV} ) ${label}`);
                    break;
                case OPCODE.IF_NE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} != ${regV} ) ${label}`);
                    break;
                case OPCODE.IF_LT.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} < ${regV} ) ${label}`);
                    break;
                case OPCODE.IF_GE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} >= ${regV} ) ${label}`);
                    break;
                case OPCODE.IF_GT.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} > ${regV} ) ${label}`);
                    break;
                case OPCODE.IF_LE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);
                    
                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }
                        
                    dec.push(`${indent}if( ${regX} <= ${regV} ) ${label}`);
                    break;

                // IF zero
                case OPCODE.IF_EQZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);

                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0){
                        if(this.isImm(regV))
                            dec.push(`${indent}if( ${this.getImmediateValue(regV)} == 0 ) ${label}`);
                        else if(regV.type == DTYPE.OBJECT_REF){
                            dec.push(`${indent}if( ${regX} != null ) ${label}`);
                        }else{
                            dec.push(`${indent}if( ${regX} == 0 ) ${label}`);
                        }
                    }else
                        dec.push(`if( ${regX} == 0 ) ${label}`);
                    break;
                case OPCODE.IF_NEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} != 0 ) ${label}`);
                    else{
                        dec.push(`${indent}if( ${regX} != 0 ) ${label}`);
                    }break;
                case OPCODE.IF_LTZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} < 0 )`);
                    else
                        dec.push(`${indent}if( ${regX} < 0 ) ${label}`);
                    break;
                case OPCODE.IF_GEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} >= 0 ) ${label}`);
                    else
                        dec.push(`${indent}if( ${regX} >= 0 ) ${label}`);
                    break;
                case OPCODE.IF_GTZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} > 0 ) ${label}`);
                    else
                        dec.push(`${indent}if( ${regX} > 0 ) ${label}`);
                    break;
                case OPCODE.IF_LEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    
                    label = `:cond_${oper.right.name}`;
                    this.saveContext(label);

                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} <= 0 ) ${label}`);
                    else
                        dec.push(`${indent}if( ${regX} <= 0 ) ${label}`);
                    break;
                
                case OPCODE.ARRAY_LENGTH.byte:
                    // dec.push(`${indent}if( ${regX} <= 0 ) ${label}`);
                    break;

                case OPCODE.GOTO.byte:
                case OPCODE.GOTO_16.byte:
                case OPCODE.GOTO_32.byte:                
                    label = `:goto_${oper.right.name}`;
                    this.saveContext(label);
                    dec.push(`${indent}goto ${label}`);
                    break;

                case OPCODE.ARRAY_LENGTH.byte:
                    regX = this.getRegisterName( oper.right );
                    regV = this.getSymbol( regX);
                    v = null;


                    if(regV != undefined){
                        if(regV.hasValue() && (regV.getReferencedValue() instanceof VirtualArray)){
                            this.setSymbol( 
                                this.getRegisterName(oper.left), 
                                DTYPE.IMM_NUMERIC, 
                                regV.getReferencedValue().size(), 
                                v = `${regX}.length`)
                        }
                        else if(regV.hasCode()){
                            this.setSymbol( 
                                this.getRegisterName(oper.left), 
                                DTYPE.IMM_NUMERIC, 
                                null, 
                                v = `${regV.getCode()}.length`)
                        }else{
                            this.setSymbol( 
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
                        dec.push(v);
                    }

                    break;

                case OPCODE.NEW_ARRAY.byte:
                    regX = this.getRegisterName( oper.left[1] );
                    regV = this.getSymbol( regX);

                    this.setSymbol(regX, DTYPE.ARRAY, this.allocator.newArray(oper.right), null);

                    if(this.isImm(regV))
                        dec.push(`${indent}${this.getRegisterName(oper.left[0])} = new ${oper.right._name}[${this.getImmediateValue(regV)}];`);
                    else if(regV.hasCode())
                        dec.push(`${indent}${this.getRegisterName(oper.left[0])} = new ${oper.right._name}[${regV.getCode()}];`);
                    else
                        dec.push(`${indent}${this.getRegisterName(oper.left[0])} = new ${oper.right._name}[${regX}];`);

                    //dec.push(`${indent}${this.getRegisterName(oper.left[0])} = new ${oper.right._name}[${regX}];`);
                    
                    break;

                default:
                    this.countUntreated++;
            }
        }

        if(dec[0]=="") dec.shift();


        return { code:dec };
    }

    throwError( pRegister, pSymbol, pInstruction, pMessage){
        // TODO
        Logger.error(`[VM][ERROR] "${pRegister}" into [${pInstruction.toString()}] : ${pMessage}`);
    }
}

class VirtualArray
{
    constructor( pType, pSize){
        this.type = pType;
        this.size = pSize;
        this.value = [];
    }
    
    size(){
        return this.size;
    }

}

class Allocator
{
    constructor( pMemorySize=-1){
        this.maxMemorySize = pMemorySize;
        this.heap = [];
        this.top = 0;
    }

    newArray( pType, pSize){
        this.top = this.heap.length;
        this.heap.push( new VirtualArray( pType._name, pSize, this.top ));

        return this.heap[this.top];
    }

}


module.exports = {
    VM: VM,
    Symbol: Symbol,
    SymbolTable: SymTable
};