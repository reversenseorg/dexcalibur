import {BookmarkType} from "./BookmarkType.js";
import {Bookmark} from "./Bookmark.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {IDatabase} from "@dexcalibur/dexcalibur-orm";
import {ProjectDatabase} from "../database/ProjectDatabase.js";


interface BookmarkMap {
    [id:string] :Bookmark;
}

export class BookmarkManager {

    private _ctx:DexcaliburProject = null;
    private _db:ProjectDatabase = null;

    types: BookmarkType[];
    bookmarks: BookmarkMap;

    constructor(pProject:DexcaliburProject) {
        this._ctx = pProject;
        this._db = pProject.getDB();
    }

    newBookmarkType( pConfig:any){
        throw new Error('Not immplemented');
    }

    newBookmark( pConfig:any){
        throw new Error('Not immplemented');

    }

    getAllBookmarksFor( pCategoryName:string){
        throw new Error('Not immplemented');

    }
}