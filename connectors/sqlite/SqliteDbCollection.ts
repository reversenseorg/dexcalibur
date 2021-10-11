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



export default class SqliteDbCollection implements IDbCollection
{
    static __type:string = DbSetType.COLL;
    name:string = null;
    private _c = 0;
    values:any = {};
    private _tpl: NodeType = null;

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
    }


    setEntry(key:string,value:any){
        if(!this.hasEntry(key)){
            this._c++;
        }
        this._s._execInsert(this._ps.insertSingle, value);
    }

    addEntry(key:string,value:any){
        this.setEntry(key,value);
    }

    getEntry(key:string):any{
        return this._s._execSelect(this._ps.selectSingle, [key]);
    }

    getAll():any{
        return this._s._execSelectAll(this._ps.selectSingle,[]);
    }

    hasEntry(key:string):boolean{
        return (this.values[key] !== undefined);
    }

    map(fn:any){
        for(let k in this.values){
            fn(k,this.values[k]);
        }
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
        /*
        let self:SqliteDbCollection = new SqliteDbCollection(), o=null;
        self.name = serialized_obj.name;
        self._c = serialized_obj._c;
        self.values = {};
        for(let i in serialized_obj.values){

            if(SerializedObject.isUnserializable(serialized_obj.values[i])){
                o = new SerializedObject(serialized_obj.values[i])
                self.values[i]=o.unserialize();
            }
            else
                self.values[i]=serialized_obj.values[i];
        }
        return (self as IDbCollection);*/
    }

    serialize():any{
        throw  new SqliteException("SqliteDbCollection  are not serializable");

        /*
        let o:any= {};

        o.__type = SqliteDbCollection.__type;
        o.name = this.name;
        o._c = this._c;
        o.values = {};

        for(let i in this.values){

            if(typeof this.values[i].serialize === 'function')
                o.values[i]=this.values[i].serialize();
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;*/
    }
}
