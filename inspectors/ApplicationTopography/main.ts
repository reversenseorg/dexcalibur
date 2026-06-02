import * as _path_ from "path";


import {IntentFilter} from "../../src/android/IntentFilter.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import Inspector, {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import ModelClass from "../../src/ModelClass.js";
import BusEvent from "../../src/BusEvent.js";
import * as Log from "../../src/Logger.js";
import {AndroidCodeAnalyzer} from "../../src/android/analyzer/AndroidCodeAnalyzer.js";
import AndroidAppAnalyzer from "../../src/android/AndroidAppAnalyzer.js";
import AndroidComponent from "../../src/android/AndroidComponent.js";
import AndroidActivity from "../../src/android/AndroidActivity.js";
import {Finder} from "../../src/search/Finder.js";
import {FinderResult} from "../../src/search/FinderResult.js";
import ModelFile from "../../src/ModelFile.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";


const ANDROID_INTENT_TAG_MAPPING: Record<string, string[]> =  Object.fromEntries([
    ["android.app.action.ADD_DEVICE_ADMIN",                              ["reach.eptype.ep-ui-handler", "reach.exp.pr-high", "purpose.security", "auth", "purpose.security"]],
    ["android.app.action.SET_NEW_PASSWORD",                              ["reach.eptype.ep-ui-handler", "reach.exp.pr-high", "purpose.security", "auth"]],
    ["android.app.action.START_ENCRYPTION",                              ["reach.eptype.ep-ui-handler", "reach.exp.pr-high", "purpose.security"]],
    ["android.bluetooth.adapter.action.REQUEST_DISCOVERABLE",            ["reach.eptype.ep-ui-handler", "reach.exp.av-adjacent", "reach.exp.ac-low", "reach.exp.pr-low", "reach.exp.ui-required", "proto.bluetooth", "purpose.security"]],
    ["android.bluetooth.adapter.action.REQUEST_ENABLE",                  ["reach.eptype.ep-ui-handler", "reach.exp.av-adjacent", "reach.exp.ac-low", "reach.exp.pr-low", "reach.exp.ui-required", "proto.bluetooth", "purpose.security"]],
    ["android.intent.action.ALL_APPS",                                   ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none"]],
    ["android.intent.action.ANSWER",                                     ["reach.eptype.ep-receiver", "reach.exp.av-network", "reach.exp.ac-low", "reach.exp.pr-none", "reach.exp.ui-required", "gsm"]],
    ["android.intent.action.APP_ERROR",                                  ["reach.eptype.ep-event-handler", "reach.exp.av-local", "reach.exp.pr-none"]],
    ["android.intent.action.ATTACH_DATA",                                ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required", "proto.file"]],
    ["android.intent.action.BUG_REPORT",                                 ["reach.eptype.ep-ui-handler", "reach.eptype.ep-debug", "reach.exp.av-local", "reach.exp.pr-low", "purpose.security"]],
    ["android.intent.action.CALL",                                       ["reach.eptype.ep-receiver", "reach.exp.av-network", "reach.exp.ac-low", "reach.exp.pr-none", "proto.gsm"]],
    ["android.intent.action.CALL_BUTTON",                                ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required", "proto.gsm"]],
    ["android.intent.action.CHOOSER",                                    ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.CREATE_LIVE_FOLDER",                         ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.CREATE_SHORTCUT",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.DELETE",                                     ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low", "reach.exp.ui-required", "purpose.security"]],
    ["android.intent.action.DIAL",                                       ["reach.eptype.ep-uri-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required", "proto.gsm"]],
    ["android.intent.action.EDIT",                                       ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.EVENT_REMINDER",                             ["reach.eptype.ep-receiver", "reach.exp.av-local", "reach.exp.pr-none"]],
    ["android.intent.action.GET_CONTENT",                                ["reach.eptype.ep-provider", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required", "proto.file"]],
    ["android.intent.action.INSERT",                                     ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.INSERT_OR_EDIT",                             ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.INSTALL_PACKAGE",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-high", "reach.exp.ui-required", "proto.file", "purpose.security"]],
    ["android.intent.action.MAIN",                                       ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.MANAGE_NETWORK_USAGE",                       ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low", "reach.exp.ui-required"]],
    ["android.intent.action.MEDIA_SEARCH",                               ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.MUSIC_PLAYER",                               ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.PASTE",                                      ["reach.eptype.ep-clipboard", "reach.exp.av-local", "reach.exp.pr-none", "proto.clipboard"]],
    ["android.intent.action.PICK",                                       ["reach.eptype.ep-provider", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.PICK_ACTIVITY",                              ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.POWER_USAGE_SUMMARY",                        ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low"]],
    ["android.intent.action.RINGTONE_PICKER",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.RUN",                                        ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low", "purpose.security"]],
    ["android.intent.action.SEARCH",                                     ["reach.eptype.ep-uri-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required", "proto.uri-handler"]],
    ["android.intent.action.SEARCH_LONG_PRESS",                          ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.SEND",                                       ["reach.eptype.ep-receiver", "reach.exp.av-local", "reach.exp.ac-low", "reach.exp.pr-none", "reach.exp.ui-required", "proto.ipc"]],
    ["android.intent.action.SENDTO",                                     ["reach.eptype.ep-receiver", "reach.exp.av-network", "reach.exp.ac-low", "reach.exp.pr-none", "reach.exp.ui-required", "proto.sms", "proto.ipc"]],
    ["android.intent.action.SEND_MULTIPLE",                              ["reach.eptype.ep-receiver", "reach.exp.av-local", "reach.exp.ac-low", "reach.exp.pr-none", "reach.exp.ui-required", "proto.ipc"]],
    ["android.intent.action.SET_ALARM",                                  ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.SET_WALLPAPER",                              ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.SYNC",                                       ["reach.eptype.ep-service", "reach.exp.av-network", "reach.exp.ac-low", "reach.exp.pr-low", "proto.http"]],
    ["android.intent.action.SYSTEM_TUTORIAL",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.UNINSTALL_PACKAGE",                          ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-high", "reach.exp.ui-required", "purpose.security"]],
    ["android.intent.action.VIEW",                                       ["reach.eptype.ep-uri-handler", "reach.exp.av-local", "reach.exp.ac-low", "reach.exp.pr-none", "reach.exp.ui-required", "proto.http"]],
    ["android.intent.action.VOICE_COMMAND",                              ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.intent.action.WEB_SEARCH",                                 ["reach.eptype.ep-uri-handler", "reach.exp.av-network", "reach.exp.pr-none", "reach.exp.ui-required", "proto.http"]],
    ["android.media.action.DISPLAY_AUDIO_EFFECT_CONTROL_PANEL",         ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.net.wifi.PICK_WIFI_NETWORK",                               ["reach.eptype.ep-ui-handler", "reach.exp.av-adjacent", "reach.exp.pr-low", "reach.exp.ui-required", "proto.wifi-direct", "purpose.security"]],
    ["android.nfc.action.NDEF_DISCOVERED",                               ["reach.eptype.ep-receiver", "reach.exp.av-adjacent", "reach.exp.ac-low", "reach.exp.pr-none", "reach.exp.ui-none", "proto.nfc", "purpose.security"]],
    ["android.nfc.action.TAG_DISCOVERED",                                ["reach.eptype.ep-receiver", "reach.exp.av-adjacent", "reach.exp.ac-low", "reach.exp.pr-none", "reach.exp.ui-none", "proto.nfc", "purpose.security"]],
    ["android.nfc.action.TECH_DISCOVERED",                               ["reach.eptype.ep-receiver", "reach.exp.av-adjacent", "reach.exp.ac-low", "reach.exp.pr-none", "reach.exp.ui-none", "proto.nfc", "purpose.security"]],
    ["android.search.action.SEARCH_SETTINGS",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.ACCESSIBILITY_SETTINGS",                          ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.ADD_ACCOUNT_SETTINGS",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low", "reach.exp.ui-required", "purpose.auth", "purpose.identity", "purpose.security"]],
    ["android.settings.AIRPLANE_MODE_SETTINGS",                          ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low", "reach.exp.ui-required"]],
    ["android.settings.APN_SETTINGS",                                    ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-high", "reach.exp.ui-required", "proto.gsm", "proto.lte",  "purpose.security"]],
    ["android.settings.APPLICATION_DETAILS_SETTINGS",                    ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.APPLICATION_DEVELOPMENT_SETTINGS",                ["reach.eptype.ep-ui-handler", "reach.eptype.ep-debug", "reach.exp.av-local", "reach.exp.pr-low", "reach.exp.ui-required", "purpose.security"]],
    ["android.settings.APPLICATION_SETTINGS",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.BLUETOOTH_SETTINGS",                              ["reach.eptype.ep-ui-handler", "reach.exp.av-adjacent", "reach.exp.pr-low", "reach.exp.ui-required", "proto.bluetooth", "proto.ble", "purpose.security"]],
    ["android.settings.DATA_ROAMING_SETTINGS",                           ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-high", "reach.exp.ui-required", "proto.gsm", "proto.lte"]],
    ["android.settings.DATE_SETTINGS",                                   ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.DEVICE_INFO_SETTINGS",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.DISPLAY_SETTINGS",                                ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.INPUT_METHOD_SETTINGS",                           ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required", "purpose.security"]],
    ["android.settings.INPUT_METHOD_SUBTYPE_SETTINGS",                   ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.INTERNAL_STORAGE_SETTINGS",                       ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.LOCALE_SETTINGS",                                 ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.LOCATION_SOURCE_SETTINGS",                        ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low", "reach.exp.ui-required", "purpose.location"]],
    ["android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS",                ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.MANAGE_APPLICATIONS_SETTINGS",                    ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.MEMORY_CARD_SETTINGS",                            ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.NETWORK_OPERATOR_SETTINGS",                       ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-high", "reach.exp.ui-required", "proto.gsm", "proto.lte",  "purpose.security"]],
    ["android.settings.NFCSHARING_SETTINGS",                             ["reach.eptype.ep-ui-handler", "reach.exp.av-adjacent", "reach.exp.pr-low", "reach.exp.ui-required", "proto.nfc", "purpose.security"]],
    ["android.settings.PRIVACY_SETTINGS",                                ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.QUICK_LAUNCH_SETTINGS",                           ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.SECURITY_SETTINGS",                               ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low", "reach.exp.ui-required", "purpose.security"]],
    ["android.settings.SETTINGS",                                        ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.SOUND_SETTINGS",                                  ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.SYNC_SETTINGS",                                   ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-low", "reach.exp.ui-required"]],
    ["android.settings.USER_DICTIONARY_SETTINGS",                        ["reach.eptype.ep-ui-handler", "reach.exp.av-local", "reach.exp.pr-none", "reach.exp.ui-required"]],
    ["android.settings.WIFI_IP_SETTINGS",                                ["reach.eptype.ep-ui-handler", "reach.exp.av-adjacent", "reach.exp.pr-low", "reach.exp.ui-required", "proto.wifi",  "purpose.security"]],
    ["android.settings.WIFI_SETTINGS",                                   ["reach.eptype.ep-ui-handler", "reach.exp.av-adjacent", "reach.exp.pr-low", "reach.exp.ui-required", "proto.wifi",  "purpose.security"]],
    ["android.settings.WIRELESS_SETTINGS",                               ["reach.eptype.ep-ui-handler", "reach.exp.av-adjacent", "reach.exp.pr-low", "reach.exp.ui-required", "proto.wifi", "proto.bluetooth",  "purpose.security"]],
    ["android.speech.tts.engine.CHECK_TTS_DATA",                         ["reach.eptype.ep-service", "reach.exp.av-local", "reach.exp.pr-none"]],
    ["android.speech.tts.engine.INSTALL_TTS_DATA",                       ["reach.eptype.ep-service", "reach.exp.av-network", "reach.exp.pr-low", "reach.exp.ui-required", "proto.http", "purpose.security"]],
]);



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

function tagByIntent(context:DexcaliburProject, event:BusEvent<any>):void {
    const intents:IntentFilter[] = event.data.obj.getIntentFilters();
    intents.map(i => {
        i.getActions().map(a => {
            const t:any = TAGS_SIGNATURE.action[a.getName()];
            if (t != null) {
                event.data.obj.addTag(t);
                event.getContext().getTagManager().incTag(t, event.data.obj);
            }
        });

        i.getCategories().map(a => {
            const t:any = TAGS_SIGNATURE.category[a.getName()];
            if (t != null) {
                event.data.obj.addTag(t);
                event.getContext().getTagManager().incTag(t, event.data.obj);
            }
        });
    });
}


function tagByAttr(context:DexcaliburProject, pAttr:any, event:BusEvent<any>):void {

    let t:any;
    for (const i in pAttr) {
        t = TAGS_SIGNATURE.category[i];
        if (t != null) {
            if (pAttr[i] == t.value) {
                event.data.obj.addTag(t.tag);
                event.getContext().getTagManager().incTag(t.tag, event.data.obj);
            }
        }
    }
}


// === CONFIG
// @ts-ignore
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    version: "1.1.3",
    tags: [
        {
            name:"android.cmp",
            _tagsOptions:[
                { name:"browsable"},
                { name:"exported"}
            ]
        },{
            name:"android.intent.action",
            _tagsOptions:[
                { name:"browsable"},
                { name:"exported"},
                { name:"main"}
            ]
        },{
            name:"android.intent.ope",
            _tagsOptions:[
                { name:"receive"},
                { name:"send"}
            ]
        },{
            name:"topo.android",
            _tagsOptions:[
                { name:"ACTIVITY"},
                { name:"RECEIVER"},
                { name:"PROVIDER"},
                { name:"SERVICE"},
                { name:"PERM"},
            ]
        }
    ],

    hookSet: {
        id: "ApplicationTopography",
        name: "Application Topography",
        description: "[INTERNAL] Manifest parser and application explorer",
        strategies:[]
    },

    eventListeners: {
        "dxc.fullscan.post":  function ( pEvent:BusEvent<any>):any {

            // scan for exported component, intentable, ..
            const exported = pEvent.getContext().getTagManager().getTag("android.intent.action.exported");
            const receiveIntent = pEvent.getContext().getTagManager().getTag("android.intent.ope.receive");
            const intentable = pEvent.getContext().getTagManager().getTag("");

/*
            pEvent.getContext().merlin.activity("attr.exported:true")
                .execute(pEvent.getContext())
                .then((vResult:FinderResult)=>{
                    (vResult.getData() as AndroidActivity[]).map(x => {
                        x.addTag(exported)
                    })
                });*/


        },
        "app.receiver.new": function (pEvent:BusEvent<any>) {

            const pCtx = pEvent.getContext();
            const cls = AndroidAppAnalyzer.getClassByManifestUid(pCtx, pEvent.data.manifest, pEvent.data.obj.name);

            const t = pCtx.getTagManager().getTag("topo.android.RECEIVER");
            const e = pCtx.getTagManager().getTag("topo.android.RECEIVER");

            if ((cls != null) && (cls instanceof ModelClass)) {
                pEvent.data.obj.setImplementedBy(cls);
                cls.addTag(t);
                pEvent.getContext().getTagManager().incTag(t, cls);
                pEvent.getContext().getTagManager().incTag(t, pEvent.data.obj);
            }else{
                //Logger.error("[AppTopo][receiver] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : class not found");
                return true;
            }

            if(pEvent.getData().obj.attr.exported=="true"){
                cls.addTag(pCtx.getTagManager().getTag("topo.android.RECEIVER"));
                pEvent.getContext().getTagManager().incTag(t, cls);
            }
            // tag by intent filter
            tagByIntent(pCtx, pEvent);

            // tag by attributes
            tagByAttr(pCtx, pEvent.data.obj.getAttributes(), pEvent);
    
            // search dependencies to platform method and class
            /*
            if (AndroidCodeAnalyzer.searchInternalDependencies(pCtx, pEvent.data.obj)!=null) {
                Logger.info("[AppTopo][receiver] Internal dependencies mapped for : ", pEvent.data.obj.name);
            } else {
                Logger.error("[AppTopo][receiver] Fail to map internal dependencies mapped for : ", pEvent.data.obj.name);
            }*/
        },
        "app.provider.new": function (pEvent:BusEvent<any>) {

            const pCtx = pEvent.getContext();

            const cls = AndroidAppAnalyzer.getClassByManifestUid(pCtx, pEvent.data.manifest, pEvent.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                pEvent.data.obj.setImplementedBy(cls);
                cls.addTag(pCtx.getTagManager().getTag("topo.android.PROVIDER") );
            }else{
                //Logger.error("[AppTopo][provider] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : class not found");
                return true;
            }


            // tag by intent filter  
            tagByIntent(pCtx, pEvent);

            // tag by attributes
            tagByAttr(pCtx, pEvent.data.obj.getAttributes(), pEvent);
    
            // search dependencies to platform method and class
            /*
            if (AndroidCodeAnalyzer.searchInternalDependencies(pCtx, pEvent.data.obj)!=null) {
                Logger.info("[AppTopo][provider] Internal dependencies mapped for : ", pEvent.data.obj.name);
            } else {
                Logger.error("[AppTopo][provider] Fail to map internal dependencies mapped for : ", pEvent.data.obj.name);
            }*/
        },
        "app.service.new": function (pEvent) {


            const pCtx = pEvent.getContext();
            const cls = AndroidAppAnalyzer.getClassByManifestUid(pCtx, pEvent.data.manifest, pEvent.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                pEvent.data.obj.setImplementedBy(cls);
                cls.addTag(pCtx.getTagManager().getTag("topo.android.SERVICE") );
            }else{
                //Logger.error("[AppTopo][service] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : class not found");
                return true;
            }


            // tag by intent filter
            tagByIntent(pCtx, pEvent);

            // tag by attributes
            tagByAttr(pCtx, pEvent.data.obj.getAttributes(), pEvent);

            // search dependencies to platform method and class
            /*
            if (AndroidCodeAnalyzer.searchInternalDependencies(pCtx, pEvent.data.obj)!=null) {
                Logger.info("[AppTopo][service] Internal dependencies mapped for : ", pEvent.data.obj.name);
            } else {
                Logger.error("[AppTopo][service] Fail to map internal dependencies mapped for : ", pEvent.data.obj.name);
            }*/
        },
        "data.file.parsed": function(pEvent:BusEvent<any>):any{
            (async ()=>{
                const ctx = pEvent.getContext();
                const tm = ctx.getTagManager();


                // skip if target platform is not android
                if(!ctx.getPlatform().isAndroid())  return;

                const parserEvent = pEvent.getData();
                const file = pEvent.getData().file;
                const dir = _path_.dirname(parserEvent.file.getRealPath());


                if(dir.split(_path_.sep).pop()!='unknown') return;

                if((parserEvent.format === ".properties")
                    || (parserEvent.parser != null && parserEvent.parser.FORMAT_NAMES?.indexOf("properties")>-1)) {

                    if(file.data != null && file.data.ok!=null){

                        if(file.data.ok["client"]!=null && file.data.ok["version"]!=null){
                            // save
                            ctx.trigger({
                                type:"sca.detect.java.library",
                                data: {
                                    libraryName: file.data.ok["client"].value,
                                    libraryVersion: file.data.ok["version"].value,
                                    proof: {
                                        file: file.getUID(),
                                        path: file.getRelativePath(),
                                        type: "properties files"
                                    }
                                }
                            });
                        }
                    }
                }

                // ModelPackage detected


            })();

        }
    },
    eventListenerSources: {
        "dxc.fullscan.post": {
            lang: 'ts',
            source: `
            // <ts>={
            
            const ctx:any = pEvent.getContext();
            if(ctx.getPlatform().isAndroid()){
                 (ctx.getAppAnalyzer() as AndroidAppAnalyzer).scanComponents().then((vResult:FinderResult)=>{}).catch((e)=>{ console.log(e.stack) });
            }
            `
        },
        "app.package.new": {
            lang: 'ts',
            source: `
            // <ts>={
            
            const ctx:any = pEvent.getContext();
            const tm = ctx.getTagManager();
            
            const evt = pEvent.getData();

             if(evt.sbomType=="swift.bundle" || (tm.getTag("swift.bundle")).match(evt.pkg as ModelPackage)){
                  console.log(parserEvent);
                    ctx.trigger({
                        type:"sca.sbom.new",
                        data: {
                            libraryName: file.data.ok["client"].value,
                            libraryVersion: file.data.ok["version"].value,
                            proof: {
                                file: file.getUID(),
                                path: file.getRelativePath(),
                                type: "Swift bundle folder"
                            }
                        }
                    });
                    return;
                }
                if(evt.sbomType=="objc.bundle" || (tm.getTag("objc.bundle")).match(evt.pkg as ModelPackage)){
                    console.log(parserEvent);
                    ctx.trigger({
                        type:"sca.sbom.new",
                        data: {
                            libraryName: pkg.name,
                            libraryVersion: "",
                            proof: {
                                file: "", // file.getUID(),
                                path: "", //file.getRelativePath(),
                                type: "ObjC bundle folder"
                            }
                        }
                    });
                    return;
                }
                if(evt.sbomType=="ai.coreml" || (tm.getTag("ai.coreml")).match(evt.pkg as ModelPackage)){
                     console.log(evt);
                    ctx.trigger({
                        type:"sca.sbom.new",
                        data: {
                            libraryName: file.data.ok["client"].value,
                            libraryVersion: file.data.ok["version"].value,
                            proof: {
                                file: file.getUID(),
                                path: file.getRelativePath(),
                                type: "AI CoreML model"
                            }
                        }
                    });
                    return;
                }
            `
        },
        "app.component.scan": {
            lang: 'ts',
            source:`
            // <ts>={

            const pCtx:any = pEvent.getContext();
            const tm = pCtx.getTagManager();

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
                
                return pContext.find.get.class(clsUID);
            }

            let cls:any;
            try{
                cls = getClassByManifestUid(pCtx, pEvent.data.manifest, pEvent.data.obj.name);
            
                if ((cls != null) && (cls.__===${NodeInternalType.CLASS}) {
                    pEvent.data.obj.setImplementedBy(cls);
                    switch (pEvent.data.obj.type){
                        case "activity":
                            tm.annotate("topo.android.ACTIVITY", cls);
                            tm.annotate("dpat.controller", cls);
                            tm.annotate("dpat.view", cls);
                            break;
                        case "service":
                            tm.annotate("topo.android.SERVICE", cls);
                            tm.annotate("dpat.service", cls);
                            //tm.annotate("dpat.daemon", cls); ou worker
                            break;
                        case "receiver":
                            tm.annotate("topo.android.RECEIVER", cls);
                            tm.annotate("dpat.observer", cls);
                            tm.annotate("reach.eptype.ep-receiver", cls);
                            break;
                        case "provider":
                            tm.annotate("topo.android.PROVIDER", cls);
                            tm.annotate("dpat.repository", cls);
                            tm.annotate("dpat.facade", cls);
                            break;
                    }
                }
            }catch (e){
                console.error("[AppTopo][component] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : class not found",e);
            }
            
            try{
                // to retrieve class implementign this activity
            let cmp:AndroidComponent = pEvent.getData().obj as AndroidComponent;
            
            if(cmp.attr.exported!=null && cmp.attr.exported==='true'){
                tm.annotate("reach.exp.av-adjacent",  [cmp,cls]);
                tm.annotate("android.cmp.exported",  [cmp,cls]); // deprecated             
            }
            
            
            if(cmp.intentFilters.length>0){
                cmp.intentFilters.map(x => {
                    x.action.map( y => {
                        
                        const itags = ANDROID_INTENT_TAG_MAPPING[y.name];
                        if(itags!=null){
                            itags.map(t => tm.annotate(t,  [cmp,cls]));
                        }
                    });
                
                    x.category.map( y =>{
                         switch (y.name){
                            case "android.intent.category.BROWSABLE":
                                tm.annotate("reach.eptype.reach.eptype.ep-uri-handler", [cmp,cls]);
                                tm.annotate("proto.nfc",  [cmp,cls]);
                                tm.annotate("android.cmp.browsable",  [cmp,cls]); // deprecated
                                tm.annotate("reach.exp.av-network",  [cmp,cls]);
                                break;
                        }
                    })
                });          
            }
            
            // update tags
            pEvent.getContext().trigger({
                type: "app.component.save",
                data: {
                    fresh: true
                    obj: cmp,
                    cls: cls
                }
            });
            }catch (e){
                
                console.error("[AppTopo][component] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : err :",e.stack);
            }
            
            
            // tag by attributes
            //tagByAttr(pCtx, acmpct.getAttributes(), pEvent);
            `
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
