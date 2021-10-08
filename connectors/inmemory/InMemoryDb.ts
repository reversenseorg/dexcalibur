/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
import DexcaliburProject from "../../src/DexcaliburProject";
import InMemoryDbCollection from "./InMemoryDbCollection";
import InMemoryDbIndex from "./InMemoryDbIndex";
import InMemoryConnector from "./adapter";
import {IDatabase} from "../../src/persist/orm/DbAbstraction";

class InMemoryDb implements IDatabase
{
    conn:InMemoryConnector = null;
    indexes:any = {};
    sizes:any = {};

    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {InMemoryDb}
     * @constructor
     */
    constructor(pConnector:InMemoryConnector = null){
        this.conn = pConnector;
        this.indexes = {};
        this.sizes = {};
    }

    getAll():any{
        return this.indexes;
    }

    /**
     * To create a new collection into current DB
     *
     * @param {String} name Name of the collection
     * @method
     */
    newCollection(name:string):InMemoryDbCollection{
        if(this.indexes[name]!=null) throw new Error("A collection is already set for the given name");

        this.indexes[name] = new InMemoryDbCollection(name);

        return this.indexes[name];
    }

    /**
     * To create a new index into current DB
     *
     * @param {String} name Name of the index
     * @method
     */
    newIndex(name:string):InMemoryDbIndex{
        if(this.indexes[name] != undefined) throw new Error("An index already exists for the given name");

        this.indexes[name] = new InMemoryDbIndex(name);

        return this.indexes[name];
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getIndex(name:string):InMemoryDbIndex{
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
    getCollection(name:string):InMemoryDbCollection{
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
    toJsonObject():any{
        let o:any= {};

        o.indexes = {};
        for(let i in this.indexes){
            o.indexes[i] = this.indexes[i].toJsonObject();
            if(this.indexes[i] instanceof InMemoryDbIndex)
                this.indexes[i].__type = "Index";
            else
                this.indexes[i].__type = "Collection";
        }

        return o;
    }

    // ============ serialize ============

    isSerializable():boolean{
        let ret:boolean=true;
        for(let i in this.indexes){
            ret = ret && this.indexes[i].isSerializable();
        }
        return ret;
    }

    unserialize(obj:any):void{
        for(let i in obj.indexes){
            if(obj.indexes[i].__type === "Index"){
                this.indexes[i] = InMemoryDbIndex.unserialize(obj.indexes[i]);
            }else{
                this.indexes[i] = InMemoryDbCollection.unserialize(obj.indexes[i]);
            }
        }
    }

    serialize():any{
        let o:any=new Object();

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

export {InMemoryDb};
export {InMemoryDbIndex as Index};
export {InMemoryDbCollection as Collection};
