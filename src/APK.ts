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

import * as _path_ from 'path';
import {CoreDebug} from "./core/CoreDebug.js";
import {Nullable} from "./core/IStringIndex.js";
import TargetApp, {AppFormatType} from "./common/TargetApp.js";


export default class APK extends TargetApp
{
    override format:AppFormatType = AppFormatType.PACKAGE;

    constructor( pPath:string = null){
        super( pPath, 'apk');
    }

    getLibPath(){

    }

    getAssets(){

    }

    getPath():string{
        return this.path;
    }

    setPath( pPath:string){
        this.path = _path_.normalize(pPath);
    }

    /**
     * TODO : Add NodeType definition and prevent prototype pollution
     * @param pConfig
     */
    static fromJsonObject(pConfig):APK{
        let o:any = new APK();
        for(let i in pConfig){
            switch(i){
                case 'path':
                    o.path = _path_.normalize(pConfig.path);
                    break;
                default:
                    o[i] = pConfig[i];
                    break;
            }
        }
        return o as APK;
    }

    toJsonObject():any{
        let o:any = {};
        for(let i in this) o[i] = this[i];
        CoreDebug.checkJsonSerialize(o,"APK");
        return o;
    }
}
