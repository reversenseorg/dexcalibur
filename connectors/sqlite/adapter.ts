'use strict';

import * as _fs_ from "fs";
import * as _sqlite_ from "better-sqlite3";
import DexcaliburProject from "../../src/DexcaliburProject";
import { SqliteDb, Index, Collection } from "./SqliteDb";
import {IDatabase, IDatabaseAdapter} from "../../src/persist/orm/DbAbstraction";

const TYPE  = 'sqlite';
const NAME = 'Sqlite';
const DESC = 'Data are stored in a sqlite DB.';

interface DatabaseInstanceList {
    [name :string] :IDatabase
}

/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
export default class SqliteConnector implements IDatabaseAdapter
{
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
    create(pPath:string = null):boolean{
        try{
            this.db = new SqliteDb(pPath, this);
            this.db.install();
            return true;
        }catch(err){
            this.db = null;
            return false;
        }
    }

    /**
     * empty
     *
     * @method
     */
    connect( pPath:string):SqliteDb{
        // nothing to do
        if(_fs_.existsSync(pPath)){
            this.db = new SqliteDb(pPath, this);
        }else{
            this.create(pPath);
        }

        return true;
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
        return this.db.getCollection(pName);
    }

    newTemporaryDb(pName: string): IDatabase {

        this.tmpDbs[pName] = new SqliteDb(this, pName);

        return this.tmpDbs[pName];
    }

    clearTemporaryDb( pName:string):void{
        this.tmpDbs[pName] = null;
    }

    getDB():IDatabase{
        return this.db;
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
