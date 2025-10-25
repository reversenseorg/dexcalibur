import {MongodbDb} from "@dexcalibur/dexcalibur-orm-mongodb";
import {FileManager} from "./FileManager.js";


export interface IFileDatabase {
    getDb():MongodbDb;
    getFileManager():FileManager;
}

export interface PageSort {
    field: string,
    sort: "asc" | "desc";
}

export interface Page {
    offset:number;
    size:number;
    sort?:PageSort[];
}