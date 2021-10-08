
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
    map(fn:any):void;

    getAll():any;

    isCollection():boolean;

    isIndex():boolean;

    size():number;

    toJsonObject():any;
}

export interface IDbIndex extends IDbSet {

    name:string;

    insert(ref:any, force:boolean):void;

    addEntry(ref:any):void;

    setEntry(offset:number, ref:any):void;

    getEntry(offset:number):any;

    hasEntry(value:any):boolean
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

    setEntry(key:string,value:any);

    addEntry(key:string,value:any);

    getEntry(key:string):any;

    hasEntry(key:string):boolean;
}

export interface IDatabaseAdapter
{
    exists():boolean;
    create():boolean;
    connect():boolean;
    close():boolean;
    getIndex( pName:string):IDbIndex;
    getCollection( pName:string):IDbCollection;
    getDB():IDatabase;
    newTemporaryDb( pName:string):IDatabase;
    toJsonObject():any;
}


export interface IDatabase
{
    newCollection(name:string):IDbCollection;

    newIndex(name:string):IDbIndex;

    getIndex(name:string):IDbIndex;

    getCollection(name:string):IDbCollection;

    getAll():any;

    toJsonObject():any;

    isSerializable():boolean;

    serialize():any;

    unserialize(input:any):void;
}
