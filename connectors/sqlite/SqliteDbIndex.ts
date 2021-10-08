
import SerializedObject from "./SerializedObject";
import {IDbIndex} from "../../src/ConnectorFactory";
import {DbColumnTemplate} from "../../src/persist/orm/DbColumnTemplate";
import {DbSetType} from "../../src/persist/orm/DbAbstraction";
import {SqliteAPI} from "./SqliteAPI";
import {NodeProperty} from "../../src/persist/orm/NodeProperty";

/**
 * Represents an array of element
 *
 * @author Georges-B. MICHEL
 * @class
 * @export
 */
export default class SqliteDbIndex implements IDbIndex
{
    static __type:string = DbSetType.INDEX;

    name:string = null;
    refs:any = [];
    model:any = null;
    tpl: NodeProperty[] = [];
    private _s:SqliteAPI;


    /**
     * To create a new instance
     *
     * @param {String} name
     * @constructor
     */
    constructor(pSqliteApi:SqliteAPI, name:string, pTpl:NodeProperty[], pModel:any){
        this.name = name;
        this.refs = [];
        this.model = pModel;
        this.tpl = pTpl;
        this._s = pSqliteApi;
    }

    create(){
        this._s._createTable( this.name, this.tpl, {notExists:true});
    }

    /**
     * To add an entry
     *
     * @param {*} ref
     * @param {Boolean} force
     * @method
     */
    insert(ref:any, force:boolean=false){
        if(force || this.refs.indexOf(ref)===-1)
            this.refs.push(ref);
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

    /**
     *
     * @param offset
     * @param ref
     */
    setEntry(offset:number, ref:any):void {
        this.refs[offset] = ref;
    }

    /**
     * To execute a function for each entry
     *
     * @param {function} fn Callback
     * @method
     */
    map(fn:any){
        for(let i:number=0; i<this.refs.length; i++){
            fn(i, this.refs[i]);
        }
    }

    /**
     * To get an entry by its offset
     *
     * @param {number} offset
     * @returns {*}
     * @method
     */
    getEntry(offset:number){
        return this.refs[offset];
    }

    /**
     * To get all entries
     *
     * @returns {Object[]}
     * @method
     */
    getAll():any{
        return this.refs;
    }

    isCollection():boolean{
        return false;
    }

    isIndex():boolean{
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
        let ret:boolean = false;
        for(let i:number=0; i<this.refs.length ; i++)
            ret = ret && this.refs[i].isSerializable();

        return ret;
    }

    static unserialize(serialized_obj:any){
        let self:SqliteDbIndex = new SqliteDbIndex(), o=null;
        self.name = serialized_obj.name;
        self.refs = [];
        for(let i:number=0; i<serialized_obj.refs.length; i++){
            if(SerializedObject.isUnserializable(serialized_obj.refs[i])){
                o = new SerializedObject(serialized_obj.refs[i]);
                self.refs.push(o.unserialize());
            }
            else
                self.refs.push(serialized_obj.refs[i]);
        }
        return self;
    }


    serialize(){
        let o:any = {};

        o.__type = SqliteDbIndex.__type;
        o.name = this.name;
        o.refs = [];

        for(let i:number=0; i<this.refs.length; i++){
            if(this.refs[i].hasOwnProperty('isSerializable') && (this.refs[i].isSerializable() === true)){
                o.refs.push(this.refs[i].serialize());
            }else if(typeof this.refs[i].toJsonObject === 'function')
                o.refs.push(this.refs[i].toJsonObject());
            else
                o.refs.push(this.refs[i]);
        }

        return o;
    }
}
