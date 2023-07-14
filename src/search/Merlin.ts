import {MerlinRule, MerlinRuleOptions} from "./MerlinRule.js";
import {OperatingSystem} from "../OperatingSystem.js";
import { MerlinAndroidRule } from "./MerlinAndroidRule.js";
import {MerlinIosRule} from "./MerlinIosRule.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {FinderResult} from "./FinderResult.js";
import ControlAssessment from "../audit/common/ControlAssessment.js";
import {BusSubscriber} from "../Bus.js";

export interface RuleOption {
    score?:number
}

export enum MerlinScopes {
    FROM_OUTSIDE,
    TO_OUTSIDE
}

export enum MerlinType {
    REQUEST,
    RULE
}

/**
 * @interface
 */
export interface MerlinPrimitive {
    TYPE: MerlinType

    execute?(pContext:any):Promise<FinderResult>;

    executeSync?(pContext:any):FinderResult;

    toJsonObject():any;

    toSearchString():string;

    hasBusSubscriber():boolean;

    getSubscribeList():string[];

    toBusSubscriber(pContext:any):BusSubscriber;
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

    /*
    static tizen( pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule {
        return new MerlinAndroidRule(pRuleOption);
    }

    static darwin( pRuleOption:MerlinRuleOptions = {}):MerlinAndroidRule {
        return new MerlinAndroidRule(pRuleOption);
    }*/

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
    }
}