import {Savable, STUB_TYPE} from "./ModelSavable.js";
import {NodeInternalType} from "./NodeInternalType.js";
import {NodeType} from "./persist/orm/NodeType.js";
import {DataSourceHelper} from "./DataSourceHelper.js";
import {INode} from "./INode.js";
import {NodeProperty, NodePropertyState} from "./persist/orm/NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "./persist/orm/DbAbstraction.js";
import {createHash} from "crypto";
import Util from "./Utils.js";
import {CoreDebug} from "./core/CoreDebug.js";

export default class ModelStringValue extends Savable
{
    static HASH_ALGO = createHash('sha1');
    static TYPE:NodeType = (new NodeType( "strings", NodeInternalType.STRING, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
        //(new NodeProperty("_uid")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
        (new NodeProperty("src")).volatile().type(DbDataType.STRING).def(null),
        (new NodeProperty("instr")).volatile().type(DbDataType.STRING).def(null),
        (new NodeProperty("value")).volatile().type(DbDataType.STRING).def(null)
    ])).dataSource(DataSourceHelper.MEM, "strings");

    __:NodeInternalType = NodeInternalType.STRING;

    // SRC_NODE_TYPE : SRC_UUID : STR_TYPE : UID
    _uid:string;

    src:any = null;
    instr:any = null;
    value:string = null;
    tags:number[] = [];

    constructor(pConfig:any=null) {
        super(STUB_TYPE.STRING_VALUE);

        if(pConfig !== null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    isDifferent(pValue:string, pUUID:string):boolean {
        const uuid = Util.sha1_buffer(pValue)
        return (this.value != null) && (uuid!=this.value);
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
        o.instr = this.instr.toJsonObject();
        o.tags = this.tags;
        CoreDebug.checkJsonSerialize(o, "ModelStringValue");
        return o;
    }

}
ModelStringValue.TYPE.builder(ModelStringValue);