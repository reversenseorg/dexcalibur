import ModelBasicBlock from "../ModelBasicBlock";
import DDVM_SymbolTable from "./DDVM_SymbolTable";

/**
 * @class
 */
export class XNode
{
    block:ModelBasicBlock = null;
    next:XNode[] = [];
    prev:XNode[] = [];

    /**
     * @constructor
     * @param pBasicBlock
     * @param pPrevious
     */
    constructor( pBasicBlock:ModelBasicBlock, pPrevious:XNode ){
        this.block = pBasicBlock;
        this.next = [];
        this.prev = [pPrevious];
    }
}

/**
 * @class
 */
export class DDVM_State
{
    entry:any = null;
    current:XNode = null;

    constructor( pEntrypoint:any=null){
        this.entry = pEntrypoint;
        this.current = null;
    }
/*
    newBranch( pTarget){
        let s = this.clone();
        return s.append(pTarget);
    }
*/
    append( pBasicBlock){
        let n:XNode = new XNode(pBasicBlock, this.current);
        this.current.next.push(n);
        this.current = n;

        return this;
    }
/*
    clone(){
        let s  = new DDVM_State();
        s.entry = this.entry;
        // for(let )
    }*/
}

/**
 * @class
 */
export class DDVM_SavedState
{
    state:any;
    localSymTab:DDVM_SymbolTable = null;
    globalSymTab:DDVM_SymbolTable = null;
    currentState:DDVM_State = null;

    constructor( pTree:any, pLocalSymTab:DDVM_SymbolTable, pGlobalSymTab:DDVM_SymbolTable, pCurrentState:any){
        this.state = pTree;
        this.localSymTab = pLocalSymTab;
        this.globalSymTab = pGlobalSymTab;
        this.currentState = pCurrentState;
    }
}
