import { CONST } from "./CoreConst.js";
import ModelCatchStatement from "./ModelCatchStatement.js";
import { ModelSwitchCase, ModelPackedSwitchStatement, ModelSparseSwitchStatement } from "./ModelSwitch.js";
import ModelInstruction from "./ModelInstruction.js";
import ModelMethod from "./ModelMethod.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "./NodeInternalType.js";
import {Savable} from "./ModelSavable.js";
import {CoreDebug} from "./core/CoreDebug.js";

/**
 * Represents a basic block of dalvik instruction
 * @class
 */
export default class ModelBasicBlock
{
    static TYPE:NodeType = new NodeType( "code_basicblock", NodeInternalType.BASIC_BLOCK, []);
    __:NodeInternalType = NodeInternalType.BASIC_BLOCK;

    // $ = STUB_TYPE.BASIC_BLOCK;

    line:number = -1;
    prologue:boolean = false;
    stack:ModelInstruction[] = []; // TODO  add Instruction[] type

    offset:number = -1;
    _parent:ModelMethod = null;

    tag:string = null; // TODO add Tag ?
    tags:any = []; // TODO add tag

    // TODO reduce memory required by replacing it by bitmap+string array or associative array
    //  special block name
    cond_name:string = null;
    goto_name:string = null;
    catch_name:string = null;
    try_name:string = null;
    try_end_name:string = null;

    //catch_cond = null;
    switch_case:any = null; // TODO
    switch_statement:string = null; // TODO

    // special child
    linked_try_block:ModelBasicBlock = null;
    linked_catch_block:ModelBasicBlock = null;
    duplicate:any = null; // TODO remove ?
    switch:any = null; // TODO
    array_data:any = null; // TODO
    array_data_name:any = null; // TODO

    succ:ModelBasicBlock[] = [];
    pred:ModelBasicBlock[] = [];
    catch:ModelCatchStatement[] = [];

    visited:boolean = false;

    /**
     * @param {Object} config Optional, an object wich can be used in order to initialize the instance
     * @constructor
     */
    constructor(pConfig:any=null){
        //this.$ = STUB_TYPE.BASIC_BLOCK;

        this.line = -1;
        this.prologue = false;
        this.stack = [];
        this.offset = -1;
        this.tags = [];
        this.succ = [];
        this.pred = [];
        this.catch = [];

        if(pConfig!=null)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }

    /**
     * To check if the block contains only NOP instruction
     * @returns {Boolean} Returns TRUE if thhe block contains only NOP instruction, else FALSE
     */
    isNOPblock():boolean{
        for(let i:number=0; i<this.stack.length; i++){
            if(this.stack[i].opcode.type != CONST.INSTR_TYPE.NOP){
                return false;
            }
        }
        return true;
    }

    hasCatchStatement():boolean{
        return this.catch.length>0;
    }

    getCatchStatements():ModelCatchStatement[]{
        return this.catch;
    }

    addCatchStatement(pStmt:ModelCatchStatement){
        this.catch.push(pStmt);
    }


    isVisited():boolean{
        return (this.visited !== undefined) && (this.visited==true);
    }

    visit():ModelBasicBlock{
        this.visited = true;
        return this;
    }

    initVisit():ModelBasicBlock{
        this.visited = false;
        return this;
    }

    getSuccessors():ModelBasicBlock[]{
        return this.succ;
    }

    addSuccessor(pBasicBlock:ModelBasicBlock){
        this.succ.push(pBasicBlock);
    }

    hasSuccessor(pBasicBlock:ModelBasicBlock):boolean{
        return this.succ.indexOf(pBasicBlock)>-1;
    }

    hasSuccessors():boolean{
        return this.succ.length > 0;
    }

    getPredecessors():ModelBasicBlock[]{
        return this.pred;
    }

    addPredecessor(pBasicBlock:ModelBasicBlock){
        this.pred.push(pBasicBlock);
    }

    hasPredecessor(pBasicBlock:ModelBasicBlock):boolean{
        return this.pred.indexOf(pBasicBlock)>-1;
    }

    hasMultiplePredecessors():boolean{
        return this.pred.length>1;
    }

    hasPredecessors():boolean{
        return this.pred.length > 0;
    }

