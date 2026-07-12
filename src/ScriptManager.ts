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

import {Script} from "./Script.js";
import DexcaliburProject from "./DexcaliburProject.js";


export class ScriptManager {

    currentProject:DexcaliburProject = null;

    scripts:Script[] = [];


    constructor( pProject:DexcaliburProject ) {
        this.currentProject = pProject;
    }

    /**
     * To get a script by its UID
     *
     * @param pSID
     */
    getScript( pSID:number):Script {
        for(let i=0; i<this.scripts.length; i++){
            if(this.scripts[i].sid === pSID) {
                return this.scripts[i];
            }
        }
        return null;
    }

    /**
     * @return {Script[]}
     */
    listScripts():Script[] {
        return this.scripts;
    }

    /**
     * To create a new script, if the script is not
     * from crashpad, it will be saved
     *
     * @param {Script} pScript Script instance
     * @method
     */
    newScript( pScript:Script):any{
        this.scripts.push(pScript);
        if(!pScript.isScratchPad()){
            this.save();
        }
    }

    /**
     *
     */
    save():void {

    }
}
