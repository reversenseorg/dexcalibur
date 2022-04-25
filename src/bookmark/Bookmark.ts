import {BookmarkType} from "./BookmarkType";
import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";


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