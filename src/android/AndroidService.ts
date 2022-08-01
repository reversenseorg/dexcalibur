

import * as Log from '../Logger';
import {IntentFilter} from "./IntentFilter";
import AndroidComponent from "./AndroidComponent";
import {NodeInternalType} from "../NodeInternalType";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidService extends AndroidComponent
{
    __:NodeInternalType = NodeInternalType.ANDROID_SERVICE;

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
