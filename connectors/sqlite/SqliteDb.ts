/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
import {Database} from "better-sqlite3";
import SqliteDbCollection from "./SqliteDbCollection";
import SqliteDbIndex from "./SqliteDbIndex";
import SqliteConnector from "./adapter";
import {SqliteException} from "./SqliteException";
import {
    DbDataType,
    DbKeyType,
    DbSetMap,
    DbSetType,
    DbSizesMap,
    IDatabase,
    IDbIndex
} from "../../src/persist/orm/DbAbstraction";
import {SqliteAPI} from "./SqliteAPI";
import {DbColumnTemplate} from "../../src/persist/orm/DbColumnTemplate";
import {NodeType} from "../../src/persist/orm/NodeType";
import {NodeProperty} from "../../src/persist/orm/NodeProperty";


const METADATA_TABLE = "dxc_meta";

class SqliteDb implements IDatabase
{
    _s:SqliteAPI = null;

    name:string = null;
    path:string = null;

    conn:SqliteConnector = null;
    indexes:DbSetMap = {};
    sizes:DbSizesMap = {};

    /**
     * To create a new DB
     *
     * @param {DexcaliburProject} pContext The project associated to this database
     * @return {SqliteDb}
     * @constructor
     */
    constructor(pPath=null, pConnector:SqliteConnector ){
        this.conn = pConnector;
        this.indexes = {};
        this.sizes = {};

        this._s = new SqliteAPI( new Database(pPath));
    }

    /**
     * To prepare an new sqlite DB to be requested over this API
     *
     * 1/ Create 'internal table' to hold metadata about collection/index
     */
    install(){
        const t = this._s._getTables();
        let f = false;
        t.map( v => { if(v.name==METADATA_TABLE) f = true; })

        if(f) return;

        this._s._createTable(METADATA_TABLE, [
            (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("type")).type(DbDataType.STRING).def("Index").notnull()
        ]);
    }


    _addCollection( pCollection:SqliteDbCollection){

    }


    getAll():any{
        return this.indexes;
    }

    /**
     * To create a table with property string-based primary key into current DB
     *
     * @param {String} name Name of the collection
     * @method
     */
    newCollection(name:string, pModel:any=null):SqliteDbCollection{
        throw new SqliteException("Raw collection are not supported : columns must fixed");
    }


    /**
     * To create a table with property string-based primary key into current DB
     *
     * @param {String} name Name of the collection
     * @method
     */
    newNodeCollection(pNodeType:NodeType, pIndexName:string = null):SqliteDbCollection{
        const name:string = ( pIndexName!=null ? pIndexName : pNodeType.getName() );

        if(this.indexes[name]!=null){
            return this.indexes[name] as SqliteDbCollection;
            //throw new SqliteException("A collection is already set for the given name");
        }


        this.indexes[name] = new SqliteDbCollection(this._s, name, pNodeType);

        return this.indexes[name] as SqliteDbCollection;
    }


    /**
     * To create a table with  numeric-based primary key (id) into current DB
     *
     * @param {String} name Name of the index
     * @method
     */
    newIndex(pName:string):SqliteDbIndex{
        throw new SqliteException("Raw index are not supported : columns must fixed");
    }
    /**
     * To create a table with  numeric-based primary key (id) into current DB
     *
     * @param {String} name Name of the index
     * @method
     */
    newNodeIndex(pNodeType:NodeType, pIndexName:string = null):SqliteDbIndex{
        const name:string = ( pIndexName!=null ? pIndexName : pNodeType.getName() );

        if(this.indexes[name] != undefined){
            return this.indexes[name] as SqliteDbIndex;
            //throw new SqliteException("An index already exists for the given name");
        }

        this.indexes[name] = new SqliteDbIndex(this._s, name, pNodeType);

        return this.indexes[name] as SqliteDbIndex;
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getIndex(name:string, pTemplate:NodeType = null):SqliteDbIndex{
        if(this.indexes.hasOwnProperty(name)===false){
            this.newIndex(name);
        }

        return this.indexes[name] as SqliteDbIndex;
    }

    /**
     * To get an index by name
     *
     * @param {String} name Index name
     * @returns {InMemoryDBIndex} Index with the given name
     * @method
     */
    getCollection(name:string):SqliteDbCollection{
        if(this.indexes.hasOwnProperty(name)===false){
            this.newCollection(name);
        }
        return this.indexes[name] as SqliteDbCollection;
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
        }

        return o;
    }

    // ============ serialize ============

    isSerializable():boolean{
        return false;
        /*let ret:boolean=true;
        for(let i in this.indexes){
            ret = ret && this.indexes[i].isSerializable();
        }
        return ret;*/
    }

    unserialize(obj:any):void{
        /*
        for(let i in obj.indexes){
            if(obj.indexes[i].__type === "Index"){
                this.indexes[i] = SqliteDbIndex.unserialize(obj.indexes[i]);
            }else{
                this.indexes[i] = SqliteDbCollection.unserialize(obj.indexes[i]);
            }
        }*/
    }

    serialize():any{
        return null;
        /*
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

        return o;*/
    }
}

export {SqliteDb};
export {SqliteDbIndex as Index};
export {SqliteDbCollection as Collection};
