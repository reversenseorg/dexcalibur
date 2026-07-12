

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

export interface ExternalToolMap {
    [uid:string] :ExternalTool
}


/**
 * Represent configuration for an external tool
 *
 * TODO : replaced by External.Tool, external tool instances should
 *
 * @deprecated
 *
 * @class
 * @since 1.0.0
 */
export class ExternalTool {

    /**
     * Path of the binary
     * @type {string}
     * @field
     */
    _p:string  = null;


    private _uid:string = null;

    private _opts:any = {}

    constructor( pUID:string, pPath:string, pOptions:any={}) {
        this._uid = pUID;
        this._p = pPath;
        this._opts = pOptions;
    }

    getUID():string {
        return this._uid;
    }

    getPath():string {
        return this._p;
    }

    getOptions(){
        return this._opts;
    }
}