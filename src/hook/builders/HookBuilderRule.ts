import {IPersistent} from "../../persist/orm/IPersistent.js";
import {NodeInternalType} from "../../NodeInternalType.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";




export class HookBuilderRule implements IPersistent {

    static TYPE:NodeType = new NodeType("hook_builder_rule", NodeInternalType.HOOK_BUILDER_RULE, [

    ]);

    __:NodeInternalType = NodeInternalType.HOOK_BUILDER_RULE;

    uid:string = null;
    name:string = null;
    descr:string = null;
    htype:string = null;
    rtype:string = null;


    constructor() {

    }

    getUID():string {
        return this.uid;
    }
}