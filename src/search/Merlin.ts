import {MerlinRule, MerlinRuleOptions} from "./MerlinRule.js";
import {OperatingSystem} from "../OperatingSystem.js";
import { MerlinAndroidRule } from "./MerlinAndroidRule.js";
import {MerlinIosRule} from "./MerlinIosRule.js";

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
            case OperatingSystem.IOS:
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

    static ios( pRuleOption:MerlinRuleOptions = {}):MerlinIosRule {
        return new MerlinIosRule(pRuleOption);
    }

    /*
    static tizen( pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule {
        return new MerlinAndroidRule(pRuleOption);
    }

    static darwin( pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule {
        return new MerlinAndroidRule(pRuleOption);
    }*/
}