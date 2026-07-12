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

import {CoreDebug} from "./core/CoreDebug.js";


export enum AppIconFormat {
    VECTOR = 'vector',
    PNG = 'png'
}





/**
 * Represent an application icon
 *
 * @class
 */
export class AppIcon {

    fmt:AppIconFormat = AppIconFormat.VECTOR;

    data:any;

    localPath:string = "";
    appPath:string = "";

    /**
     * Icon Size
     */
    size:any = null;

    format:string = null;

    /**
     * @constructor
     * @param pConfig
     */
    constructor( pConfig:any = {}) {
        for(let i in pConfig)
            if(this.hasOwnProperty(i))
                this[i] = pConfig[i];
    }

    toJsonObject(){
        //let o:any = new Object();
        //for(let i in this) o[i] = this[i];
        const  o  =this;
        CoreDebug.checkJsonSerialize(o, "AppIcon");
        return o;
    }
}

