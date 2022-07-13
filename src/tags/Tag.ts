import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";
import {NodeProperty} from "../persist/orm/NodeProperty";
import {DbDataType, DbKeyType} from "../persist/orm/DbAbstraction";
import {INode} from "../INode";


export interface TagMap {
    [hashCode:number] :Tag
}

/**
 * Tags are a way to attach properties to nodes at runtime
 *
 * @class
 */
export class Tag implements INode
{
    static TYPE:NodeType = new NodeType(
        'tag',
        NodeInternalType.TAG_CATEGORY,
        [
            (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty('label')).type(DbDataType.STRING).notnull(),
            (new NodeProperty('name')).type(DbDataType.STRING),
            (new NodeProperty('descr')).type(DbDataType.STRING)
        ]
    );
    __:NodeInternalType = NodeInternalType.TAG;

    _:number;

    _uid:string;
    descr:string;
    label:string;
    name:string;

    child:Tag[]; // ??

    constructor( pUID:number, pLabel:string  ) {
        this.label = pLabel;
        this._ = pUID;
    }


    appendTag( pTag:Tag):void {
        this.child[pTag.hashCode] = pTag;
    }

    getChildren():TagMap {
        return this.child;
    }

    get hashCode():number {
        return this._;
    }

    getUID(): string {
        return this._uid;
    }

    /**
     *
     */
    toJsonObject():any{
        const o:any = new Object();
        o._uid = this._uid;
        o.name = this.name;
        o.label = this.label;
        o.descr = this.descr;

        return o;
    }


}
Tag.TYPE.builder(Tag);