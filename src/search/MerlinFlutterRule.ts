import {MerlinSearchAPI} from "./MerlinSearchAPI.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Operation, OperationType, MerlinSearchRequest} from "./MerlinSearchRequest.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {MerlinRule, MerlinRuleOptions, MerlinRuleType, SearchOptions } from "./MerlinRule.js";
import {AndroidPermission} from "../android/Permissions.js";
import {SerializedSearchRequest} from "../audit/common/SerializedMerlinPrimitive.js";
import {Nullable} from "../core/IStringIndex.js";

export class MerlinFlutterRule extends MerlinRule {

    targetOS = OperatingSystem.FLUTTER;

    constructor(pOpts:MerlinRuleOptions) {
        super(OperatingSystem.FLUTTER, pOpts);
    }

    override getRequestByNode(pRequestOpts:SerializedSearchRequest,pOpts:SearchOptions|any|null):Nullable<MerlinSearchRequest> {
        switch (pRequestOpts.node){
            case "constant": return this.constant(pRequestOpts.pattern, pOpts);
            //case "assets": return this.constant(pRequestOpts.pattern, pOpts);
            default: return null;
        }
    }

    constant( pRequest:any, pOptions:SearchOptions|null = null):MerlinSearchRequest {
        return this.field(pRequest,pOptions);
    }

    toJsonObject(): any {
        return super.toJsonObject();
    }
}