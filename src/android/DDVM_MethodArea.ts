import {CONST} from "../CoreConst";
import * as Log from "../Logger";
import DDVM_SymbolTable from "./DDVM_SymbolTable";
import ModelMethod from "../ModelMethod";
import DDVM_Symbol from "./DDVM_Symbol";
import ModelBasicBlock from "../ModelBasicBlock";
import ModelInstruction from "../ModelInstruction";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum DDVM_InstructionType{
    BLOCK_START,
    OPERATION,
    BLOCK_END
}
export interface DDVM_Instruction {
    i:ModelBasicBlock|ModelInstruction;
    t:DDVM_InstructionType
}


/**
 * This class manages shared memory and overall executed instructions
 */
export class DDVM_MethodArea
{
    methods:any = null;
    symTab:DDVM_SymbolTable = null;

    constructor(){

        this.methods = {};

        /*
         Global symbol table is stored here, this table contains
          - static variables (fields)
          - loaded classes (ClassPrototype)
          - uncatched exception
        */
        this.symTab = new DDVM_SymbolTable();
    }

    getGlobalSymbolTable():DDVM_SymbolTable{
        return this.symTab;
    }


    setGlobalSymbol( pName:string, pType:any, pValue:any, pCode:any=null){

        Logger.debug(`[VM] [METHAREA] Set global symbol ${pName} ${(pValue!=null)? " = "+pValue : ""}`);
        return this.symTab.setSymbol( pName, pType, pValue, pCode)
    }

    getGlobalSymbol( pName:string):DDVM_Symbol{
        Logger.debug(`[VM] [METHAREA] Get global symbol ${pName}`);
        return this.symTab.getSymbol( pName);
    }

    importSymbolTable( pTable:DDVM_SymbolTable):void{
        this.symTab = pTable;
    }

    /**
     * To get optimized instructions
     * @param {Method} pMethod The method containing requested instructions
     * @returns {Object[]} An array of anonymous object containg Instruction object or BasicBlock metadata
     * @deprecated
     */
    getInstructions( pMethod:ModelMethod):any[]{
        return this.methods[pMethod.signature()];
    }

    /**
     *
     * @param {Method} pMethod The method to init
     */
    initMethod( pMethod:ModelMethod):any{
        let v:string = pMethod.signature();
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
    analyzeBlocks(pMethod:ModelMethod):DDVM_Instruction[]{

        let blocks:ModelBasicBlock[] =  pMethod.getBasicBlocks();

        if(blocks.length == 0) return null;

        let self:ModelBasicBlock = null, next:ModelBasicBlock=null, instrStack:DDVM_Instruction[]=[];
        let entry:ModelBasicBlock = blocks[0], instr:ModelInstruction[]=null, jump:boolean=false;


        // forward analysis
        self = entry;
        for(let i=0; i<blocks.length ; i++){

            // avoid basic blocks containing only NOP
            if(blocks[i].isNOPblock()) continue;

            // avoid basic blocks already visited
            if(blocks[i].isVisited()) continue;


            instrStack.push({ i:blocks[i], t:DDVM_InstructionType.BLOCK_START });

            instr = blocks[i].getInstructions();
            jump = false;
            for(let k=0; k<instr.length; k++){

                instrStack.push({ i:instr[k], t:DDVM_InstructionType.OPERATION });

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