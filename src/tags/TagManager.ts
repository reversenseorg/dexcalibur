
import DexcaliburProject from "../DexcaliburProject.js";

import {newTagPresets, TAG_CATEGORY_PRESETS} from "./common/TagPresets.js";

import {IDatabase, IDbCollection, IStringIndex, Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../core/IStringIndex.js";
import {newLogger} from "../Logger.js";
import {ProjectDatabase} from "../database/ProjectDatabase.js";
import type = Mocha.utils.type;

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

    _db:ProjectDatabase;

    _uuidMap:TagMap = {};
    _nameMap:TagNameMap = {};
    _offset = 0;
    _categories:IDbCollection = null;
    _tags:IDbCollection = null;

    cache:TagCategoryMap = {};
    private _tagsCache:Tag[] = [];

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
    private async _loadPresets():Promise<void>{

        Logger.debug("[TAG MANAGER] Loading presets ...");
        const presets = newTagPresets();
        let vTagCategory:TagCategory;
        let cached:string[] = [];
        let tags:Tag[] = [];

        for(let i=0; i<presets.length; i++){
            vTagCategory = presets[i] ;

            // if empty, category has not been loaded
            if(this.cache[vTagCategory.getUID()]==null){
                // save category
                await this.addCategory(vTagCategory);
                this.cache[vTagCategory.getUID()] = vTagCategory;

                // save children tags
                tags = vTagCategory.getTags();
                for(let k=0;k<tags.length;k++){
                    this._tags.asyncUpdateEntry(tags[k],{upsert:true});
                }
            }else{
                this.cache[vTagCategory.getUID()].getTags().map( x => {
                    cached.push(x.getUID());
                });
            }

            // append to cache only tags not existing in DB
            tags = vTagCategory.getTags();
            let update = false;
            for(let i=0; i<tags.length; i++){
                if(cached.indexOf(tags[i].getUID())==-1){
                    this.importTag(tags[i]);
                    this.cache[vTagCategory.getUID()].addTag(tags[i]);
                }
            }
        }

        Logger.debug("[TAG MANAGER] Preset tags loaded");
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
            this._tags.asyncUpdateEntry(pTag, {upsert:true });
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
    async refreshCache():Promise<void>{

        // retrieve from DB
        const cats:IStringIndex<TagCategory> = {};
        const categories = await this._categories.getAsList();
        const tags = await this._tags.getAsList();

        categories.map( (vTagCat:TagCategory)=>{
            cats[vTagCat.getUID()] = vTagCat;
        });


        tags.map( (vTag:Tag)=>{

            if(vTag.category != null){

                // fixing broken relationship
                if((typeof vTag.category)==='string'){
                    vTag.category = cats[vTag.category as any];
                }

                if(cats[vTag.category.getUID()]!=null){
                    cats[vTag.category.getUID()].addTag(vTag);
                }
            }

            this.importTag(vTag);
        });


        this.cache = cats;

        // load presets
        await this._loadPresets();

        // reset tag list
        this._tagsCache = [];
        for(let k in this.cache){
            this._tagsCache = this._tagsCache.concat(this.cache[k].getTags());
        }

        Logger.info(`[TAG MANAGER] Cache Initialized/Refreshed : ${Object.keys(cats).length} categories, ${tags.length} tags `)
    }

    /**
     *
     */
    async init(pDb:ProjectDatabase):Promise<void>{
        Logger.debug("[TAG MANAGER] Initializing ...")
        this._db = pDb;

        this._categories = this._db.getCollectionOf(TagCategory.TYPE.getType());
        this._tags = this._db.getCollectionOf(Tag.TYPE.getType());

        await this.refreshCache();


        Logger.debug("[TAG MANAGER] Initialized");
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


    async getTags(pRefresh = false):Promise<Tag[]> {
        if(pRefresh){
            await this.refreshCache();
        }

        return this._tagsCache;
    }


    async getCategory( pUID:string ):Promise<Tag> {
        return this._categories.asyncGetEntry(pUID);
    }

    async getCategories():Promise<TagCategory[]> {
        return this._categories.getAsList();
    }

    async searchCategoryByName( pName:string ):Promise<TagCategory[]> {
        const cats:TagCategory[] = [];
        const all:TagCategory[] = await this._categories.getAsList();

        // todo replace by native seach
        all.map( (vCat:TagCategory)=>{
            if(vCat.name==pName){
                cats.push(vCat);
            }
        })
        return cats;
    }

    async getCategoryByName( pUID:string ):Promise<Tag> {
        return await this._categories.search({ name:pUID });
    }


    /**
     * Create only if missing
     *
     * @param pTagCategory
     */
    async addCategory( pTagCategory:TagCategory):Promise<void>{

        const res = await this._categories.asyncUpdateEntry(pTagCategory, {upsert:true});
        console.log("TAG MANAGER > addCategory > "+pTagCategory.getUID(), res);
        this.cache[pTagCategory.getUID()] = pTagCategory;
    }


    async updateCategory( pTagCategory:TagCategory):Promise<void>{

        const res = await this._categories.asyncUpdateEntry(pTagCategory, {upsert:true});
        console.log("TAG MANAGER > updateCategory ", res);

        const tags = pTagCategory.getTags();
        for(let i=0; i<tags.length; i++){
            await this._tags.asyncUpdateEntry(tags[i], {upsert:true});
        }
    }

    /**
     * To save changes
     */
    save():void {
        console.log("TAG MANAGER > save ");
        /*
        this._categories.map( (vCat:TagCategory)=>{
            this._categories.updateEntry(vCat);
        });

        this._tags.map( (vTag:Tag)=>{
            this._tags.updateEntry(vTag);
        });*/
    }
}