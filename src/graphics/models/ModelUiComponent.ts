import {Savable, STUB_TYPE} from "../../ModelSavable.js";
import {DbDataType, DbKeyType, DbSerialize, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelUiComponentType from "./ModelUiComponentType.js";


export interface UiCmpState {
    created?: number[],
    destroyed?: number[],
    hidden?: number[],
    displayed?: number[]
}


export default class ModelUiComponent extends Savable
{
    static TYPE:NodeType = (new NodeType( "ui_cmp", NodeInternalType.UI_CMP, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("data")).type(DbDataType.BLOB).serialize(DbSerialize.JSON).def(null),
        (new NodeProperty("state")).type(DbDataType.BLOB).serialize(DbSerialize.JSON).def({})
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.UI_CMP;

    _uid:string = "";
    tags:number[] = [];
    data:any = null;
    state:UiCmpState = {};
    type:ModelUiComponentType;

    constructor(pConfig:any=null){
        super(STUB_TYPE.UI_CMP);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

}
ModelUiComponent.TYPE.builder(ModelUiComponent)