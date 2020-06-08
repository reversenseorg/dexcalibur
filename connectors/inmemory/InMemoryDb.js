'use strict';


const InMemoryDBIndex = require('./InMemoryDbIndex');
const InMemoryDBCollection = require('./InMemoryDbCollection');

/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
class InMemoryDb
{
    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {InMemoryDb}
     * @constructor
     */
    constructor(pConnector = null){
        this.conn = pConnector;
        this.indexes = {};
        this.sizes = {};
    }


    /**
     * To create a new collection into current DB
     *
     * @param {String} name Name of the collection
     * @method
     */
    newCollection(name){
        if(this.indexes[name]!=null) throw new Error("A collection is already set for the given name");

        this.indexes[name] = new InMemoryDBCollection(name);
    }

    /**
     * To create a new index into current DB
     *
     * @param {String} name Name of the index
     * @method
     */
    newIndex(name){
        if(this.indexes[name] != undefined) throw new Error("An index already exists for the given name");

        this.indexes[name] = new InMemoryDBIndex(name);
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getIndex(name){
        if(this.indexes.hasOwnProperty(name)===false){
            this.newIndex(name);
        }
        return this.indexes[name];
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getCollection(name){
        if(this.indexes.hasOwnProperty(name)===false){
            this.newCollection(name);
        }
        return this.indexes[name];
    }

    /**
     * To transform current DB into a simple object ready to be serialized
     *
     * @returns {Object}
     */
    toJsonObject(){
        let o= {};

        o.indexes = {};
        for(let i in this.indexes){
            o.indexes[i] = this.indexes[i].toJsonObject();
            if(this.indexes[i] instanceof InMemoryDBIndex)
                this.indexes[i].__type = "Index";
            else
                this.indexes[i].__type = "Collection";
        }

        return o;
    }

    // ============ serialize ============

    isSerializable(){
        let ret=true;
        for(let i in this.indexes){
            ret &= this.indexes[i].isSerializable();
        }
        return ret;
    }

    unserialize(obj){
        for(let i in obj.indexes){
            if(obj.indexes[i].__type === "Index"){
                this.indexes[i] = InMemoryDBIndex.unserialize(obj.indexes[i]);
            }else{
                this.indexes[i] = InMemoryDBCollection.unserialize(obj.indexes[i]);
            }
        }
    }

    serialize(){
        let o=new Object();

        o.indexes = {};
        for(let i in this.indexes){
            if(typeof this.indexes[i].isSerializable === 'function')
                o.indexes[i] = this.indexes[i].serialize();
            else if(typeof this.indexes[i].toJsonObject === 'function')
                o.indexes[i] = this.indexes[i].toJsonObject();
            else
                o.indexes[i] = this.indexes[i];
        }

        return o;
    }
}

module.exports = {
    InMemoryDb: InMemoryDb,
    Index: InMemoryDBIndex,
    Collection: InMemoryDBCollection
};