import {BookmarkType} from "./BookmarkType.js";
import {Bookmark} from "./Bookmark.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {IDatabase} from "../persist/orm/DbAbstraction.js";


interface BookmarkMap {
    [id:string] :Bookmark;
}

export class BookmarkManager {

    private _ctx:DexcaliburProject = null;
    private _db:IDatabase = null;

    types: BookmarkType[];
    bookmarks: BookmarkMap;

    constructor(pProject:DexcaliburProject) {
        this._ctx = pProject;
        this._db = pProject.getDB();
    }

    newBookmarkType( pConfig:any){

    }

    newBookmark( pConfig:any){

    }


    getAllBookmarksFor( pCategoryName:string){

    }
}