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

import ModelResource from "../ModelResource.js";
import {DataLocation, DataLocationType} from "../DataLocation.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import ModelStringValue from "../ModelStringValue.js";


export interface PlistOptions {
    data?:any;
}

/**
 *
 */
export class PlistDocument {


    data:any = {};

    constructor(pOptions:any = {}) {
        if(pOptions.data!=null) this.data = pOptions.data;
    }

    getData(pKey:string):any {
        return this.data[pKey];
    }

    addPair(pKey: string, pData: any, pRaw = false) {
        if(typeof pData==="string" && pRaw==false){
            this.data[pKey] = new ModelStringValue({
                value: pData
            })
        }else{
            this.data[pKey] = pData;
        }
    }


    toModelResource( pLocation:Nullable<DataLocation> = null):ModelResource<any> {

        return new ModelResource({
            location: pLocation,
            _uid: null,
            //name: this.getLocalId(pUID),
            value: this.data
        });
    }
}