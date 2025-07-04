import {Savable, STUB_TYPE} from "./ModelSavable.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {
    NodeType,
    DataSourceHelper,
    NodeProperty,
    DbDataType,
    DbKeyType,
    INode,
    NodeUtils
} from "@dexcalibur/dexcalibur-orm";
import {createHash} from "crypto";
import Util from "./Utils.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {ModelInstance} from "./ModelInstance.js";
import {Nullable} from "./core/IStringIndex.js";
import {ResourceReference} from "./android/AndroidResource.js";
import ModelFile from "./ModelFile.js";
import {INodeRef} from "./INode.js";

export interface ModelStringValueOpts {
    _uid?:string;
    src?:INode|INodeRef;
    instr?:any;
    value?:string;
    instance?:ModelInstance[];
    tags?:number[];
}

export default class ModelStringValue extends Savable implements INode
{
    static HASH_ALGO = createHash('sha1');
    static TYPE:NodeType = (new NodeType( "stringsValue", NodeInternalType.STRING, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
        //(new NodeProperty("_uid")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
        (new NodeProperty("src")).type(DbDataType.STRING).def(null),
        (new NodeProperty("instr")).type(DbDataType.STRING).def(null),
        (new NodeProperty("value")).type(DbDataType.STRING).def(null),
        (new NodeProperty("tags")).type(DbDataType.STRING).def(null),
        (new NodeProperty("instance")).volatile().type(DbDataType.STRING).def([])
    ])).dataSource("MEM", "strings");

    __:NodeInternalType = NodeInternalType.STRING;

    // SRC_NODE_TYPE : SRC_UUID : STR_TYPE : UID
    _uid:string = "";

    src:INodeRef|any = null;
    instr:any = null;
    value:string = null;
    instance:ModelInstance[] = [];
    tags:number[] = [];

    constructor(pConfig:Nullable<ModelStringValueOpts>=null) {
        super(STUB_TYPE.STRING_VALUE);

        if(pConfig !== null)
            for(let i in pConfig)
                this[i] = pConfig[i];


    }

    isDifferent(pValue:string, pUUID:string):boolean {
        const uuid = Util.sha1_buffer(pValue)
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

    setValue(pValue:string):ModelStringValue{
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
    }


    toJsonObject():any{
        let o:any = {};
        o.__ = this.__;
        o.value = this.value;

        // "instr" can be empty is the string has been gathered at runtime
        if(this.instr !=null){
            o.instr = this.instr.toJsonObject();
        }

        o.tags = this.tags;
        CoreDebug.checkJsonSerialize(o, "ModelStringValue");
        return o;
    }

    getUID():string {
        if(this._uid==null){
            this._uid = Util.sha1_buffer(this.value+(new Date()).getTime());
        }
        return this._uid;
    }
}

ModelStringValue.TYPE.builder(ModelStringValue);