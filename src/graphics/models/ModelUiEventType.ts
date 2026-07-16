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
import {DbDataType, DbKeyType, NodeProperty, NodeType} from "@reversense/dexcalibur-orm";
import {NodeInternalType} from "@reversense/dxc-core-api";
import ModelUiRole from "./ModelUiRole.js";

/**
 *
 */
export default class ModelUiEventType extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_evt_type", NodeInternalType.UI_EVT_TYPE, [

        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("version")).type(DbDataType.STRING).def(null),
        (new NodeProperty("role")).single(ModelUiRole.TYPE).def(null),
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.UI_EVT_TYPE;

    description = "";

    constructor(pConfig:any=null){
        super(STUB_TYPE.UI_EVT_TYPE);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

}
ModelUiEventType.TYPE.builder(ModelUiEventType);