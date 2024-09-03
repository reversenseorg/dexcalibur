import {Savable, STUB_TYPE} from "../../ModelSavable.js";
import {DbDataType, DbKeyType, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {Nullable} from "../../core/IStringIndex.js";

export interface UiRoleOpts {
    _uid?:string;
    version?:string;
    description?:string;
    tags?:number[];
    name?:string;
    tagNames?:string[];
}

export default class ModelUiRole extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_role", NodeInternalType.UI_ROLE, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("tagNames")).type(DbDataType.STRING).def([]),
        (new NodeProperty("version")).type(DbDataType.STRING).def(null),
        (new NodeProperty("description")).type(DbDataType.STRING).def(null),
    ]));

    __:NodeInternalType = NodeInternalType.UI_ROLE;

    name:string;
    version = "1.0.0";
    description = "";
    tagNames:string[] = [];

    constructor(pConfig:Nullable<UiRoleOpts>=null){
        super(STUB_TYPE.UI_ROLE);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }


}