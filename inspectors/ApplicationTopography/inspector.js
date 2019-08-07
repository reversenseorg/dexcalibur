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
        EXPOSED: "EXPOSED"
});



AppTopoInspector.on("app.activity.new", {
    task: function(ctx, event){

        // to retrieve class implementign this activity
        let cls = ctx.find.get.class(event.data.name);
        if(cls instanceof CLASS.Class){
            event.data.setImplementedBy(cls);
            cls.addTag("ACTIVITY");
        }

        // tag by intent filter  
        let intents = event.data.getIntentFilters();
        intents.map(i => {
            i.getActions().map(a => {
                switch(a.getName()){
                    case "android.intent.action.MAIN":
                        event.data.addTag(TAGS.MAIN);
                        break;
                }
            });

            i.getCategories().map(c => {
                switch(c.getName()){
                    case "android.intent.category.BROWSABLE":
                        event.data.addTag(TAGS.BROWSABLE);
                        break;
                }
            });

            /*
            i.getData().map(d => {
                
            });*/
        });


        // tag by attributes
        let attr = event.data.getAttributes();
        for(let i in attr){
            switch(i){
                case "exported":
                    if(attr[i]===true)
                        event.data.addTag(TAGS.EXPOSED);
                    break;
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
    }
});
AppTopoInspector.on("app.provider.new", {
    task: function(ctx, event){

        let cls = ctx.find.get.class(event.data.name);
        if(cls instanceof CLASS.Class){
            event.data.setImplementedBy(cls);
        }
    }
});
AppTopoInspector.on("app.service.new", {
    task: function(ctx, event){

        let cls = ctx.find.get.class(event.data.name);
        if(cls instanceof CLASS.Class){
            event.data.setImplementedBy(cls);
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