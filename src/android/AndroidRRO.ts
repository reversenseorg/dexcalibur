import {NodeType} from "../persist/orm/NodeType.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {NodeProperty} from "../persist/orm/NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "../persist/orm/DbAbstraction.js";

export class AndroidRRO {

    static MAN:any = `
        [See https://source.android.com/devices/architecture/rros](https://source.android.com/devices/architecture/rros)
        
        ## Changes in Android 11
        In Android 11 or higher, if a configuration file is located in partition/overlay/config/config.xml, overlays are configured using that file and android:isStatic and android:priority don't have an effect on overlays located in the partition. Defining an overlay configuration file in any partition enforces the overlay partition precedence.
        In addition, Android 11 or higher removes the ability to use static overlays to affect the values of resources read during package installation. For the common use case of using static overlays to change the value of booleans that configure component enabled state, use the <component-override> SystemConfig tag (new in Android 11).
    `;

    static TYPE:NodeType = new NodeType(
        "android_rro",
        NodeInternalType.PLATFORM_PPT,
        [
            (new NodeProperty("targetPackage")).volatile().type(DbDataType.STRING).serialize(DbSerialize.JSON),
            (new NodeProperty("targetName")).volatile().type(DbDataType.STRING).serialize(DbSerialize.JSON),
        ]);

    targetPackage:string = null; // overlayable package
    targetName:string = null; // overlayable tag
    isStatic:boolean = null;
    priority:number = null;
    resourcesMap:string = null;

    constructor(config:any=null){

        if(config != null){
            for(let i in config)
                if(this[i] !==  undefined)
                    this[i] = config[i];
        }
    }

    static fromXml(xmlobj:any):AndroidRRO{
        let p:AndroidRRO = new AndroidRRO();

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