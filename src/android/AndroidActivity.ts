/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import * as Log from '../Logger.js';
import {IntentFilter} from "./IntentFilter.js";
import AndroidComponent from "./AndroidComponent.js";
import {ModelPermission} from "./ModelPermission.js";

import {NodeInternalType} from "@reversense/dxc-core-api";
import {
    NodeType,
    DataSourceHelper,
    NodeProperty,
    DbDataType,
    DbKeyType,
    NodePropertyState, SerializeOptions, INode
} from "@reversense/dexcalibur-orm";
import ModelClass from "../ModelClass.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;



// TODO : not integrated
class AndroidActivityAlias
{
    enabled:boolean = null;
    exported:boolean =null;
    icon:string =null;
    label:string =null;
    name:string =null;
    permission:ModelPermission =null;
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
    static TYPE:NodeType = (new NodeType( "androidActivity", NodeInternalType.ANDROID_ACTIVITY, [
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
        ]))
        .dataSource("PROJECT_DB"); //, "androidActivity");

    __:NodeInternalType = NodeInternalType.ANDROID_ACTIVITY;

    type = "activity";

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
AndroidActivity.TYPE.builder(AndroidActivity);