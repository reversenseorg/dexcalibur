import { CONST } from "./CoreConst";
import ModelBasicBlock from "./ModelBasicBlock";
import ModelMethod from "./ModelMethod";
import {Savable, STUB_TYPE} from "./ModelSavable";
import {ModelRegisterReference} from "./ModelReference";
import {NodeType} from "./NodeType";
import {ModelFunction} from "./ModelFunction";


export enum ModelInstructionType {
    CJMP    ='cjmp',
    JMP     ='jmp',
    LOAD    ='load',
    ADD     ='add',
    STORE   ='store',
    MOV     ='mov',
    CALL    ='call',
    SHL     ='shl',
    SHR     ='shr',
    PUSH    ='push',
    NULL    ='null',
    CMP     ='cmp',
    UCALL   ='ucall'
}


/**
 * Represents an instruction from the Application bytecode
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance
 * @constructor
 */
export default class ModelCpuInstruction
{
    _t:NodeType = NodeType.INSTR_CPU;
    offset:number
    ptr:number = null;
    refptr:boolean = false;
    func:ModelFunction = null;
    fcn_addr?:number;
    fcn_last?:number;
    sz:number;
    bytes:string;
    type:string;
    opcode:string;
    disasm:string;
    reloc:boolean = false;

    jump?:number;
    fail?:number;

    flags?:any[];

    constructor(pConfig:any=null) {

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }


    toJsonObject(pExclude:string[]=[]):any{
        let o:any = {};
        for(let i in this){
            if(pExclude.indexOf(i)>-1) continue;
            if(typeof this[i]==='object'){
                // it can be an array or an object or NULL
                if((this[i]!==null) && (this[i].hasOwnProperty('toJsonObject'))){
                    o[i] = (this[i] as any).toJsonObject();
                }else{
                    o[i] = this[i];
                }
            } else{
                o[i] = this[i];
            }
        }
        return o;
    };
}
