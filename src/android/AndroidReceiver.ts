import {IntentFilter} from "./IntentFilter.js";
import * as Log from '../Logger.js';
import AndroidComponent from "./AndroidComponent.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {
    NodeType,
    DataSourceHelper,
    NodeProperty,
    DbDataType,
    DbKeyType,
    NodePropertyState
} from "@dexcalibur/dexcalibur-orm";
import ModelClass from "../ModelClass.js";
import AndroidProvider from "./AndroidProvider.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidReceiver extends AndroidComponent
{
    static TYPE:NodeType = (new NodeType( "androidReceiver", NodeInternalType.ANDROID_RECEIVER, [
        (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("label")).type(DbDataType.STRING).def(""),
        (new NodeProperty("attr")).type(DbDataType.STRING).def({}),
        (new NodeProperty("metadata")).type(DbDataType.STRING).def({}),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("intentFilters"))
            .type(DbDataType.STRING)
            .sleep( (x:NodePropertyState)=>{
                if(x.p==null) return [];

                let filters=[];
                x.p.map(y => filters.push(y.toJsonObject()));

                return filters;
            })
            .wakeUp( (x:NodePropertyState)=>{
                if(x.p==null) return [];

                let filters=[];
                x.p.map(y => {
                    filters.push(new IntentFilter(y))
                });
                return filters;
            })
            .def([]),
        (new NodeProperty("__impl")).single(ModelClass.TYPE),
    ])).dataSource("PROJECT_DB");
       // .dataSource("MEM", "androidReceiver");

    type = "receiver";
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
AndroidReceiver.TYPE.builder(AndroidReceiver);
