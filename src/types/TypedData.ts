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

import {T} from "./Types.js";

export enum VAL_TYPE {
    CONSTANT,
    INOUT,
    OUTPUT
}

/**
 * @class
 */
export class TypedData {
    /**
     * Data type
     * See T
     * @field {string}
     */
    t:number = T.UINT32;

    /**
     * Type or arg name
     * @field {string}
     */
    n:string = null;

    /**
     * Register number holding extra value required to
     * interpret current data
     * @field {number}
     */
    r:number = -1;

    /**
     * Meaning of the value (conceptually) : file descriptor, pointer to struct, flags, ...
     * @field {Types.L}
     */
    l:number;

    /**
     * Optional. If the mean of the data is specified, an extra value to help to parse
     * or the parser
     * @field {any}
     */
    f?:any;

    /**
     * A flag if the value is constant ('const' keyword).
     * Non-constant value can be updated bue the syscall.
     *
     * Default is FALSE
     * @field {boolean}
     */
    c:boolean = false;

    /**
     * Optional. The list of error codes which can be hold by this data.
     * It helps to define the type of return value.
     * @field {any}
     */
    e?:any;

    /**
     * The length of the data if the data is an array or a L.BUFFER
     * @type {number}
     * @field
     */
    len?:number; // size if l => BUFFER

    /**
     * The raw value
     * @type {number}
     * @field
     */
    v?:number;

    /**
     *
     * @param pCfg
     * @constructor
     */
    constructor(pCfg:any = null) {
        if(pCfg != null){
            for(let i in pCfg) this[i] = pCfg[i];
        }
    }

    /**
     *
     * @param pCfg {any} Config
     * @return {TypedData} An instance of TypedData
     * @method
     * @static
     */
    static from(pCfg:any){
        return new TypedData(pCfg);
    }

    static buffer(pType:TypedData, pSize:number =-1){
        return null; //pType.copy();
    }

    out(){
        return this.copy().update({ v: VAL_TYPE.OUTPUT });
    }

    update( pCfg:any){
        for(let i in pCfg){
            this[i] = pCfg[i];
        }
        return this;
    }

    copy( pName:string=null){
        let t:TypedData = new TypedData(this);
        if(pName!=null)  t.n = pName;
        return t;
    }

    constant(pConst = true){
        this.c  = pConst;
        return this;
    }

    asReturn( pError:any[]=[]){
        let t:TypedData = new TypedData(this);
        t.e = pError;
        return t;
    }
}