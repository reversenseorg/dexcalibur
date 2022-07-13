import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";
import {Tag} from "./Tag";
import {NodeProperty} from "../persist/orm/NodeProperty";
import {DbDataType, DbKeyType} from "../persist/orm/DbAbstraction";
import {UserAccount} from "../user/UserAccount";
import {INode} from "../INode";

/**
 * Tag categories are conceptuals, and are only used to help to manage tags
 *
 * Tags are grouped by thema
 *
 * @class
 */
export default class TagCategory implements INode
{
    static TYPE:NodeType = new NodeType(
        'tag_category',
        NodeInternalType.TAG_CATEGORY,
        [
            (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty('name')).type(DbDataType.STRING).notnull(),
            (new NodeProperty('descr')).type(DbDataType.STRING),
            (new NodeProperty('tags')).multiple(Tag.TYPE).volatile(),
        ]
    );
    __:NodeInternalType = NodeInternalType.TAG_CATEGORY;


    _uid:string = null;
    /**
     * Category name
     */
    name:string = null;
    descr:string = null;
    taglist:string[] = [];
    tags:Tag[] = [];

    /**
     *
     * @param pConfig
     * @constructor
     */
    constructor(pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];

        }
    }
    /*
    constructor(name:string, taglist:string[]){
        this.name = name;
        this.taglist = taglist;
    }

    addTag(tag:string){
        if(this.taglist.indexOf(tag)==-1)
            this.taglist.push(tag);
    }
    */


    addTag(pTag:Tag){
        if(this.tags.indexOf(pTag)==-1)
            this.tags.push(pTag);
    }

    getTags():Tag[]{
        return this.tags;
    }

    toJsonObject():any{
        const o:any = new Object();
        o.name = this.name;
        o.descr = this.descr;
        o.tags = [];
        this.tags.map( (vTag:Tag) => {
            o.tags.push(vTag.toJsonObject());
        })
        return o;
    }

    /**
     *
     */
    getUID(): string {
        return this._uid;
    }
}
TagCategory.TYPE.builder(TagCategory);