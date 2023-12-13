
import DexcaliburProject from "../DexcaliburProject.js";

import {newTagPresets, TAG_CATEGORY_PRESETS} from "./common/TagPresets.js";

import {IDatabase, IDbCollection, IStringIndex, Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../core/IStringIndex.js";
import {newLogger} from "../Logger.js";

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


const Logger = newLogger();



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

    generateUUID():number {
        let uuid=-1;
        do{
            uuid = Math.round(Math.random()*10000);
        }while(this._uuidMap[uuid]!=null);
        return uuid;
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

        newTagPresets().map( (vTagCategory:TagCategory)=>{

            let cached:string[] = [];

            // if empty, category has not been loaded
            if(this.cache[vTagCategory.getUID()]==null){
                // save category
                this.addCategory(vTagCategory);
                this.cache[vTagCategory.getUID()] = vTagCategory;

                // save children tags
                vTagCategory.getTags().map( vTag => {
                    this._tags.addEntry(vTag.getUID(), vTag);
                });
            }else{
                this.cache[vTagCategory.getUID()].getTags().map( x => {
                    cached.push(x.getUID());
                });
            }

            // append to cache only tags not existing in DB
            const tags = vTagCategory.getTags();
            let update = false;
            for(let i=0; i<tags.length; i++){
                if(cached.indexOf(tags[i].getUID())==-1){

                    this.importTag(tags[i]);
                    // pick UUID
                    //tags[i].setUUID(this.generateUUID());

                    // save tag
                    this.cache[vTagCategory.getUID()].addTag(tags[i]);
                    //this._tags.addEntry(tags[i].getUID(), tags[i]);
                }
            }
        });
    }

    /**
     * To import Tag instance into current context.
     *
     * If the UUID is undefined, it ll be generated. The UUID is inside a project.
     *
     * The tag is appended to several map used to resolve Tag from UUID (number)
     *
     * @param {Tag} pTag Tag instance
     * @method
     */
    importTag(pTag:Tag):void {
        let uuid = pTag.getUUID();

        if(uuid==null){
            pTag.setUUID(this.generateUUID());
            uuid = pTag.getUUID();
            this._tags.updateEntry(pTag);
        }

        this._uuidMap[uuid] = pTag;
        this._nameMap[pTag.getUID()] = uuid;
    }

    /**
     * To import a category and its tags
     *
     * @param {TagCategory} pTagCat The tag category to import
     * @method
     */
    importCategory(pTagCat:TagCategory):void {
        this.addCategory(pTagCat)

        pTagCat.getTags().map(x => {
            this.importTag(x);
        })
    }

    /**
     *
     */
    init(pContext:DexcaliburProject){
        this._db = pContext.getDB();
        this._categories = this._db.getCollectionOf(TagCategory.TYPE);
        this._tags = this._db.getCollectionOf(Tag.TYPE);

        // retrieve from DB
        const cats:IStringIndex<TagCategory> = {};
        this._categories.map( (vOffset:number, vTagCat:TagCategory)=>{
            cats[vTagCat.getUID()] = vTagCat;
        });

        this._tags.map( (vOffset:number, vTag:Tag)=>{

            this.importTag(vTag);

            if(vTag.category != null){

                if(cats[vTag.category.getUID()]!=null){
                    cats[vTag.category.getUID()].addTag(vTag);
                }

                //vTag.category.addTag(vTag);
               //  this.cache[vTag.category.getUID()] = cats[vTag.category.getUID()]; //vTag.category;
            }

            //if(uuid > this._offset) this._offset = uuid+1;
        });


        this.cache = cats;

        // load presets
        this._loadPresets();

        console.log(this.cache);
    }

    hasCategory(pCategoryUID:string){
        return this._categories.hasEntry(pCategoryUID);
    }


    getTag( pUID:string ):Nullable<Tag> {
        if(this._nameMap[pUID]!=null){
            return this._uuidMap[this._nameMap[pUID]];
        }else{
            Logger.error("[TAG MANAGER][getTag] Tag '"+pUID+"' not exists.");
            // TODO : search closest category from UID, create Tag, update DB and return it;
            return null;
        }
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
     *
     * @param pTagCategory
     */
    addCategory( pTagCategory:TagCategory){

        if(!this._categories.hasEntry(pTagCategory.getUID())){
            this._categories.addEntry(pTagCategory.getUID(), pTagCategory);
        }else{
            this._categories.updateEntry(pTagCategory);
        }

        this.cache[pTagCategory.getUID()] = pTagCategory;
    }


    updateCategory( pTagCategory:TagCategory){

       if(!this._categories.hasEntry(pTagCategory.getUID())){
           this._categories.addEntry(pTagCategory.getUID(), pTagCategory);
           this.cache[pTagCategory.getUID()] = pTagCategory;
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

    /**
     * To save changes
     */
    save(){
        this._categories.map( (vCat:TagCategory)=>{
            this._categories.updateEntry(vCat);
        });

        this._tags.map( (vTag:Tag)=>{
            this._tags.updateEntry(vTag);
        });
    }
}