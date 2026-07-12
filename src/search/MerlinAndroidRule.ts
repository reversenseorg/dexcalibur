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

import { MerlinSearchRequest} from "./MerlinSearchRequest.js";
import {MerlinRule, MerlinRuleOptions, SearchOptions } from "./MerlinRule.js";
import {SerializedSearchRequest} from "../audit/common/SerializedMerlinPrimitive.js";
import {Nullable} from "../core/IStringIndex.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";

export class MerlinAndroidRule extends MerlinRule {

    targetOS = OperatingSystem.ANDROID;

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.ANDROID, pOpts);
    }

    override getRequestByNode(pRequestOpts:SerializedSearchRequest,pOpts:SearchOptions|any|null):Nullable<MerlinSearchRequest> {
        switch (pRequestOpts.node){
            case "javaClass": return this.javaClass(pRequestOpts.pattern, pOpts);
            case "javaCallToMethod": return this.javaCallToMethod(pRequestOpts.pattern, pOpts);
            case "javaCallWithArgsAssert": return this.javaCallWithArgsAssert(pRequestOpts.pattern, pOpts);
            case "uiInputText": return this.uiInputText(pRequestOpts.pattern, pOpts);
            default: return null;
        }
    }

    javaClass( pRequest:any, pOptions:SearchOptions|null = null):MerlinSearchRequest {
        return this.class(pRequest,pOptions);
    }

    javaCallToMethod( pRequest:any, pScope:any = null):MerlinSearchRequest {
        return this.method("called."+pRequest );
    }

    // TODO
    javaCallWithArgsAssert( pRequest:any, pArgsRule:any = null):MerlinSearchRequest {
        let r = this.method("called."+pRequest);
        // r.assertArgs(1, "value", this.get.field("name:^a"))
        return r;
    }

    uiInputText( pRequest:any, pScope:any = null):MerlinSearchRequest {
        return this.method("called.enclosingClass.name:android\.widget\.EditText"+pRequest );
    }

    toJsonObject(): any {
        return super.toJsonObject();
    }
}