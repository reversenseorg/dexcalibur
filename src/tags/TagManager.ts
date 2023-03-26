
import DexcaliburProject from "../DexcaliburProject.js";
import {Tag} from "./Tag.js";
import {IDatabase, IDbCollection} from "../persist/orm/DbAbstraction.js";
import {TAG_CATEGORY_PRESETS} from "./common/TagPresets.js";
import {TagCategory} from "./TagCategory.js";

export interface TagMap {
    [num:number] :Tag
}
export interface TagNameMap {
    [name:string] :number
}
export interface TagCategoryMap {
    [name:string] :TagCategory
}
export interface TagHashMap {
    [name:string] :Tag
}



export class TagManager {

    _db:IDatabase;

    _uuidMap:TagMap = {};
    _nameMap:TagNameMap = {};
    _offset = 0;
    _categories:IDbCollection = null;
    _tags:IDbCollection = null;

    cache:TagCategoryMap = {};

    constructor() {
    }

    getFullQualifiedName( pTag:Tag):string {
        return pTag.getCategory().getUID()+'.'+pTag.name;
    }

    getTagUuidOf(pTag:Tag){
        const fqn = pTag.getFQN();

        let uuid = this._nameMap[fqn];
        if(uuid == null){
            this._uuidMap[this._offset] = pTag;
            pTag.setUUID( this._offset);
            uuid = this._offset;
            this._offset++;
        }
        return uuid;
    }


    /**
     * Load preset categories of tags
     *
     * @private
     */
    private _loadPresets(){
        TAG_CATEGORY_PRESETS.map( (vTagCategory:TagCategory)=>{
            this.addCategory(vTagCategory);
        })
    }

    /**
     *
     */
    init(pContext:DexcaliburProject){
        this._db = pContext.getDB();
        this._categories = this._db.getCollectionOf(TagCategory.TYPE);
        this._tags = this._db.getCollectionOf(Tag.TYPE);


        this._tags.map( (vOffset:number, vTag:Tag)=>{
            // construct "quick-access" indexes
            const uuid = vTag.getUUID();
            this._uuidMap[uuid] = vTag;
            this._nameMap[vTag.getUID()] = uuid;

            if(vTag.category != null){
                vTag.category.addTag(vTag);
                this.cache[vTag.category.getUID()] = vTag.category;
            }

            if(uuid > this._offset) this._offset = uuid+1;
        });

        this._loadPresets();
    }

    hasCategory(pCategoryUID:string){
        return this._categories.hasEntry(pCategoryUID);
    }


    getTag( pUID:string ):Tag {
        return this._tags.getEntry(pUID);
    }

    getTagByUUID( pUUID:number ):Tag {
        return this._uuidMap[pUUID];
    }


    getTags():Tag[] {
        return this._tags.getAsList();
    }


    getCategory( pUID:string ):Tag {
        return this._categories.getEntry(pUID);
    }

    getCategories():TagCategory[] {
        return this._categories.getAsList();
    }

    searchCategoryByName( pName:string ):TagCategory[] {
        const cats:TagCategory[] = [];
        this._categories.map( (vCat:TagCategory)=>{
            if(vCat.name==pName){
                cats.push(vCat);
            }
        })
        return cats;
    }

    getCategoryByName( pUID:string ):Tag {
        return this._categories.getEntry(pUID);
    }


    /**
     * Create only if missing
     * @param pTagCategory
     */
    addCategory( pTagCategory:TagCategory){

        if(!this._categories.hasEntry(pTagCategory.getUID())){
            this._categories.addEntry(pTagCategory.getUID(), pTagCategory);
        }

        pTagCategory.getTags().map( (vTag:Tag) => {

            if(!this._tags.hasEntry(vTag.getUID())){
                vTag.setUUID(this._offset);

                this._uuidMap[vTag.getUUID()] = vTag;
                this._nameMap[vTag.getUID()] = vTag.getUUID();
                this._offset++;

                this._tags.addEntry(vTag.getUID(), vTag);
            }
        });
    }

    updateCategory( pTagCategory:TagCategory){

       if(!this._categories.hasEntry(pTagCategory.getUID())){
           this._categories.addEntry(pTagCategory.getUID(), pTagCategory);
       }else{
           this._categories.updateEntry(pTagCategory);
       }


       pTagCategory.getTags().map( (vTag:Tag) => {
            if(!this._tags.hasEntry(vTag.getUID())){
                this._tags.addEntry(vTag.getUID(), vTag);
            }else{
                this._tags.updateEntry(vTag);
            }
       });
    }

    save(){
        this._categories.map( (vCat:TagCategory)=>{
            this._categories.updateEntry(vCat);
        });

        this._tags.map( (vTag:Tag)=>{
            this._tags.updateEntry(vTag);
        });
    }
}