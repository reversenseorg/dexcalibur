import * as Log from '../Logger';
import {IntentFilter} from "./IntentFilter";
import AndroidComponent from "./AndroidComponent";
import {AndroidPermission} from "./Permissions";
import {NodeInternalType} from "../NodeInternalType";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;



// TODO : not integrated
class AndroidActivityAlias
{
    enabled:boolean = null;
    exported:boolean =null;
    icon:string =null;
    label:string =null;
    name:string =null;
    permission:AndroidPermission =null;
    targetActivity:AndroidActivity =null;

    constructor(config:any=null){

        if(config != null){
            for(let i in config)
                if(this[i] !==  undefined)
                    this[i] = config[i];
        }
    }


    toXmlObject():any{
        let o:any = {$:{}};

        for(let i in this){
            o.$["android:"+i] = this[i];
        }

        return o;
    }

    static fromXml(xmlobj:any):AndroidActivityAlias{
        let act = new AndroidActivityAlias();

        for(let i in xmlobj.$){
            if(i.indexOf("android:")>-1)
                act[i.substr(8)] = xmlobj.$[i];
            else
                act[i] = xmlobj.$[i];
        }

        return act;
    }

}

/**
 * To represent an activity declared into the Android manifest
 *
 */
export default class AndroidActivity extends AndroidComponent
{
    __:NodeInternalType = NodeInternalType.ANDROID_ACTIVITY;

    static MODEL = {
        allowEmbedded:["true" , "false"],
        allowTaskReparenting:["true" , "false"],
        alwaysRetainTaskState:["true" , "false"],
        autoRemoveFromRecents:["true" , "false"],
        banner:"drawable resource",
        clearTaskOnLaunch:["true" , "false"],
        colorMode:[ "hdr" , "wideColorGamut"],
        configChanges:["mcc", "mnc", "locale",
            "touchscreen", "keyboard", "keyboardHidden",
            "navigation", "screenLayout", "fontScale",
            "uiMode", "orientation", "density",
            "screenSize", "smallestScreenSize"],
        directBootAware:["true" , "false"],
        documentLaunchMode:["intoExisting" , "always" ,
            "none" , "never"],
        enabled:["true" , "false"],
        excludeFromRecents:["true" , "false"],
        exported:["true" , "false"],
        finishOnTaskLaunch:["true" , "false"],
        hardwareAccelerated:["true" , "false"],
        icon:"drawable resource",
        immersive:["true" , "false"],
        label:"string resource",
        launchMode:["standard" , "singleTop" ,
            "singleTask" , "singleInstance"],
        lockTaskMode:["normal" , "never" ,
            "if_whitelisted" , "always"],
        maxRecents:"integer",
        maxAspectRatio:"float",
        multiprocess:["true" , "false"],
        name:"string",
        noHistory:["true" , "false"],
        parentActivityName:"string",
        persistableMode:["persistRootOnly" ,
            "persistAcrossReboots" , "persistNever"],
        permission:"string",
        process:"string",
        relinquishTaskIdentity:["true" , "false"],
        resizeableActivity:["true" , "false"],
        screenOrientation:["unspecified" , "behind" ,
            "landscape" , "portrait" ,
            "reverseLandscape" , "reversePortrait" ,
            "sensorLandscape" , "sensorPortrait" ,
            "userLandscape" , "userPortrait" ,
            "sensor" , "fullSensor" , "nosensor" ,
            "user" , "fullUser" , "locked"],
        showForAllUsers:["true" , "false"],
        stateNotNeeded:["true" , "false"],
        supportsPictureInPicture:["true" , "false"],
        taskAffinity:"string",
        theme:"resource or theme",
        uiOptions:["none" , "splitActionBarWhenNarrow"],
        windowSoftInputMode:["stateUnspecified",
            "stateUnchanged", "stateHidden",
            "stateAlwaysHidden", "stateVisible",
            "stateAlwaysVisible", "adjustUnspecified",
            "adjustResize", "adjustPan"]
    }


    constructor(pConfig:any=null){
        super();

        // auto config
        if(pConfig != null){
            for(let i in pConfig)
                if(this[i] !==  undefined)
                    this[i] = pConfig[i];

            if(this.name != null)
                this.generateUID();
        }
    }


    static fromXml(xmlobj:any):AndroidActivity{
        let act:AndroidActivity = new AndroidActivity();

        for(let j in xmlobj){
            switch(j){
                case '$':
                    act.setAttributes(xmlobj.$);
                    act.label = act.attr.label;
                    act.name = act.attr.name;

                    try{
                        act.generateUID();
                    }catch(e){
                        Logger.error("[ACTIVITY] Manifest parsing error : an service has not name");
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
