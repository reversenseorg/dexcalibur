import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";

/**
 * Represents a bookmark type
 */
export class BookmarkType {


    static TYPE:NodeType = new NodeType("bookmark_type", NodeInternalType.BOOKMARK_TYPE, []);
    __:NodeInternalType = NodeInternalType.BOOKMARK_TYPE;

    id: number;
    name: string;
    descr: string;
    theme: any;
    priority: number;

    constructor(pConfig:any) {
        for(let i in pConfig) {
            this[i] = pConfig[i];
        }
    }


    getName():string {
        return this.name;
    }

}