import ModelMethod from "../ModelMethod.js";
import DDVM_SymbolTable from "./DDVM_SymbolTable.js";
import {DDVM_TypeHelper, DTYPE} from "./DDVM_TypeHelper.js";
import DDVM_ClassInstance from "./DDVM_ClassInstance.js";
import * as Log from "../Logger.js";
import DDVM_Symbol from "./DDVM_Symbol.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const RET_VOID = 0x100;


export class DDVM_StackEntry
{
    method: ModelMethod;
    symTab:DDVM_SymbolTable;
    ret:DDVM_Symbol = null;
    stats:number = 0;
    states:Record<string, DDVM_SymbolTable> = {};


    constructor( pMethod:ModelMethod, pObj, pArgs, pReturn = null){
        this.method = pMethod;
        this.symTab = new DDVM_SymbolTable();
        this.ret = pReturn;
        this.stats = 0;

        this.states = {};

        this.initSymTable(pObj, pArgs);
    }

    saveState(pLabel = "root"):void{
        //if(this.states[pLabel]==null) this.states[pLabel] = [];
        this.states[pLabel]=this.symTab.clone(); //.push(this.symTab.clone());
    }

    restoreState(pLabel = "root"):void{
        this.symTab = this.states[pLabel];
    }

    setReturn( pReturn:DDVM_Symbol):void{
        this.ret = pReturn;
    }

    getSymbolTable():DDVM_SymbolTable{
        return this.symTab;
    }

    getReturn():DDVM_Symbol{
        return this.ret;
    }

    /**
     * Set 'this' symbol
     * @param {VM_ClassInstance} pInstance
     */
    setThis( pInstance:DDVM_ClassInstance){
        this.symTab.setSymbol( 'p0', DDVM_TypeHelper.getDataTypeOf(pInstance), pInstance, 'this');
    }


    /**
     * To set concrete values into parameters
     *
     * @param {Object[]} pArguments
     * @param {Boolean} pAutoInstanciate
     */
    setArguments( pArguments:any, pAutoInstanciate:boolean=false){

        //if(this.method.isStatic()) p=0;

        console.log("SetArguments", pArguments);
        for(let k in pArguments){
            this.symTab.setSymbol( k, pArguments[k].type, pArguments)
        }
    }

    addArgument( pOffset, pType, pValue){
        let p:number=1;
        if(this.method.isStatic()) p=0;

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
        if(this.method.isStatic()==false){
            this.symTab.setSymbol('p0', DTYPE.OBJECT_REF, pObj);
            paramOffset = 1;
        }

        for(let i=paramOffset; i<this.method.args.length+paramOffset; i++){
            arg = this.method.args[i-paramOffset];
            Logger.debug(`initRegister: (reg=p${i}, type=${DDVM_TypeHelper.getDataTypeOf(arg)})`);
            this.symTab.setSymbol('p'+i, DDVM_TypeHelper.getDataTypeOf(arg), (pArgs[i-paramOffset]!==undefined ? pArgs[i-paramOffset].getValue() : null) ); // arg
        }

        // init local registers
        for(let i=0; i<this.method.locals; i++){
            this.symTab.setSymbol('v'+i, DTYPE.UNDEFINED, null);
        }
    }

    toJsonObject():any {
        const o =  {
            method: {
                __: this.method.__,
                uid: this.method.getUID()
            },
            symTab: (this.symTab!=null ? this.symTab.toJsonObject() : null),
            ret: (this.ret !=null ? this.ret.toJsonObject() : null),
            states: {}
        };

        for(let k in this.states){
            o.states[k] = (this.states[k] != null ? this.states[k].toJsonObject() : null);
        }

        return o;
    }
}


/**
 * Stack Area contains call stack and return value for each call.
 * @author FrenchYeti
 */
export class DDVM_StackMemory
{
    callstack:DDVM_StackEntry[] = null;
    csLen:number = 0;
    ret:any = null;
    symTab:DDVM_SymbolTable = null;
    indirect: DDVM_StackEntry[] = null;

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
    print():string{
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
        this.indirect.push(new DDVM_StackEntry(  pMethod, pThis, pArgs ));
    }


    lastIndirectInvoke():DDVM_StackEntry{
        return this.indirect.pop();
    }

    /**
     * To get the current call stack depth
     * @returns {int} The depth of current call stack. 0 means the top level function is the current function
     */
    depth():number{
        return this.callstack.length-1;
    }

    /**
     * To get current stack entry.
     * It returns the stack entry associated to current running method.
     *
     * @returns {VM_StackEntry} The stack entry
     */
    current():DDVM_StackEntry{
        return this.callstack[this.callstack.length-1];
    }

    setLocalSymbol( pName:string, pType:number, pValue:any, pCode:any=null){
        Logger.debug(`[VM] [STACK] Set local symbol ${pName}, type=${pType}, value=${pValue}, code=${pCode}`);
        return this.symTab.setSymbol( pName, pType, pValue, pCode)
    }

    getLocalSymbol( pName:string):DDVM_Symbol{
        Logger.debug(`[VM] [STACK] Get local symbol ${pName}`);
        return this.symTab.getSymbol(pName);
    }

    importLocalSymbol(pReg:string, pSymbol:DDVM_Symbol, pExpr:any=null){
        Logger.debug(`[VM] [STACK] Import local symbol into ${pReg}`);
        return this.symTab.importSymbol(pReg, pSymbol, (pExpr==null&&pSymbol.getCode()!=null ? pSymbol.getCode() : pExpr) );
    }


    getLocalSymbolTable():DDVM_SymbolTable{
        return this.symTab;
    }

    clear():void{
        this.callstack = [];
        this.ret = [];
    }

    add( pMethod:ModelMethod, pObj:any=null, pArgs:any=[]){
        this.callstack.push( new DDVM_StackEntry( pMethod, pObj, pArgs ));
        this.symTab = this.callstack[ this.callstack.length-1 ].symTab;
        Logger.debugBgRed('[VM] [STACK] Add entry : '+pMethod.signature());
    }

    /**
     * TODO : add support of multiple calls to the same method into the callstack
     * @param pMethodName
     */
    get( pMethodName:string):DDVM_StackEntry{
        for(let i:number=0; i<this.callstack.length; i++){
            if(this.callstack[i].method.signature() ==pMethodName){
                return this.callstack[i];
            }
        }
        return null;
    }

    last():DDVM_StackEntry{
        if(this.callstack.length > 0){
            return this.callstack[this.callstack.length-1];
        }else
            return null;
    }

    lastReturn():DDVM_Symbol{
        if(this.ret.length > 0){
            return this.ret[this.ret.length-1];
        }else
            return null;
    }

    /**
     * To remove a StackEntry (stack frame) from the callstack.
     * It is called systematically when a method has been successfully invoked.
     */
    pop():DDVM_StackEntry{
        if(this.callstack.length>1)
            this.symTab = this.callstack[this.callstack.length-2].symTab;

        return this.callstack.pop();
    }

    /**
     *
     * @param {Symbol|int} pSymbol The resturn value
     */
    pushReturn( pSymbol:DDVM_Symbol):void{
        this.ret.push( pSymbol);
        //this.callstack[this.callstack.length-1].setReturn( pSymbol);
    }

    /**
     * To return the latest value push into 'return stack'
     *
     * @returns {Symbol} The symbol containing concrete data or symbolic expression of the value returned
     */
    popReturn():DDVM_Symbol{
        return this.ret.pop();
    }

    getReturn():DDVM_Symbol{
        return this.callstack[this.callstack.length-1].getReturn();
    }
}

