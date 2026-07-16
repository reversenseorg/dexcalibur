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

import {MerlinRule, MerlinRuleOptions} from "./MerlinRule.js";
import {OperatingSystem} from "@reversense/dxc-core-api";
import { MerlinAndroidRule } from "./MerlinAndroidRule.js";
import {MerlinIosRule} from "./MerlinIosRule.js";
import {MerlinFlutterRule} from "./MerlinFlutterRule.js";
import {MerlinPrimitive, MerlinType} from "./MerlinPrimitive.js";

/**
 * Decontextualized API to write detection/verifying rules
 *
 * @class
 */
export class Merlin {


    static static( pTargetOS:OperatingSystem = null, pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule|MerlinRule {
        switch (pTargetOS){
            case OperatingSystem.ANDROID:
                return new MerlinAndroidRule(pRuleOption);
                break;
            case OperatingSystem.IOS:
                return new MerlinIosRule(pRuleOption);
                break;
            default:
                return new MerlinRule(undefined, pRuleOption);
                break;
        }

    }

    static isRule(pRule:MerlinPrimitive):boolean {
        return (pRule.TYPE==MerlinType.RULE);
    }

    static isSearchRequest(pRule:MerlinPrimitive):boolean {
        return (pRule.TYPE==MerlinType.REQUEST);
    }

    static android( pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule {
        return new MerlinAndroidRule(pRuleOption);
    }

    static ios( pRuleOption:MerlinRuleOptions = {}):MerlinIosRule {
        return new MerlinIosRule(pRuleOption);
    }


    static tizen( pRuleOption:MerlinRuleOptions = {}):MerlinRule {
        return new MerlinRule(OperatingSystem.TIZEN, pRuleOption);
    }

    static darwin( pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule {
        return new MerlinAndroidRule(pRuleOption);
    }

    static flutter( pRuleOption:MerlinRuleOptions = {}):MerlinFlutterRule {
        return new MerlinFlutterRule(pRuleOption);
    }

    /*
    static fromJsonObject(pObject:any):MerlinAndroidRule|MerlinIosRule|MerlinRule {


        switch (pObject.targetOS){
            case OperatingSystem.ANDROID:
                return MerlinAndroidRule.fromJsonObject(pObject);
                break;
            case OperatingSystem.IOS:
                return MerlinIosRule.fromJsonObject(pObject);
                break;
            default:
                return MerlinRule.fromJsonObject(pObject);
                break;
        }
    }*/
}