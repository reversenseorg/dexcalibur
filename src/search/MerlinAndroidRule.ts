import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import {OperatingSystem} from "../OperatingSystem.js";
import {MerlinRule, MerlinRuleOptions, MerlinRuleType, SearchOptions } from "./MerlinRule.js";
import {AndroidPermission} from "../android/Permissions.js";

export class MerlinAndroidRule extends MerlinRule {

    targetOS = OperatingSystem.ANDROID;

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.ANDROID, pOpts);
    }


    javaClass( pRequest:any, pOptions:SearchOptions|null = null):MerlinSearchRequest {
        return this.class(pRequest,pOptions);
    }

    javaCallToMethod( pRequest:any, pScope:any = null):MerlinSearchRequest {
        return this.method("called."+pRequest );
    }


    javaCallWithArgsAssert( pRequest:any, pArgsRule:any = null):MerlinSearchRequest {
        let r = this.method("called."+pRequest);
        // r.assertArgs(1, "value", this.get.field("name:^a"))
        return r;
    }

    uiInputText( pRequest:any, pScope:any = null):MerlinSearchRequest {
        return this.method("called.enclosingClass.name:android\.widget\.EditText"+pRequest );
    }

    toJsonObject(): any {
        return super.toJsonObject();
    }
}