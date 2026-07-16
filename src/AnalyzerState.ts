
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
    NodePropertyState,
    NodeProperty,
    DbDataType,
    DbKeyType,
    IDbCollection,
    INode, SerializeOptions
} from "@reversense/dexcalibur-orm";

import {NodeInternalType} from "@reversense/dxc-core-api";

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
        this._pdb = pCtx.getProjectDB();
    }

    /**
     * Chainable
     *
     * @param pName
     * @param pValue
     */
    append(pName:string, pValue:string, pOptions = {unique:false} ) :AnalyzerState{

        if(this.state[pName]==null){
            this.state[pName] = [pValue];
        }else if(!pOptions.unique || this.state[pName].indexOf(pValue)==-1){
            this.state[pName].push(pValue);
        }

        return this;
    }

    async save():Promise<any>{
        return await this._pdb.saveState(this);
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