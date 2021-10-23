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
import DexcaliburEngine from "../../src/DexcaliburEngine";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export default class SqliteDbCollection implements IDbCollection
{
    static __type:string = DbSetType.COLL;
    name:string = null;
    private _c = 0;
    values:any = {};
    private _tpl: NodeType = null;
    private _key_cache:any[] = [];
    private _extra:any = {};
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

        this._ps = this._s._generatePreparedStmt(name, this._tpl);

        // update prepared statement cache when node type change
        this._tpl.onChange( (x:NodeProperty[]) => {
            this._ps = this._s._generatePreparedStmt(name, this._tpl);
            this._s._alterTable( this.name, x, {add:true});
        });
    }

    /**
     * To create table where data will be stored
     */
    create(){
        this._s._createTable( this.name, this._tpl.getProperties(), {notExists:true});

        return this;
    }

    /**
     * To keep  a trace of collection linked to the current collection
     *
     * @param pColl
     */
    link( pColl:SqliteDbCollection):void {
        this._extra[pColl.name] = pColl;
    }

    getExtra( pName:string):SqliteDbCollection {
        return this._extra[pName];
    }


    setEntry(key:any,value:any){
        if(!this.hasEntry(key)){
            this._c++;

            this._s._execInsert(
                this._ps.insertSingle,
                this._s._extractParams(value, this._tpl)
            );
        }else{
            this._s._execInsert(
                this._ps.updateSingle,
                this._s._extractParams(value, this._tpl)
            );
        }
    }

    addEntry(key:string,value:any){
        this.setEntry(key,value);
    }

    /**
     * To recover non volatile links broken by persistence
     *
     * @param pData
     * @private
     */
    private _relink(pData:any):any {
        const o = new (this._tpl.getBuilder())(pData);

        this._tpl.getProperties().map( (vPpt:NodeProperty)=>{
            if(vPpt.hasWakeUp()){
                Logger.raw(JSON.stringify(o[vPpt.getName()]));
                Logger.raw(vPpt.getName());
                o[vPpt.getName()] = vPpt.doWakeUp({
                    self: o,
                    ctx: DexcaliburEngine.getInstance(),
                    p: o[vPpt.getName()]
                })
            }
        });

        if(this._tpl.hasLinks()){
            const lks:NodeProperty[] = this._tpl.getLinks();
            lks.map( (vPpt:NodeProperty)=>{
                if(vPpt.hasSource()){
                    if(vPpt.isMultiple()){
                        // in this case (multiple) a foreign key is stored into another table
                        o[vPpt.getName()] = vPpt.getSource()(o);
                    }else{
                        o[vPpt.getName()] = vPpt.getSource()(pData[vPpt.getName()]);
                        /*if(o[vPpt.getName()].length>0){
                            o[vPpt.getName()] = o[vPpt.getName()][0];
                        }*/
                    }

                }
            });
        }
        return o;
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
        let i:number =0;
        let all:any;


        if(pList){
            all = [];
            res.map( (vEntry:any)=>{
                i++;
                all.push( this._relink(vEntry));
            });
        }else{
            all = {};
            res.map( (vEntry:any)=>{
                i++;
                all[vEntry[this._tpl.getPrimaryKey().getName()]] = this._relink(vEntry);
            });
        }



        this._c = i;

        //Logger.raw(JSON.stringify(all));

        return all;
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

        if(typeof pKey === 'object'){
            return (this._s._execSelect(this._ps.selectSingle, pKey) != null)
        }else{
            const p:any = {};
            p[this._tpl.getPrimaryKey().getName()] = pKey;
            return (this._s._execSelect(this._ps.selectSingle, p) != null)
        }
    }



    getEntry(key:any):any{
        if(typeof key === 'object'){
            return this._relink(this._s._execSelect(this._ps.selectSingle, key));
        }else{
            const p={};
            p[this._tpl.getPrimaryKey().getName()] = key;
            return this._relink(this._s._execSelect(this._ps.selectSingle, p));
        }
    }


    updateEntry( pEntry:any):boolean {
        const pk = this._s._extractKey(pEntry, this._tpl);
        if(this.hasEntry(pk)){
            this._s._execInsert(
                this._ps.updateSingle,
                this._s._extractParams(pEntry, this._tpl)
            );
        }else{
            this._s._execInsert(
                this._ps.insertSingle,
                this._s._extractParams(pEntry, this._tpl)
            );
        }

        return true;
    }

    /**
     *
     * @param key
     */
    removeEntry(key: any): boolean {

        let res = false;
        try {
            if (typeof key === 'object') {
                this._s._execInsert(this._ps.removeSingle, key);
            } else {
                const p = {};
                p[this._tpl.getPrimaryKey().getName()] = key;
                this._s._execInsert(this._ps.removeSingle, p);
            }

            res = true;

        } catch (err) {
            Logger.error('[SQLITE] Remove entry failed : ', err.message);
        }

        return res;
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
    }

    serialize():any{
        throw  new SqliteException("SqliteDbCollection  are not serializable");
    }
}
