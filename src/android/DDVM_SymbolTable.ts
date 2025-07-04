/**
 * @class
 */
import DDVM_Symbol from "./DDVM_Symbol.js";
import {SerializeOptions} from "@dexcalibur/dexcalibur-orm";


/**
 * Represent a symbol table
 * It is a hashmap indexed by the name of local symbols (the name of local registers)
 *
 * A symbol table can use to hold global symbol, as well as local variable,
 * but each table must be limite to a single scope (method, global, ..)
 *
 * @class
 */
export default class DDVM_SymbolTable
{
    table:Record<string,DDVM_Symbol> = {};

    /**
     * @constructor
     */
    constructor(){
        this.table = {};
    }

    /**
     * To print symbol table / stack info to a string
     * @returns {String} Symbol table info
     */
    print():string{
        let m:string= ``, k:number=0;

        for(let i in this.table){
            m += `  - ${i}, ${this.table[i].print()}
`;
            k++;
        }

        m = `Table size : ${k}
`+m;
        return m;
    }

    /**
     * To get the map
     *
     */
    getSymbols():Record<string,DDVM_Symbol>{
        return this.table;
    }

    /**
     * To add a new symbol or replace an existing one with same name
     *
     * @param {string} pSymbol Symbol name
     * @param pType
     * @param pValue
     * @param pCode
     * @param pSkipped
     * @return {DDVM_Symbol}
     * @method
     */
    addEntry(pSymbol:string,  pType:any, pValue:any, pCode:any, pSkipped:boolean=false):DDVM_Symbol{
        this.table[pSymbol] =  new DDVM_Symbol(
            pType,
            pValue,
            pCode,
            pSkipped
        );

        return this.table[pSymbol];
    }

    getEntry(pSymbol):DDVM_Symbol{
        return this.table[pSymbol];
    }

    hasEntry(pSymbol):boolean{
        return (this.table[pSymbol]!==undefined);
    }

    /**
     * To import an existing symbol in to this table.
     *
     * It will create a new symbol
     *
     * It commonly happens whe a method is invoked :
     * 'this' and arguments symbol from caller are imported inside
     * local symbol table of the invoked method. Such structure is a kind
     * of call stack
     *
     * @param {string} pReg
     * @param {DDVM_Symbol} pSymbol symbol to import
     * @param pExpr
     */
    importSymbol(pReg:string, pSymbol:DDVM_Symbol, pExpr:any):DDVM_Symbol{
        return this.addEntry(pReg, pSymbol.type, pSymbol.value, pExpr, pSymbol.skipped);
    }

    setSymbol(pReg:string, pType:any, pValue:any, pCode:any=null):DDVM_Symbol{
        // Logger.debug("setSymbol: (reg=",pReg,", type=",pType,")");
        return this.addEntry(pReg, pType, pValue, pCode);
    }

    getSymbol(pSymbol:string):DDVM_Symbol{
        return this.table[pSymbol];
    }

    /**
     * Deep cloning of the table
     *
     * @return {DDVM_SymbolTable}
     * @method
     */
    clone():DDVM_SymbolTable{
        let tab:DDVM_SymbolTable = new DDVM_SymbolTable();

        for(let i in this.table){
            tab.addEntry(i, this.table[i].type, this.table[i].value, this.table[i].code);
        }
        return tab;
    }

    /**
     *
     * @param pOptions
     * @since 1.9.0
     */
    toJsonObject(pOptions?:SerializeOptions){

        let tab:any = {};
        for(let k in this.table){
            tab[k] = this.table[k].toJsonObject();
        }
        return tab;
    }
}
