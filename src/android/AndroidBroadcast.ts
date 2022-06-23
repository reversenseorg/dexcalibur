import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";
import {NodeProperty} from "../persist/orm/NodeProperty";
import {DbDataType, DbKeyType, DbSerialize} from "../persist/orm/DbAbstraction";
import {AndroidAttributeSet} from "./AndroidAttribute";
import AndroidComponent from "./AndroidComponent";

export class AndroidBroadcast extends AndroidComponent {



    androidPrefixed:string[] = [];
    attr:AndroidAttributeSet = {};

    name:string = null;

    constructor(config:any=null){
        super();
        if(config != null){
            for(let i in config)
                if(this[i] !==  undefined)
                    this[i] = config[i];
        }
    }

    static fromXml(xmlobj:any):AndroidBroadcast{
        let p:AndroidBroadcast = new AndroidBroadcast();

        for(let i in xmlobj){
            if(i.startsWith('android:')){
                p[i.substr(8)] = xmlobj[i];
            }else{
                p[i] = xmlobj[i];
            }
        }

        return p;
    }

    static getDefaultTargetPolicyPath():string {
        return  "res/values/overlayable.xml";
    }


    toXmlObject():any{
        let o:any = {$:{}};

        for(let i in this){
            o.$["android:"+i] = this[i];
        }

        return o;
    }

    toJsonObject(){
        return this;
    }
}