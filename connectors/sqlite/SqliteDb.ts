/**
 * Represents a database stored into memory (ACID-like)
 *
 * @author Georges-B. MICHEL
 * @class
 */
import * as Database from "better-sqlite3";
import SqliteDbCollection from "./SqliteDbCollection";
import SqliteDbIndex from "./SqliteDbIndex";
import SqliteConnector from "./adapter";
import {
    DbDataType,
    DbKeyType,
    DbSetMap,
    DbSetType,
    DbSizesMap,
    IDatabase,
    IDbSet
} from "../../src/persist/orm/DbAbstraction";
import {PreparedStatementList, SqliteAPI} from "./SqliteAPI";
import {NodeType} from "../../src/persist/orm/NodeType";
import {NodeProperty} from "../../src/persist/orm/NodeProperty";
import * as Log from "../../src/Logger";
import {NodeInternalType} from "../../src/NodeInternalType";
import DexcaliburProject from "../../src/DexcaliburProject";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const METADATA_TABLE = "dxc_meta";

class SqliteDb implements IDatabase
{
    static TYPE:NodeType = new NodeType(
        METADATA_TABLE,
        NodeInternalType.INTERNAL_DB,
        [
            (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("type")).type(DbDataType.STRING).def("Index").notnull(),
            (new NodeProperty("node")).type(DbDataType.STRING)
        ]
    );

    _s:SqliteAPI = null;
    private _ps:PreparedStatementList;
    _tables:string[] = [];

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
    constructor(pPath:string =null, pConnector:SqliteConnector ){
        this.conn = pConnector;
        this.indexes = {};
        this.sizes = {};

        let db = new Database(pPath, { verbose:Logger.raw });

        this._s = new SqliteAPI( db );
        this._ps = this._s._generatePreparedStmt(METADATA_TABLE, SqliteDb.TYPE);
        this._refresh();
    }

    /**
     * To prepare an new sqlite DB to be requested over this API
     *
     * 1/ Create 'internal table' to hold metadata about collection/index
     */
    install(){
        const t = this._s._getTables();
        let f = false;
        t.map( v => { if(v == METADATA_TABLE) f = true; })

        if(f) return;

        this._s._createTable(SqliteDb.TYPE.getName(), SqliteDb.TYPE.getProperties());
    }


    /**
     * To refresh some meta data including :
     *
     * - table name list
     *
     * @private
     */
    private _refresh():any {
        this._tables = this._s._getTables();
        Logger.info(JSON.stringify(this._tables));
    }


    /**
     * To verify if a table exists or not
     *
     * @param pName
     * @private
     */
    exists( pName:string):boolean {
        this._refresh();
        this.loadIndexes();
        return (this._tables.indexOf(pName)>-1 && this.indexes[pName]!=null);// this.indexes[pName]!=null;
    }

    /**
     *
     */
    loadIndexes(){
       // if(Object.keys(this.indexes).length==0){
            const idx = this._s._execSelectAllNoData(this._ps.selectAll);
            if(idx!=null){
                Logger.debug(JSON.stringify(idx));
                idx.map( info => {
                    if(this.indexes[info.name]==null){
                        if(info.type == DbSetType.INDEX){
                            this.indexes[info.name] = this.newIndex(info.name, NodeType.lookup(info.node));
                        }else{
                            this.indexes[info.name] = this.newCollection(info.name, NodeType.lookup(info.node));
                        }
                    }
                })
            }
       // }
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
    newCollection(pIndexName:string, pNodeType:NodeType):SqliteDbCollection{
        const name:string = ( pIndexName!=null ? pIndexName : pNodeType.getName() );

        if(this.indexes[name]!=null){
            return this.indexes[name] as SqliteDbCollection;
            //throw new SqliteException("A collection is already set for the given name");
        }


        this.indexes[name] = (new SqliteDbCollection(this._s, name, pNodeType)).setDB(this);


        if(pNodeType.hasExternalProperties()){
            pNodeType.getExternalProperties().map( (ppt:NodeProperty) => {
                if(!this.exists(ppt.getNodeType().getName())){
                    const c:SqliteDbCollection = this.newCollection(ppt.getNodeType().getName(), ppt.getNodeType());
                    (this.indexes[name] as SqliteDbCollection).link(c);
                    Logger.raw("LINKING new extra coll "+c.name+" TO "+(this.indexes[name] as any).name);
                }else{

                    const b:SqliteDbCollection = this.getCollection(ppt.getNodeType().getName(), ppt.getNodeType());
                    (this.indexes[name] as SqliteDbCollection).link(b);
                    Logger.raw("LINKING existing extra coll "+b.name+" TO "+(this.indexes[name] as any).name);
                }
            });
        }

        // if there is not table for this collection, it is created


        this._refresh();
        if(this._tables.indexOf(name)==-1){
            (this.indexes[name] as SqliteDbCollection).create();
            this._s._execInsert( this._ps.insertSingle,{
                name: name,
                type: DbSetType.COLL,
                node: pNodeType.getName()
            });
            this._refresh();
        }

        return this.indexes[name] as SqliteDbCollection;
    }


    /**
     * To create a table with  numeric-based primary key (id) into current DB
     *
     * @param {String} name Name of the index
     * @method
     */
    newIndex(pIndexName:string, pNodeType:NodeType):SqliteDbIndex{
        const name:string = ( pIndexName!=null ? pIndexName : pNodeType.getName() );

        if(this.indexes[name] != undefined){
            return this.indexes[name] as SqliteDbIndex;
            //throw new SqliteException("An index already exists for the given name");
        }

        this.indexes[name] = (new SqliteDbIndex(this._s, name, pNodeType)).setDB(this)

        // if there is not table for this index, it is created
        this._refresh();
        if(this._tables.indexOf(name)==-1){
            (this.indexes[name] as SqliteDbIndex).create();
            this._s._execInsert( this._ps.insertSingle,{
                name: name,
                type: DbSetType.INDEX,
                node: pNodeType.getType()
            });
            this._refresh();
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
    getIndex(name:string, pTemplate:NodeType = null):SqliteDbIndex{
        if(this.indexes.hasOwnProperty(name)===false){
            this.newIndex(name, pTemplate);
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
    getCollection(name:string, pTemplate:NodeType = null):SqliteDbCollection{
        if(this.indexes.hasOwnProperty(name)===false){
            this.newCollection(name, pTemplate);
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

    /**
     * To get the instance of the project for this DB
     */
    getProject():DexcaliburProject {
        return this.conn.ctx;
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
