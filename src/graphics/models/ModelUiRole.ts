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
import {DbDataType, DbKeyType, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {Nullable} from "../../core/IStringIndex.js";

export interface UiRoleOpts {
    _uid?:string;
    version?:string;
    description?:string;
    tags?:number[];
    name?:string;
    tagNames?:string[];
}

export default class ModelUiRole extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_role", NodeInternalType.UI_ROLE, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("tagNames")).type(DbDataType.STRING).def([]),
        (new NodeProperty("version")).type(DbDataType.STRING).def(null),
        (new NodeProperty("description")).type(DbDataType.STRING).def(null),
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.UI_ROLE;

    name:string;
    version = "1.0.0";
    description = "";
    tagNames:string[] = [];

    constructor(pConfig:Nullable<UiRoleOpts>=null){
        super(STUB_TYPE.UI_ROLE);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }


}
ModelUiRole.TYPE.builder(ModelUiRole);