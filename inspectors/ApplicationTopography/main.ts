import * as HOOK from '../../src/hook/HookManager';

import ClassAnalyzer from './src/ClassAnalyzer';
import {IntentFilter} from "../../src/android/IntentFilter";
import InspectorFactory from "../../src/InspectorFactory";
import Inspector, {INSPECTOR_TYPE} from "../../src/Inspector";
import DexcaliburProject from "../../src/DexcaliburProject";
import ModelClass from "../../src/ModelClass";
import BusEvent from "../../src/BusEvent";
import AndroidActivity from "../../src/android/AndroidActivity";
import * as Log from "../../src/Logger";
import {AndroidManifest} from "../../src/android/AndroidManifest";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

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

function tagByIntent(context:DexcaliburProject, event:BusEvent):void {
    const intents:IntentFilter[] = event.data.obj.getIntentFilters();
    intents.map(i => {
        i.getActions().map(a => {
            const t:any = TAGS_SIGNATURE.action[a.getName()];
            if (t != null) {
                event.data.obj.addTag(t);
            }
        });

        i.getCategories().map(a => {
            const t:any = TAGS_SIGNATURE.category[a.getName()];
            if (t != null) {
                event.data.obj.addTag(t);
            }
        });
    });
}


function tagByAttr(context:DexcaliburProject, pAttr:any, event:BusEvent):void {

    let t:any;
    for (const i in pAttr) {
        t = TAGS_SIGNATURE.category[i];
        if (t != null) {
            if (pAttr[i] == t.value) {
                event.data.obj.addTag(t.tag);
            }
        }
    }
}

function isRelativeName(pName){
    return pName[0]=='.';
}

function getClassByManifestUid( pContext:DexcaliburProject, pManifest:AndroidManifest, pClassName:string):ModelClass{
    let clsUID:string;
    if(isRelativeName(pClassName)){
        clsUID = pManifest.attributes.package+pClassName;
    }else{
        clsUID = pClassName;
    }


    const cls:ModelClass = pContext.find.get.class(clsUID);
    if( cls == null){
        Logger.error("[AppTopo] Class '"+clsUID+"' not found");
    }
    return cls;
}

// === CONFIG
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    tags : {
        "intent.action": ["browsable", "exported"],
        "topo.android":["ACTIVITY","RECEIVER","PROVIDER","SERVICE","PERM"]
    },

    hookSet: {
        id: "ApplicationTopography",
        name: "Application Topography",
        description: "[INTERNAL] Manifest parser and application explorer"
    },

    eventListeners: {
        "app.activity.new": function (ctx:DexcaliburProject, event:BusEvent):any {

            // to retrieve class implementign this activity
            let act:AndroidActivity = null;
            const cls = getClassByManifestUid(ctx, event.data.manifest, event.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                event.data.obj.setImplementedBy(cls);
                cls.addTag( ctx.getTagManager().getTag("topo.android.ACTIVITY"));
            }else{
                Logger.error("[AppTopo][activity] Fail to map internal dependencies mapped for ["+ event.data.obj.name+"] : class not found");
                return true;
            }

            act = event.getData().obj;

            // tag by intent filter  
            tagByIntent(ctx, event);

            // tag by attributes
            tagByAttr(ctx, act.getAttributes(), event);

    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data.obj)!==false) {
                Logger.info("[AppTopo][activity] Internal dependencies mapped for : ", event.data.obj.name);
            } else {
                Logger.error("[AppTopo][activity] Fail to map internal dependencies mapped for : ", event.data.obj.name);
            }
        },
        "app.receiver.new": function (ctx, event) {

            const cls = getClassByManifestUid(ctx, event.data.manifest, event.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                event.data.obj.setImplementedBy(cls);
                cls.addTag(ctx.getTagManager().getTag("topo.android.RECEIVER"));
            }else{
                Logger.error("[AppTopo][receiver] Fail to map internal dependencies mapped for ["+ event.data.obj.name+"] : class not found");
                return true;
            }



            // tag by intent filter
            tagByIntent(ctx, event);

            // tag by attributes
            tagByAttr(ctx, event.data.obj.getAttributes(), event);


    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data.obj)!==false) {
                Logger.info("[AppTopo][receiver] Internal dependencies mapped for : ", event.data.obj.name);
            } else {
                Logger.error("[AppTopo][receiver] Fail to map internal dependencies mapped for : ", event.data.obj.name);
            }
        },
        "app.provider.new": function (ctx, event) {


            const cls = getClassByManifestUid(ctx, event.data.manifest, event.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                event.data.obj.setImplementedBy(cls);
                cls.addTag(ctx.getTagManager().getTag("topo.android.PROVIDER") );
            }else{
                Logger.error("[AppTopo][provider] Fail to map internal dependencies mapped for ["+ event.data.obj.name+"] : class not found");
                return true;
            }


            // tag by intent filter  
            tagByIntent(ctx, event);

            // tag by attributes
            tagByAttr(ctx, event.data.obj.getAttributes(), event);
    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data.obj)!==false) {
                Logger.info("[AppTopo][provider] Internal dependencies mapped for : ", event.data.obj.name);
            } else {
                Logger.error("[AppTopo][provider] Fail to map internal dependencies mapped for : ", event.data.obj.name);
            }
        },
        "app.service.new": function (ctx, event) {


            const cls = getClassByManifestUid(ctx, event.data.manifest, event.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                event.data.obj.setImplementedBy(cls);
                cls.addTag(ctx.getTagManager().getTag("topo.android.SERVICE") );
            }else{
                Logger.error("[AppTopo][service] Fail to map internal dependencies mapped for ["+ event.data.obj.name+"] : class not found");
                return true;
            }


            // tag by intent filter
            tagByIntent(ctx, event);

            // tag by attributes
            tagByAttr(ctx, event.data.obj.getAttributes(), event);

            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data.obj)!==false) {
                Logger.info("[AppTopo][service] Internal dependencies mapped for : ", event.data.obj.name);
            } else {
                Logger.error("[AppTopo][service] Fail to map internal dependencies mapped for : ", event.data.obj.name);
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
