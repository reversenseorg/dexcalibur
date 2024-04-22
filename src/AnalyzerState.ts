
import {
    NodeType,
    NodePropertyState,
    NodeProperty,
    DbDataType,
    DbKeyType,
    IDbCollection,
    INode, SerializeOptions
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "./NodeInternalType.js";

import DexcaliburProject from "./DexcaliburProject.js";
import {ProjectDatabase} from "./database/ProjectDatabase.js";
import {Nullable} from "./core/IStringIndex.js";


export interface AnalyzerStateOptions {
    _uid:string;
    state?:any;
    modified?:number;
    tags?:number[];
}
/**
 * A class to save the state of an analyzer or analyzed entities
 *
 * @class
 */
export class AnalyzerState implements INode{

    static TYPE:NodeType = new NodeType(
        "anal_state",
        NodeInternalType.ANAL_STATE,
        [
            (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("state"))
                .type(DbDataType.STRING),
               // .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : )})
               // .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : {} )}),
            (new NodeProperty("modified")).type(DbDataType.NUMERIC).def(-1)
        ]);


    __:NodeInternalType = NodeInternalType.ANAL_STATE;

    _uid:string;

    state:any = {};

    modified = -1;

    tags:number[] = [];
    /**
     * The collection where the state is backed up
     * @private
     */
    private _coll:IDbCollection = null;

    private _pdb:Nullable<ProjectDatabase> = null;

    /**
     *
     * @param pOptions
     */
    constructor(pOptions:AnalyzerStateOptions) {
      for(const i in pOptions) this[i] = pOptions[i];

    }

    getUID():string|null {
        return this._uid;
    }

    /**
     * To check if the state can be stored
     */
    isReady(){
        return (this._pdb!=null);
    }

    /**
     * Chainable
     *
     * @param pName
     * @param pValue
     */
    setProperty(pName:string, pValue:any):AnalyzerState {
        this.state[pName] = pValue;
        return this;
    }

    getProperty(pName:string):any {
        return this.state[pName];
    }

    setContext(pCtx:DexcaliburProject){
        this._coll = pCtx.getDB().getCollection('anal_state', AnalyzerState.TYPE);
        this._pdb = pCtx.getProjectDB();
    }

    /**
     * Chainable
     *
     * @param pName
     * @param pValue
     */
    append(pName:string, pValue:string, pOptions = {unique:false} ) :AnalyzerState{

        console.log(this.state);
        if(this.state[pName]==null){
            this.state[pName] = [pValue];
        }else if(!pOptions.unique || this.state[pName].indexOf(pValue)==-1){
            this.state[pName].push(pValue);
        }

        return this;
    }

    async save():Promise<any>{
        return await this._pdb.saveState(this); //  this._coll.updateEntry(this);
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return {
            _uid: this._uid,
            state: this.state,
            modified: this.modified,
            tags: this.tags,
            __: this.__
        };
    }
}

AnalyzerState.TYPE.builder(AnalyzerState);