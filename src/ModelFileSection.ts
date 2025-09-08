

import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {NodeType,  NodeProperty, DbDataType} from "@dexcalibur/dexcalibur-orm";
import {CoreDebug} from "./core/CoreDebug.js";
import {Metadata, MetadataType} from "./audit/common/Metadata.js";

/**
 * Represents a section into a file
 *
 * @class
 * @since 1.0.0
 */
export default class ModelFileSection {

    static TYPE:NodeType = new NodeType("file_sections", NodeInternalType.FILE_SECTION, [
       // (new NodeProperty("uid")).type(DbDataType.INTEGER).key(DbKeyType.PRIMARY).def(null),
        (new NodeProperty("o")).type(DbDataType.INTEGER).def(-1),
        (new NodeProperty("l")).type(DbDataType.INTEGER).def(null),
        (new NodeProperty("t")).type(DbDataType.STRING).def(null),
        (new NodeProperty("meta")).type(DbDataType.BLOB).def([]),
        (new NodeProperty("data")).type(DbDataType.BLOB).def(null),
    ]);
    __:NodeInternalType = NodeInternalType.FILE_SECTION;

    o:number = -1;
    l:number = -1;
    t:string = "";
    meta:Metadata[] = [];
    data:Nullable<Uint8Array> = null;

    /**
     *
     * @param {number} pOffset
     * @param  {string} pType
     */
    constructor(pOffset:number, pType:string) {
        this.o = pOffset;
        this.t = pType;
    }

    getOffset():number {
        return  this.o;
    }

    getType():string {
        return this.t;
    }

    setData(data:Nullable<Uint8Array>) {
        this.data = data;
    }

    setLen(pLen:number) {
        this.l = pLen;
    }

    addMeta(pMeta:Metadata) {
        this.meta.push(pMeta);
    }

    toJsonObject(){
        const o = this;
        CoreDebug.checkJsonSerialize(o, "ModelFileSection");
        return o;
    }

    getMeta(pType: MetadataType, pKey: string) {
        return this.meta.find(x => (x.key == pKey) && (x.type == pType));
    }
}
ModelFileSection.TYPE.builder(ModelFileSection);