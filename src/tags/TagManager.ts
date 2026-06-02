
import {newTagPresets, } from "./common/TagPresets.js";

import { IDbCollection, INode, IStringIndex, Tag, TagCategory, TagUUID} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../core/IStringIndex.js";
import {newLogger} from "../Logger.js";
import {ProjectDatabase} from "../database/ProjectDatabase.js";
import { SearchRequestCondition} from "../search/SearchRequestCondition.js";
import {INodeRef} from "../INode.js";

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

export interface SearchOptions {
    regexp: boolean;
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

    ready = false;

    _ctrEdit = 0;

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
     * Load preset categories of tags.
     *
     * Must be called one time per project
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
                    await this._tags.asyncUpdateEntry(tags[k],{upsert:true});
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
                    await this.importTag(tags[i]);
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
    async importTag(pTag:Tag):Promise<void> {
        let uuid = pTag._;

        if(uuid==null){
            pTag.setUUID(this.generateUUID());
            uuid = pTag.getUUID();
            await this._tags.asyncUpdateEntry(pTag, {upsert:true });
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
    async importCategory(pTagCat:TagCategory):Promise<void> {

        let cat:TagCategory = await this.getCategoryByName(pTagCat.name);
        let freshTags:Tag[] = [];

        if(cat == null){
            cat = await this.addCategory(pTagCat);

            /*
            if(cat==null){
                // get freshly created instance
                cat = await this.getCategoryByName(pTagCat.name);
                console.log("importCategory > getCategoryByName > ",pTagCat.name,cat);
            }*/
        }

        // push tags in the right category instance
        pTagCat.getTags().map(x => {
            // it replace pTagCat<->x relation by cat<->x
            // it is necessary to keep TagCategory and Tag synchronized
            cat.addTag(x);
            freshTags.push(x);
        });

        //const tags = pTagCat.getTags();
        for(let i=0; i<freshTags.length; i++){
            await  this.importTag(freshTags[i]);
        }
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


        let vTag:Tag;
        for(let i=0; i<tags.length; i++){
            vTag = tags[i];
            if(vTag.category != null){

                // fixing broken relationship
                if((typeof vTag.category)==='string'){
                    vTag.category = cats[vTag.category as any];
                }
                if(cats[vTag.category.getUID()]!=null){
                    cats[vTag.category.getUID()].addTag(vTag);
                }
            }
            await this.importTag(vTag);
        }

        this.cache = cats;

        // reset tag list
        this._resetTagList();

        Logger.info(`[TAG MANAGER] Cache Initialized/Refreshed : ${Object.keys(this.cache).length} categories, ${this._tagsCache.length} tags `)
    }

    /**
     * To recreate cache of all tags
     *
     * @private
     */
    private _resetTagList(){
        this._tagsCache = [];
        for(let k in this.cache){
            this._tagsCache = this._tagsCache.concat(this.cache[k].getTags());
        }
    }

    /**
     * To init tag manager by importing tag + cataegory into cache
     * And optionnally create presets tags
     *
     * @method
     */
    async init(pDb:ProjectDatabase, pNewProject = false):Promise<void>{
        Logger.debug("[TAG MANAGER] Initializing ...")
        this._db = pDb;

        this._categories = this._db.getCollectionOf(TagCategory.TYPE.getType());
        this._tags = this._db.getCollectionOf(Tag.TYPE.getType());

        await this.refreshCache();

        // if it is the first time the project initializes its tag manager
        // then load presets tags & category, and update cache
        if(pNewProject){
            // load presets
            await this._loadPresets();
            // reset cache with fresh tags
            this._resetTagList();
            // print info
            Logger.info(`[TAG MANAGER] Cache created : ${Object.keys(this.cache).length} categories, ${this._tagsCache.length} tags `)
        }else{
            // update tags, if new builtin tag or category has been added
            await this._loadPresets();
        }

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


    async getCategory( pUID:string ):Promise<TagCategory> {
        return this._categories.asyncGetEntry(pUID);
    }

    async getCategories():Promise<TagCategory[]> {
        return this._categories.getAsList();
    }

    /**
     *
     * @param pFilter
     * @param pOptions
     */
    async searchTagsFromCache(pFilter:any, pOptions:SearchOptions = {regexp:false}):Promise<Tag[]> {

        let filtered:Tag[] = [];
        let criterias = Object.keys(pFilter);
        let i=0;
        let re:RegExp;
        let ctags:Tag[] = [];
        let cats:TagCategory[] = [];

        while(i<criterias.length){
            switch (criterias[i]){
                case "category":
                    if(pOptions.regexp) re = new RegExp(pFilter.category);
                    if(i==0){
                        // walk over cache
                        for(let k in this.cache){
                            if((pOptions.regexp && k.match(re)) || (k===pFilter.category)){
                                filtered = filtered.concat(this.cache[k].getTags());
                            }
                        }
                    }else{
                        filtered = filtered.filter(x => {
                            return (x.category!=null && ((pOptions.regexp && x.category.getUID().match(re))
                                || (x.category.getUID()===pFilter.category)));
                        });
                    }
                    if(filtered.length==0) return [];
                    break;
                default:
                    for(let k in this.cache){
                        ctags = (i==0 ? this.cache[k].getTags() : filtered);
                        if(pOptions.regexp){
                            re = new RegExp(pFilter[criterias[i]]);
                            ctags.map(x => {
                                if(x[criterias[i]]!=null && x[criterias[i]].match(re)){
                                    filtered.push(x);
                                }
                            });
                        }else{
                            ctags.map(x => {
                                if(x[criterias[i]]===pFilter[criterias[i]]){
                                    filtered.push(x);
                                }
                            });
                        }
                    }
                    break;
            }
            i++;
        }

        return filtered;
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

    /**
     * To search a category by its unique name
     *
     * @param pUID
     */
    async getCategoryByName( pUID:string ):Promise<Nullable<TagCategory>> {
        try{
            const res = await this._categories.search({ name:pUID });
            if(res.length>0){
                return res[0];
            }else
                return null;
        }catch (e){
            Logger.error(`[TAG MANAGER][getCategoryByName] A fatal error occurred while retrieving [name=${pUID}] : `+e.message);
        }
    }


    /**
     * Create only if missing
     *
     * @param pTagCategory
     */
    async addCategory( pTagCategory:TagCategory):Promise<TagCategory>{

        const res = await this._categories.asyncUpdateEntry(pTagCategory, {upsert:true});
        Logger.debug("TAG MANAGER > addCategory > "+pTagCategory.getUID(), res);
        this.cache[pTagCategory.getUID()] = pTagCategory;
        return pTagCategory;
    }


    async updateCategory( pTagCategory:TagCategory):Promise<void>{

        const res = await this._categories.asyncUpdateEntry(pTagCategory, {upsert:true});
        Logger.debug("TAG MANAGER > updateCategory ", res);

        const tags = pTagCategory.getTags();
        for(let i=0; i<tags.length; i++){
            await this._tags.asyncUpdateEntry(tags[i], {upsert:true});
        }
    }

    async updateTag( pTag:Tag):Promise<void>{
        await this._tags.asyncUpdateEntry(pTag, {upsert:true});
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

    async searchTagsByRegexp(pUidPattern:string):Promise<TagUUID[]>{
        const tags:Tag[] = await this._tags.search({
            filter:{
                _uid: {
                    $regex: pUidPattern
                }
            }
        },{merlin:false, raw:true});

        return tags.map(x => x.getUUID());
    }

    /**
     *
     * @param pUidPattern
     */
    async searchTags(pUidPattern:string):Promise<TagUUID[]>{

        if(pUidPattern[0]==SearchRequestCondition.REGEXP_DELIMITER_TOKEN &&
            pUidPattern[pUidPattern.length-1]==SearchRequestCondition.REGEXP_DELIMITER_TOKEN){

            return await this.searchTagsByRegexp(pUidPattern.substring(1,pUidPattern.length-2));
        }
        else if(pUidPattern.indexOf(SearchRequestCondition.WILDCARD)>-1){
            return await this.searchTagsByRegexp(
                pUidPattern.replaceAll(".","\\.").replaceAll(".*","..*")
            )
        }
        else {
            const tags:Tag[] = await this._tags.search({
                filter:{
                    _uid:  pUidPattern
                }
            },{merlin:false, raw:true});

            return tags.map(x => x.getUUID());
        }
    }

    /**
     * To increment tag counter
     * @method
     */
    incTag(pTag:Tag, pObj:INode|INodeRef):void {
         if(pTag==null) throw new Error("Tag '"+pTag+"' not found.");

        if(pTag.extra._occ==null){
            pTag.extra._occ = {};
        }
        pTag.extra._occ[pObj.__] = (pTag.extra._occ[pObj.__] || 0) + 1;
        this._ctrEdit++;
    }

    annotate(pTag:Tag|string, pObj:INode|INode[]):void {
        const tag = (typeof pTag === 'string' ? this.getTag(pTag) : pTag);
        if(tag==null) throw new Error("Tag '"+pTag+"' not found.");

        if(Array.isArray(pObj)){
            (pObj as INode[]).map( x => {
                if(x!=null && x.addTag!=null){
                    x.addTag(tag);
                    this.incTag(tag, x);
                }
            })
        }else if(pObj!=null){
            if(pObj["addTag"]==null){
                throw new Error("Tag '"+tag.name+"' cannot be added to object because object is not a node.");
            }else{
                pObj["addTag"](tag);
            }

            this.incTag(tag, pObj);
        }
    }

    /**
     * To increment tag counter
     * @method
     */
    decTag(pTag:Tag, pObj:INode|INodeRef):void {
        if(pTag.extra._occ==null){
            pTag.extra._occ = {};
        }
        pTag.extra._occ[pObj.__] = (pTag.extra._occ[pObj.__] || 0) - 1;
        this._ctrEdit++;
    }

    count(pTag:Tag, pObj:INode|INodeRef):number {
        if(pTag.extra._occ==null) return 0;
        return pTag.extra._occ[pObj.__] || 0;
    }
}