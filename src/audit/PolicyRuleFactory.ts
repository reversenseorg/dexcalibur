import {AssuranceModelUUID} from "./common/AssuranceModel.js";
import {ActionType, PolicyAction, PolicyRule, PolicyRuleCondition} from "./PolicyRule.js";
import {Policy} from "./Policy.js";
import {PiiCriticity} from "./privacy/pii/PiiCategory.js"
import {PolicyActionFactory} from "./PolicyActionFactory.js";
import {MetadataTopic} from "./common/Metadata.js";



export class PolicyRuleFactory {

    static ALL = {
        alert: new PolicyRule({
            id: "alert",
            name: "Alert on new finding",
            description: "To warn and perform assigned actions when a scan found new things related to previous version of the same application",
            version: "1.1",
            condition: PolicyRuleCondition.NEWOCC,
            thresholds: [1],
            control: null,
            actions: [
                PolicyActionFactory.createAction(ActionType.REPORT_WARNING)
            ]
        }),
        high_pii_criticity: new PolicyRule({
            id: "high_pii_criticity",
            name: "Alert on high risk finding",
            description: "To warn and perform assigned actions when a scan found high risk issues",
            version: "1.0",
            condition: PolicyRuleCondition.CRITICITY,
            thresholds: [  PiiCriticity.SENSITIVE ],
            control: null,
            actions: [
                //{ type: ActionType.REPORT_WARNING, opts:{ color: "#F00", style:"danger" } }
                PolicyActionFactory.createAction(ActionType.REPORT_WARNING)
            ]
        }),
        custom_sdk_purpose: new PolicyRule({
            id: "custom_sdk_purpose",
            name: "Custom SDK purposes",
            description: "To add or remove SDK purpose to fit organization policy",
            version: "1.0",
            condition: PolicyRuleCondition.NONE,
            control: null,
            actions: [
                //{ type: ActionType.REPORT_WARNING, opts:{ color: "#F00", style:"danger" } }
                PolicyActionFactory.createAction(ActionType.REPORT_WARNING)
            ]
        }),
        require_consent: new PolicyRule({
            id: "require_consent",
            name: "Require Consent Warning",
            description: "To check if detected component require user consent accordingly to a set a tracker purpose",
            version: "1.0",
            condition: PolicyRuleCondition.METADATA_IN_LIST,
            thresholds: [
                {
                    type: "meta",
                    key: MetadataTopic.PURPOSE,
                    in: []
                }
            ],
            control: null,
            actions: [
                //{ type: ActionType.REPORT_WARNING, opts:{ color: "#F00", style:"danger" } }
                PolicyActionFactory.createAction(ActionType.REPORT_WARNING)
            ]
        }),
        analyze_tp_sdk: new PolicyRule({
            id: "analyze_tp_sdk",
            name: "Group by Third-party SDKs",
            description: "To group results by third-party SDKs",
            version: "1.0",
            condition: PolicyRuleCondition.NONE,
            actions:[]
        }),
        analyze_pii: new PolicyRule({
            id: "analyze_pii",
            name: "Search PII manipulated by SDKs",
            description: "To search manipulated personal data for each detected SDK.",
            version: "1.0",
            condition: PolicyRuleCondition.NONE,
            actions:[]
        })
    }


    static MODELS:Record<string, Policy> = {
        "privacy.pii3": new Policy({
            name: "Generic policy for Personal Identifiable Information (PII)",
            description: "This policy offers various rules to customise dashboard, reports and CTA",
            version: "1.0",
            rules: [
                PolicyRuleFactory.ALL.alert,
                //PolicyRuleFactory.ALL.high_country_criticity,
                PolicyRuleFactory.ALL.analyze_tp_sdk
            ]
        }),
        "privacy.trackers.shared": new Policy({
            name: "Generic Third-part SDK policy",
            description: "This policy offers various rules to customise dashboard, reports and CTA",
            version: "1.0",
            rules: [
                PolicyRuleFactory.ALL.alert,
                PolicyRuleFactory.ALL.high_pii_criticity,
                PolicyRuleFactory.ALL.require_consent,
                PolicyRuleFactory.ALL.analyze_pii,
                PolicyRuleFactory.ALL.custom_sdk_purpose
            ]
        }),
    };


    static newGenericPolicy():Policy {
        return new Policy({
            name: "Generic policy for any purpose",
            description: "This policy offers various rules to customise dashboard, reports and CTA",
            version: "1.0",
            rules: []
        });
    }

    /**
     *
     * @param pModel
     */
    static fromModel(pModel:AssuranceModelUUID):Policy {

        let policy = PolicyRuleFactory.MODELS[pModel];
        if(policy==null){
            return PolicyRuleFactory.newGenericPolicy();
        }else{
            return policy;
        }
    }

}