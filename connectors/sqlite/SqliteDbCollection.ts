/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
import SerializedObject from "./SerializedObject";
import {DbSetType, IDbCollection} from "../../src/persist/orm/DbAbstraction";
import {NodeProperty} from "../../src/persist/orm/NodeProperty";
import {PreparedStatementList, SqliteAPI} from "./SqliteAPI";
import {SqliteException} from "./SqliteException";
import {NodeType} from "../../src/persist/orm/NodeType";
import * as Log from "../../src/Logger";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export default class SqliteDbCollection implements IDbCollection
{
    static __type:string = DbSetType.COLL;
    name:string = null;
    private _c = 0;
    values:any = {};
    private _tpl: NodeType = null;
    private _key_cache:any[] = [];

    private _s:SqliteAPI = null;
    private _ps:PreparedStatementList;


    /**
     * To create a new instance
     *
     * @param {String} name
     * @constructor
     */
    constructor(pSqliteApi:SqliteAPI, name:string, pTpl:NodeType){
        this.name = name;
        this._tpl = pTpl;
        this._s = pSqliteApi;
        this._c = 0;

        // TODO : generate prepared statements
        this._ps = this._s._generatePreparedStmt(name, this._tpl);
    }

    /**
     * To create table where data will be stored
     */
    create(){
        this._s._createTable( this.name, this._tpl.getProperties(), {notExists:true});
        return this;
    }


    setEntry(key:string,value:any){
        if(!this.hasEntry(key)){
            this._c++;
        }

        this._s._execInsert(
            this._ps.insertSingle,
            this._s._extractParams(value, this._tpl.getProperties())
        );
    }

    addEntry(key:string,value:any){
        this.setEntry(key,value);
    }

    getEntry(key:string):any{
        return this._s._execSelect(this._ps.selectSingle, [key]);
    }

    /**
     * To read all entries from the colelction and instanciate node
     *
     * @param {boolean} pList If TRUE, then it returns an array, else it returns an object indexed by primary key value
     * @return {any|any[]} List or hashmap of entries
     * @method
     * @since 1.0.0
     */
    getAll(pList = false):any{
        const res = this._s._execSelectAll(this._ps.selectAll,[]);

        Logger.raw(res);
        Logger.raw(this._tpl.getBuilder());
        let all:any;
        if(pList){
            all = [];
            res.map( (vEntry:any)=>{
                all.push(new (this._tpl.getBuilder())(vEntry));
            });
        }else{
            all = {};
            res.map( (vEntry:any)=>{
                all[vEntry[this._tpl.getPrimaryKey().getName()]] = new (this._tpl.getBuilder())(vEntry);
            });
        }

        Logger.raw(JSON.stringify(all));

        return all;
    }

    /**
     * To check if an entry exists for the specified key
     *
     * By default it filters by primary key
     *
     * @param {any} pKey Key value
     * @return {boolean} Return TRUE is an entry exists, else FALSE
     * @method
     * @since 1.0.0
     */
    hasEntry(pKey:any):boolean{
        const p:any = {};
        p[this._tpl.getPrimaryKey().getName()] = pKey

        return (this._s._execSelect(this._ps.selectSingle, p) != null)
    }

    /**
     * To execute a function for each entry
     *
     * Same as map function over an array
     *
     * @param {function} pFn The callback function
     * @method
     * @since 1.0.0
     */
    map(pFn:any){
        this.getAll(true).map( (k:any, i:number) => { pFn(i,k) });
    }

    isCollection(){
        return true;
    }

    isIndex():boolean{
        return false;
    }

    size():number{
        return this._c;
    }


    removeEntry(key: any): boolean {
        this._s._execInsert( this._ps.removeSingle, [key]);
        return true;
    }

    toJsonObject():any{
        let o:any= {};

        o.name = this.name;
        o._c = this._c;
        o.values = {};
        for(let i in this.values){
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;
    }

    // ======= serialize =======

    isSerializable():boolean{
        return false;
    }

    static unserialize(serialized_obj:any):IDbCollection{
        throw  new SqliteException("SqliteDbCollection  are not unserializable");
    }

    serialize():any{
        throw  new SqliteException("SqliteDbCollection  are not serializable");
    }
}
