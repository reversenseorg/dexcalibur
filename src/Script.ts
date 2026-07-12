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

import * as VM from 'vm';
import {ScriptException} from "./errors/ScriptException.js";

/**
 * Represent a Dexcalibur script
 *
 * @class
 */
export class Script {

    /**
     * Script ID
     *
     * @field
     * @type {string}
     * @public
     */
    sid:number = null;

    /**
     * Script name
     *
     * @field
     * @type {string}
     * @public
     */
    name:string = null;

    /**
     * Description of the script
     *
     * @field
     * @type {string}
     * @public
     */
    description:string = "No description";

    /**
     * Script source code
     *
     * @field
     * @type {string}
     * @public
     */
    code:string = null;

    scratchpad:boolean = true;

    /**
     *
     * @param pConfig
     * @constructor
     */
    constructor( pConfig:any = null) {
        if(pConfig != null){
            for(const i in pConfig){
                this[i] = pConfig[i];
            }
        }
    }

    /**
     * Set description text
     *
     * @param pText
     */
    setDescription( pText:string){
        this.description = pText;
    }

    /**
     * Set description text
     *
     * @param pText
     */
    setCode( pText:string){
        this.code = pText;
    }

    /**
     * Set description text
     *
     * @param pText
     */
    setName( pText:string){
        this.name = pText;
    }

    /**
     * To execute the script
     *
     * @param {any} pEnv
     */
    execute( pEnv:any ):boolean {
        if(this.code.length == 0){
            throw ScriptException.EMPTY_SCRIPT();
        }

        const script = new VM.Script(this.code);

        VM.createContext(pEnv);
        script.runInContext(pEnv);

        return true;
    }

    /**
     * To check if the script comes from scratchpad or must be saved
     *
     * @return {boolean} Return TRUE if the script come from scratchpad
     * @method
     */
    isScratchPad():boolean {
        return this.scratchpad;
    }
}