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
    THIS: 0xb
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

    getValue(){
        return this.value;
    }

    isThis(pMethod){
        return (pMethod instanceof CLASS.Method) && (pMethod.modifiers.static==false);
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

    addEntry(pSymbol, pVisibility, pType, pValue){
        this.table[pSymbol] =  new Symbol(
            pVisibility,
            pType,
            pValue
        );

        return this.table[pSymbol];
    }

    getEntry(pSymbol){
        return this.table[pSymbol];
    }

    hasEntry(pSymbol){
        return (this.table[pSymbol]!==undefined);
    }
}

class VM
{
    constructor(pMethod, pLocalSize, pParamSize){
        this.code = [];
        this.registers = {};
        this.symTab = new SymTable();
        this.invokes = [];
        this.method = pMethod;
        this.simplify = 0;
        this.countUntreated = 0;
        this.branch = null;
        this.depth = 0;

        this.initRegisters(pMethod, pLocalSize, pParamSize);
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

    setContext(pCode){
        this.code = pCode;
    }

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


    setSymbol(pReg, pType, pValue){
        Logger.debug("setSymbol: (reg=",pReg,", type=",pType,")");
        return this.symTab.addEntry(pReg, VTYPE.METH, pType, pValue);
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


    detectIfElse(pBlocks){
        let f=false;
        for(let i=0; i<pBlocks.length; i++){
            console.log(pBlocks[i].offset);
            if(pBlocks[i].isConditionalBlock()) 
                f=true;
        }
        return f;
    }

    dump(pBlock){
        let p=pBlock.getSuccessors(), v="";
        v+=`${pBlock.offset} => `;
        for(let i=0; i<p.length; i++) v+= " :: "+p[i].offset+" ";
        return "[ "+v+" ]";
    }

    runDecompile(pTree, pSource=[], pDepth=0, pStop=false, pClose=false){
        let cont = true, source=pSource, res={ depth:0 }, succ=null, pred=[], d=null, tmp=null;
        let next = [], ifelse=false;
        
        console.log(this.dump(pTree));

        Logger.debug(pTree.offset+" => "+pTree.isConditionalBlock());

        if(pTree.isGotoBlock()){
            source.push(`goto_${pTree.getGotoLabel()}:`);
        }
        if(pTree.isTryBlock()){
            source.push(`${"    ".repeat(pDepth)}try{`);
            pDepth++;
        }
        
        if(pTree.isVisited()==false){
            res = this.decompileBasicBlock(pTree, pDepth);
            //console.log(pTree);
            pTree.visit();

            source = source.concat(res.code);
        }

        if(pClose)
            source.push(`${"    ".repeat(pDepth)}}`);

        Logger.debug(pTree.offset+" (END)=> "+pTree.isConditionalBlock());


        pred = pTree.getPredecessors();
        succ = pTree.getSuccessors();

        /*if(pred.length>1 && pWidth<pred.length){

            source.push(`${"    ".repeat(pDepth)}}else{`);
            for(let i=pWidth; i<pred.length; i++){
                if(pred[i].isVisited()) continue;
                source = this.runDecompile(pred[i], source, pDepth, pWidth+1);
            }
            source.push(`${"    ".repeat(pDepth)}}`);

        }else*/ 
        if(pTree.hasSuccessors()){
            if(succ.length == 1 && !succ[0].isVisited()){

                if(!succ[0].hasMultiplePredecessors())
                    source = this.runDecompile(succ[0], source, pDepth, true);
                else{
                    source = this.runDecompile(succ[0], source, pDepth-1, true);
                }
            }else{
                // explore blocks with single predecessor
                ifelse = this.detectIfElse(succ);
                for(let i=0; i<succ.length; i++){
                    if(succ[i].isVisited()) continue;
                    if(succ[i].hasMultiplePredecessors()){
                        next.push(succ[i]);
                        //this.branch.push(succ[i]);
                        continue;
                    } 
                    if(ifelse){
                        if(succ[i].isConditionalBlock()){
                            cont = source.pop();
                            source.push(cont+'{');
                        }else{
                            source.push(`${"    ".repeat(pDepth)}else{`);
                        }
                    }
                    // pDepth+(succ[i].isConditionalBlock()?1:0)
                    source = this.runDecompile(succ[i], source, pDepth+1, true, true);
                    source.push(`${"    ".repeat(pDepth)}}`);
                }
            }
        }
        
        if(pTree.isTryEndBlock()){
            if(pTree.hasCatchStatement()){
                d = pTree.getCatchStatements();
                for(let i=0; i<d.length; i++){
                    source.push(`${"    ".repeat(pDepth-1)}}catch(${d[i].getException().name}){`);
                    source = this.runDecompile(d[i].getTarget(), source, pDepth+1, false);
                    source.push(`${"    ".repeat(pDepth-1)}}`);
                }
            }
        }   

        // treat blocks with multiple predecessors
        //this.branch
        for(let i=0; i<next.length; i++){
            if(next[i].isVisited()==false){
                source = this.runDecompile(next[i], source, pDepth, false);
            }
        }


        return source;
    }


    runSimplify(){
        let ssmali=[], dec=null, f=0, pDepth=0, d=null;
        let bbs = this.method.getBasicBlocks();

        for(let i=0; i<bbs.length; i++){
            f = 0;
            if(bbs[i].isConditionalBlock()){
                ssmali.push(`\ncond_${bbs[i].getCondLabel()}:`);
                f++;
            }
            if(bbs[i].isGotoBlock()){
                if(f>0) 
                    ssmali.push(`goto_${bbs[i].getGotoLabel()}:`);
                else{
                    ssmali.push(`\ngoto_${bbs[i].getGotoLabel()}:`);
                    f++;
                }
            }
            if(bbs[i].isTryBlock()){
                if(f==0) 
                    ssmali.push(`try{`);
                else
                    ssmali.push(`\ntry{`);

                this.depth++;
            }


            dec = this.simplifyBasicBlock(bbs[i], this.depth);  
            ssmali = ssmali.concat(dec.code);      

            if(bbs[i].isTryEndBlock()){
                if(bbs[i].hasCatchStatement()){
                    d = bbs[i].getCatchStatements();
                    for(let i=0; i<d.length; i++){
                        if(d[i].getException() != null)
                            ssmali.push(`${"    ".repeat(this.depth-1)}}catch(${d[i].getException().name}) :${d[i].getTarget().getCatchLabel()}`);
                        else
                            ssmali.push(`${"    ".repeat(this.depth-1)}}catchall :${d[i].getTarget().getCatchLabel()}`);
                    }
                }else{
                    ssmali.push(`} try END\n`);
                    this.depth--;
                }
            }
        }

        Logger.debug('[SIMPLIFIER] '+this.countUntreated+' instructions not treated');
        return ssmali;
    }

    decompileBasicBlock(pBlock, pDepth=0){
        let ops = [], dec=[],  f={res:false}, v='', regX=null,  regV=null, oper=null, tmp=[];
        let indent = "    ".repeat(pDepth);

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
                        dec.push(`${indent}String ${regX} = ${this.getImmediateValue(regV)};`);
                    break;

                case OPCODE.MOVE_RESULT.byte:
                case OPCODE.MOVE_RESULT_WIDE.byte:
//                        console.log(oper);

                    regX = this.getRegisterName(oper.left);
                    if(this.invokes.length > 0){
                        regV = this.invokes.pop();
                        if(ops[regV]==undefined){
                            this.setSymbol(regX, this.getDataTypeOf(ops[k-1].right.ret), null);
                        }else
                            this.setSymbol(regX, this.getDataTypeOf(ops[regV].right.ret), null);
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

                    v = dec.pop();
                    if(f.res == true){
                        dec.push(`${indent}${regX} = ${v.substr(indent.length,v.length)}`);
                        f.res = false;
                    }


                    break;

                case OPCODE.MOVE_RESULT_OBJECT.byte:

                    regX = this.getRegisterName(oper.left);
                    if(this.invokes.length > 0){
                        regV = this.invokes.pop();
                        if(ops[regV]==undefined){
                            this.setSymbol(regX, DTYPE.OBJECT_REF, ops[k-1].right.ret);
                        }else
                            this.setSymbol(regX, DTYPE.OBJECT_REF, ops[regV].right.ret);
                    }else{
                        Logger.debug("move-result-object skipped");
                        //this.setSymbol(regX, DTYPE.IMM_NUMERIC, null);
                        break;
                    }

                    v = dec.pop();
                    if(f.res == true){
                        dec.push(`${indent}${regX} = ${v.substr(indent.length,v.length)}`);
                        f.res = false;
                    }

                    break;

                case OPCODE.INVOKE_STATIC.byte:
                    v = `${indent}${oper.right.enclosingClass.name}.${ops[k].right.name}(`;
                    if(oper.left.length > 0){
                        for(let j=0; j<oper.left.length; j++){
                            regX = this.getRegisterName(oper.left[j]);
                            regV = this.getSymbol(regX);

                            if(this.isImm(regV))
                                v+= this.getImmediateValue(regV)+',';
                            else
                                v+= regX+',';

                        } 
                        v = v.substr(0, v.length-1);
                    }
                    v += ');';
                    dec.push(v);
                    f.res = true;
                    break;

                case OPCODE.INVOKE_VIRTUAL.byte:
                case OPCODE.INVOKE_DIRECT.byte:
                case OPCODE.INVOKE_INTERFACE.byte:
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getSymbol(regX);

                    if((oper.right instanceof CLASS.Method) && (oper.right.name=="<init>"))
                        v = `${regX} = new ${oper.right.enclosingClass.name}(`;
                    else if(method.modifiers.static==false && regX=="p0"){
                        v = `this.${oper.right.name}(`;
                        f.res = true;
                        this.invokes.push(k);
                    }
                    else{
                        v = `${regX}.${oper.right.name}(`;
                        f.res = true;
                        this.invokes.push(k);
                    }

                    if(oper.left.length > 1){
                        for(let j=1; j<oper.left.length; j++){

                            tmp = this.getRegisterName(oper.left[j]);
                            regV = this.getSymbol(tmp);

                            if(this.simplify >= 1 && this.isImm(regV))
                                v += `${this.getImmediateValue(regV)},`;
                            else{
                                v += `${tmp},`;
                            }
                        } 
                        v = v.substr(0, v.length-1);
                    }
                    v += ');';
                    dec.push(`${indent}${v}`);
                    break;


                case OPCODE.IGET_BYTE.byte:
                case OPCODE.IGET_CHAR.byte:
                case OPCODE.IGET_OBJECT.byte:
                case OPCODE.IGET_SHORT.byte:
                case OPCODE.IGET_WIDE.byte:
                case OPCODE.IGET_BOOLEAN.byte:
                    regX = this.getRegisterName(oper.left[0]);
                    regV = oper.right.type.name;
                    
                    if(this.getRegisterName(oper.left[1])=="p0" && (this.method.modifiers.static==false)){
                        if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                            v = `${indent}${regV} ${regX} = this.${oper.right.name};`;
                        else
                            v = `${indent}${regV} ${regX} = p0.${oper.right.name};`;

                    }else{
                        v = `${indent}${regV} ${regX} = ${this.getRegisterName(oper.left[1])}.${oper.right.name};`;
                    }


                    //co
                    this.setSymbol(regX, DTYPE.FIELD_REF, oper.right.name, v);
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

                case OPCODE.ADD_INT_LIT8.byte:
                case OPCODE.ADD_INT_LIT8.byte:
                    if(this.simplify<1){
                        v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getImmediateValue(oper.right)};`;

                    }else{
                        regX = this.getRegisterName(oper.left[1]);
                        regV = this.getSymbol(regX);

                        if(this.isImm(regV)){
                            regX = this.getRegisterName(oper.left[0]);
                            this.setSymbol(regX, regV.addInt8(this.getImmediateValue(oper.right)));
                        }else{
                           v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getImmediateValue(oper.right)};`;
                        }
                    }
                    break;

                /*case OPCODE.ADD_DOUBLE.byte:
                case OPCODE.ADD_FLOAT.byte:

                    
                    break;*/

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

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} == ${regV} )`);
                    break;
                case OPCODE.IF_NE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} != ${regV} )`);
                    break;
                case OPCODE.IF_LT.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} < ${regV} )`);
                    break;
                case OPCODE.IF_GE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} >= ${regV} )`);
                    break;
                case OPCODE.IF_GT.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} > ${regV} )`);
                    break;
                case OPCODE.IF_LE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);
                    
                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }
                        
                    dec.push(`${indent}if( ${regX} <= ${regV} )`);
                    break;

                // IF zero
                case OPCODE.IF_EQZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0){
                        if(this.isImm(regV))
                            dec.push(`${indent}if( ${this.getImmediateValue(regV)} == 0 )`);
                        else if(regV.type == DTYPE.OBJECT_REF){
                            dec.push(`${indent}if( ${regX} != null )`);
                        }else{
                            dec.push(`${indent}if( ${regX} == 0 )`);
                        }
                    }else
                        dec.push(`if( ${regX} == 0 )`);
                    break;
                case OPCODE.IF_NEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} != 0 )`);
                    else
                        dec.push(`${indent}if( ${regX} != 0 )`);
                    break;
                case OPCODE.IF_LTZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} < 0 )`);
                    else
                        dec.push(`${indent}if( ${regX} < 0 )`);
                    break;
                case OPCODE.IF_GEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} >= 0 )`);
                    else
                        dec.push(`${indent}if( ${regX} >= 0 )`);
                    break;
                case OPCODE.IF_GTZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} > 0 )`);
                    else
                        dec.push(`${indent}if( ${regX} > 0 )`);
                    break;
                case OPCODE.IF_LEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} <= 0 )`);
                    else
                        dec.push(`${indent}if( ${regX} <= 0 )`);
                    break;
                /*case OPCODE.MONITOR_ENTER.byte:
                    dec.push("try{");
                    break;
                case OPCODE.MONITOR_ENTER.byte:
                    dec.push("try{");
                    break;*/
            }
        }

        if(dec[0]=="") dec.shift();

        return { code:dec, depth:pDepth };
    }



    simplifyBasicBlock(pBlock, pDepth=0){
        let ops = [], dec=[],  f={res:false}, v='', regX=null,  regV=null, oper=null, tmp=[];
        let indent = "    ".repeat(pDepth);

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
                    if(this.simplify<1){
                        v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getImmediateValue(oper.right)};`;

                    }else{
                        regX = this.getRegisterName(oper.left[1]);
                        regV = this.getSymbol(regX);

                        if(this.isImm(regV)){
                            regX = this.getRegisterName(oper.left[0]);
                            this.setSymbol(regX, regV.add(this.getImmediateValue(oper.right), oper.opcode.byte));
                        }else{
                            v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getImmediateValue(oper.right)};`;
                        }
                    }
                    break;
                case OPCODE.ADD_INT.byte:
                case OPCODE.ADD_LONG.byte:
                case OPCODE.ADD_DOUBLE.byte:
                case OPCODE.ADD_FLOAT.byte:
                    if(this.simplify<1){
                        v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getRegisterName(oper.right)};`;
                        
                    }else{
                        regX = this.getRegisterName(oper.right);
                        regV = this.getSymbol(regX);

                        if(this.isImm(regV)){
                            regX = this.getRegisterName(oper.left[1]);

                            if(this.isImm(this.getSymbol(regX)))
                                this.setSymbol(this.getRegisterName(oper.left[0]), regV.add(this.getImmediateValue(oper.right), oper.opcode.byte));
                            else{
                                v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getImmediateValue(regV)};`;                    
                                dec.push(v);
                            }
                            break;
                        }
                        

                        regX = this.getRegisterName(oper.left[1]);
                        regV = this.getSymbol(regX);
                        if(this.isImm(regV)){
                            regX = this.getSymbol(this.getRegisterName(oper.left[0]));

                            v = `${this.getRegisterName(oper.left[0])} = ${this.getImmediateValue(oper.left[1])}+${this.getRegisterName(oper.right)};`;
                            regX.setCode(v);

                            break;
                        }
                        else{
                            v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getRegisterName(oper.right)};`;
                            dec.push(v);
                        }
                    }
                    break;

                case OPCODE.ADD_INT_2ADDR.byte:
                case OPCODE.ADD_LONG_2ADDR.byte:
                case OPCODE.ADD_DOUBLE_2ADDR.byte:
                case OPCODE.ADD_FLOAT_2ADDR.byte:
                    if(this.simplify<1){
                        v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[0])}+${this.getRegisterName(oper.right)};`;

                        dec.push(v);
                    }else{
                        regX = this.getRegisterName(oper.right);
                        regV = this.getSymbol(regX);

                        if(this.isImm(regV)){

                            regX = this.getRegisterName(oper.left[0]);
                            regX = this.getSymbol(regX);

                            if(this.isImm(regX)){
                                this.setSymbol(regX, regX.add(regV.getValue(), oper.opcode.byte));
                            }

                        }else{
                            v = `${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getImmediateValue(oper.right)};`;
                             dec.push(v);
                        }
                    }
                    
                    break;
                case OPCODE.MOVE_RESULT.byte:
                case OPCODE.MOVE_RESULT_WIDE.byte:
