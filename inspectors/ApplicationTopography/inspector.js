const HOOK = require("../../src/HookManager.js");
const Inspector = require("../../src/Inspector.js");
const CLASS = require("../../src/CoreClass.js");

// ===== INIT =====

var AppTopoInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "ApplicationTopography",
        name: "Application Topography",
        description: "[INTERNAL] Manifest parser and application explorer"
    })
});

AppTopoInspector.useGUI();


AppTopoInspector.registerTagCategory(
    "intent.action",
    ["browsable","exported"]
);

// ===== CONFIG HOOKS =====



// ====== CONFIG TASK ====== 



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
        "exported": {value:true, tag:TAGS.EXPOSED},

    }
}

function tagByIntent(event){
    let intents = event.data.getIntentFilters();
    intents.map(i => {
        i.getActions().map(a => {
            let t = TAGS_SIGNATURE.action[a.getName()];
            if(t != null){
                event.data.addTag(t);
            }
        });

        i.getCategories().map(a => {
            let t = TAGS_SIGNATURE.category[a.getName()];
            if(t != null){
                event.data.addTag(t);
            }
        });
    });
}

// activity analysis is trigged when a new activity is found
AppTopoInspector.on("app.activity.new", {
    task: function(ctx, event){

        // to retrieve class implementign this activity
        let cls = ctx.find.get.class(event.data.name);
        if(cls instanceof CLASS.Class){
            event.data.setImplementedBy(cls);
            cls.addTag("ACTIVITY");
        }

        // tag by intent filter  
        tagByIntent(event);
        /*
        let intents = event.data.getIntentFilters();
        intents.map(i => {
            i.getActions().map(a => {
                let t = TAGS_SIGNATURE.action[a.getName()];
                if(t != null){
                    event.data.addTag(t);
                }
            });

            i.getCategories().map(a => {
                let t = TAGS_SIGNATURE.category[a.getName()];
                if(t != null){
                    event.data.addTag(t);
                }
            });
        });*/


        // tag by attributes
        let attr = event.data.getAttributes();
        for(let i in attr){
            t = TAGS_SIGNATURE.category[i];
            if(t != null){
                if(attr[i] == t.value){
                    event.data.addTag(t.tag);
                }
            }
        }
    }
});
AppTopoInspector.on("app.receiver.new", {
    task: function(ctx, event){

        let cls = ctx.find.get.class(event.data.name);
        if(cls instanceof CLASS.Class){
            event.data.setImplementedBy(cls);
        }


        // tag by intent filter  
        tagByIntent(event);
    }
});
AppTopoInspector.on("app.provider.new", {
    task: function(ctx, event){

        let cls = ctx.find.get.class(event.data.name);
        if(cls instanceof CLASS.Class){
            event.data.setImplementedBy(cls);
        }


        // tag by intent filter  
        tagByIntent(event);
    }
});
AppTopoInspector.on("app.service.new", {
    task: function(ctx, event){

        let cls = ctx.find.get.class(event.data.name);
        if(cls instanceof CLASS.Class){
            event.data.setImplementedBy(cls);
        }


        // tag by intent filter  
        tagByIntent(event);
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