    dump(){
        console.log("\tBasic Block (line "+this.line+"):\n-------------------------");
        for(let i in this.stack){
            this.stack[i].dump();
        }
        console.log("-------------------------");
    }

    clone(clean:boolean=true):ModelBasicBlock{
        let bb:any = new ModelBasicBlock();
        for(let i in this){
            bb[i] = this[i];
        }

        if(clean){
            //bb.cond_name = null;
            //bb.goto_name = null;
            bb.catch_name = null;
            bb.try_name = null;
            bb.try_end_name = null;
            //bb.catch_name = null;
            bb.duplicate = true;
        }

        return bb as ModelBasicBlock;
    }

    disass(pDisassembler:any):any{

        return pDisassembler.block(this._parent,this,0);
    }


    hasInstr(type:any):boolean{
        for(let i in this.stack){
            if(this.stack[i].opcode.type==type) return true;
        }
        return false;
    }

    setAsConditionalBlock(name:string){
        this.cond_name = name;
    }
    isConditionalBlock():boolean{
        return this.cond_name != null;
    }
    getCondLabel():string{
        return this.cond_name;
    }
    setAsGotoBlock(name:string){
        this.goto_name = name;
    }
    isGotoBlock():boolean{
        return this.goto_name != null;
    }
    getGotoLabel():string{
        return this.goto_name;
    }
    setAsTryBlock(name:string){
        this.try_name = name;
    }
    getTryStartLabel():string{
        return this.try_name;
    }
    getTryEndLabel():string{
        return this.try_end_name;
    }
    setTryEndName(name:string){
        this.try_end_name = name;
    }
    getTryEndName():string{
        return this.try_end_name;
    }
    isTryBlock():boolean{
        return this.try_name != null;
    }
    isTryEndBlock():boolean{
        return this.try_end_name != null;
    }

    setAsCatchBlock(name:string){
        this.catch_name = name;
    }
    setCatchCond(name:string){
        this.catch_name = name;
    }
    isCatchBlock():boolean{
        return this.catch_name != null;
    }
    getCatchLabel():string{
        return this.catch_name;
    }

    setAsArrayData(name:string){
        this.array_data_name = name;
    }
    setAsSwitchCase(name:string){
        this.switch_case = name;
    }
    setAsSwitchStatement(name:string){
        this.switch_statement = name;
    }
    isSwitchStatement():boolean{
        return (this.switch_statement != null) && (this.switch != null);
    }
    isSwitchCase():boolean{
        return this.switch_case != null;
    }
    setupPackedSwitchStatement(start_value:number){
        this.switch = new ModelPackedSwitchStatement(start_value);
    }
    setupSparseSwitchStatement(){
        this.switch = new ModelSparseSwitchStatement();
    }
    getSwitchStatement():ModelSparseSwitchStatement|ModelPackedSwitchStatement{
        return this.switch;
    }
    getSwitchCaseName():string{
        return this.switch_case;
    }
    getSwitchStatementName():string{
        return this.switch_statement;
    }

    getInstructions():ModelInstruction[]{
        return this.stack;
    }

    toJsonObject():any {
        const o:any = {};
        Object.keys(this).map((vPpt) => {
            switch (vPpt){
                case "stack":
                    o[vPpt] =[];
                    this.stack.map(x => {
                        o.stack.push(x.toJsonObject());
                    })
                    break;
                case "_parent":
                    o[vPpt] = (this._parent!=null ? this._parent.__signature__ : null);
                    break;
                case "linked_try_block":
                case "linked_catch_block":
                    o[vPpt] = (this[vPpt]!=null ? this[vPpt].offset : -1);
                    break;
                case "succ":
                case "pred":
                    o[vPpt] = this[vPpt].map(x => x.offset );
                    // ignore
                    break;
                case "catch":
                    o.catch = [];
                    this.catch.map(x => {
                        o.catch.push(x.toJsonObject());
                    });
                    break;
                default:
                    o[vPpt] = this[vPpt];
                    break;
            }
        });
        CoreDebug.checkJsonSerialize(o, "ModelBasicBlock");
        return o;
    }
}
ModelBasicBlock.TYPE.builder(ModelBasicBlock);