//                        console.log(oper);

                    regX = this.getRegisterName(oper.left);
                    if(this.invokes.length > 0){
                        regV = this.invokes.pop();

                        if(ops[regV]==undefined){
                            this.setSymbol(regX, this.getDataTypeOf(ops[k-1].right.ret), null);
                        }else
                            this.setSymbol(regX, this.getDataTypeOf(ops[regV].right.ret), null);

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

                    v = dec.pop();
                    if(f.res == true){
                        dec.push(`${indent}${regX} = ${v.substr(indent.length,v.length)}`);
                        f.res = false;
                    }


                    break;

                case OPCODE.MOVE_RESULT_OBJECT.byte:

                    regX = this.getRegisterName(oper.left);
                    if(this.invokes.length > 0){
                        regV = this.invokes.pop();
                        if(ops[regV]==undefined){
                            this.setSymbol(regX, DTYPE.OBJECT_REF, ops[k-1].right.ret);
                        }else
                            this.setSymbol(regX, DTYPE.OBJECT_REF, ops[regV].right.ret);
                    }else{
                        Logger.debug("move-result-object skipped");
                        //this.setSymbol(regX, DTYPE.IMM_NUMERIC, null);
                        break;
                    }

                    v = dec.pop();
                    if(f.res == true){
                        dec.push(`${indent}${regX} = ${v.substr(indent.length,v.length)}`);
                        f.res = false;
                    }

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
                    v = `${indent}${oper.right.enclosingClass.name}.${ops[k].right.name}(`;
                    if(oper.left.length > 0){
                        for(let j=0; j<oper.left.length; j++){
                            regX = this.getRegisterName(oper.left[j]);
                            regV = this.getSymbol(regX);

                            if(this.isImm(regV))
                                v+= this.getImmediateValue(regV)+',';
                            else
                                v+= regX+',';

                        } 
                        v = v.substr(0, v.length-1);
                    }
                    v += ');';
                    dec.push(v);
                    f.res = true;
                    break;

                case OPCODE.INVOKE_VIRTUAL.byte:
                case OPCODE.INVOKE_DIRECT.byte:
                case OPCODE.INVOKE_INTERFACE.byte:
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getSymbol(regX);

                    if((oper.right instanceof CLASS.Method) && (oper.right.name=="<init>"))
                        v = `${indent}${regX} = new ${oper.right.enclosingClass.name}(`;
                    else if(method.modifiers.static==false && regX=="p0"){
                        v = `${indent}this.${oper.right.name}(`;
                        f.res = true;
                        this.invokes.push(k);
                    }
                    else{
                        v = `${indent}${regX}.${oper.right.name}(`;
                        f.res = true;
                        this.invokes.push(k);
                    }

                    if(oper.left.length > 1){
                        for(let j=1; j<oper.left.length; j++){

                            tmp = this.getRegisterName(oper.left[j]);
                            regV = this.getSymbol(tmp);

                            if(this.simplify >= 1 && this.isImm(regV))
                                v += `${this.getImmediateValue(regV)},`;
                            else{
                                v += `${tmp},`;
                            }
                        } 
                        v = v.substr(0, v.length-1);
                    }
                    v += ');';
                    dec.push(`${indent}${v}`);
                    break;


                case OPCODE.IGET.byte:
                case OPCODE.IGET_BYTE.byte:
                case OPCODE.IGET_CHAR.byte:
                case OPCODE.IGET_OBJECT.byte:
                case OPCODE.IGET_SHORT.byte:
                case OPCODE.IGET_WIDE.byte:
                case OPCODE.IGET_BOOLEAN.byte:
                    regX = this.getRegisterName(oper.left[0]);
                    regV = oper.right.type.name;
                    
                    if(this.getRegisterName(oper.left[1])=="p0" && (this.method.modifiers.static==false)){
                        if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                            v = `${indent}${regX} = (${regV}) this.${oper.right.name};`;
                        else
                            v = `${indent}${regX} = (${regV})  p0.${oper.right.name};`;

                    }else{
                        v = `${indent}${regX} = (${regV}) ${this.getRegisterName(oper.left[1])}.${oper.right.name};`;
                    }


                    //co
                    this.setSymbol(regX, DTYPE.FIELD_REF, oper.right.name, v);
                    dec.push(v);
                    break;

                case OPCODE.SGET.byte:
                case OPCODE.SGET_BYTE.byte:
                case OPCODE.SGET_CHAR.byte:
                case OPCODE.SGET_OBJECT.byte:
                case OPCODE.SGET_SHORT.byte:
                case OPCODE.SGET_WIDE.byte:
                case OPCODE.SGET_BOOLEAN.byte:
                    regX = this.getRegisterName(oper.left[0]);
                    regV = oper.right.type.name;
                    
                    if(this.getRegisterName(oper.left[1])=="p0" && (this.method.modifiers.static==false)){
                        if(oper.right.enclosingClass.name == this.method.enclosingClass.name)
                            v = `${indent}${regX} = (${regV}) this.${oper.right.name};`;
                        else
                            v = `${indent}${regX} = (${regV})  p0.${oper.right.name};`;

                    }else{
                        v = `${indent}${regX} = (${regV}) ${this.getRegisterName(oper.left[1])}.${oper.right.name};`;
                    }


                    //co
                    this.setSymbol(regX, DTYPE.FIELD_REF, oper.right.name, v);
                    dec.push(v);
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
                            v = `${indent}${this.getRegisterName(oper.left[1])}.${oper.right.name} = ${regX};`;
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

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} == ${regV} ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_NE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} != ${regV} ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_LT.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} < ${regV} ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_GE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} >= ${regV} ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_GT.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);

                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }

                    dec.push(`${indent}if( ${regX} > ${regV} ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_LE.byte:                
                    regX = this.getRegisterName(oper.left[0]);
                    regV = this.getRegisterName(oper.left[1]);
                    
                    if(this.simplify>0){
                        if(this.isImm(this.getSymbol(regX)))
                            regX = this.getImmediateValue(this.getSymbol(regX));
                        if(this.isImm(this.getSymbol(regV)))
                            regV = this.getImmediateValue(this.getSymbol(regV));
                    }
                        
                    dec.push(`${indent}if( ${regX} <= ${regV} ) :cond_${oper.right.name}`);
                    break;

                // IF zero
                case OPCODE.IF_EQZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0){
                        if(this.isImm(regV))
                            dec.push(`${indent}if( ${this.getImmediateValue(regV)} == 0 ) :cond_${oper.right.name}`);
                        else if(regV.type == DTYPE.OBJECT_REF){
                            dec.push(`${indent}if( ${regX} != null ) :cond_${oper.right.name}`);
                        }else{
                            dec.push(`${indent}if( ${regX} == 0 ) :cond_${oper.right.name}`);
                        }
                    }else
                        dec.push(`if( ${regX} == 0 ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_NEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} != 0 ) :cond_${oper.right.name}`);
                    else{
                        console.log(oper.right, oper);
                        dec.push(`${indent}if( ${regX} != 0 ) :cond_${oper.right.name}`);
                    }break;
                case OPCODE.IF_LTZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} < 0 )`);
                    else
                        dec.push(`${indent}if( ${regX} < 0 ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_GEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} >= 0 ) :cond_${oper.right.name}`);
                    else
                        dec.push(`${indent}if( ${regX} >= 0 ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_GTZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} > 0 ) :cond_${oper.right.name}`);
                    else
                        dec.push(`${indent}if( ${regX} > 0 ) :cond_${oper.right.name}`);
                    break;
                case OPCODE.IF_LEZ.byte:                
                    regX = this.getRegisterName(oper.left);
                    regV = this.getSymbol(regX);
                    if(this.simplify>0 && this.isImm(regV))
                        dec.push(`${indent}if( ${this.getImmediateValue(regV)} <= 0 ) :cond_${oper.right.name}`);
                    else
                        dec.push(`${indent}if( ${regX} <= 0 ) :cond_${oper.right.name}`);
                    break;
                /*case OPCODE.MONITOR_ENTER.byte:
                    dec.push("try{");
                    break;
                case OPCODE.MONITOR_ENTER.byte:
                    dec.push("try{");
                    break;*/
                default:
                    this.countUntreated++;
            }
        }

        if(dec[0]=="") dec.shift();


        return { code:dec, depth:pDepth };
    }
}



