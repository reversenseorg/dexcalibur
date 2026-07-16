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

import {NodeType} from "@reversense/dexcalibur-orm";
import {DataSourceException} from "./errors/DataSourceException.js";
import DexcaliburProject from "./DexcaliburProject.js";
import * as Log from "./Logger.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class DataSource {

    name:string;
    private _fn:any = null;
    private _handlers:any = {};

    constructor( pName:string, pFind:any) {
        this.name = pName;
        this._fn = pFind;
    }

    getQueryFn():any {
        return this
    }

    /*
     *
     * @param pNodeType {string}
     * @private
     */
    /*private _getHandler( pNodeType:NodeType):any {
        const h = this._handlers[pNodeType.getName()];
        if(h == null){
            throw DataSourceException.NO_HANDLER_DEFINED(pNodeType.getName())
        }

        return h;
    }*/

    /**
     * To find instance for 1 node by using its UID
     *
     * @param pNodeType
     * @param pProject
     * @param pUID
     */
    find( pNodeType:NodeType, pProject:DexcaliburProject, pUID:any):any{
        if(pUID == null) return null;

        return this._fn.single.call( null, pProject, pNodeType, pUID);
    }


    /**
     * To find all instances with specified UIDs
     *
     * @param pNodeType
     * @param pProject
     * @param pUID
     */
    findMult( pNodeType:NodeType,  pProject:DexcaliburProject, pUID:any[]):any{

        if(pUID == null || pUID.length == 0) return [];

        if(this._fn.multi != null){
            return (this._fn.multi.call( null, pProject, pNodeType)).call( null, pUID);
        }else{
            const entries:any = [];
            const find1 = this._fn.single.call( null, pProject, pNodeType, pUID);

            pUID.map( (vUID:any)=>{
                entries.push( find1.call(null, vUID) );
            });

            return entries;
        }
    }

    register( pNodeType:NodeType, pExtra:any):void{
        this._handlers[pNodeType.getName()] = pExtra;
    }
}