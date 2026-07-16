'use strict';


import DexcaliburProject from "../../src/DexcaliburProject.js";
import { InMemoryDb, Index, Collection } from "./InMemoryDb.js";
import {IDatabase, IDatabaseAdapter, IDbCollection, IDbIndex} from "@reversense/dexcalibur-orm";

const TYPE  = 'inmemory';
const NAME = 'InMemory';
const DESC = 'Data are stored in memory. Only saved data can be restored (such as intercepted bytecode, DEX file loaded dynamically and more)';

interface DatabaseInstanceList {
    [name :string] :IDatabase
}

/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
export default class InMemoryConnector implements IDatabaseAdapter
{
    static UUID = TYPE;

    ctx:DexcaliburProject = null;
    options:any = null;
    type:string = TYPE;
    db:InMemoryDb = null;
    tmpDbs:DatabaseInstanceList = {};

    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {InMemoryDb}
     * @constructor
     */
    constructor(pContext:DexcaliburProject=null, pOptions:any = null){
        this.ctx = pContext;
        this.options = pOptions;
    }

    getSubConnector(pName:string):IDatabaseAdapter|null{
        // not supported
        return null;
    }

    /**
     * empty
     * @returns {boolean}
     */
    exists():boolean{
        // nothing to do
        return true;
    }

    /**
     * empty
     * @returns {boolean}
     */
    create():boolean{
        // nothing to do
        return true;
    }

    /**
     * empty
     *
     * @method
     */
    connect( pOptions:any  = null):boolean{
        // nothing to do
        this.db = new InMemoryDb(this);
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

    getIndex( pName:string):IDbIndex{
        return this.db.getIndex(pName);
    }


    getCollection( pName:string):IDbCollection{
        return this.db.getCollection(pName, null);
    }

    newTemporaryDb(pName: string): IDatabase {

        this.tmpDbs[pName] = new InMemoryDb(this);

        return this.tmpDbs[pName];
    }

    clearTemporaryDb( pName:string):void{
        this.tmpDbs[pName] = null;
    }

    getDB():IDatabase{
        return this.db;
    }

    getType(): string {
        return this.type;
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
        return InMemoryConnector.getProperties();
    }
}
