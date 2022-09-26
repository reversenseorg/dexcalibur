import * as Log from '../Logger';
import {IntentFilter} from "./IntentFilter";
import AndroidComponent from "./AndroidComponent";
import {
    AndroidAttribute,
    AndroidAttributeMap,
    AndroidAttributeModel,
    AndroidAttributeSet,
    ATTR_TYPE
} from "./AndroidAttribute";
import {NodeInternalType} from "../NodeInternalType";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;



export default class AndroidProvider extends AndroidComponent
{
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

                    for(let i in xmlobj.$){
                        name = (i.indexOf('android:')==0)? i.slice(8) : i;
                        if(AndroidAttributeModel[name]!=null){
                            act.setAttributes(
                                AndroidAttributeModel[name].with(xmlobj.$[i])
                            );
                        }else{
                            throw new Error("Unsupported attribute detected on provider : "+name)
                        }
                    }

                    //act.setAttributes(xmlobj.$);
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
