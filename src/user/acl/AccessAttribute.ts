
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

import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {UserGroupUUID} from "./common/UserGroup.js";


export type AccessAttributeMap = Record<string, AccessAttribute<any>>;

export interface AccessAttributeOptions<F> {
    name?:string;
    value?:F[];
    type?:Nullable<NodeInternalType>;
}
/**
 * Represents an access point
 */
export class AccessAttribute<T> {

    private _n:string;
    private _v:T[];
    private _t:NodeInternalType;


    constructor( pName:string, pValue:T[] = [], pType:NodeInternalType = NodeInternalType.USER_ACCOUNT) {
        this._n = pName;
        this._v= pValue;
        this._t = pType;
    }


    get name():string {
        return this._n;
    }

    get value():T[] {
        return this._v;
    }


    set value(v:T[]) {
        this._v = v;
    }

    /*
    get usergroup():UserGroupUUID {
        return this._t;
    }

    set usergroup(g:UserGroupUUID) {
        this._g = g;
    }*/

    is(pType:NodeInternalType):boolean {
        return (this._t===pType);
    }

    /**
     * To create an instance from a poor object
     * @param {any} pData
     */
    static from<T>(pData:AccessAttributeOptions<T>):AccessAttribute<T> {
        return new AccessAttribute<T>(pData.name, (pData.hasOwnProperty('value')? pData.value : ([] as T[]) ),pData.type);
    }

    append(pVal:T):void {
        if(this._v==null) this._v = [];

        if(this._v.indexOf(pVal)>-1) return;

        this._v.push(pVal);
    }
    /**
     * To clone without value
     *
     */
    clone():AccessAttribute<T> {
        return new AccessAttribute(this._n, [], this._t);
    }


    /**
     * To serialize into poor object ready to be serialized
     *
     * @param {boolean} pAll If true object is converted into poor object, else, only value is serialized
     * @method
     */
    toJsonObject(pAll:boolean = false):any {
        if(pAll){
            return {
                _n: this._n,
                _v: (this._v != null && this._v.hasOwnProperty('toJsonObject'))? (this._v as any).toJsonObject() : this._v,
                _t: this._t
            };
        }else{
            return (this._v != null && this._v.hasOwnProperty('toJsonObject'))? (this._v as any).toJsonObject() : this._v;
        }

    }
}