class Decompiler {

    static instance = null;

    constructor(pContext){
        this.context = pContext;
        this.vm = null;
        this.decompiled = {};
    }


    /**
     * To get an instance of the decompiler.
     * Important : only one instance of this.decompiled should exist to
     * prevent method already analyzed, to be reprocessed.
     *  
     * @param {Project} pContext 
     */
    static getInstance(pContext){
        if(Decompiler.instance == null){
            Decompiler.instance = new Decompiler(pContext);
        }

        return Decompiler.instance;
    }
    
    /**
     * To perform forward and backward analysis. It allows to identify 
     *  IF statement, GOTO, and more
     * @param {Method} pMethod 
     */
    analyzeBlocks(pMethod){
        
        let blocks =  pMethod.getBasicBlocks();

        if(blocks.length == 0) return null;

        let self = null, next=null;
        let entry = blocks[0], instr=null, jump=false;

        // forward analysis
        self = entry;
        for(let i=0; i<blocks.length ; i++){

            if(blocks[i].isVisited()) continue;

            instr = blocks[i].getInstructions();  
            jump = false;
            for(let k=0; k<instr.length; k++){

                if(instr[k].opcode.type == CONST.INSTR_TYPE.IF){
                    //console.log("IF-", instr[k]);
                    next =  pMethod.getBasicBlockByLabel(instr[k].right.name, CONST.INSTR_TYPE.IF);
                    Logger.debug(`Block ${i} IF => Block ${next.offset}`)
                    blocks[i].addSuccessor(next);
                    if(next.hasPredecessor(blocks[i])==false){
                        next.addPredecessor(blocks[i]);
                    }
                    if((blocks[i+1] !== undefined) 
                        && (blocks[i].hasSuccessor(blocks[i+1])==false)){
                        
                        Logger.debug(`Block ${i} ELSE => Block ${blocks[i+1].offset}`)
                        blocks[i].addSuccessor(blocks[i+1]);

                        if(blocks[i+1].hasPredecessor(blocks[i])==false){
                            blocks[i+1].addPredecessor(blocks[i]);
                        }
                    }
                    jump = true;
                }
                else if(instr[k].opcode.type == CONST.INSTR_TYPE.GOTO){
                    Logger.debug("GOTO", instr[k]);
                    next =  pMethod.getBasicBlockByLabel(instr[k].right.name, CONST.INSTR_TYPE.GOTO);
                    Logger.debug(`Block ${i} GOTO => Block ${next.offset}`)
                    blocks[i].addSuccessor(next);
                    if(next.hasPredecessor(blocks[i])==false){
                        next.addPredecessor(blocks[i]);
                    }
                    jump = true;
                }
                else if(instr[k].opcode.type == CONST.INSTR_TYPE.RET){
                    Logger.debug(`Block ${i} RETURN`)
                    jump = true;
                }
            }

            if((jump == false)
                && (blocks[i+1] !== undefined) 
                && (blocks[i].hasSuccessor(blocks[i+1])==false)){
                
                Logger.debug(`Block ${i} CONTINUE => Block ${blocks[i+1].offset}`)
                self.addSuccessor(blocks[i+1]);
                blocks[i+1].addPredecessor(blocks[i]);
            }
            blocks[i].visit();   
        }

        // backward analysis
        /*for(let i=0; i<blocks.length ; i++){

            if(blocks[i].hasSuccessors()){
                instr = blocks[i].getSuccessors();
                for(let k=0; k<instr.length; k++){
                    if(instr[k].hasPredecessor(blocks[i])==false){
                        Logger.debug(i," predecessor of ",k);
                        instr[k].addPredecessor(blocks[i]);
                    }
                }
            } 
        }*/

        return entry;
    }

