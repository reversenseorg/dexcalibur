
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

import {JavaHookBuilder} from "./JavaHookBuilder.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {NativeHookBuilder} from "./NativeHookBuilder.js";
import {IDatabase, IDbCollection} from "@reversense/dexcalibur-orm";


export class HookBuilder {


    private _db:IDbCollection = null;

    java:JavaHookBuilder = null;
    native:NativeHookBuilder = null;

    constructor( pContext:DexcaliburProject) {
        this.java = new JavaHookBuilder(pContext);
        this.native = new NativeHookBuilder(pContext);
    }

    /**
     * To init KP manager according to target OS
     */
    init( pDB:IDatabase):HookBuilder{
        /*
        if(pDB == null) throw JavaHookBuilderException.INVALID_DB();

        this._db = (pDB as SqliteDb).newCollection( HookBuilderRule.TYPE.getName(), HookBuilderRule.TYPE) ;
        this._db.getAll(false, true);

        if(this._db.size() == 0){

        }

*/
        return this;
    }
}