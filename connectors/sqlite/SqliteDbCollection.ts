/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
import SerializedObject from "./SerializedObject";
import {IDbCollection} from "../../src/ConnectorFactory";
import {DbSetType} from "../../src/persist/orm/DbAbstraction";
import {NodeProperty} from "../../src/persist/orm/NodeProperty";
import {SqliteAPI} from "./SqliteAPI";


export default class SqliteDbCollection implements IDbCollection
{
    static __type:string = DbSetType.COLL;
    name:string = null;
    private _c = 0;
    values:any = {};
    private _tpl: NodeProperty[] = [];

    private _s:SqliteAPI = null;


    /**
     * To create a new instance
     *
     * @param {String} name
     * @constructor
     */
    constructor(pSqliteApi:SqliteAPI, name:string, pTpl:NodeProperty[]){
        this.name = name;
        this._tpl = pTpl;
        this._s = pSqliteApi;
        this._c = 0;

        // TODO : generate prepared statements
    }

    /**
     * To create table where data will be stored
     */
    create(){
        this._s._createTable( this.name, this._tpl, {notExists:true});
    }


    setEntry(key:string,value:any){
        if(!this.hasEntry(key)){
            this._c++;
        }
        this.values[key] = value;
        this._s._insert( this.name, this._tpl)
    }

    addEntry(key:string,value:any){
        this.setEntry(key,value);
    }

    getEntry(key:string):any{
        return this.values[key];
    }

    getAll():any{
        return this.values;
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
        o.ctr = this.ctr;
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
        return true;
    }

    static unserialize(serialized_obj:any):IDbCollection{
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
        return (self as IDbCollection);
    }

    serialize():any{
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

        return o;
    }
}
