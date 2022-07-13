
import DexcaliburProject from "../DexcaliburProject";
import {Tag} from "./Tag";
import {IDatabase, IDbCollection} from "../persist/orm/DbAbstraction";
import TagCategory from "./TagCategory";

export interface TagMap {
    [num:number] :Tag
}

export class TagManager {

    _db:IDatabase;

    _map:TagMap = {};

    _categories:IDbCollection = null;

    _tags:IDbCollection = null;

    constructor(pContext:DexcaliburProject) {
        this._db = pContext.connector.getDB();
    }

    /**
     *
     */
    init(){
        this._categories = this._db.getCollectionOf(TagCategory.TYPE);
        this._tags = this._db.getCollectionOf(Tag.TYPE);
    }

    hasCategory(pCategoryUID:string){
        return this._categories.hasEntry(pCategoryUID);
    }


    getTag( pUID:string ):Tag {
        return this._tags.getEntry(pUID);
    }

    getCategory( pUID:string ):Tag {
        return this._categories.getEntry(pUID);
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

}