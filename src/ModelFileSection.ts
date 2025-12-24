

import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {NodeType, NodeProperty, DbDataType, ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {CoreDebug} from "./core/CoreDebug.js";
import {Metadata, MetadataType} from "./audit/common/Metadata.js";
import ModelMetadata from "./ModelMetadata.js";

/**
 * Represents a section into a file
 *
 * @class
 * @since 1.0.0
 */
export default class ModelFileSection {

    static TYPE:NodeType = new NodeType("file_sections", NodeInternalType.FILE_SECTION, [
       // (new NodeProperty("uid")).type(DbDataType.INTEGER).key(DbKeyType.PRIMARY).def(null),
        (new NodeProperty("o")).type(DbDataType.INTEGER).def(-1).descr("Offset of the file section. This offset is relative to the begin of file").addValidationRule(ValidationRule.uint64()),
        (new NodeProperty("l")).type(DbDataType.INTEGER).def(null).descr("Size of the chunk in bytes.").addValidationRule(ValidationRule.uint64()),
        (new NodeProperty("t")).type(DbDataType.STRING).def(null).descr("The name of the chunk").addValidationRule(ValidationRule.utf8String()),
        (new NodeProperty("meta")).type(DbDataType.BLOB).def([]).descr("A list of Metadata."), //.addValidationRule(ValidationRule.asArrayOf(ModelMetadata)),
        (new NodeProperty("data")).type(DbDataType.BLOB).def(null).descr("Raw data stored as a buffer or parsed"),
    ]).descr(`
A **file_sections** node represent a chunk from a file. Such sections are stored into an instance of ModelFileSection class.
A PNG file represented by a ModelFile node can contain a ModelFileSections foreach chunks such as IHDR ou PLTE chunks.
    `);
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