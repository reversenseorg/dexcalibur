

import * as Log from '../Logger.js';
import {IntentFilter} from "./IntentFilter.js";
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
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidService extends AndroidComponent
{
    static TYPE:NodeType = (new NodeType( "androidService", NodeInternalType.ANDROID_SERVICE, [
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
        (new NodeProperty("__impl")).single(ModelClass.TYPE)
    ])).dataSource("PROJECT_DB");
       // .dataSource("MEM", "androidService");

    __:NodeInternalType = NodeInternalType.ANDROID_SERVICE;

    type = "service";
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

    getUID():string{
        return this.name;
    }

    static fromXml(xmlobj:any):AndroidService{
        let act:AndroidService = new AndroidService();

        for(let j in xmlobj){
            switch(j){
                case '$':
                    act.setAttributes(xmlobj.$);
                    act.label = act.attr.label;
                    act.name = act.attr.name;

                    try{
                        act.generateUID();
                    }catch(e){
                        Logger.error("[SERVICE] Manifest parsing error : an service has not name");
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
AndroidService.TYPE.builder(AndroidService);