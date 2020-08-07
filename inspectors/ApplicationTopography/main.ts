import * as HOOK from '../../src/HookManager';

import ClassAnalyzer from './src/ClassAnalyzer';
import {IntentFilter} from "../../src/android/IntentFilter";
import InspectorFactory from "../../src/InspectorFactory";
import Inspector, {INSPECTOR_TYPE} from "../../src/Inspector";
import DexcaliburProject from "../../src/DexcaliburProject";
import ModelClass from "../../src/ModelClass";
import Event from "../../src/Event";
import AndroidActivity from "../../src/android/AndroidActivity";
import * as Log from "../../src/Logger";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====


const TAGS = Object.freeze({
    MAIN: "MAIN",
    BROWSABLE: "BROWSABLE",
    EXPOSED: "EXPOSED",
    BOOT_COMPLETED: "BOOT_COMPLETED",
    SMS: "SMS",
    PHONE: "PHONE"
});

const TAGS_SIGNATURE = {
    action: {
        "android.intent.action.MAIN": TAGS.MAIN,
        "android.provider.Telephony.SMS_RECEIVED": TAGS.SMS,
        "android.provider.Telephony.NEW_OUTGOING_SMS": TAGS.SMS,
        "android.intent.action.PHONE_STATE": TAGS.PHONE,
        "android.intent.action.BOOT_COMPLETED": TAGS.BOOT_COMPLETED
    },
    category: {
        "android.intent.category.BROWSABLE": TAGS.BROWSABLE,
    },
    attr: {
        "exported": { value: true, tag: TAGS.EXPOSED },

    }
}

function tagByIntent(event:Event):void {
    let intents:IntentFilter[] = event.data.obj.getIntentFilters();
    intents.map(i => {
        i.getActions().map(a => {
            let t:any = TAGS_SIGNATURE.action[a.getName()];
            if (t != null) {
                event.data.obj.addTag(t);
            }
        });

        i.getCategories().map(a => {
            let t:any = TAGS_SIGNATURE.category[a.getName()];
            if (t != null) {
                event.data.obj.addTag(t);
            }
        });
    });
}

function isRelativeName(pName){
    return pName[0]=='.';
}


// === CONFIG
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    tags : {
        "intent.action": ["browsable", "exported"]
    },

    hookSet: {
        id: "ApplicationTopography",
        name: "Application Topography",
        description: "[INTERNAL] Manifest parser and application explorer"
    },

    eventListeners: {
        "app.activity.new": function (ctx:DexcaliburProject, event:Event):any {
        
            // to retrieve class implementign this activity
            let t:any;
            let cls:ModelClass;
            if(isRelativeName(event.data.obj.name)){
                cls = ctx.find.get.class(event.data.manifest.attributes.package+event.data.obj.name);
            }else{
                cls = ctx.find.get.class(event.data.obj.name);
            }

            let act:AndroidActivity = null;

            if(cls != null) {
                event.data.obj.setImplementedBy(cls);
                cls.addTag("ACTIVITY");
            }

            act = event.getData().obj;
            // tag by intent filter  
            tagByIntent(event);


            // tag by attributes
            let attr:any = act.getAttributes();
            for (let i in attr) {
                t = TAGS_SIGNATURE.category[i];
                if (t != null) {
                    if (attr[i] == t.value) {
                        event.data.obj.addTag(t.tag);
                    }
                }
            }
    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data.obj) === true) {
                Logger.info("[AppTopo][activity] Internal dependencies mapped for : ", event.data.obj.name);
            } else {
                Logger.error("[AppTopo][activity] Fail tyo map internal dependencies mapped for : ", event.data.obj.name);
            }
        },
        "app.receiver.new": function (ctx, event) {


            let cls:ModelClass;
            if(isRelativeName(event.data.obj.name)){
                cls = ctx.find.get.class(event.data.manifest.attributes.package+event.data.obj.name);
            }else{
                cls = ctx.find.get.class(event.data.obj.name);
            }
            let t:any;
            if (cls instanceof ModelClass) {
                event.data.obj.setImplementedBy(cls);
                cls.addTag("RECEIVER");
            }
    
    
            // tag by intent filter  
            tagByIntent(event);
    
    
            // tag by attributes
            let attr = event.data.obj.getAttributes();
            for (let i in attr) {
                t = TAGS_SIGNATURE.category[i];
                if (t != null) {
                    if (attr[i] == t.value) {
                        event.data.obj.addTag(t.tag);
                    }
                }
            }
    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data.obj) === true) {
                Logger.info("[AppTopo][receiver] Internal dependencies mapped for : ", event.data.obj.name);
            } else {
                Logger.error("[AppTopo][receiver] Fail tyo map internal dependencies mapped for : ", event.data.obj.name);
            }
        },
        "app.provider.new": function (ctx, event) {

            let cls:ModelClass;
            if(isRelativeName(event.data.obj.name)){
                cls = ctx.find.get.class(event.data.manifest.attributes.package+event.data.obj.name);
            }else{
                cls = ctx.find.get.class(event.data.obj.name);
            }
            let t:any;
            if (cls instanceof ModelClass) {
                event.data.obj.setImplementedBy(cls);
                cls.addTag("PROVIDER");
            }
    
    
            // tag by intent filter  
            tagByIntent(event);
    
    
            // tag by attributes
            let attr = event.data.obj.getAttributes();
            for (let i in attr) {
                t = TAGS_SIGNATURE.category[i];
                if (t != null) {
                    if (attr[i] == t.value) {
                        event.data.obj.addTag(t.tag);
                    }
                }
            }
    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data.obj) === true) {
                Logger.info("[AppTopo][provider] Internal dependencies mapped for : ", event.data.obj.name);
            } else {
                Logger.error("[AppTopo][provider] Fail tyo map internal dependencies mapped for : ", event.data.obj.name);
            }
        },
        "app.service.new": function (ctx, event) {

                let cls:ModelClass;
                if(isRelativeName(event.data.obj.name)){
                    cls = ctx.find.get.class(event.data.manifest.attributes.package+event.data.obj.name);
                }else{
                    cls = ctx.find.get.class(event.data.obj.name);
                }

                let t:any;
                if (cls instanceof ModelClass) {
                    event.data.obj.setImplementedBy(cls);
                    cls.addTag("SERVICE");
                }
        
                // tag by intent filter  
                tagByIntent(event);
        
        
                // tag by attributes
                let attr = event.data.obj.getAttributes();
                for (let i in attr) {
                    t = TAGS_SIGNATURE.category[i];
                    if (t != null) {
                        if (attr[i] == t.value) {
                            event.data.obj.addTag(t.tag);
                        }
                    }
                }
        
                // search dependencies to platform method and class
                if (ClassAnalyzer.searchInternalDependencies(ctx, event.data.obj) === true) {
                    Logger.info("[AppTopo][service] Internal dependencies mapped for : ", event.data.obj.name);
                } else {
                    Logger.error("[AppTopo][service] Fail tyo map internal dependencies mapped for : ", event.data.obj.name);
                }
            }
    }
});



/*
AppTopoInspector.on("manifest.application.new", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file loaded ",event.data.path);
    }
});

AppTopoInspector.on("manifest.intentFilter.new", {
    task: function(ctx, event){

        Logger.info("[INSPECTOR][TASK] ApplicationTopography : declare intent filer");


        
    }
});
*/
