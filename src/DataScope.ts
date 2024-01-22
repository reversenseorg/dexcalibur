import {NodeInternalType} from "./NodeInternalType.js";
import {IPersistent} from "./persist/orm/IPersistent.js";
import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import * as _path_ from 'path';
import {IZoned, SecurityZone} from "./security/SecurityZone.js";

export interface DataScopeMap {
    [name:string] :DataScope
}

export enum DataScopePpts {
    PATH="p",
    PATH_SEP="s",
    OTHER="o"
}

const DEFAULT_PREFIX = "files_";



export default class DataScope implements INode,IPersistent,IZoned{

    static TYPE:NodeType = new NodeType(
        "data_scope",
        NodeInternalType.DATA_SCOPE,
        [
            (new NodeProperty("__i")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("_i")).type(DbDataType.STRING).def(DEFAULT_PREFIX), // path relative to scope root
            (new NodeProperty("_n")).type(DbDataType.STRING).unique(),
            (new NodeProperty("zone")).type(DbDataType.STRING),
            (new NodeProperty("_p"))
                .type(DbDataType.STRING)
                //.sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : null)})
                //.wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)})
        ]).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.DATA_SCOPE;

    /**
     * DB UID
     */
    _id:string;

    __i:string;
    _i:string = DEFAULT_PREFIX;
    _n:string = null;
    _p:any = {};

    zone:SecurityZone = SecurityZone.PRIVATE;

    tags:number[] = [];

    constructor( pConfig:any = {}){
        this.setPpts( DataScopePpts.PATH_SEP, _path_.sep);

        for(let i in pConfig){
            this[i] = pConfig[i];
        }
    }

    static create(pName:string, pInternalName:string, pOpts:any={}):DataScope{
        return new DataScope({
            _n: pName,
            _p: pOpts,
            __i: pInternalName
        });
    }

    getUID():string {
        return this._n;
    }

    setIndexPrefix(pPrefix:string){
        this._i = pPrefix;
    }

    getInternalName():string {
        return this.__i;
    }

    getIndexName():string {
        return this._i+this._n;
    }

    getName():string {
        return this._n;
    }

    setPpts( pType:DataScopePpts, pValue:any):DataScope {
        this._p[pType] = pValue;

        return this;
    }

    /**
     *
     *
     * Chainable
     *
     * @param pZone
     */
    setZone( pZone:SecurityZone):DataScope {
        this.zone = pZone;
        return this;
    }

    getBasePath():string {
        return this._p[DataScopePpts.PATH];
    }

    equals( pScope:DataScope):boolean {
        if(pScope==null) return false;

        return (pScope.getName()===this.getName());
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return this;
    }
}
DataScope.TYPE.builder(DataScope);