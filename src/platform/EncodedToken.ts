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

import {Endianness} from "../core/Endianness.js";
import {Nullable} from "../core/IStringIndex.js";


export interface EncodedTokenOptions {
    value?: number;
    byteSize?: number;
    key?: string;
    type?:string;
    endianness?: Endianness;
}

export default class EncodedToken  {
    key: string;
    value: number;
    byteSize: number;
    type:string;
    endianness: Endianness = Endianness.LITTLE_ENDIAN;

    constructor( pConfig:Nullable<EncodedTokenOptions> = null) {
        if(pConfig!=null){
            this.key = pConfig.key!;
            this.byteSize = pConfig.byteSize!;
            this.value = pConfig.value!;
            this.endianness = pConfig.endianness!;
            this.type = pConfig.type!;
        }
    }

    equalValue(pValue:number, pValueEndianness:Endianness):boolean {
        return (this.value == pValue);
    }

    toJsonObject():any {
        return {
            key: this.key,
            value: this.value,
            byteSize: this.byteSize,
            type: this.type,
            endianness: this.endianness
        }
    }
}