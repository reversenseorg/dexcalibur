import {DbDataType} from "./persist/orm/DbAbstraction.js";
import {NodeType} from "./persist/orm/NodeType.js";
import {NodeInternalType} from "./NodeInternalType.js";
import {NodeProperty} from "./persist/orm/NodeProperty.js";
import {CoreDebug} from "./core/CoreDebug.js";

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
    ]);
    __:NodeInternalType = NodeInternalType.FILE_SECTION;

    o:number = -1;
    l:number = -1;
    t:string = "";

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

    toJsonObject(){
        const o = this;
        CoreDebug.checkJsonSerialize(o, "ModelFileSection");
        return o;
    }
}
ModelFileSection.TYPE.builder(ModelFileSection);