
/**
 * @interface
 * @since 1.0.0
 */
export interface CacheEntry {
    last: number; // last access
    d: any; // cached data
}

/**
 * @interface
 * @since 1.0.0
 */
export interface CacheIndexes {
    [indexName:string] :CacheIndex; // where number is the offset into Cache
}

/**
 * @interface
 * @since 1.0.0
 */
export interface CacheIndex {
    [entryId:string] :number; // where number is the offset into Cache
}


const DEFAULT_INDEX_NAME = "uid";

/**
 * Represent a cache for persisted collections and indexes
 *
 * @class
 * @since 1.0.0
 */
export default class PersistenceCache {

    /**
     * An array containing all cache entries
     *
     * @type any[]
     * @field
     * @private
     * @since 1.0.0
     */
    private _d:any[] = []

    /**
     * A map of every indexes for this
     *
     * @type {CacheIndexes}
     * @field
     * @private
     * @since 1.0.0
     */
    private _i:CacheIndexes = {};

    /**
     * A list of node properties used as index to access this cache
     *
     * @type {string[]}
     * @field
     * @private
     * @since 1.0.0
     */
    private _inames:string[];


    /**
     *
     * @param {string[]} pIndexedPpt A list of node properties used as index to access this cache
     * @constructor
     * @since 1.0.0
     */
    constructor( pIndexedPpt:string[] = [DEFAULT_INDEX_NAME]) {
        this._inames = pIndexedPpt;
    }

    /**
     * To recreate cache structure
     *
     * @method
     * @private
     * @method
     * @since 1.0.0
     */
    private _create(){
        this._inames.map( vName => {
            this._i[vName] = {};
        });
    }

    /**
     * To check if an entry is cached by its uid
     *
     * @param {string} pUid Node UID
     * @return {boolean}
     * @method
     * @since 1.0.0
     */
    has(pUid:string, pIndexName:string = DEFAULT_INDEX_NAME):boolean {
        return this.indexOf(pUid, pIndexName) > -1;
    }

    /**
     * To get the entry offset by the specified uid and index name
     *
     * @param {string} pUid Node UID
     * @param {string} pIndexName Index name (must be the name of a node property)
     * @return {number} Return the offset of the entry, else -1 if the entry is not found
     * @method
     * @since 1.0.0
     */
    indexOf(pUid:string, pIndexName:string = DEFAULT_INDEX_NAME):number {
        const o = this._i[pIndexName][pUid];
        return ((o!=null) && (this._d[o]!=null))? o : -1 ;
    }

    /**
     * To get an entry by its offset 
     * 
     * Warning : offset can change is the entry or cache is flushed, 
     * ensure to use .indexOf() to get the right offset
     * 
     * @param {number} pOffset
     * @return {any} Cache entry, else null
     * @method
     * @since 1.0.0
     */
    get( pOffset:number):any{
       return this._d[pOffset];
    }

    /**
     * To get qn entry by the value of a specified property.
     *
     * The property must be an index of the cache, declared when the cache has been instancied.
     *
     *
     * @param {string} pUid
     * @param {string} pIndexName
     * @return {any}
     * @method
     * @since 1.0.0
     */
    getEntry(pUid:string, pIndexName:string = DEFAULT_INDEX_NAME):any {
        const o = this._i[pIndexName][pUid];
        return this._d[o];
    }

    /**
     * To push an object into the cache.
     *
     * This object wil be indexed by each property defined into the cache structure
     *
     * @param {any} pObject Object to cache
     * @return {number} New cache offset
     * @method
     * @since 1.0.0
     */
    push( pObject:any):number {
        // must be transaction
        const o = this._d.push(pObject) - 1;
        this._inames.map( vNames => {
            if(pObject[vNames] != null){
                this._i[vNames][pObject[vNames]] = o;
            }
        });

        return o;
    }

    /**
     * To get the cache size
     *
     * @method
     * @since 1.0.0
     */
    size(){
        return this._d.length;
    }

    /**
     * To flush and recreate cache
     *
     * @method
     * @since 1.0.0
     */
    flush(){
        delete this._i;
        delete this._d;
        this._i = {};
        this._d = [];
        this._create();
    }

}