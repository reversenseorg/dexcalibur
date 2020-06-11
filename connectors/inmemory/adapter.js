'use strict';


const InMemoryDb = require('./InMemoryDb');

const TYPE  = 'inmemory';
const NAME = 'InMemory';
const DESC = 'Data are stored in memory. Only saved data can be restored (such as intercepted bytecode, DEX file loaded dynamically and more)';

/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
class InMemoryConnector
{
    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {InMemoryDb}
     * @constructor
     */
    constructor(pContext=null, pOptions = null){
        this.ctx = pContext;
        this.options = pOptions;

        this.type = TYPE;

        this.db = null;
    }

    /**
     * empty
     * @returns {boolean}
     */
    exists(){
        // nothing to do
        return true;
    }

    /**
     * empty
     * @returns {boolean}
     */
    create(){
        // nothing to do
        return true;
    }

    /**
     * empty
     *
     * @method
     */
    connect(){
        // nothing to do
        this.db = new InMemoryDb.InMemoryDb(this);
        return true;
    }


    /**
     * empty
     *
     * @method
     */
    close(){
        // nothing to do
        return true;
    }

    getIndex( pName){
        return this.db.getIndex(pName);
    }


    getCollection( pName){
        return this.db.getCollection(pName);
    }

    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     * @method
     * @static
     */
    static getProperties() {
        let o = {};

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
    toJsonObject(){
        return InMemoryConnector.getProperties();
    }
}

module.exports = InMemoryConnector;