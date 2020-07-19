import DexcaliburProject from "../DexcaliburProject";
import ModelMethod from "../ModelMethod";
import {OPCODE} from "../Opcode";
import {CONST} from "../CoreConst";
import DDVM_Log from "./DDVM_Log";
import DDVM_SymbolTable from "./DDVM_SymbolTable";
import DDVM_Monitor from "./DDVM_Monitor";
import {DDVM_HeapArea} from "./DDVM_HeapArea";
import DDVM_ClassLoader from "./DDVM_ClassLoader";
import {DDVM_StackMemory} from "./DDVM_StackMemory";
import DDVM_PseudoCodeMaker from "./DDVM_PseudoCodeMaker";
import {DDVM_Instruction, DDVM_InstructionType, DDVM_MethodArea} from "./DDVM_MethodArea";
import DDVM_Allocator from "./DDVM_Allocator";
import {ModelRegisterReference} from "../ModelReference";
import * as Log from "../Logger";
import DDVM_Configuration from "./DDVM_Configuration";
import {ModelBasicType, ModelObjectType} from "../ModelType";
import ModelClass from "../ModelClass";
import DDVM_Symbol from "./DDVM_Symbol";
import {ATYPE_DTYPE, DDVM_TypeHelper, DTYPE, RET_VOID, SYMBOL_OPE} from "./DDVM_TypeHelper";
import Util from "../Utils";
import ModelInstruction from "../ModelInstruction";
import DDVM_ClassInstance from "./DDVM_ClassInstance";
import {DexcaliburVM} from "../DexcaliburVM";
import DDVM_Hook from "./DDVM_Hook";
import ModelBasicBlock from "../ModelBasicBlock";
import DDVM_VirtualArray from "./DDVM_VirtualArray";
import ModelCatchStatement from "../ModelCatchStatement";
import DDVM_Exception from "./DDVM_Exception";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const CR = "";
const METH_INVOKE_SIGNATURE = "java.lang.reflect.Method.invoke(<java.lang.Object><java.lang.Object>[])<java.lang.Object>";

export enum REG_TYPE {
    REG_4BITS,
    REG_8BITS,
    REG_16BITS,
    REG_4BITS_PAIR,
    REG_8BITS_PAIR,
    REG_16BITS_PAIR,
}


