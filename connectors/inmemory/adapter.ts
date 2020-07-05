'use strict';


import InMemoryDbIndex from "./InMemoryDbIndex";
import DexcaliburProject from "../../src/DexcaliburProject";
import InMemoryDb from "./InMemoryDb";
import InMemoryDbCollection from "./InMemoryDbCollection";
import {IDatabaseAdapter} from "../../src/ConnectorFactory";

const TYPE  = 'inmemory';
const NAME = 'InMemory';
const DESC = 'Data are stored in memory. Only saved data can be restored (such as intercepted bytecode, DEX file loaded dynamically and more)';

/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
export default class InMemoryConnector implements IDatabaseAdapter
{
    ctx:DexcaliburProject = null;
    options:any = null;
    type:string = TYPE;
    db:InMemoryDb = null;

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
    connect():boolean{
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

    getIndex( pName:string):InMemoryDbIndex{
        return this.db.getIndex(pName);
    }


    getCollection( pName:string):InMemoryDbCollection{
        return this.db.getCollection(pName);
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
