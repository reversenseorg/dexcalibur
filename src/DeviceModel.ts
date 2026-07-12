

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

import {NodeType, INode, NodeProperty, DbDataType, DbKeyType} from "@dexcalibur/dexcalibur-orm";
import {IStringIndex} from "./core/IStringIndex.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";


export class DeviceModel implements INode {

    static TYPE:NodeType = new NodeType(
        "device_model",
        NodeInternalType.BRAND,
        [
            (new NodeProperty("_id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("brand")).type(DbDataType.STRING).def(null),
            (new NodeProperty("battery_size")).type(DbDataType.STRING).def(null),
            (new NodeProperty("battery_type")).type(DbDataType.STRING).def(null),
            (new NodeProperty("picture")).type(DbDataType.STRING).def(null),
            (new NodeProperty("os")).type(DbDataType.STRING).def(""),
            (new NodeProperty("released_at")).type(DbDataType.STRING).def(""),
            (new NodeProperty("chipset")).type(DbDataType.STRING).def(""),
            (new NodeProperty("ram")).type(DbDataType.STRING).def(""),
            (new NodeProperty("specifications")).type(DbDataType.BLOB).def({}),
            (new NodeProperty("deleted_at")).type(DbDataType.STRING).def(""),
            (new NodeProperty("created_at")).type(DbDataType.STRING).def(""),
            (new NodeProperty("updated_at")).type(DbDataType.STRING).def(""),

        ])
        .descr(`
Represent a **device_model** node - such as "Motorola One Vision" - in the universal representation.          
Device models are stored into instance of DeviceModel class.
        `);

    __:NodeInternalType = NodeInternalType.DEVICE_MODEL;

    _id:string = ""
    name: string = "";
    brand: string = "";
    picture: string = "";
    os: string = "";
    ram: string = "";
    chipset: string = "";
    released_at: string = "";
    battery_size: string = "";
    battery_type: string = "";
    deleted_at:string = "";
    created_at:string = "";
    updated_at:string = "";

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
DeviceModel.TYPE.builder(DeviceModel);