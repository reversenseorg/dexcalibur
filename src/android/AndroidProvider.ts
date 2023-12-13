import * as Log from '../Logger.js';
import {IntentFilter} from "./IntentFilter.js";
import AndroidComponent from "./AndroidComponent.js";
import {
    AndroidAttribute,
    AndroidAttributeMap,
    AndroidAttributeModel,
    AndroidAttributeSet,
    ATTR_TYPE
} from "./AndroidAttribute.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {NodeType, DataSourceHelper, NodeProperty, DbDataType, DbKeyType} from "@dexcalibur/dexcalibur-orm";
import ModelClass from "../ModelClass.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;



export default class AndroidProvider extends AndroidComponent
{
    static TYPE:NodeType = (new NodeType( "androidProvider", NodeInternalType.ANDROID_PROVIDER, [
        (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("label")).type(DbDataType.STRING).def(""),
        (new NodeProperty("attr")).volatile().type(DbDataType.STRING),
        (new NodeProperty("__impl")).volatile().single(ModelClass.TYPE),
    ]))
        .dataSource("MEM", "androidProvider");

    __:NodeInternalType = NodeInternalType.ANDROID_PROVIDER;

    static MODEL:AndroidAttribute[] = [
        AndroidAttributeModel.authorities,
        AndroidAttributeModel.directBootAware,
        AndroidAttributeModel.enabled,
        AndroidAttributeModel.exported,
        AndroidAttributeModel.grantUriPermissions,
        AndroidAttributeModel.icon,
        AndroidAttributeModel.initOrder,
        AndroidAttributeModel.label,
        AndroidAttributeModel.multiprocess,
        AndroidAttributeModel.name,
        AndroidAttributeModel.permission,
        AndroidAttributeModel.process,
        AndroidAttributeModel.readPermission,
        AndroidAttributeModel.syncable,
        AndroidAttributeModel.writePermission,
        AndroidAttributeModel.singleUser,
        AndroidAttributeModel.visibleToInstantApps
    ];


    constructor(config=null){
        super();

        // auto config
        if(config != null){
            let name:string;
            for(let i in config){
                name = (i.indexOf('android:')==0)? i.slice(8) : i;
                if(AndroidAttributeModel[name]!=null){
                    this.setAttributes(
                        AndroidAttributeModel[name].with(config[i])
                    );
                }else{
                    Logger.error("[PROVIDER] Unsupported attribute detected on provider : "+name);
                }
            }


            if(this.name != null)
                this.generateUID();
        }
    }

    static fromXml(xmlobj:any):AndroidProvider{
        let act:AndroidProvider = new AndroidProvider();

        let name:string;
        for(let j in xmlobj){
            switch(j){
                case '$':
                    act.setAttributes(xmlobj.$);
                    act.label = act.attr.label;
                    act.name = act.attr.name;

                    try{
                        act.generateUID();
                    }catch(e){
                        Logger.error("[PROVIDER] Manifest parsing error : an service has not name");
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
