/**
 * @class
 */
import DDVM_Symbol from "./DDVM_Symbol";

export interface DDVM_SymbolMap {
    [symbolName :string] :DDVM_Symbol;
}

export default class DDVM_SymbolTable
{
    table:DDVM_SymbolMap = null;

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

    getSymbols():DDVM_SymbolMap{
        return this.table;
    }

    /**
     *
     * @param {string} pSymbol Symbol name
     * @param pVisibility
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

    clone():DDVM_SymbolTable{
        let tab:DDVM_SymbolTable = new DDVM_SymbolTable();

        for(let i in this.table){
            tab.addEntry(i, this.table[i].type, this.table[i].value, this.table[i].code);
        }
        return tab;
    }
}
