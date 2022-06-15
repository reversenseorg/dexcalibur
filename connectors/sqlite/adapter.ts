'use strict';

import * as _path_ from "path";
import * as _fs_ from "fs";
import * as _sqlite_ from "better-sqlite3";
import DexcaliburProject from "../../src/DexcaliburProject";
import { SqliteDb, Index, Collection } from "./SqliteDb";
import {IDatabase, IDatabaseAdapter} from "../../src/persist/orm/DbAbstraction";
import * as Log from "../../src/Logger";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const TYPE  = 'sqlite';
const NAME = 'Sqlite';
const DESC = 'Data are stored in a sqlite DB.';

interface DatabaseInstanceList {
    [name :string] :IDatabase
}

interface SqliteDatabaseInstanceList {
    [name :string] :SqliteDb
}


/**
 * Represents a SQLite file-based database
 *
 * @author Georges-B. MICHEL
 * @class
 */
export default class SqliteConnector implements IDatabaseAdapter
{
    static SHARED:SqliteDatabaseInstanceList = {};

    ctx:DexcaliburProject = null;
    options:any = null;
    type:string = TYPE;
    db:SqliteDb = null;
    tmpDbs:DatabaseInstanceList = {};

    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {SqliteDb}
     * @constructor
     */
    constructor(pContext:DexcaliburProject=null, pOptions:any = null){
        this.ctx = pContext;
        this.options = pOptions;
    }


    getType(): string {
        return this.type;
    }

    /**
     * empty
     * @returns {boolean}
     */
    exists(pPath:string = null):boolean{
        return _fs_.existsSync(pPath)
    }

    /**
     * empty
     * @returns {boolean}
     */
    create(pPath:string = null, pShared = false):boolean{
        //try{
            this.db = new SqliteDb(pPath, this);
            this.db.install();

            if(pShared){
                SqliteConnector.SHARED[pPath] = this.db;
            }

            return true;
        /*}catch(err){
            Logger.error(err.message+"\n"+err.stack);

            this.db = null;
            return false;
        }*/
    }

    /**
     * empty
     *
     * @method
     */
    connect( pPath:string, pShared = false):SqliteDb{

        if(SqliteConnector.SHARED[pPath]!=null && pShared){
            return SqliteConnector.SHARED[pPath] as SqliteDb;
        }

        Logger.raw("=============== START CONNECTING TO SQLITE ("+pPath+")....."+_fs_.existsSync(pPath))
        if(_fs_.existsSync(pPath)){
            this.db = new SqliteDb(pPath, this);
        }else{
            Logger.info("Creating new db : "+pPath);
            this.create(pPath);
        }


        if(pShared){
            SqliteConnector.SHARED[pPath] =  this.db;
        }

        // load indexes
        this.db.loadIndexes() ;

        Logger.raw("=============== SQLITE IS READY  .....")
        return this.db;
    }


    /**
     * empty
     *
     * @method
     */
    close():boolean{
        // nothing to do
        return true;
    }

    getIndex( pName:string):Index{
        return this.db.getIndex(pName);
    }


    getCollection( pName:string):Collection{
        return this.db.getCollection(pName, null);
    }

    newTemporaryDb(pPath: string): IDatabase {
        let p:string;
        if(!_path_.isAbsolute(pPath) || !_fs_.existsSync(pPath)){
            p = _path_.join(this.ctx.getWorkspace().getPath(),pPath);
        }else{
            p = pPath;
        }

        const dbname = _path_.basename(pPath);

        this.tmpDbs[dbname] = new SqliteDb(p, this);

        return this.tmpDbs[dbname];
    }

    clearTemporaryDb( pName:string):void{
        // todo : wipe or delete db
        this.tmpDbs[pName] = null;
    }

    getDB(pPath:string = null):IDatabase{
        if(pPath != null){
            return SqliteConnector.SHARED[pPath];
        }else{
            return this.db;
        }
    }
    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     * @method
     * @static
     */
    static getProperties():any {
        let o:any = {};

        o.type = TYPE;
        o.name = NAME;
        o.description = DESC;

        return o;
    }

    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     * @method
     */
    toJsonObject():any{
        return SqliteConnector.getProperties();
    }
}
