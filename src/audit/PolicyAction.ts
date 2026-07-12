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

import {IChange} from "../common/Change.js";
import {DbDataType, NodeProperty, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {ProjectInputPurpose} from "../analyzer/ProjectInput.js";
import {ControlNodeCanonicalUID} from "./common/AssuranceModel.js";

export enum PolicyRuleCondition {
    NEWOCC= 'newocc', // new occurence
    NEWOCC_SINCE = "newocc_since",
    NEWOCC_RELEASE_CTR = "newocc_relctr",
    DEFECT_SINCE = "defect_since",
    DEFECT_RELEASE_CTR = "defect_relctr",
    REMOVED= 'removed',
    REMOVED_RELEASE_CTR= 'removed_relctr',
    REMOVED_SINCE= 'removed_since',
    CRITICITY= 'criticity',
    RISK= 'risk',
}

export interface Threshold {

}

export interface PolicyRuleOptions {
    name?:string;
    description?:string;
    version?:string;
    enabled?:boolean;
}

/**
 *
 * @class
 */
export class PolicyRule {


    // COMMON

    name:string;

    description:string;

    version:string;

    enabled = false;

    // RULE

    control: ControlNodeCanonicalUID[] = [];

    condition: PolicyRuleCondition;

    thresholds: Threshold[] = [];



    constructor(pOptions:PolicyRuleOptions = {}) {
        if(pOptions.name!=null) this.name = pOptions.name;
        if(pOptions.description!=null) this.description = pOptions.description;
        if(pOptions.version!=null) this.version = pOptions.version;
        if(pOptions.enabled!=null) this.enabled = pOptions.enabled;
    }


    /**
     * To prepare to json serialized
     *
     * @method
     */
    toJsonObject():any{
        return {
            name: this.name,
            description: this.description,
            version: this.version,
            enabled: this.enabled
        };
    }

    static fromUnsafeObject(pOptions:PolicyRuleOptions) {
        return new PolicyRule(pOptions);
    }
}