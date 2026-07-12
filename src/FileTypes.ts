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

// add xml, yaml, properties, jks, bks (...)  parsers
// add file type identifier

import * as Log from './Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class EncodedDataType
{
    mime:string = null;
    ext:string = null;

    constructor(pConfig:any){
        if(pConfig!=null)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }


    isMIME(format:string):boolean{
        return this.mime===format;
    }

    isExt(format:string):boolean{
        return this.ext===format;
    }
}


export const TYPES = {
    BKS: new EncodedDataType({ ext: "bks" }),
    XML: new EncodedDataType({ ext: "xml" }),
    JSON: new EncodedDataType({ ext: "json" }),
    YAML: new EncodedDataType({ ext: "yml" }),
    PROP: new EncodedDataType({ ext: "properties" })
};