    /*compute(pTree, pList){
        let succ=null, l=[], first=null, next=null;
        if(pTree.hasSuccessors()){
            succ = pTree.getSuccessors();
            for(let i=0; i<succ.leength; i++){
                if(succ[i].isConditionalBlock()){
                    first = succ[i];
                }else if(!succ[i].hasMultiplePredecessors()){
                    l.push(succ[i]);
                }else{
                    next = succ[i];
                }
            }
        }
        pList.push(first);
        pList.concat(l);
        pList.push(next);
    }*/

    simplify(pMethod, pLevel=0){
        let blocks = [], cs = {
            tag: null,
            intr: []
        };

        // init
        blocks =  pMethod.getBasicBlocks();
        if(blocks.length == 0) return cs;

        this.vm = new VM( pMethod, pMethod.locals, pMethod.args.length);

        // explore blocks
        this.vm.cleanVisitedBlock();
        this.vm.setSimplifyingLevel(pLevel);

        cs.instr = this.vm.runSimplify();

        Logger.debug(cs.instr.join("\n"));

        return cs;
    }

    decompile(pMethod, pLevel=0){
        let blocks = [], tree=null, instr = [], vm = [], cs = {
            tag: null,
            intr: []
        };

        // init
        blocks =  pMethod.getBasicBlocks();
        if(blocks.length == 0) return cs;

        this.vm = new VM( pMethod, pMethod.locals, pMethod.args.length);

        // explore blocks
        this.vm.cleanVisitedBlock();

        if(this.decompiled[pMethod.signature()]!=true){
            tree = this.analyzeBlocks(pMethod);
            this.decompiled[pMethod.signature()] = true;
            Logger.debug("[DECOMPILER] Forward/Backward analysis done !"); 
        }else{
            tree = blocks[0];
            Logger.debug("[DECOMPILER] Forward/Backward previously done. Read from cache");
        }

        // decompile
        this.vm.cleanVisitedBlock();
        this.vm.setSimplifyingLevel(pLevel);

        cs.instr = this.vm.runDecompile(tree);
        //console.log(cs.instr.join("\n"));

        Logger.debug(cs.instr.join("\n"));

        /*
        blocks =  pMethod.getBasicBlocks();

        if(blocks.length == 0) return cs;
        this.vm = new VM( pMethod, pMethod.locals, pMethod.args.length);
        this.vm.setContext(blocks);
        cs.intr = this.vm.runAll();*/

        return cs;
    }
}

module.exports = Decompiler;