import {DbDataType, NodeProperty} from "@dexcalibur/dexcalibur-orm";


export enum ActionType {
    SEND_EMAIL='send:email',
    REPORT_WARNING='report:warning'
}

export enum PolicyRuleCondition {
    NONE="none",
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
    METADATA_IN_LIST='meta-in-list'
}

export interface Threshold {

}

export interface SendMailActionOptions {
    email:string[],
    comment?:string;
}


export interface PolicyAction {
    type: ActionType;
    name?:string;
    description?:string;
    opts: any;
}

export interface PolicyRuleOptions {
    id?:string;
    name?:string;
    description?:string;
    version?:string;
    enabled?:boolean;
    control?: string/*ControlNodeCanonicalUID*/[];
    condition?: PolicyRuleCondition;
    thresholds?: Threshold[];
    actions?:PolicyAction[];
}

/**
 *
 * @class
 */
export class PolicyRule {


    // COMMON

    id:string;

    name:string;

    description:string;

    version:string;

    enabled = false;

    // RULE

    control: string/*ControlNodeCanonicalUID*/[] = [];

    condition: PolicyRuleCondition;

    thresholds: Threshold[] = [];

    actions: PolicyAction[] = [];



    constructor(pOptions:PolicyRuleOptions = {}) {
        if(pOptions.id!=null) this.id = pOptions.id;
        if(pOptions.name!=null) this.name = pOptions.name;
        if(pOptions.description!=null) this.description = pOptions.description;
        if(pOptions.version!=null) this.version = pOptions.version;
        if(pOptions.enabled!=null) this.enabled = pOptions.enabled;
        if(pOptions.control!=null) this.control = pOptions.control;
        if(pOptions.condition!=null) this.condition = pOptions.condition;
        if(pOptions.thresholds!=null) this.thresholds = pOptions.thresholds;
        if(pOptions.actions!=null) this.actions = pOptions.actions;
    }

    getUID():string {
        return this.id;
    }


    /**
     * To prepare to json serialized
     *
     * @method
     */
    toJsonObject():any{
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            version: this.version,
            enabled: this.enabled,
            control: this.control,
            condition: this.condition,
            thresholds: this.thresholds,
            actions: this.actions,
        };
    }



    static fromUnsafeObject(pOptions:PolicyRuleOptions) {
        return new PolicyRule(pOptions);
    }
}