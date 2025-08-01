import {OperatingSystem} from "../platform/OperatingSystem.js";
import {MerlinRule, MerlinRuleOptions, MerlinRuleType, SearchOptions } from "./MerlinRule.js";

export class MerlinTizenRule extends MerlinRule {

    targetOS = OperatingSystem.TIZEN;

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.TIZEN, pOpts);
    }

    toJsonObject(): any {
        return super.toJsonObject();
    }
}