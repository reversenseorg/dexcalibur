
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

import * as Log from './Logger.js';
import RadareHelper, {R2_TYPE} from "./R2Helper.js";
import DexcaliburProject from "./DexcaliburProject.js";
import ModelFile from "./ModelFile.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export default class RadareFactory
{
    helpers: Record<string, RadareHelper> = {}
    ctx:DexcaliburProject = null;

    constructor( pProject:DexcaliburProject) {
        this.ctx = pProject;
    }



    /**
     * To create an instance of RadareHelper connected to r2 over HTTP
     * @param pURL
     */
    newRemoteInstance( pBinary:ModelFile, pURL:string): RadareHelper {
        return this.helpers[pBinary.getUID()] = new RadareHelper( pBinary, R2_TYPE.HTTP, { url:pURL, ctx:this.ctx });
    }

    /**
     * To create an instance of RadareHelper spawning a local r2 process
     * @param pBinary
     */
    async newLocalInstance( pBinary:ModelFile):Promise<RadareHelper> {
        const f = pBinary.getUID()
        this.helpers[f] = new RadareHelper( pBinary, R2_TYPE.LOCAL, { ctx:this.ctx });
        await this.helpers[f].start([]);
        return this.helpers[f];
    }

    /**
     * To get the helper associated to a file
     *
     * @param {string} pBinary Analyzed file
     * @return {RadareHelper}
     */
    getHelperFor(pBinary:ModelFile):RadareHelper {
      //  Logger.raw(Object.keys(this.helpers).join(";"),"          '",pBinary.getUID(),"'")
        return this.helpers[pBinary.getUID()];
    }

    /**
     * To check if an helper exists for the target file
     *
     * @param pBinary
     */
    isOpened(pBinary:ModelFile):boolean {
        //Logger.raw(Object.keys(this.helpers).join(";"),"          ",pBinary.getUID())
        //return this.helpers.hasOwnProperty(pBinary.getUID());
        return (Object.keys(this.helpers).indexOf(pBinary.getUID())>-1);
    }

}
