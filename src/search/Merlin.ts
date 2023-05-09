import {MerlinRule, MerlinRuleOptions} from "./MerlinRule.js";
import {OperatingSystem} from "../OperatingSystem.js";
import { MerlinAndroidRule } from "./MerlinAndroidRule.js";

export interface RuleOption {
    score?:number
}

export enum MerlinScopes {
    FROM_OUTSIDE,
    TO_OUTSIDE
}

/**
 * Decontextualized API to write detection/verifying rules
 *
 * @class
 */
export class Merlin {


    static static( pTargetOS:OperatingSystem, pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule|MerlinRule {
        switch (pTargetOS){
            case OperatingSystem.ANDROID:
                return new MerlinAndroidRule(pRuleOption);
                break;
            default:
                return new MerlinRule(undefined, pRuleOption);
                break;
        }

    }

    static android( pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule {
        return new MerlinAndroidRule(pRuleOption);
    }

}