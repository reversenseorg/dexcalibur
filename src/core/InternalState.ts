
import {
    NodeType,
    NodeProperty,
    DbDataType,
    DbKeyType,
    INode, SerializeOptions
} from "@dexcalibur/dexcalibur-orm";

import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {EngineDatabase} from "../database/EngineDatabase.js";
import {EngineDatabaseException} from "../errors/EngineDatabaseException.js";


export interface InternalStateOptions {
    uuid:InternalStateUUID;
    state?:any;
    name?:string;
    modified?:number;
    tags?:number[];
}

export type InternalStateUUID = string;

/**
 * A class to save the state of internal managers
 *
 * @class
 */
export class InternalState implements INode{

    static TYPE:NodeType = new NodeType(
        "state",
        NodeInternalType.INTERNAL_STATE,
        [
            (new NodeProperty("uuid"))
                .type(DbDataType.STRING)
                .key(DbKeyType.PRIMARY),
            (new NodeProperty("name"))
                .type(DbDataType.STRING),
            (new NodeProperty("state"))
                .type(DbDataType.STRING),
               // .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : )})
               // .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : {} )}),
            (new NodeProperty("modified")).type(DbDataType.NUMERIC).def(-1)
        ]).dataSource("ENGINE_DB");


    __:NodeInternalType = NodeInternalType.INTERNAL_STATE;

    uuid:InternalStateUUID;

    name:string = "";

    state:any = {};

    modified = -1;

    tags:number[] = [];


    private _edb:Nullable<EngineDatabase> = null;

    /**
     *
     * @param pOptions
     */
    constructor(pOptions:InternalStateOptions) {
      for(const i in pOptions) this[i] = pOptions[i];

    }

    setDB(pEngineDB:EngineDatabase):void {
        this._edb = pEngineDB;
    }

    getUID():InternalStateUUID {
        return this.uuid;
    }

    /**
     * Chainable
     *
     * @param pName
     * @param pValue
     */
    setProperty(pName:string, pValue:any):InternalState {
        this.state[pName] = pValue;
        return this;
    }

    getProperty(pName:string):any {
        return this.state[pName];
    }

    /**
     * Chainable
     *
     * @param pName
     * @param pValue
     */
    append(pName:string, pValue:string, pOptions = {unique:false} ) :InternalState{

        if(this.state[pName]==null){
            this.state[pName] = [pValue];
        }else if(!pOptions.unique || this.state[pName].indexOf(pValue)==-1){
            this.state[pName].push(pValue);
        }

        return this;
    }

    async save():Promise<any>{
        if(this._edb==null){
            throw EngineDatabaseException.CANNOT_SAVE_INTERNAL_STATE(this.getUID())
        }

        return await this._edb.save(this); //  this._coll.updateEntry(this);
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return {
            uuid: this.uuid,
            name: this.name,
            state: this.state,
            modified: this.modified,
            tags: this.tags,
            __: this.__
        };
    }
}

InternalState.TYPE.builder(InternalState);