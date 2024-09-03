import {Savable, STUB_TYPE} from "../../ModelSavable.js";
import {DbDataType, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelInstruction from "../../ModelInstruction.js";
import ModelMethod from "../../ModelMethod.js";

/**
 *
 */
export default class ModelUiEvent extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_evt", NodeInternalType.UI_EVT, [

    ]));

    __:NodeInternalType = NodeInternalType.UI_EVT;


    constructor(pConfig:any=null){
        super(STUB_TYPE.UI_EVT);

        if(pConfig !== undefined)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

}