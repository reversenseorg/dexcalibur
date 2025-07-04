// TDB
import {Savable, STUB_TYPE} from "./ModelSavable.js";
import ModelInstruction from "./ModelInstruction.js";
import ModelMethod from "./ModelMethod.js";
import {EOL} from "os";
import ModelClass from "./ModelClass.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {NodeType, DataSourceHelper, NodeProperty, DbDataType, TagUUID} from "@dexcalibur/dexcalibur-orm";

import {CoreDebug} from "./core/CoreDebug.js";
import {INode} from "./INode.js";
import {CryptoUtils} from "./CryptoUtils.js";

/**
 * Represents a call to a method, a field or a class
 * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance
 * @constructor
 */
export default class ModelCall extends Savable implements INode
{
    static TYPE:NodeType = (new NodeType( "call", NodeInternalType.CALL, [
        (new NodeProperty("instr")).volatile().single(ModelInstruction.TYPE),
        (new NodeProperty("caller")).volatile().single(ModelMethod.TYPE),
        (new NodeProperty("calleed")).volatile().single(ModelMethod.TYPE),
        (new NodeProperty("line")).volatile().type(DbDataType.INTEGER).def(-1),
        (new NodeProperty("object")).volatile().type(DbDataType.BLOB),
        (new NodeProperty("subject")).volatile().type(DbDataType.BLOB),
    ])).dataSource("PROJECT_DB", "call");

    __:NodeInternalType = NodeInternalType.CALL;

    _uid:string = "";

    instr:ModelInstruction = null;
    caller:ModelMethod = null;
    calleed:ModelMethod = null;

    line:number = null;
    type:any = null;
    object:any = null;
    subject:any = null;

    tags:TagUUID[] = [];

    constructor(pConfig:any=null){
        super(STUB_TYPE.CALL);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    getUID(): string {
        if(this._uid==null){
            this._uid = CryptoUtils.sha256(`${this.instr.opcode}:${this.caller.getUID()}=>${this.calleed.getUID()}`)
        }
        return super.getUID();
    }

    print(){
        console.log("\t"+this.caller.hashCode()+" [:line"+this.instr.getLine()+"] > \n\t\t"
            +this.instr.opcode.instr+" "
            +this.calleed.hashCode());
    };

    help(){
        let t:string ="+-------------------- HELP --------------------+";
        t += EOL+"[-- Methods : ]";
        t += EOL+"\t.print()\tPrint the call data";
        t += EOL+"\t.help()\tThis help";
        t += EOL+"[-- Properties : ]";
        t += EOL+"\t.instr:<Instruction>\tGet the instruction";
        t += EOL+"\t.caller:<Method>\tGet the method performing the call";
        t += EOL+"\t.calleed:<*>\tGet the reference to the calleed";
        t += EOL;

        console.log(t);
    }


    toJsonObject():any{
        let obj:any = {};
        for(let i in this){
            if(["_","$"].indexOf(i[0])==-1
                && (Array.isArray(this[i]))
                && (typeof this[i] != 'object')){

                obj[i] = this[i];
            }
            else if(i == "tags"){
                obj.tags = this.tags;
            }
            else if(i == "caller"){
                obj.caller = this.caller.__signature__;
            }
            else if(i == "calleed"){
                if(this.calleed instanceof ModelClass)
                    obj.callee = this.calleed.name;
                else
                    obj.callee = this.calleed.__signature__;
            }
            else if(i == "instr"){
                obj.instr = this.instr.exportType(); //toJsonObject(["name"]);
            }
            else if(i == "_uid"){
                obj._uid = this.getUID(); //toJsonObject(["name"]);
            }
        }
        CoreDebug.checkJsonSerialize(obj, "ModelCall");
        return obj;
    };
}
