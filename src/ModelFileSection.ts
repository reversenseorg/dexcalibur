import {DbDataType, DbKeyType} from "./persist/orm/DbAbstraction";
import {NodeType} from "./persist/orm/NodeType";
import {NodeInternalType} from "./NodeInternalType";
import {NodeProperty} from "./persist/orm/NodeProperty";

/**
 * Represents a section into a file
 *
 * @class
 * @since 1.0.0
 */
export default class ModelFileSection {

    static TYPE:NodeType = new NodeType("file_sections", NodeInternalType.FILE_SECTION, [
        (new NodeProperty("uid")).type(DbDataType.INTEGER).key(DbKeyType.PRIMARY).def(null),
        (new NodeProperty("o")).type(DbDataType.INTEGER).def(-1),
        (new NodeProperty("t")).type(DbDataType.STRING).def(null),
    ]);

    o:number = -1;
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
}