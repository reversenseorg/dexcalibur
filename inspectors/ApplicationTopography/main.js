const HOOK = require("../../src/HookManager.js");
const Inspector = require("../../src/Inspector.js");
const InspectorFactory = require("../../src/InspectorFactory");
const CLASS = require("../../src/CoreClass.js");
const Logger = require("../../src/Logger.js")();
const ClassAnalyzer = require("./src/ClassAnalyzer.js");

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

function tagByIntent(event) {
    let intents = event.data.getIntentFilters();
    intents.map(i => {
        i.getActions().map(a => {
            let t = TAGS_SIGNATURE.action[a.getName()];
            if (t != null) {
                event.data.addTag(t);
            }
        });

        i.getCategories().map(a => {
            let t = TAGS_SIGNATURE.category[a.getName()];
            if (t != null) {
                event.data.addTag(t);
            }
        });
    });
}


// === CONFIG
var AppTopoInspector = new InspectorFactory({

    startStep: Inspector.STEP.POST_APP_SCAN,

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
        "app.activity.new": function (ctx, event) {
        
            // to retrieve class implementign this activity
            let cls = ctx.find.get.class(event.data.name);
            if (cls instanceof CLASS.Class) {
                event.data.setImplementedBy(cls);
                cls.addTag("ACTIVITY");
            }
    
            // tag by intent filter  
            tagByIntent(event);
    
            // tag by attributes
            let attr = event.data.getAttributes();
            for (let i in attr) {
                t = TAGS_SIGNATURE.category[i];
                if (t != null) {
                    if (attr[i] == t.value) {
                        event.data.addTag(t.tag);
                    }
                }
            }
    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data) === true) {
                Logger.info("[AppTopo][activity] Internal dependencies mapped for : ", event.data.name);
            } else {
                Logger.error("[AppTopo][activity] Fail tyo map internal dependencies mapped for : ", event.data.name);
            }
        },
        "app.receiver.new": function (ctx, event) {
    
            let cls = ctx.find.get.class(event.data.name)
            if (cls instanceof CLASS.Class) {
                event.data.setImplementedBy(cls);
                cls.addTag("RECEIVER");
            }
    
    
            // tag by intent filter  
            tagByIntent(event);
    
    
            // tag by attributes
            let attr = event.data.getAttributes();
            for (let i in attr) {
                t = TAGS_SIGNATURE.category[i];
                if (t != null) {
                    if (attr[i] == t.value) {
                        event.data.addTag(t.tag);
                    }
                }
            }
    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data) === true) {
                Logger.info("[AppTopo][receiver] Internal dependencies mapped for : ", event.data.name);
            } else {
                Logger.error("[AppTopo][receiver] Fail tyo map internal dependencies mapped for : ", event.data.name);
            }
        },
        "app.provider.new": function (ctx, event) {
        
            let cls = ctx.find.get.class(event.data.name);
            if (cls instanceof CLASS.Class) {
                event.data.setImplementedBy(cls);
                cls.addTag("PROVIDER");
            }
    
    
            // tag by intent filter  
            tagByIntent(event);
    
    
            // tag by attributes
            let attr = event.data.getAttributes();
            for (let i in attr) {
                t = TAGS_SIGNATURE.category[i];
                if (t != null) {
                    if (attr[i] == t.value) {
                        event.data.addTag(t.tag);
                    }
                }
            }
    
            // search dependencies to platform method and class
            if (ClassAnalyzer.searchInternalDependencies(ctx, event.data) === true) {
                Logger.info("[AppTopo][provider] Internal dependencies mapped for : ", event.data.name);
            } else {
                Logger.error("[AppTopo][provider] Fail tyo map internal dependencies mapped for : ", event.data.name);
            }
        },
        "app.service.new": function (ctx, event) {
        
                let cls = ctx.find.get.class(event.data.name);
                if (cls instanceof CLASS.Class) {
                    event.data.setImplementedBy(cls);
                    cls.addTag("SERVICE");
                }
        
                // tag by intent filter  
                tagByIntent(event);
        
        
                // tag by attributes
                let attr = event.data.getAttributes();
                for (let i in attr) {
                    t = TAGS_SIGNATURE.category[i];
                    if (t != null) {
                        if (attr[i] == t.value) {
                            event.data.addTag(t.tag);
                        }
                    }
                }
        
                // search dependencies to platform method and class
                if (ClassAnalyzer.searchInternalDependencies(ctx, event.data) === true) {
                    Logger.info("[AppTopo][service] Internal dependencies mapped for : ", event.data.name);
                } else {
                    Logger.error("[AppTopo][service] Fail tyo map internal dependencies mapped for : ", event.data.name);
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

module.exports = AppTopoInspector;