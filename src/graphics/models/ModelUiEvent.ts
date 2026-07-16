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
import {DbDataType, DbKeyType, DbSerialize, INode, NodeProperty, NodeType} from "@reversense/dexcalibur-orm";
import {NodeInternalType} from "@reversense/dxc-core-api";

/**
 *
 */
export default class ModelUiEvent extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_evt", NodeInternalType.UI_EVT, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("time")).type(DbDataType.INTEGER).def(-1),
        (new NodeProperty("data")).type(DbDataType.BLOB).serialize(DbSerialize.JSON).def(null),
        (new NodeProperty("source")).type(DbDataType.BLOB).def(null),
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.UI_EVT;

    tags:number[] = [];
    time:number = -1;
    data:any = null;
    source:INode = null;

    constructor(pConfig:any=null){
        super(STUB_TYPE.UI_EVT);

        if(pConfig != null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

}
ModelUiEvent.TYPE.builder(ModelUiEvent);