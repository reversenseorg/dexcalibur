import {Savable, STUB_TYPE} from "./ModelSavable.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {
    NodeType,
    DataSourceHelper,
    NodeProperty,
    DbDataType,
    DbKeyType,
    INode,
    NodeUtils, NodePropertyState
} from "@dexcalibur/dexcalibur-orm";
import {createHash} from "crypto";
import Util from "./Utils.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {ModelInstance} from "./ModelInstance.js";
import {Nullable} from "./core/IStringIndex.js";
import {ResourceReference} from "./android/AndroidResource.js";
import ModelFile from "./ModelFile.js";
import {INodeRef} from "./INode.js";
import Control from "./audit/common/Control.js";
import ModelInstruction from "./ModelInstruction.js";
import ModelMethod from "./ModelMethod.js";
import ModelBasicBlock from "./ModelBasicBlock.js";

export interface ModelStringValueOpts {
    _uid?:string;
    src?:(INode|INodeRef|any)[];
    instr?:any;
    value?:string;
    instance?:ModelInstance[];
    tags?:number[];
}

export interface  IInstrRef {
    bb: number,
    o: number
}
export interface IStringCtxRef extends INodeRef {
    instr?:IInstrRef;
    tags?:number[];
}

export default class ModelStringValue extends Savable implements INode
{
    static HASH_ALGO = createHash('sha1');
    static TYPE:NodeType = (new NodeType( "stringsValue", NodeInternalType.STRING, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
        //(new NodeProperty("_uid")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
        (new NodeProperty("src"))
            .type(DbDataType.STRING)
            .sleep((x:NodePropertyState)=>{
                if(x.p==null || x.p.length==0) return [];

                const i:any[] = [];
                x.p.map(y => {
                    if(NodeUtils.isNode(y)){
                        i.push(NodeUtils.asNodeRef(y));
                    }else if(y.toJsonObject !=null){
                        i.push(y.toJsonObject())
                    }else {
                        i.push(y)
                    }
                });
                return i;
            })
            .wakeUp((x:NodePropertyState)=>{
                if(x.p==null || x.p.length==0) return [];

                return x.p;
            })
            .def([]),
        (new NodeProperty("instr"))
            .volatile()
            .type(DbDataType.STRING)
            .def(null),
        (new NodeProperty("value"))
            .type(DbDataType.STRING)
            .def(null),
        (new NodeProperty("tags")).type(DbDataType.STRING).def(null),
        (new NodeProperty("instance")).volatile().type(DbDataType.STRING).def([])
    ])).dataSource("PROJECT_DB","strings"); //, "strings");

    __:NodeInternalType = NodeInternalType.STRING;

    // SRC_NODE_TYPE : SRC_UUID : STR_TYPE : UID
    _uid:Nullable<string> = null;

    src:(IStringCtxRef|any)[] = [];

    //instr:any = null;
    value:string = null;

    instance:ModelInstance[] = [];
    tags:number[] = [];

    constructor(pConfig:Nullable<ModelStringValueOpts>=null) {
        super(STUB_TYPE.STRING_VALUE);

        if(pConfig !== null)
            for(let i in pConfig)
                this[i] = pConfig[i];

        if(this._uid==null && this.value!=null){
            this.setValue(this.value);
        }
    }


    static addStringRefTo(pStrings:ModelStringValue[], pRawStr:string, pRetRef = true):INodeRef|ModelStringValue  {

        let i=0;
        let eq:number;
        const hash = ModelStringValue.hashcode(pRawStr);

        while(i<pStrings.length && (eq=pStrings[i].getUID().localeCompare(hash))<0) i++;

        if(pStrings[i]!=null){
            if(eq===0){
                // location / src
                return (pRetRef ? NodeUtils.asNodeRef(pStrings[i]) : new ModelStringValue({ value:pRawStr }) )
            }else{
                // missing string
                // insert data without break sort
                // const end = pStrings.slice(i);
                // shift values
                for(let len=pStrings.length-1; len>=i; len--){
                    pStrings[len+1] = pStrings[len];
                }
                // insert strings
                pStrings[i] = new ModelStringValue({ value: pRawStr });
                return (pRetRef ? NodeUtils.asNodeRef(pStrings[i]) : new ModelStringValue({ value:pRawStr }) )
            }
        }else{
            pStrings[i] = new ModelStringValue({ value: pRawStr });
            return (pRetRef ? NodeUtils.asNodeRef(pStrings[i]) :  new ModelStringValue({ value:pRawStr }) )
        }
    }

    static hashcode(pValue:string):string {
        return Util.sha1_buffer(pValue);
    }

    isDifferent(pValue:string, pUUID:string):boolean {
        const uuid = ModelStringValue.hashcode(pValue);
        return (this.value != null) && (uuid!=this.value);
    }


    /**
     * To check if the specified value is a ModelStringValue node
     *
     * @param {any} pValue The. object to test
     * @return {boolean} TRUE is the argument is a ModelStringValue
     * @static
     * @method
     */
    static is(pValue:any):boolean{
        return (pValue!=null && NodeUtils.isNode(pValue) && pValue.__===NodeInternalType.STRING);
    }

    setValue(pValue:string):void{
        this._uid = ModelStringValue.hashcode(pValue);
        this.value = pValue;
    }

    getValue():string {
        return this.value;
    }

    /*
    set value(pValue:string) {
        this._uid = ModelStringValue.hashcode(pValue);
        this._value = pValue;
    }

    get value():string {
        return this._value;
    }

    /*setValue(pValue:string):ModelStringValue{
        const uuid = Util.sha1_buffer(pValue);

        if(this.isDifferent(pValue,uuid)){
            return new ModelStringValue({
                _uid: uuid,
                src: this.src,
                instr: this.instr,
                tags: this.tags,
                value: pValue
            });
        }else{
            return this;
        }
    }*/


    toJsonObject():any{
        let o:any = {};
        o.__ = this.__;
        o._uid = this._uid;
        o.value = this.value;
        o.src = [];
        o._uid = this.getUID();

        // "instr" can be empty is the string has been gathered at runtime
        /*if(this.instr !=null){
            o.instr = null; //this.instr.toJsonObject();
        }*/

        this.src.map(y => {
            if(NodeUtils.isNode(y)){
                o.src.push(NodeUtils.asNodeRef(y));
            }else if(y.toJsonObject !=null){
                o.src.push(y.toJsonObject())
            }else {
                o.src.push(y)
            }
        });

        o.tags = this.tags;
        CoreDebug.checkJsonSerialize(o, "ModelStringValue");
        return o;
    }

    getUID():string {
        if(this._uid===""){
            throw new Error("Invalid ModelStringValue UID");
        }
        if(this._uid==null){
            this._uid = ModelStringValue.hashcode(this.value); //  Util.sha1_buffer(this.value);
        }
        return this._uid;
    }

    /**
     * To check if an object is a node reference
     *
     * @param pRef
     */
    static isNodeRef(pRef:any):boolean {
        return (pRef['__']!=null && pRef['_uid']!=null);
    }

    updateSource(pStr:ModelStringValue):void {

        pStr.src.map( x => {
            let u:any;

            if(NodeUtils.isNode(x)){
                let r = NodeUtils.asNodeRef(x);
                u = this.src.find(o => (o.__===r.__ && o._uid===r._uid));
                if(u==null){
                    this.src.push(x);
                }
            }else if (x['__']!=null && x['_uid']!=null){
                u = this.src.find(o => (o.__===x.__ && o._uid===x._uid));
                if(u==null){
                    this.src.push(x);
                }
            }else{
                this.src.push(x);
            }
        });

        pStr.tags.map(t => {
            if(this.tags.indexOf(t)==-1) this.tags.push(t);
        })
    }

    /**
     * This method is used to add the instruction from a method where
     * the string is assigned to a variable.
     *
     * @param {ModelMethod} pMethod
     * @param {ModelInstruction} pInstruct
     */
    setInstrSource(pMethod: ModelMethod, pInstruct: ModelInstruction) {
        const r = NodeUtils.asNodeRef(pMethod);

        this.src.push({
            __: r.__,
            _uid: r._uid,
            tags: pMethod.tags,
            instr: { o: pInstruct.offset, bb:(pInstruct._parent!=null ? (pInstruct._parent as ModelBasicBlock).offset:null)  },
        });

        pMethod.tags.map(t =>{
            if(this.tags.indexOf(t)==-1) this.tags.push(t);
        });
    }
}

ModelStringValue.TYPE.builder(ModelStringValue);