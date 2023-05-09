import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import {OperatingSystem} from "../OperatingSystem.js";
import {MerlinRule, MerlinRuleOptions, MerlinRuleType, SearchOptions } from "./MerlinRule.js";
import {AndroidPermission} from "../android/Permissions.js";

export class MerlinAndroidRule extends MerlinRule {

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.ANDROID, pOpts);
    }


    javaClass( pRequest:any, pOptions:SearchOptions|null = null):MerlinSearchRequest {
        return this.class(pRequest,pOptions);
    }

    javaCallToMethod( pRequest:any, pScope:any = null):MerlinSearchRequest {
        return this.method("called."+pRequest );
    }
}