/**
 * Class managing minimalist smali VM and performing partial smali execution.
 *
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
export default class DexcaliburDVM implements DexcaliburVM
{

    context:DexcaliburProject = null;

    logs:DDVM_Log = null;

    // symTab is the symbol table of the current running method (the last into call stack)
    symTab:DDVM_SymbolTable = null;

    globalSymTab:DDVM_SymbolTable = null;

    monitor:DDVM_Monitor = null;

    // class instance are stored into heap
    classloader:DDVM_ClassLoader = null;
    heap:DDVM_HeapArea = null;
    stack:DDVM_StackMemory = null;
    pcmaker:DDVM_PseudoCodeMaker = null;
    metharea:DDVM_MethodArea = null;
    allocator:DDVM_Allocator = null;

    invokes:any = [];

    method:ModelMethod = null;

    simplify:number = 0;

    countUntreated:number = 0;
    depth:number = 0;
    savedContexts:any = {};
    visited:any = [];
    currentContext:string = "root";

    config:DDVM_Configuration = null;

    pseudocode:boolean = false;

    hooks:any = {};

    constructor(pContext:DexcaliburProject, pMethod:ModelMethod = null){

        this.context = pContext;

        this.logs = new DDVM_Log();

        // symTab is the symbol table of the current running method (the last into call stack)
        this.symTab = null;

        this.globalSymTab = new DDVM_SymbolTable();

        this.monitor = new DDVM_Monitor();

        // class instance are stored into heap
        this.classloader = new DDVM_ClassLoader(this);
        this.heap = new DDVM_HeapArea(this, this.classloader);
        this.stack = new DDVM_StackMemory();
        this.pcmaker = new DDVM_PseudoCodeMaker(this, true);
        this.metharea = new DDVM_MethodArea();
        this.allocator = new DDVM_Allocator( this, -1);

        this.invokes = [];

        this.method = pMethod;

        this.simplify = 0;

        this.countUntreated = 0;
        this.depth = 0;
        this.savedContexts = {};
        this.visited = [];
        this.currentContext = "root";

        this.config = new DDVM_Configuration();

        this.pseudocode = false;

        this.hooks = {};
    }


    performLongBinaryOp( pOpCode:number, pDest:any, pSrc1:any, pSrc2:any):any{
        throw new Error('[DDVM] performLongBinaryOp() : operation not implemented.');

        switch(pOpCode){
            case OPCODE.ADD_LONG.byte:
                break;
        }
    }

    performBinaryOpAddr2( pOpCode:number, pType:any, pDest:any, pSrc1:any):void{
        throw new Error('[DDVM] performBinaryOpAddr2() : operation not implemented.');

    }


    /**
     *
     * @param {*} pRegister
     */
    prepareLong( pRegister:ModelRegisterReference ):any{
        let s:any = {
            mn: pRegister.getRX(), // this.getRegisterName({ t:pRegister.t, i:pRegister.i }), // register holding most significant number
            ln: pRegister.getNext().getRX(), //this.getRegisterName({ t:pRegister.t, i:pRegister.i+1 }), // register holding least significant number
            v: null // value
        };

        s.m = this.stack.getLocalSymbol( s.mn );
        s.l = this.stack.getLocalSymbol( s.ln );

        if(this.isImm(s.m) && this.isImm(s.l)){
            s.v = (s.m << 32) | (s.l & 0x00000000FFFFFFFF); // & replaced by |
        }

        return s;
    }

    /**
     * To get pseudo-code generated while execution
     *
     * @return {string[]}
     * @method
     */
    getPseudoCode():string[]{
        return this.pcmaker.getCode();
    }

    /**
     * To get the stack trace
     *
     * @return {string}
     * @method
     */
    printStackTrace():string{
        return this.stack.print();
    }


    /**
     * To get the VM logs
     *
     * @return {string[]}
     * @method
     */
    getLog():string[]{
        return this.readLog();
    }

    /**
     *
     * @param {*} pOpCode
     * @param {*} pType
     * @param {*} pDest
     * @param {*} pSrc
     */
    performBinaryOp( pOpCode:number, pType:any, pDest:ModelRegisterReference,
                     pSrc1:ModelRegisterReference, pSrc2:ModelRegisterReference=null){

        let dst:any = null, src1:any = null, src2:any = null;

        src1 = {
            m: this.stack.getLocalSymbol( pSrc1.getNext().getRX() ),//this.getRegisterName({ t:pSrc1.t, i:pSrc1.i+1 })),
            l: this.stack.getLocalSymbol( pSrc1.getRX() ), //this.getRegisterName({ t:pSrc1.t, i:pSrc1.i })),
            v: null
        };

        src2 = {
            m: this.stack.getLocalSymbol( pSrc2.getNext().getRX()), // this.getRegisterName({ t:pSrc2.t, i:pSrc2.i+1 })),
            l: this.stack.getLocalSymbol( pSrc2.getRX() ), //this.getRegisterName({ t:pSrc2.t, i:pSrc2.i })),
            v: null
        };

        if(this.isImm(src1.m) && this.isImm(src1.l)){
            src1.v = (src1.m << 32) | (src1.l & 0x00000000FFFFFFFF); // &
        }

        if(this.isImm(src2.m) && this.isImm(src2.l)){
            src2.v = (src2.m << 32) | (src2.l & 0x00000000FFFFFFFF); // & replaced by
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
            dst = src1.v;
            this.stack.setLocalSymbol(
                //this.getRegisterName({ t:pSrc1.t, i:pSrc1.i+1 }),
                pSrc1.getNext().getRX(),
                DTYPE.IMM_LONG,
                src1.v
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
/*
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
        }*/

        return "";
    }
    /**
     * To write a message into VM logs.
     *
     * @param {String} pMessage The message to log
     */
    writeLog( pMessage:string):void{
        Logger.info("[VM][LOG] "+pMessage);
        this.logs.write(pMessage);
    }

    /**
     * To read all logs from the VM
     *
     * @returns {String[]} An array containing all log messages
     */
    readLog():string[]{
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
        this.stack = new DDVM_StackMemory();
        this.pcmaker = new DDVM_PseudoCodeMaker(this, true);
        this.allocator = new DDVM_Allocator( this, -1);
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
        this.classloader = new DDVM_ClassLoader(this);
        this.heap = new DDVM_HeapArea(this, this.classloader);
        this.stack = new DDVM_StackMemory();
        this.pcmaker = new DDVM_PseudoCodeMaker( this,true);
        this.metharea = new DDVM_MethodArea();
        this.allocator = new DDVM_Allocator( this, -1);
        this.logs.reset();

        this.savedContexts = {};
        this.visited = [];
        this.currentContext = "root";
    }

    setupHooks():void{

        // getMethod => should return method from  pThis class
        this.defineHook(
            "java.lang.Class.getMethod(<java.lang.String><java.lang.Class>[])<java.lang.reflect.Method>",
            function( pVM:DexcaliburDVM, pThis:any, pArgs:any):void{
                // make call signature
                let cls:DDVM_ClassInstance = pThis.getValue(), m:any=null, o:any=null ;
                if(pVM.isImm(pArgs[0])){
                    // method name is concrete!==

                    if(pArgs[1].getValue() !== null){
                        m = pVM.getMethodFromClass( pThis.getValue(), pArgs[0].getValue(), pArgs[1].getValue().getValue());
                    }else
                        m = null;

                    //console.log('method found through reflect api :', (m!=null? m.signature():null));
                    Logger.info("[DVM] method found through reflect api :", (m!=null? m.signature():null));

                    o = pVM.heap.newInstance(pVM.context.find.get.class('java.lang.reflect.Method'));
                    //o = pVM.heap.getObject(o);
                    o.linkConcrete(m);

                    pVM.stack.pushReturn( new DDVM_Symbol(
                        'ret',
                        DTYPE.OBJECT_REF,
                        //{ obj:m, type: m.ret._name},
                        o,
                        null
                    ));

                    return m;
                }else{
                    // method name is unknow, return
                    //this.vm.stack.setLocalSymbol();
                    Logger.info("[DVM] Fail to execute 'java.lang.Class.getMethod()' hook ");
                    return ;
                }
            }
        );

        this.defineHook(
            "java.lang.reflect.Method.invoke(<java.lang.Object><java.lang.Object>[])<java.lang.Object>",
            function(pVM:DexcaliburDVM, pThis:any, pArgs:any):void{
                let m = null;

                if(pThis.getValue() == null){
                    Logger.error('[VM] [HOOK] Fail to execute Method.invoke() hook : "this" is null.');
                    return null;
                }

                console.log(pVM.stack.print());

                m = pThis.getValue().getConcrete();

                // make call signature
                if(m instanceof ModelMethod){
                    console.log("Invoke : Method ready to be invoked ", m.signature());

                    //console.log(pArgs);
                    pVM.invoke( m, pArgs[0], pArgs.slice(1));

                    // track invoked method
                    pVM.stack.addIndirectInvoke(m, pArgs[0], pArgs.slice(1));

                    // return result from invoked method
                    //return pVM.stack.popRet();
                }else{
                    console.log("Invoke : Method not found")
                }

                //console.log("Invoje par reflect API")
                //pVM.invoke( p, );
            }
        );

        this.defineHook(
            "java.lang.String.charAt(<int>)<char>",
            function( pVM:DexcaliburDVM, pThis:any, pArgs:any):void{
                let m = null;

                if(pThis.getValue() == null){
                    Logger.error('[VM] [HOOK] Fail to execute String.charAt() hook : "this" is null.');
                    return null;
                }

//                m = pThis.getValue();
                console.log(pThis);

                if(pThis.getValue().hasConcrete()){
                    pVM.stack.pushReturn( new DDVM_Symbol(
                        DTYPE.IMM_CHAR,
                        pThis.getValue().getConcrete()[pArgs[0].hasValue()?pArgs[0].getValue():pArgs[0].getCode()],
                        null
                    ));
                }else{
                    pVM.stack.pushReturn( new DDVM_Symbol(
                        DTYPE.IMM_CHAR,
                        null,
                        `[${pArgs[0].hasValue()?pArgs[0].getValue():pArgs[0].getCode()}]`
                    ));
                }

                console.log(pVM.stack.print());
            }
        );

        /*this.vm.defineHook(
            "java.lang.String.<init>(<char>[])<void>",
            function( pVM, pThis, pArgs){
                let m = null;

                if(pThis.getValue() == null){
                    Logger.error('[VM] [HOOK] Fail to execute String.charAt() hook : "this" is null.');
                    return null;
                }

//                m = pThis.getValue();
                //console.log(pThis);

                    pVM.stack.pushReturn( new SmaliVM.Symbol(
                        SmaliVM.VTYPE.METH,
                        SmaliVM.DTYPE.OBJECT_REF,
                        pThis.getValue().getConcrete()[pArgs[0].hasValue()?pArgs[0].getValue():pArgs[0].getCode()],
                        null
                    ));


                console.log(pVM.stack.print());
            }
        );*/

        this.defineHook(
            "java.lang.StringBuilder.append(<java.lang.String>)<java.lang.StringBuilder>",
            function( pVM:DexcaliburDVM, pThis:any, pArgs:any):void{
                let m = null;

                if(pThis.getValue() == null){
                    Logger.error('[VM] [HOOK] Fail to execute StringBuilder.append() hook : "this" is null.');
                    return null;
                }

//                m = pThis.getValue();
                console.log(pThis);

                if(pThis.getValue().hasConcrete()){
                    if(pArgs[0].getValue().hasConcrete()){
                        pVM.stack.pushReturn( new DDVM_Symbol(
                            DTYPE.IMM_CHAR,
                            pThis.getValue().getConcrete()+pArgs[0].getValue().getConcrete(),
                            null
                        ));
                    }else{
                        pVM.stack.pushReturn( new DDVM_Symbol(
                            DTYPE.IMM_CHAR,
                            null,
                            '"'+pThis.getValue().getConcrete()+'" + ('+pArgs[0].getCode()+') '
                        ));
                    }
                }else{
                    pVM.stack.pushReturn( new DDVM_Symbol(
                        DTYPE.IMM_CHAR,
                        null,
                        `+ ${pArgs[0].hasValue()? '"'+pArgs[0].getValue()+'"':pArgs[0].getCode()}`
                    ));
                }

                console.log(pVM.stack.print());
            }
        );

        // ndroid.util.Log.d(<java.lang.String><java.lang.String>)<int>
        this.defineHook(
            "android.util.Log.d(<java.lang.String><java.lang.String>)<int>",
            function( pVM:DexcaliburDVM, pThis:any, pArgs:any):void{

                console.log(pArgs[1].getValue());


                if(pArgs[0].getValue().hasConcrete()
                    && pArgs[1].getValue().hasConcrete()){
                    pVM.writeLog(pArgs[0].getValue().getConcrete()+" "+pArgs[1].getValue().getConcrete());
                }
                else if(pArgs[0].getValue().hasConcrete()){
                    pVM.writeLog(pArgs[0].getValue().getConcrete()+" <arg1>");
                }
                else if(pArgs[1].getValue().hasConcrete()){
                    pVM.writeLog("<arg0> "+pArgs[1].getValue().getConcrete());
                }else{
                    pVM.writeLog("<arg0> <arg1>");
                }

                pVM.stack.pushReturn( new DDVM_Symbol(
                    DTYPE.IMM_NUMERIC,
                    1,
                    null
                ));
            }
        );
    }

    /**
     *
     * @param {Class} pClass
     * @param {String} pName
     * @param {Symbol[]} pArgs
     * @returns {Method} The method with the corresponding signature, else NULL
     * @method
     */
    getMethodFromClass( pClass:ModelClass, pName:string, pArgs:any):ModelMethod{
        let ok:boolean = null, arg:any=null;
        let meths:ModelMethod[] = pClass.getMethod({ name:pName }, CONST.EXACT_MATCH);

        if(meths.length===0) return null;

        // implement better search
        for(let i=0; i<meths.length; i++){
            if(pArgs.length != meths[i].args.length) continue;
            ok = true;
            for(let j=0; j<pArgs.length; j++){
                arg = pArgs[j].getValue();

                if(arg instanceof ModelObjectType){
                    if(arg._name != meths[i].args[j]._name) ok=false;
                }
                else if(arg instanceof ModelClass){
                    if(arg.name != meths[i].args[j]._name)
                        ok=false;
                }
                else{
                    Logger.error(`[VM] [REFLECT] Method ${pName} : invalid argument type `);
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
    isHooked( pMethod:ModelMethod):boolean{
        return (this.hooks[pMethod.signature()] instanceof DDVM_Hook);
    }

    /**
     * To execute the hook associate to pMethod
     *
     * @param {*} pMethod
     * @param {*} pThis
     * @param {*} pObj
     * @returns {Boolean} TRUE if hook have been executed, else FALSE
     */
    execHook( pMethod:ModelMethod, pThis:any, pArgs:any):boolean{
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
    defineHook( pMethodName:string, pHook:Function):void{
        this.hooks[pMethodName] = new DDVM_Hook( pMethodName, pHook, true);
    }

    /**
     * To configure VM
     * @param {Object} pConfig Configuration of the VM
     */
    setConfig( pConfig:any):void{
        for(let i in pConfig){
            this.config[i] = pConfig[i];
        }
    }


    /**
     * @deprecated
     * @param {*} pSymTab
     */
    importGlobalSymbols( pSymTab:DDVM_SymbolTable):void{
        this.metharea.importSymbolTable( pSymTab);
    }

    /**
     *
     * @param {String} pLabel
     */
    changeContextLabel(pLabel:string = "root"):void{
        this.currentContext = pLabel;
    }

    enablePseudocode():void{
        this.pseudocode = true;
    }

    disablePseudocode():void{
        this.pseudocode = false;
    }

    saveContext(pLabel:string = "root"){
        this.stack.current().saveState(pLabel);
        //this.savedContexts[pLabel] = this.stack.current().clone(); // getLocalSymbolTable().clone();
        //console.log(this.savedContexts);
        Logger.debug("[VM] [SYM] Save : "+pLabel);
    }

    restoreContext( pNextLabel:string):void{
        this.stack.current().saveState(this.currentContext);
        this.currentContext = pNextLabel;
        this.stack.current().restoreState(pNextLabel);

//        this.savedContexts[this.currentContext] = this.stack.getLocalSymbolTable();
//        this.currentContext = pNextLabel;
//        this.symTab = this.savedContexts[pNextLabel];
//        this.stack.symTab = this.savedContexts[pNextLabel];

        Logger.debug("[VM] [SYM] Archive : "+this.currentContext+", Restore :"+pNextLabel);
    }

    contextExists( pLabel:string):boolean{
        return false;
      //  return (this.stack.current().hasState(pLabel) != null);
    }

    getEntrypoint():ModelMethod{
        return this.method;
    }

    /**
     *
     * @param {*} pMethod
     * @param {*} pLocalSize
     * @param {*} pParamSize
     * @deprecated
     */
    initRegisters(pMethod:ModelMethod, pLocalSize:number, pParamSize:number):void{

        Logger.debug(`[VM][DEPRECATED] Init  (locals:${pLocalSize}, params:${pParamSize})`);

        // init parameter register
        let paramOffset:number = 0, arg:any=null;
        if(pMethod.isStatic()==false){
            this.setSymbol('p0', DTYPE.CLASS_REF, pMethod.enclosingClass);
            paramOffset = 1;
        }

        for(let i:number=paramOffset; i<pParamSize+paramOffset; i++){
            arg = pMethod.args[i-paramOffset];
            Logger.debug("initRegister: (reg=p"+i+", type="+DDVM_TypeHelper.getDataTypeOf(arg)+")");
            this.setSymbol('p'+i, DDVM_TypeHelper.getDataTypeOf(arg), null); // arg
        }


        // init local registers
        for(let i:number=0; i<pLocalSize; i++){
            this.setSymbol('v'+i, DTYPE.UNDEFINED, null);
        }

        this.countUntreated = 0;
    }

    /**
     * To remove "visited" flags from basic blocks.
     * It should be applied only to analyzed method,
     * because it is involved into process making the pseudocode
     */
    cleanVisitedBlock():void{
        let block:ModelBasicBlock[] = this.method.getBasicBlocks();
        for(let i=0; i<block.length; i++){
            block[i].initVisit();
        }
    }

    /**
     *
     * @param {*} pLevel
     * @deprecated
     */
    setSimplifyingLevel(pLevel:number){
        this.simplify = pLevel;
    }

    /**
     *
     * @param pMethod
     * @param pArgumentsValue
     */
    prepareArguments( pMethod:ModelMethod, pArgumentsValue:any):any{
        let args:any={}, p:number=0;

        if(pMethod.isStatic()==false) p=1;

        for(let i=0; i<pMethod.args.length; i++){

            args[p+i] = new DDVM_Symbol(
                DDVM_TypeHelper.getDataTypeOf(pMethod.args[i]),
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
    start( pMethod:ModelMethod, pThis:DDVM_ClassInstance, pArguments:any=null, pClearHeap:boolean=false):void{
        let opt:any = null, margs:(ModelObjectType|ModelBasicType)[]=null, arr:any=null;

        // clean StackMemory
        this.stack.clear();

        // If forced, clean HeapArea
        if(pClearHeap == true){
            this.heap.clear();
        }

        // init
        this.method = pMethod;
        opt = this.metharea.initMethod(pMethod);

        if(this.config.loadClassFirst){
            this.classloader.load(this.method.enclosingClass, (this.config.initParent && pMethod.name!="<clinit>"));
            // clear stack : remove data if <clinit> has been executed
            this.stack.clear();
        }

        // init callstack with entrypoint
        this.stack.add(pMethod);

        // if method is not static 'this' reference should be instanciate
        if(this.method.isStatic() == false){
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

            margs = this.method.getArgsType();

            for(let i=0; i<margs.length; i++){
                if(margs[i] instanceof ModelObjectType){

                    if((pArguments!=null) && (pArguments["p"+i] !=null)){
                        //console.log(margs[i]);
                        if(pArguments["p"+i].val != null)
                            this.stack.last().addArgument(i, DDVM_TypeHelper.getDataTypeOf(margs[i]),
                                this.heap.newInstance(margs[i]._name).setConcrete(pArguments["p"+i].val));
                        else if(pArguments["p"+i].notset==true)
                            this.stack.last().addArgument(i, DDVM_TypeHelper.getDataTypeOf(margs[i]),
                                this.heap.newInstance(margs[i]._name));
                        else
                            this.stack.last().addArgument(i, DDVM_TypeHelper.getDataTypeOf(margs[i]),
                                this.heap.newInstance(margs[i]._name));
                    }else{
                        this.stack.last().addArgument(i, DDVM_TypeHelper.getDataTypeOf(margs[i]),
                            this.heap.newInstance(margs[i]._name));
                    }

                }else{
                    if((pArguments!=null) && (pArguments["p"+i] !=null)){
                        if(pArguments["p"+i].val != null){
                            if(DDVM_TypeHelper.getDataTypeOf(margs[i])==DTYPE.ARRAY){
                                // parse array string
                                arr = DDVM_VirtualArray.fromString( margs[i].name, pArguments["p"+i].val); // margs[i].type,

                                this.stack.last().addArgument(i, DDVM_TypeHelper.getDataTypeOf(margs[i]), arr);
                            }else
                                this.stack.last().addArgument(i, DDVM_TypeHelper.getDataTypeOf(margs[i]),
                                    DDVM_TypeHelper.castToDataType(DDVM_TypeHelper.getDataTypeOf(margs[i]), pArguments["p"+i].val));
                        }else if(pArguments["p"+i].notset==true)
                            this.stack.last().addArgument(i, DTYPE.UNDEFINED, null);
                        else
                            this.stack.last().addArgument(i, DDVM_TypeHelper.getDataTypeOf(margs[i]), null);
                    }else{
                        this.stack.last().addArgument(i, DDVM_TypeHelper.getDataTypeOf(margs[i]), null);
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
    getRegisterName(pReg:ModelRegisterReference):string{
        if(pReg.t=='v')
            return "v"+pReg.i
        else
            return "p"+pReg.i;
    }


    getSymbol(pReg:string):DDVM_Symbol{
//        return this.symTab.getEntry(pReg);
        return this.stack.getLocalSymbolTable().getSymbol(pReg);
    }

    importSymbol(pReg:string, pSymbol:DDVM_Symbol, pExpr:any):DDVM_Symbol{
        return this.stack.getLocalSymbolTable().addEntry(pReg, pSymbol.type, pSymbol.value, pExpr);
    }

    setSymbol(pReg:string, pType:any, pValue:any, pCode:any=null){
        Logger.debug("setSymbol: (reg=",pReg,", type=",pType,")");
//        return this.symTab.addEntry(pReg, VTYPE.METH, pType, pValue, pCode);
        return this.stack.getLocalSymbolTable().setSymbol(pReg, pType, pValue, pCode);
    }


    setGlobalSymbol(pName:string, pType:any, pValue:any, pCode:any=null){
        Logger.debug("setGlobalSymbol: (reg=",pName,", type=",pType,")");
//        return this.globalSymTab.addEntry(pName, VTYPE.VM, pType, pValue, pCode);
        return this.metharea.setGlobalSymbol(pName, pType, pValue, pCode);
    }

    /**
     * To check if the Symbol/register has concrete value
     *
     * @param {Symbol} pSymbol The symbol to check
     * @returns {Boolean} TRUE if the symbol has concrete value, else FALSE
     */
    isImm(pSymbol:DDVM_Symbol):boolean{
        if(pSymbol.type < DTYPE.OBJECT_REF && (pSymbol.value != null)){
            return true;
        }
        else if(pSymbol.type == DTYPE.OBJECT_REF
            && (pSymbol.value instanceof DDVM_ClassInstance)
            && (pSymbol.getValue().hasConcrete())){
            return true;
        }else{
            return false;
        }
    }

    getImmediateValue(pSymbol:DDVM_Symbol, pSeparator:string=""):string{
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

    /**
     * To move value into 'src' register to 'dest' register
     *
     * @param pSrcRegister
     * @param pDestRegister
     */
    moveRegister(pSrcRegister:string, pDestRegister:string):void{
        let src:DDVM_Symbol = this.stack.getLocalSymbol(pSrcRegister);
        this.stack.setLocalSymbol(pDestRegister, src.type, src.getValue(), src.getCode());
    }

    findOffsetByLabel( pStack:DDVM_Instruction[], pLabel:string, pType:number){
        for(let i=0; i<pStack.length; i++){
            if(pStack[i].t==DDVM_InstructionType.BLOCK_START){
                //console.log(pStack[i].i.getGotoLabel(), pLabel);
                if(pType == CONST.INSTR_TYPE.IF && (pStack[i].i as ModelBasicBlock).getCondLabel()==pLabel){
                    return i;
                }
                else if(pType == CONST.INSTR_TYPE.GOTO && (pStack[i].i as ModelBasicBlock).getGotoLabel()==pLabel){
                    return i;
                }
            }
        }
        return null;
    }


    /**
     * To invoke a method
     *
     * @param {ModelMethod} pMethod The method to invoke
     * @param {DDVM_ClassInstance} pObj
     * @param {Symbol[]} pArgs Array of symbols containing arguments value or expr
     */
    invoke( pMethod:ModelMethod, pObj:DDVM_ClassInstance, pArgs:DDVM_Symbol[]):DDVM_Symbol{
        let opt = null;

        // if the method is hooked, then execute the hook instead
        // of initial method
        if(this.isHooked(pMethod)){
            // inject hook into callstack instead of initial method
            this.stack.add( pMethod, pObj, pArgs);

            Logger.debug('[DVM] [INVOKE] [HOOK] ',this.stack.print());

            // execute hook
            this.execHook( pMethod, pObj, pArgs);
            // remove inject hook from callstack
            this.stack.pop();
            return null;
        }

        // If mockAndroidInternals=TRUE,then invoke of Android Internal methods should be ignored
        // return value is symbolic
        if(this.config.mockAndroidInternals && pMethod.hasTag('di')){
            Logger.debugPink(`[DVM] [INVOKE] Android Internal method ignored by config (mockAndroidInternals) : ${pMethod.signature()}`);
            this.stack.pushReturn(new DDVM_Symbol(
                DDVM_TypeHelper.getDataTypeOf(pMethod.ret),
                null,
                null
            ))
            return null;
        }

        // Following actions are done only if the method is not hooked or ignored

        // add method to callstack and create its local symbol table
        this.stack.add( pMethod, pObj, pArgs);

        // set 'this' symbol if not null or not undefined
        if(pObj != null){
            this.stack.last().setThis(pObj);
        }

        // set arguments symbol (import caller symbol into symbol table of called tables)
        if(Array.isArray(pArgs) && (pArgs.length > 0)){
            this.stack.last().setArguments(pArgs);
        }

        // build control-flow graph
        opt = this.metharea.initMethod( pMethod);

        // run instruction
        this.run( opt.instr);

        // pop from callstack and move result to return stack
        this.stack.pop();

        // return, if a value is returned the value is stored
        return this.stack.lastReturn();
    }


    /**
     *
     * @param {DDVM_Instruction[]} pStack
     * @param {number} pDepth Callstack max depth
     */
    run( pStack:DDVM_Instruction[], pDepth:number=0){
        let i:number=0, f:number=0, dec:any=null, msg:any=null, ctxRST:boolean=false, bbs:ModelBasicBlock=null ;
        let indent:string = "    ".repeat(this.depth);
        let d:ModelCatchStatement[];
        //let block:ModelBasicBlock, instr:ModelInstruction;

        // add emulated method to callstack;

        do{
            // instruction
            if(pStack[i].t===DDVM_InstructionType.OPERATION){

                dec = this.execute(pStack, i);

                if(dec.code.length > 0  && !Util.isEmpty(dec.code, Util.FLAG_WS | Util.FLAG_CR | Util.FLAG_TB)){
                    //console.log(dec.code);

                    //ssmali = ssmali.concat(dec.code);
                    this.pcmaker.push(dec.code[0]);
                    Logger.debug(`[PCMAKER] ${this.pcmaker.last()}`);

                }/*else{
                    ssmali.push(`// empty block : dead code removed or block already simplified (contant propagated)`)
                }*/

                // if instruction was a jump to a labelled basic block
                if(dec.jump != null){
                    // change offset of the next instruction
                    i = this.findOffsetByLabel( pStack, dec.jump.label, dec.jump.type);

                    // if target block has multiple predecessors,
                    // add "goto" instruction to pseudo code
                    if((pStack[i].i as ModelBasicBlock).hasMultiplePredecessors()){
                        this.pcmaker.push(`${indent}goto :goto_${dec.jump.label}`);
                    }
                }
                // if instruction invoke a method
                else if(dec.inv != null){
                    // Only pseudo-code from top level method should be generated
                    if(this.stack.callstack.length>1) // patched : length==1 replaced by length>1
                        this.pcmaker.turnOff();

                    // if callstack maxdepth is disabled (-1) or not reached, continue to enter
                    // into new calls
                    if( (this.config.maxdepth==-1) || (this.config.maxdepth - this.stack.depth()) > 0){

                        // invoke the method
                        this.invoke( dec.inv.meth, dec.inv.obj, dec.inv.args);

                        // after return, if next instruction is into the top level method,
                        // then pseudo-code generator should be enable
                        if(this.stack.callstack.length==1){
                            this.pcmaker.turnOn();

                            // if the method invoked was invoked through Reflection API
                            // then, into pseudo-code, the call to Method.invoke() is replaced
                            // by the method invoked
                            if(dec.inv.meth.signature() == METH_INVOKE_SIGNATURE
                                && this.config.simplify>0){

                                // retrieve data about this call
                                dec = this.stack.lastIndirectInvoke();

                                // replace last pseudo-code line by new one
                                this.pcmaker.pop();
                                this.pcmaker.writeIndirectInvoke(
                                    // Method.invoke() context
                                    (pStack[i].i as ModelInstruction).left[1], (pStack[i].i as ModelInstruction).left[2],
                                    // invoked method
                                    dec.method, dec.obj, dec.args);

                            }
                        }

                        // special case : Method.invoke() could be replace by target method



                    }
                    // else if mas depth of call stack is reached, and method invoked should
                    // return value, this value becomes symbolic
                    else if(dec.inv.meth.ret != null){
                        if(this.stack.callstack.length==1) this.pcmaker.turnOn();
                        this.pcmaker.append(' // skipped, max depth reached');

                        this.stack.pushReturn( new DDVM_Symbol(
                            DDVM_TypeHelper.getDataTypeOf(dec.inv.meth.ret),
                            null,
                            null,
                            DDVM_Symbol.SKIPPED
                        ));
                    }
                    if(this.stack.callstack.length==1) this.pcmaker.turnOn();
                    i++;
                }
                else if(dec.ret != null){
                    Logger.debug('[DVM] INCREMENT NOT INCREMENTED ? I='+i);
                    break;
                }
                else{
                    i++;
                }
            }
            // enter into basic block
            else if(pStack[i].t===DDVM_InstructionType.BLOCK_START){

                bbs = pStack[i].i as ModelBasicBlock;
                f=0;

                msg = '';

                // if the block is conditional, add its label to pseudo code
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
                    msg += `catch_${bbs.getCatchLabel()}`; //cond_* replaced by catch_*
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
            // TODO : JAMAIS atteind ?
            else if(pStack[i].t==DDVM_InstructionType.BLOCK_END){
                Logger.debugBgRed('<<< BLOCK END >>>');
                bbs = pStack[i].i as ModelBasicBlock;

                if(bbs.isTryEndBlock()){
                    if(bbs.hasCatchStatement()){
                        d = bbs.getCatchStatements();
                        for(let i=0; i<d.length; i++){
                            if(d[i].getException() != null)
                                this.pcmaker.push(`${"    ".repeat(this.depth-1)}}catch(${d[i].getException().name}) ${(d[i].getTarget() as ModelBasicBlock).getCatchLabel()}`);
                            else
                                this.pcmaker.push(`${"    ".repeat(this.depth-1)}}catchall ${(d[i].getTarget() as ModelBasicBlock).getCatchLabel()}`);
                        }

                        this.depth--;
                    }else{
                        this.pcmaker.push(`} try END\n`);
                        this.depth--;
                    }
                }
                else if(bbs.isCatchBlock()){
                    this.depth--;
                }

                i++;
            }


        }while(i<pStack.length);

        // when all instruction have been executed, get return
        if(dec.ret != null){
            if(dec.ret instanceof DDVM_Symbol){
                this.stack.pushReturn(dec.ret);
//                this.stack.last().setReturn(dec.ret);
            }
        }


        if(pStack[i].t!=DDVM_InstructionType.BLOCK_END && bbs.isTryEndBlock()){
            if(bbs.hasCatchStatement()){
                d = bbs.getCatchStatements();
                for(let i=0; i<d.length; i++){
                    if(d[i].getException() != null)
                        this.pcmaker.push(`${"    ".repeat(this.depth-1)}}catch(${d[i].getException().name}) ${(d[i].getTarget() as ModelBasicBlock).getCatchLabel()}`);
                    else
                        this.pcmaker.push(`${"    ".repeat(this.depth-1)}}catchall ${(d[i].getTarget() as ModelBasicBlock).getCatchLabel()}`);
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
    execute( pInstrStack:DDVM_Instruction[], pInstrOffset:number):void{
        let f:any={res:false}, v:string='', vx:string[]=null;
        let regX:any=null,  regV:any=null, regZ:any=null, label:any=null;
        let oper:ModelInstruction;
        let state:any = { code:[], jump:null, ret:null, inv:null};
        let regs:any = {};
        let indent:string = "    ".repeat(this.depth);


        oper = pInstrStack[pInstrOffset].i as ModelInstruction;

        switch(oper.opcode.byte)
        {
            case OPCODE.NEW_INSTANCE.byte:

                regX = this.getRegisterName(oper.left);
                //regV = this.allocator.newInstance(oper.right)
                this.stack.setLocalSymbol(regX, DTYPE.OBJECT_REF, this.heap.newInstance( oper.right as ModelClass));

                break;

            case OPCODE.CONST.byte:
            case OPCODE.CONST_4.byte:
            case OPCODE.CONST_16.byte:
            case OPCODE.CONST_WIDE.byte:
            case OPCODE.CONST_WIDE_16.byte:
            case OPCODE.CONST_WIDE_32.byte:
                regX = this.getRegisterName(oper.left);
                regV = this.stack.setLocalSymbol(regX, DTYPE.IMM_NUMERIC, oper.right._value, null);

                // assigning concret value are ommited
                if(this.config.simplify<1){
                    state.code.push(`${indent}${regX} = ${this.getImmediateValue(regV)};`);
                }
                break;

            case OPCODE.CONST_HIGH16.byte:
                regX = this.getRegisterName(oper.left);
                regV = this.stack.setLocalSymbol(regX, DTYPE.IMM_NUMERIC, oper.right._value, null);

                // assigning concret value are ommited
                if(this.config.simplify<1){
                    state.code.push(`${indent}${regX} = ${this.getImmediateValue(regV)};`);
                }
                break;

            case OPCODE.CONST_WIDE_HIGH16.byte:
                regX = this.getRegisterName(oper.left);

                regV = this.stack.setLocalSymbol(regX, DTYPE.IMM_NUMERIC, oper.right._value, null);

                // assigning concret value are ommited
                if(this.config.simplify<1){
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
                        '0x'+parseInt(v,10).toString(16));

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

                        state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v}`);
                        break;
                    }
                    else if(regV.hasCode()){

                        v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}(${regV.getCode()})`;
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]),
                            DTYPE.IMM_NUMERIC,
                            null,
                            v);

                        state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v}`);
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

                        state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v}`);
                        break;
                    }
                    else if(regV.hasCode()){

                        //v = `${indent}${this.getRegisterName(oper.left[0])} = ${regV.getCode()}+${this.getRegisterName(oper.right)};`;
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]),
                            DTYPE.IMM_NUMERIC,
                            null,
                            v = `${regV.getCode()}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);

                        state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v}`);
                        //state.code.push(v);
                    }
                    else{
                        //v = `${indent}${this.getRegisterName(oper.left[0])} = ${this.getRegisterName(oper.left[1])}+${this.getRegisterName(oper.right)};`;
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left[0]),
                            DTYPE.IMM_NUMERIC,
                            null,
                            v = `${this.getRegisterName(oper.left[1])}${oper.opcode.ope}${this.getRegisterName(oper.right)}`);

                        state.code.push(`${indent}${this.getRegisterName(oper.left[0])} = ${v}`);
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
                    //this.getRegisterName({ t:oper.left[0].t, i:oper.left[0].i }),
                    (oper.left[0] as ModelRegisterReference).getRX(),
                    DTYPE.IMM_LONG,
                    regs.val!==null? (regs.val >> 32) & 0xFFFFFFFF : null,
                    regs.code.m);
                this.stack.setLocalSymbol(
                    // this.getRegisterName({ t:oper.left[0].t, i:oper.left[0].i+1 }),
                    (oper.left[0] as ModelRegisterReference).getNext().getRX(),
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
                    // this.getRegisterName({ t:oper.left.t, i:oper.left.i }),
                    (oper.left[0] as ModelRegisterReference).getRX(),
                    DTYPE.IMM_LONG,
                    regs.val!==null? (regs.val >> 32) & 0xFFFFFFFF : null,
                    regs.code.m);
                this.stack.setLocalSymbol(
                    //this.getRegisterName({ t:oper.left.t, i:oper.left.i+1 }),
                    (oper.left[0] as ModelRegisterReference).getNext().getRX(),
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

                //if(this.isImm(regV))
                //    v = regV.getValue() & 0x000000FF;

                this.stack.setLocalSymbol(
                    this.getRegisterName(oper.left),
                    DTYPE.IMM_BYTE,
                    (this.isImm(regV)? regV.getValue() & 0x000000FF : null),
                    `(byte) ${regX}`
                );

                break;

            case OPCODE.INT_TO_CHAR.byte:

                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                //if(this.isImm(regV))
                //    v = regV.getValue() & 0x000000FF;

                this.stack.setLocalSymbol(
                    this.getRegisterName(oper.left), DTYPE.IMM_CHAR, (this.isImm(regV)? regV.getValue() & 0x000000FF : null), `(char) ${regX}`
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

                //if(this.isImm(regV))
                //    v = regV.getValue() & 0x0000FFFF;

                this.stack.setLocalSymbol(
                    this.getRegisterName(oper.left), DTYPE.IMM_SHORT,
                    (this.isImm(regV)? regV.getValue() & 0x0000FFFF : null), `(short) ${regX}`
                );

                break;

            // cast involving multiple registers
            case OPCODE.INT_TO_LONG.byte:
                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                //if(this.isImm(regV))
                //    v = regV.getValue() & 0x0000FFFF;

                // <dest> = <src>
                this.stack.setLocalSymbol(
                    this.getRegisterName(oper.left), DTYPE.IMM_LONG, 0x00000000, `(long) ${regX}`
                );
                // <dest>+1 = 0x00000000
                this.stack.setLocalSymbol(
                    // this.getRegisterName({ t:oper.left.t, i:oper.left.i+1 }), DTYPE.IMM_NUMERIC, v, `((long)${regX} >> 32)`
                    this.getRegisterName(oper.left.getNext()), DTYPE.IMM_NUMERIC,
                    (this.isImm(regV)? regV.getValue() & 0xFFFFFFFF : null), `((long)${regX} >> 32)`
                );

                break;

            // verify :
            // 0x cafebabe deadbeef => v0 = cafebabe ; v1 = deadbeef

            case OPCODE.INT_TO_DOUBLE.byte:
                regX = this.getRegisterName(oper.right);
                regV = this.stack.getLocalSymbol(regX);
                v = null;

                //if(this.isImm(regV))
                //    v = regV.getValue() & 0x0000FFFF;

                // <dest> = <src>
                this.stack.setLocalSymbol(
                    this.getRegisterName(oper.left), DTYPE.IMM_DOUBLE, v, `(long) ${regX}`
                );
                // <dest>+1 = 0x00000000
                this.stack.setLocalSymbol(
                    //this.getRegisterName({ t:oper.left.t, i:oper.left.i+1 }), DTYPE.IMM_NUMERIC, 0x00000000, `((long)${regX} >> 32)`
                    this.getRegisterName(oper.left.getNext()), DTYPE.IMM_NUMERIC,
                        (this.isImm(regV)? regV.getValue() & 0xFFFFFFFF : null), `((long)${regX} >> 32)`
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
                    oper.right,
                    oper.left
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
                    if(regV.getValue() instanceof DDVM_VirtualArray){
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
                    if(regV.getValue() instanceof DDVM_VirtualArray){ // concrete value
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

                        regV = this.stack.getLocalSymbol(oper.left[j].getRX());

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

                    if(regZ.getValue() instanceof DDVM_ClassInstance){
                        v = `${regV.endsWith(".String")?"":"("+regV+")"} ${label}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                        this.stack.setLocalSymbol(regX, DDVM_TypeHelper.getDataTypeOf( oper.right.type), regZ.getValue().readField(oper.right), v);
                    }else{
                        v = `${regV.endsWith(".String")?"":"("+regV+")"} ${label}.${oper.right.alias!=null? oper.right.alias : oper.right.name}`;
                        this.stack.setLocalSymbol(regX, DDVM_TypeHelper.getDataTypeOf( oper.right.type), null, v);
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


                    if(regV.getValue() instanceof DDVM_ClassInstance){
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
                    vx = [`${indent}${oper.right.enclosingClass.name}.${oper.right.name}`,this.getImmediateValue(regV)];
                    this.metharea.setGlobalSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`,
                        DTYPE.FIELD,
                        regV.getValue(),
                        `${vx[0]} = ${vx[1]}`);
                }
                else if(regV.getValue() instanceof DDVM_VirtualArray){
                    vx = [`${oper.right.enclosingClass.name}.${oper.right.name}`,regV.getValue().toString()];
                    this.metharea.setGlobalSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`,
                        DTYPE.FIELD,
                        regV.getValue(),
                        `${vx[0]} = ${vx[1]}`);
                }
                else if(regV.hasCode()){
                    vx = [`${oper.right.enclosingClass.name}.${oper.right.name}`,regV.getCode()];
                    this.metharea.setGlobalSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`,
                        DTYPE.FIELD,
                        null,
                        `${vx[0]} = ${vx[1]}`);
                }
                else{
                    vx = [`${oper.right.enclosingClass.name}.${oper.right.name}`,regX];
                    this.metharea.setGlobalSymbol(
                        `${oper.right.enclosingClass.name}.${oper.right.name}`,
                        DTYPE.FIELD,
                        null,
                        `${vx[0]} = ${vx[1]}`);
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
                state.code.push(`${indent}${vx[0]} = ${vx[1]}`);

                break;

            case OPCODE.RETURN.byte:
                regX = this.getRegisterName(oper.left);
                regV = this.stack.getLocalSymbol(regX);

                if((regX=="p0") && (this.method.isStatic()==false)){
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

                // ce n'esy pas this.method qu'il faut regarder mais la derniere dans la stack
                if(oper.left.isRX("p0") && (this.method.isStatic()==false)){
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

                    if((regV.getValue() instanceof DDVM_ClassInstance) && regV.getValue().hasConcrete()){
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
                    state.ret = new DDVM_Symbol(DTYPE.IMM_NUMERIC,  BigInt(regV.value), null );
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
                        if(CONST.VM.IF_DEFAULT_PATH){
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
                        if(CONST.VM.IF_DEFAULT_PATH){
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
                        if(regV.getValue() instanceof DDVM_ClassInstance){

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
                        if(regV.getValue() instanceof DDVM_ClassInstance){

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

                if(regX.getValue() instanceof DDVM_VirtualArray){
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

                if(regV.getValue() instanceof DDVM_VirtualArray){
                    //console.log(oper.right.name);
                    v = this.method.getDataBlockByName(':array_'+oper.right.name);
                    regV.getValue().fillWith(v);
                    if(this.config.simplify<1){
                        state.code.push(`${indent} ${regX} = ${regV.getValue().toString()}`);
                    }
                }else{
                    throw new DDVM_Exception('VM001','fill-array-data cannot be executed : '+regX+' is not an array');
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
                    if(regV.hasValue() && (regV.getReferencedValue() instanceof DDVM_VirtualArray)){
                        this.stack.setLocalSymbol(
                            this.getRegisterName(oper.left),
                            DTYPE.IMM_NUMERIC,
                            regV.getReferencedValue().length(),
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
                if(oper.right instanceof ModelBasicType){
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


    throwError( pRegister:string, pSymbol:DDVM_Symbol, pInstruction:ModelInstruction, pMessage:string):void{
        // TODO
        Logger.error(`[VM][ERROR] "${pRegister}" into [${pInstruction.toString()}] : ${pMessage}`);
    }
}
