import {BookmarkType} from "./BookmarkType.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {NodeInternalType} from "../NodeInternalType.js";


export class Bookmark {


    static TYPE:NodeType = new NodeType("bookmark", NodeInternalType.BOOKMARK, []);
    __:NodeInternalType = NodeInternalType.BOOKMARK;

    id: number;
    name: string;
    category: string;
    descr: string;
    location: any;
    type: BookmarkType;

    getTypeName():string {
        return this.type.getName();
    }
}