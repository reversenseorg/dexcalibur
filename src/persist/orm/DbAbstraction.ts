
import DexcaliburProject from "../../DexcaliburProject.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";

export enum DbDataType {
    // strings
    STRING,
    CHARACTER,
    VARCHAR,
    TEXT,
    NVARCHAR,
    NCHAR,
    CHAR,

    // binary
    BLOB,

    // integers
    INTEGER,
    INT,
    TINYINT,
    SMALLINT,
    MEDIUMINT,
    BIGINT,
    UNSIGNED_BIG_INT,
    INT2,
    INT8,

    // null
    NULL,

    // float
    REAL,
    DOUBLE,
    DOUBLE_PRECISION,
    FLOAT,

    // misc
    NUMERIC,
    DECIMAL_10_5,
    BOOLEAN,
    DATE,
    DATETIME
}

export enum DbKeyType {
    PRIMARY,
    FOREIGN,
    COMPOSITE
}

export enum DbSerialize {
    JSON,
    RAW
}

export enum DbSetType {
    INDEX="Index",
    COLL="Collection"
}

export interface IDbSet {
    map(fn:((vIndex:any, vData:any)=>void)):void;


    getAsList():any[];

    getAll():any;

    isCollection():boolean;

    isIndex():boolean;

    size():number;

    toJsonObject():any;

    search?( pRequest:any, pOptions?:any):any;
}

export interface IDbIndex extends IDbSet {

    name:string;

    _db:any;

    insert(ref:any, force:boolean):void;

    addEntry(ref:any):void;

    setEntry(offset:number, ref:any):void;

    getEntry(offset:number):any;

    hasEntry(value:any):boolean;

    removeEntry(key: any):boolean;

    updateEntry(key:any, ref:any);
}

export interface DbSetMap {
    [name:string] :IDbSet ;
}

export interface DbSizesMap {
    [name:string] :number ;
}


export interface IDbCollection extends IDbSet
{
    name:string;

    _db:IDatabase;

    setEntry(key:string,value:any);

    addEntry(key:string,value:any);

    updateEntry(value:any);

    getEntry(key:string):any;

    hasEntry(key:string):boolean;

    removeEntry(key: any):boolean;
}

/**
 * Interface for a connector to a database.
 *
 * Classes implementing this interface are responsible to connection/authentication to DBMS
 *
 * @interface
 */
export interface IDatabaseAdapter
{
    ctx?:DexcaliburProject;

    exists():boolean;
    create():boolean;
    connect(pOptions:any):any;
    close():boolean;
    getIndex( pName:string):IDbIndex;
    getCollection( pName:string):IDbCollection;
    getDB():IDatabase;
    getType():string;
    newTemporaryDb( pName:string):IDatabase;
    toJsonObject():any;
}


export interface IDatabase
{
    conn:IDatabaseAdapter;

    newCollection(name:string, pNodeType:NodeType):IDbCollection;

    newIndex(name:string, pNodeType:NodeType):IDbIndex;

    getIndex(name:string, pNodeType:NodeType):IDbIndex;

    getIndexOf(pNodeType:NodeType):IDbIndex;

    getCollection(name:string, pNodeType:NodeType):IDbCollection;

    getCollectionOf(pNodeType:NodeType):IDbCollection;

    getAll():any;

    exists(pName:string):boolean ;

    toJsonObject():any;

    isSerializable():boolean;

    serialize():any;

    unserialize(input:any):void;

    getProject():DexcaliburProject;
}
