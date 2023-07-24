import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import {OperatingSystem} from "../OperatingSystem.js";
import {MerlinRule, MerlinRuleOptions, MerlinRuleType, SearchOptions } from "./MerlinRule.js";
import {AndroidPermission} from "../android/Permissions.js";

export class MerlinFlutterRule extends MerlinRule {

    targetOS = OperatingSystem.FLUTTER;

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.FLUTTER, pOpts);
    }


    constant( pRequest:any, pOptions:SearchOptions|null = null):MerlinSearchRequest {
        return this.field(pRequest,pOptions);
    }

    toJsonObject(): any {
        return super.toJsonObject();
    }
}