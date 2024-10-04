import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import {OperatingSystem} from "../platform/OperatingSystem.js";
import {MerlinRule, MerlinRuleOptions, MerlinRuleType, SearchOptions } from "./MerlinRule.js";
import {AndroidPermission} from "../android/Permissions.js";
import {SerializedSearchRequest} from "../audit/common/SerializedMerlinPrimitive.js";
import {Nullable} from "../core/IStringIndex.js";

export class MerlinIosRule extends MerlinRule {

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.ANDROID, pOpts);
    }

    override getRequestByNode(pRequestOpts:SerializedSearchRequest,pOpts:SearchOptions|any|null):Nullable<MerlinSearchRequest> {
        switch (pRequestOpts.node){
            case "objcClass": return this.objcClass(pRequestOpts.pattern, pOpts);
            case "objcCallToMethod": return this.objcCallToMethod(pRequestOpts.pattern, pOpts);
            case "objcCallWithArgsAssert": return this.objcCallWithArgsAssert(pRequestOpts.pattern, pOpts);
            default: return null;
        }
    }

    objcClass( pRequest:any, pOptions:SearchOptions|null = null):MerlinSearchRequest {
        return this.class(pRequest,pOptions);
    }

    objcCallToMethod( pRequest:any, pScope:any = null):MerlinSearchRequest {
        return this.method("called."+pRequest );
    }


    objcCallWithArgsAssert( pRequest:any, pArgsRule:any = null):MerlinSearchRequest {
        let r = this.method("called."+pRequest);
        // r.assertArgs(1, "value", this.get.field("name:^a"))
        return r;
    }
}