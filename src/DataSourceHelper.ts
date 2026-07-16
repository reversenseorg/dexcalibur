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

import {DataSource} from "./DataSource.js";
import DexcaliburProject from "./DexcaliburProject.js";
import {NodeType} from "@reversense/dexcalibur-orm";
import * as Log from "./Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class DataSourceHelper {

    static MEM:DataSource = (new DataSource("mem",{
        single: function(pProject:DexcaliburProject, pNodeType:NodeType, pUID:any):any{
            Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
            const o = pProject.getSearchEngine().get[pNodeType.getSourceAlias()](pUID);

            Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
            return o;
        }
    }));

    static FILE:DataSource = new DataSource("fs",{
        single: function(pProject:DexcaliburProject, pNodeType:NodeType, pUID:any):any{
            throw new Error("FILE datasource is deprecated. ");

            Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
            const o = pProject.getDB().getCollectionOf(pNodeType.getType()).getEntry(pUID);
            Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
            return o;
        }
    });
}