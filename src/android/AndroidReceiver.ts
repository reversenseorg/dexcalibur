import {IntentFilter} from "./IntentFilter.js";
import * as Log from '../Logger.js';
import AndroidComponent from "./AndroidComponent.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {DataSourceHelper} from "../DataSourceHelper.js";
import {NodeProperty} from "../persist/orm/NodeProperty.js";
import {DbDataType, DbKeyType} from "../persist/orm/DbAbstraction.js";
import ModelClass from "../ModelClass.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidReceiver extends AndroidComponent
{
    static TYPE:NodeType = (new NodeType( "androidReceiver", NodeInternalType.ANDROID_RECEIVER, [
        (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("label")).type(DbDataType.STRING).def(""),
        (new NodeProperty("attr")).volatile().type(DbDataType.STRING),
        (new NodeProperty("__impl")).volatile().single(ModelClass.TYPE),

    ]))
        .dataSource(DataSourceHelper.MEM, "androidReceiver");

    __:NodeInternalType = NodeInternalType.ANDROID_RECEIVER;

    constructor(config:any=null){
        super();

        // auto config
        if(config != null){
            for(let i in config)
                if(this[i] !==  undefined)
                    this[i] = config[i];

            if(this.name != null)
                this.generateUID();
        }
    }


    static fromXml(xmlobj:any):AndroidReceiver{
        let act:AndroidReceiver = new AndroidReceiver();

        for(let j in xmlobj){
            switch(j){
                case '$':
                    act.setAttributes(xmlobj.$);
                    act.label = act.attr.label;
                    act.name = act.attr.name;

                    try{
                        act.generateUID();
                    }catch(e){
                        Logger.error("[RECEIVER] Manifest parsing error : an service has not name");
                    }

                    break;
                case 'intent-filter':
                    for(let i=0; i<xmlobj[j].length; i++){
                        act.addIntentFilters(
                            IntentFilter.fromXml(xmlobj[j][i])
                        );
                    }
                    break;
            }
        }


        return act;
    }
}
