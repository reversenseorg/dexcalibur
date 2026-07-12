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

import {IPersistent} from "../../persist/orm/IPersistent.js";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;
import {NodeType} from "@dexcalibur/dexcalibur-orm";




export class HookBuilderRule implements IPersistent {

    static TYPE:NodeType = new NodeType("hook_builder_rule", NodeInternalType.HOOK_BUILDER_RULE, [

    ]);

    __:NodeInternalType = NodeInternalType.HOOK_BUILDER_RULE;

    uid:string = null;
    name:string = null;
    descr:string = null;
    htype:string = null;
    rtype:string = null;


    constructor() {

    }

    getUID():string {
        return this.uid;
    }
}