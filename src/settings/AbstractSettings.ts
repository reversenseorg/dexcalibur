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

import {IncomingValue} from "../security/SanitizedValue.js";


export abstract class AbstractSettings {

    protected parent:AbstractSettings = null;

    constructor( pParent:AbstractSettings = null) {
        this.parent = pParent;
    }

    /**
     * To trigger global saving
     *
     * @param {string} pDestPath Optional. Backup file path
     * @method
     */
    save(pDestPath:string = null):any {
        return (this.parent!=null ? this.parent.save(pDestPath) : null)
    }



    abstract sanitize( pName:string, pValue:any):IncomingValue;

    abstract update( pValue:IncomingValue):void;

    abstract toObject():any;
}