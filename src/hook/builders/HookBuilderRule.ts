import {IPersistent} from "../../persist/orm/IPersistent";
import {NodeType} from "../../persist/orm/NodeType";
import {NodeInternalType} from "../../NodeInternalType";
import {HOOK_TYPE} from "../HookManager";
import {IDatabase} from "../../persist/orm/DbAbstraction";
import {JavaHookBuilderException} from "../../errors/JavaHookBuilderException";
import {SqliteDb} from "../../../connectors/sqlite/SqliteDb";




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