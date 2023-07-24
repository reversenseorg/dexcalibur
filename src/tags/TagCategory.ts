import {NodeType} from "../persist/orm/NodeType.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {Tag} from "./Tag.js";
import {INode} from "../INode.js";
import {CoreDebug} from "../core/CoreDebug.js";

/**
 * Tag categories are conceptuals, and are only used to help to manage tags
 *
 * Tags are grouped by thema
 *
 * @class
 */
export class TagCategory implements INode
{
    static TYPE:NodeType = new NodeType(
        'tag_category',
        NodeInternalType.TAG_CATEGORY,
        []
    );
    __:NodeInternalType = NodeInternalType.TAG_CATEGORY;

    /**
     * Category name
     */
    name:string = null;
    descr:string = null;
    tags:number[] = [];

    private _tags:Tag[] = [];

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

    /**
     * Add a tag to the category
     * @param pTag
     */
    addTag(pTag:Tag){
        if(this._tags.indexOf(pTag)==-1){
            pTag.setFQN(this.getUID()+'.'+pTag.name);
            pTag.category = this;
            this._tags.push(pTag);
        }
    }

    getTags():Tag[]{
        return this._tags;
    }

    toJsonObject():any{
        const o:any = new Object();
        o.name = this.name;
        o.descr = this.descr;
        o._tags = [];
        this._tags.map( (vTag:Tag) => {
            o._tags.push(vTag.toJsonObject());
        });
        CoreDebug.checkJsonSerialize(o,"TagCategory");
        return o;
    }

    /**
     *
     */
    getUID(): string {
        return this.name;
    }
}
TagCategory.TYPE.builder(TagCategory);