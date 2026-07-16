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

import {IntentFilter} from "./IntentFilter.js";
import * as Log from '../Logger.js';
import AndroidComponent from "./AndroidComponent.js";

import {NodeInternalType} from "@reversense/dxc-core-api";
import {
    NodeType,
    DataSourceHelper,
    NodeProperty,
    DbDataType,
    DbKeyType,
    NodePropertyState
} from "@reversense/dexcalibur-orm";
import ModelClass from "../ModelClass.js";
import AndroidProvider from "./AndroidProvider.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidReceiver extends AndroidComponent
{
    static TYPE:NodeType = (new NodeType( "androidReceiver", NodeInternalType.ANDROID_RECEIVER, [
        (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("label")).type(DbDataType.STRING).def(""),
        (new NodeProperty("attr")).type(DbDataType.STRING).def({}),
        (new NodeProperty("metadata")).type(DbDataType.STRING).def({}),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("intentFilters"))
            .type(DbDataType.STRING)
            .sleep( (x:NodePropertyState)=>{
                if(x.p==null) return [];

                let filters=[];
                x.p.map(y => filters.push(y.toJsonObject()));

                return filters;
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p==null) return [];

                let filters=[];
                x.p.map(y => {
                    filters.push(new IntentFilter(y))
                });
                return filters;
            })
            .def([]),
        (new NodeProperty("__impl")).single(ModelClass.TYPE),
    ])).dataSource("PROJECT_DB");
       // .dataSource("MEM", "androidReceiver");

    type = "receiver";
    __:NodeInternalType = NodeInternalType.ANDROID_RECEIVER;

    constructor(config:any=null){
        super();

        // auto config
        if(config != null){
            for(let i in config)
                if(this[i] !==  undefined)
                    this[i] = config[i];

            if(this.name != null)
                this.generateUID();
        }
    }


    static fromXml(xmlobj:any):AndroidReceiver{
        let act:AndroidReceiver = new AndroidReceiver();

        for(let j in xmlobj){
            switch(j){
                case '$':
                    act.setAttributes(xmlobj.$);
                    act.label = act.attr.label;
                    act.name = act.attr.name;

                    try{
                        act.generateUID();
                    }catch(e){
                        Logger.error("[RECEIVER] Manifest parsing error : an service has not name");
                    }

                    break;
                case 'intent-filter':
                    for(let i=0; i<xmlobj[j].length; i++){
                        act.addIntentFilters(
                            IntentFilter.fromXml(xmlobj[j][i])
                        );
                    }
                    break;
            }
        }


        return act;
    }
}
AndroidReceiver.TYPE.builder(AndroidReceiver);
