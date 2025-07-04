import {AssuranceModelUUID} from "./common/AssuranceModel.js";
import {ActionType, PolicyAction, PolicyRule, PolicyRuleCondition} from "./PolicyRule.js";
import {Policy} from "./Policy.js";
import {PiiCriticity} from "./privacy/pii/PiiCategory.js"
import {PolicyActionFactory} from "./PolicyActionFactory.js";
import {MetadataTopic} from "./common/ControlAssessment.js";



export class PolicyRuleFactory {

    static ALL = {
        alert: new PolicyRule({
            name: "Alert on new finding",
            description: "To warn and perform assigned actions when a scan found new things related to previous version of the same application",
            version: "1.0",
            condition: PolicyRuleCondition.NEWOCC,
            thresholds: [1],
            control: null,
            actions: [
                PolicyActionFactory.createAction(ActionType.SEND_EMAIL)
            ]
        }),
        high_pii_criticity: new PolicyRule({
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
        require_consent: new PolicyRule({
            name: "Require Consent Warning",
            description: "To check if detected component require user consent accordingly to a set a tracker purpose",
            version: "1.0",
            condition: PolicyRuleCondition.METADATA_IN_LIST,
            thresholds: [
                {
                    key: MetadataTopic.CATEGORY,
                    in: [
                        ""
                    ]
                }
            ],
            control: null,
            actions: [
                //{ type: ActionType.REPORT_WARNING, opts:{ color: "#F00", style:"danger" } }
                PolicyActionFactory.createAction(ActionType.REPORT_WARNING)
            ]
        })
    }


    static MODELS:Record<string, Policy> = {
        "privacy.pii3": new Policy({
            name: "Generic policy for Personal Identifiable Information (PII)",
            description: "This policy offers various rules to customise dashboard, reports and CTA",
            version: "1.0",
            rules: [
                PolicyRuleFactory.ALL.alert
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