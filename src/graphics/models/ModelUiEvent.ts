import {Savable, STUB_TYPE} from "../../ModelSavable.js";
import {DbDataType, DbKeyType, DbSerialize, INode, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

/**
 *
 */
export default class ModelUiEvent extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_evt", NodeInternalType.UI_EVT, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("time")).type(DbDataType.INTEGER).def(-1),
        (new NodeProperty("data")).type(DbDataType.BLOB).serialize(DbSerialize.JSON).def(null),
        (new NodeProperty("source")).type(DbDataType.BLOB).def(null),
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.UI_EVT;

    tags:number[] = [];
    time:number = -1;
    data:any = null;
    source:INode = null;

    constructor(pConfig:any=null){
        super(STUB_TYPE.UI_EVT);

        if(pConfig != null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

}
ModelUiEvent.TYPE.builder(ModelUiEvent);