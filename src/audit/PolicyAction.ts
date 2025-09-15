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