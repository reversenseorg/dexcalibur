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

import {NodeType, INode} from "@reversense/dexcalibur-orm";
import {NodeInternalType} from "@reversense/dxc-core-api";
import {DeviceModel} from "./DeviceModel.js";
import {IStringIndex} from "./core/IStringIndex.js";


export class Brand implements INode {

    static TYPE:NodeType = new NodeType(
        "brand",
        NodeInternalType.BRAND,
        []);


    __:NodeInternalType = NodeInternalType.BRAND;

    _id:string;
    id: string = "";
    name: string;
    logo: string = "";

    models: DeviceModel[] = [];

    deleted_at:number = -1;
    created_at:number = -1;
    updated_at:number = -1;

    tags:number[] = [];

    constructor(pConfig:any) {
        if(pConfig != null){
            for(let i in pConfig){
                (this as IStringIndex<any>)[i]=pConfig[i];
            }
        }

        if(this.name==null){
            throw new Error("[BRAND] Name is mandatory");
        }
    }

    getUID():string {
        return this._id;
    }

    toJsonObject(pOption?: any): any {
        const o = {};

        // browse ppts
        for(const i in this){
            if(pOption!=null){

                // skip property if excluded
                if(pOption.exclude!=null && pOption.exclude.indexOf(i)>-1) continue;

                if(pOption.override!=null && pOption.override.hasOwnProperty(i)){
                    // @ts-ignore
                    o[i] = pOption.override[i];
                }else{
                    switch(i){
                        default:
                            // @ts-ignore
                            o[i] = this[i];
                            break;
                    }
                }
            }else {
                switch(typeof this[i]){
                    case "object":
                    default:
                        (o as IStringIndex<any>)[i] = this[i];
                        break;
                }
            }
        }

        return o;
    }

}
Brand.TYPE.builder(Brand);