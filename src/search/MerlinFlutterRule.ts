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

import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import {OperatingSystem} from "@reversense/dxc-core-api";
import {MerlinRule, MerlinRuleOptions, MerlinRuleType, SearchOptions } from "./MerlinRule.js";
import {SerializedSearchRequest} from "../audit/common/SerializedMerlinPrimitive.js";
import {Nullable} from "../core/IStringIndex.js";

export class MerlinFlutterRule extends MerlinRule {

    targetOS = OperatingSystem.FLUTTER;

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.FLUTTER, pOpts);
    }

    override getRequestByNode(pRequestOpts:SerializedSearchRequest,pOpts:SearchOptions|any|null):Nullable<MerlinSearchRequest> {
        switch (pRequestOpts.node){
            case "constant": return this.constant(pRequestOpts.pattern, pOpts);
            //case "assets": return this.constant(pRequestOpts.pattern, pOpts);
            default: return null;
        }
    }

    constant( pRequest:any, pOptions:SearchOptions|null = null):MerlinSearchRequest {
        return this.field(pRequest,pOptions);
    }

    toJsonObject(): any {
        return super.toJsonObject();
    }
}