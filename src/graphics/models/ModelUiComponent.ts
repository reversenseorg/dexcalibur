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

import {Savable, STUB_TYPE} from "../../ModelSavable.js";
import {DbDataType, DbKeyType, DbSerialize, NodeProperty, NodeType} from "@reversense/dexcalibur-orm";
import {NodeInternalType} from "@reversense/dxc-core-api";
import ModelUiComponentType from "./ModelUiComponentType.js";


export interface UiCmpState {
    created?: number[],
    destroyed?: number[],
    hidden?: number[],
    displayed?: number[]
}


export default class ModelUiComponent extends Savable
{
    static TYPE:NodeType = (new NodeType( "ui_cmp", NodeInternalType.UI_CMP, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("data")).type(DbDataType.BLOB).serialize(DbSerialize.JSON).def(null),
        (new NodeProperty("state")).type(DbDataType.BLOB).serialize(DbSerialize.JSON).def({})
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.UI_CMP;

    _uid:string = "";
    tags:number[] = [];
    data:any = null;
    state:UiCmpState = {};
    type:ModelUiComponentType;

    constructor(pConfig:any=null){
        super(STUB_TYPE.UI_CMP);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

}
ModelUiComponent.TYPE.builder(ModelUiComponent)