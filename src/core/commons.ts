import {MongodbDb} from "@dexcalibur/dexcalibur-orm-mongodb";
import {FileManager} from "./FileManager.js";


export interface IFileDatabase {
    getDb():MongodbDb;
    getFileManager():FileManager;
}