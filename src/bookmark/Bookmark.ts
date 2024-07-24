import {BookmarkType} from "./BookmarkType.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;


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