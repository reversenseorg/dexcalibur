import {Savable, STUB_TYPE} from "../../ModelSavable.js";
import {DbDataType, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelInstruction from "../../ModelInstruction.js";
import ModelMethod from "../../ModelMethod.js";


export default class ModelUiComponent extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_cmp", NodeInternalType.UI_CMP, [

    ]));

    __:NodeInternalType = NodeInternalType.UI_CMP;


    constructor(pConfig:any=null){
        super(STUB_TYPE.UI_CMP);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

}