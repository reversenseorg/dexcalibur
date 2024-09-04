import {Savable, STUB_TYPE} from "../../ModelSavable.js";
import {DbDataType, DbKeyType, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelInstruction from "../../ModelInstruction.js";
import ModelMethod from "../../ModelMethod.js";
import ModelUiRole from "./ModelUiRole.js";
import ModelUiComponent from "./ModelUiComponent.js";

/**
 *
 */
export default class ModelUiEventType extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_evt_type", NodeInternalType.UI_EVT_TYPE, [

        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("version")).type(DbDataType.STRING).def(null),
        (new NodeProperty("role")).single(ModelUiRole.TYPE).def(null),
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.UI_EVT_TYPE;

    description = "";

    constructor(pConfig:any=null){
        super(STUB_TYPE.UI_EVT_TYPE);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

}
ModelUiEventType.TYPE.builder(ModelUiEventType);