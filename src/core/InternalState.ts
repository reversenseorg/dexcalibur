
/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {
    NodeType,
    NodeProperty,
    DbDataType,
    DbKeyType,
    INode, SerializeOptions
} from "@reversense/dexcalibur-orm";

import {NodeInternalType, Nullable} from "@reversense/dxc-core-api";
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

        if((this as any)._id!=null){
            return this._edb.getCollectionOf(InternalState.TYPE.getType())
                .asyncUpdateEntry(this, {replace:false, $set:['state','modified']});
        }else{
            return await this._edb.save(this);
        }
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