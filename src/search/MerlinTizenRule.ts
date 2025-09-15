import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {MerlinRule, MerlinRuleOptions, MerlinRuleType, SearchOptions } from "./MerlinRule.js";
import {AndroidPermission} from "../android/Permissions.js";

export class MerlinTizenRule extends MerlinRule {

    targetOS = OperatingSystem.TIZEN;

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.TIZEN, pOpts);
    }

    toJsonObject(): any {
        return super.toJsonObject();
    }
}