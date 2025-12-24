// TDB
import {Savable, Stub, STUB_TYPE} from "./ModelSavable.js";
import ModelInstruction from "./ModelInstruction.js";
import ModelMethod from "./ModelMethod.js";
import {EOL} from "os";
import ModelClass from "./ModelClass.js";

import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {
    DbDataType,
    DbKeyType,
    NodeProperty,
    NodePropertyState,
    NodeType,
    Tag,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";

import {CoreDebug} from "./core/CoreDebug.js";
import {INode, INodeRef} from "./INode.js";
import {CryptoUtils} from "./CryptoUtils.js";
import Platform from "./platform/Platform.js";
import ModelField from "./ModelField.js";
import ModelSyscall from "./ModelSyscall.js";
import ModelStringValue from "./ModelStringValue.js";
import {ModelFunction} from "./ModelFunction.js";

/**
 * Represents a call to a method, a field or a class
 * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance
 * @constructor
 */
export default class ModelCall implements INode
{
    static TYPE:NodeType = (new NodeType( "call", NodeInternalType.CALL, [
        (new NodeProperty("_uid"))
            .type(DbDataType.STRING)
            .key(DbKeyType.PRIMARY),
        (new NodeProperty("tags")).type(DbDataType.BLOB).def([]),

        (new NodeProperty("instr"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                if(x.p != null && x.p.toJsonObject!=null){
                    return (x.p as ModelInstruction).toJsonObject();
                }else{
                    return null;
                }
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p != null){
                    return new ModelInstruction(x.p);
                }else{
                    return null;
                }
            })
            .def(null), //.single(ModelInstruction.TYPE),

        (new NodeProperty("caller")).volatile().single(ModelMethod.TYPE),
        (new NodeProperty("_caller"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                if(x.self.caller != null){
                    return {
                        __: x.self.caller.__,
                        _uid: x.self.caller.getUID()
                    } as INodeRef;
                }else{
                    return null;
                }
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p != null){
                    return x.p;
                }else{
                    return null;
                }
            })
            .def(null), //.single(ModelMethod.TYPE),
        (new NodeProperty("calleed"))
            .volatile()
            .single(ModelMethod.TYPE),
        (new NodeProperty("_called"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                if(x.self.calleed != null){
                    return {
                        __: x.self.calleed.__,
                        _uid: x.self.calleed.getUID()
                    } as INodeRef;
                }else{
                    return null;
                }
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p != null){
                    return x.p;
                }else{
                    return null;
                }
            })
            .def(null), //.volatile().single(ModelMethod.TYPE),

        (new NodeProperty("line")).type(DbDataType.INTEGER).def(-1),
        (new NodeProperty("object")).volatile().type(DbDataType.BLOB),
        (new NodeProperty("subject")).volatile().type(DbDataType.BLOB),
    ])).dataSource("PROJECT_DB", "call");

    __:NodeInternalType = NodeInternalType.CALL;

    //_uid:string = "";

    __uid?:string = null;

    instr:ModelInstruction = null;
    caller:ModelMethod = null;
    calleed:(ModelMethod|ModelClass|ModelField|ModelFunction|ModelStringValue) = null;

    _caller:Nullable<INodeRef> = null;
    _called:Nullable<INodeRef> = null;

    line:number = null;
    type:any = null;
    object:any = null;
    subject:any = null;

    tags:TagUUID[] = [];

    constructor(pConfig:any=null){
        //super(STUB_TYPE.CALL);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    get _uid():string{
        if(this.__uid==null){
            this.__uid = this._genUID();
        }

        return this.__uid;
    }

    set _uid(value:string){
        this.__uid = value;
    }

    private _genUID():string{

//        return CryptoUtils.sha256(`${this.instr.opcode}:${this.caller.getUID()}=>${this.calleed.getUID()}`);
        return CryptoUtils.sha256(
            `${this.instr.opcode.instr}:${this.caller.__}:${this.caller.getUID()}:${this.calleed.__}:${this.calleed.getUID()}`,
            'hex', true
        );
    }

    getUID(): string {
        return this._uid;
    }

    print(){
        console.log("\t"+this.caller.hashCode()+" [:line"+this.instr.getLine()+"] > \n\t\t"
            +this.instr.opcode.instr+" "
            +this.calleed.getUID());
    }

    setCaller(pNode:INode){
        this.caller = pNode as ModelMethod;
        this._caller = {
            __: pNode.__,
            _uid: pNode.getUID()
        }
    }

    setCalled(pNode:INode){
        this.calleed = pNode as ModelMethod;
        this._called = {
            __: pNode.__,
            _uid: pNode.getUID()
        }
    }

    setInstr(pInstr:ModelInstruction){
        this.instr = pInstr;
    }


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
            else if(i == "caller" && this.caller != null){
                obj.caller = this.caller.getUID();
            }
            else if(i == "calleed" && this.calleed != null){
                obj.callee = this.calleed.getUID();
            }
            else if(i == "instr"){
                obj.instr = this.instr.exportType();
            }
            else if(i == "_uid"){
                obj._uid = this._uid;
            }
            else if(i == "_caller"){
                obj._caller = this._caller;
            }
            else if(i == "_called"){
                obj._called = this._called;
            }
        }

        obj.__ = this.__;
        CoreDebug.checkJsonSerialize(obj, "ModelCall");
        return obj;
    };

    /*
    export( pStubType:STUB_TYPE=null, pExclude:string[]=null):Stub{
        return new Stub(
            (pStubType!==null ? pStubType : this.$),
            this,
            pExclude
        )
    }

    import( pConfig:any):any{
        for(let i in pConfig) this[i] = pConfig[i];

        return this;
    }*/


    addTag(vTag:Tag){
        const uuid = vTag.getUUID();
        if(this.tags.indexOf(uuid)==-1)
            this.tags.push(uuid);
    }

    hasTag(vTag:Tag):boolean{
        const uuid = vTag.getUUID()
        for(let i=0; i<this.tags.length; i++){
            if(this.tags[i]===uuid){
                return true;
            }
        }
        return false;
    }

    getTags():number[]{
        return this.tags;
    }

}
ModelCall.TYPE.builder(ModelCall);