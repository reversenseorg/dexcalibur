
import {DbDataType, DbKeyType, DbSetType, IDbIndex} from "../../src/persist/orm/DbAbstraction.js";
import {PreparedStatementList, SqliteAPI} from "./SqliteAPI.js";
import {SqliteException} from "./SqliteException.js";
import {NodeType} from "../../src/persist/orm/NodeType.js";
import {NodeProperty} from "../../src/persist/orm/NodeProperty.js";
import {SqliteDb} from "./SqliteDb.js";

/**
 * Represents an array of element stored in a SQLite table
 *
 * @author Georges-B. MICHEL
 * @class
 * @export
 */
export default class SqliteDbIndex implements IDbIndex
{
    static __type:string = DbSetType.INDEX;

    name:string = null;
    refs:any = []; // replace by cache
    _tpl: NodeType = null;
    _pk: NodeProperty = null; //primary key

    _db:SqliteDb = null;

    /**
     * @type {SqliteAPI}
     * @private
     */
    private _s:SqliteAPI;

    private _ps:PreparedStatementList;



    /**
     * To create a new instance
     *
     * @param {String} name
     * @constructor
     */
    constructor(pSqliteApi:SqliteAPI, name:string, pTpl:NodeType){
        this.name = name;
        this.refs = [];
        this._pk = (new NodeProperty("__id")).type(DbDataType.NUMERIC).unique().key(DbKeyType.PRIMARY);
        this._tpl = pTpl;
        this._s = pSqliteApi;


        // TODO : generate prepared statements
        this._ps = this._s._generatePreparedStmt(name, this._tpl);
    }

    setDB(pDB:SqliteDb):any {
        this._db = pDB;
        return this;
    }

    create(){
        this._s._createTable( this.name, [].concat(this._tpl.getProperties()), {notExists:true});
        return this;
    }

    /**
     * To add an entry
     *
     * @param {*} ref
     * @param {Boolean} force
     * @method
     */
    insert(ref:any, force:boolean=false){
        if(force || this.refs.indexOf(ref)===-1) {
            this.refs.push(ref);
            this._s._execInsert(this._ps.insertSingle, ref);
        }
    }

    // just a wrapper
    /**
     * To add an entry (alias of insert() )
     *
     * @param {*} ref
     * @method
     */
    addEntry(ref:any){
        this.insert(ref);
    }



    updateEntry(offset:number, ref:any) {
        this.refs[offset] = ref;
        this._s._execInsert(this._ps.updateSingle, ref);
    }

    /**
     *
     * @param offset
     * @param ref
     */
    setEntry(offset:number, ref:any):void {
        if(!this.hasEntry(offset)){
            this.refs[offset] = ref;
            this._s._execInsert(this._ps.insertSingle, ref);
        }else{
            this.refs[offset] = ref;
            this._s._execInsert(this._ps.updateSingle, ref);
        }

    }

    /**
     * To execute a function for each entry
     *
     * @param {function} fn Callback
     * @method
     */
    map(fn:any){
        this.getAll().map( (k,i) => fn(i,k));
    }


    getAsList():any[] {
        return this.getAll();
    }

    /**
     * To get an entry by its offset
     *
     * @param {number} offset
     * @returns {*}
     * @method
     */
    getEntry(offset:number){
        if(this.refs[offset] != null){
            return this.refs[offset];
        }else{
            // TODO : cache or lazy laoding
            return this._s._execSelectAllNoData(this._ps.selectAll)[offset];
        }
    }

    /**
     * To get all entries
     *
     * @returns {Object[]}
     * @method
     */
    getAll():any{
        const data = this._s._execSelectAllNoData(this._ps.selectAll);
        const ret = [];
        data.map( entry => {
            ret.push(new (this._tpl.getBuilder())(entry));
        })
        return ret;
    }

    isCollection():boolean{
        return false;
    }

    isIndex():boolean{
        return true;
    }


    removeEntry(key: any): boolean {
        this._s._execInsert( this._ps.removeSingle, [key]);
        return true;
    }

    /**
     * To get the number of elements into the index
     *
     * @returns {number}
     * @method
     */
    size():number{
        return this.refs.length;
    }


    hasEntry(value:any):boolean{

        return (this.refs.indexOf(value) > -1);
    }

    /**
     * To transform current index to simple object ready to be serialized.
     *
     * @returns {{}}
     * @method
     */
    toJsonObject():any{
        let o:any = {};

        o.name = this.name;
        o.refs = [];
        for(let i:number=0; i<this.refs.length; i++){
            if(typeof this.refs[i].toJsonObject  === 'function'){
                o.refs[i] = this.refs[i].toJsonObject()
            }else{
                o.refs[i] = this.refs[i];
            }
        }

        return o;
    }

    // ======= serialize =======


    isSerializable():boolean{
        return false;
    }

    static unserialize(serialized_obj:any){
        throw new SqliteException("SqliteDbIndex are not serializable");
    }


    serialize(){
        throw new SqliteException("SqliteDbIndex are not serializable");
    }
}
