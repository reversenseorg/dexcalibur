const HOOK = require("../../src/HookManager.js");
const Inspector = require("../../src/Inspector.js");
const Logger = require("../../src/Logger.js");

// ===== INIT =====

var AppTopoInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "ApplicationTopography",
        name: "Manifest parser and application explorer",
        description: "-"
    })
});

AppTopoInspector.useGUI();


AppTopoInspector.registerTagCategory(
    "intent.action",
    ["browsable","exported"]
);

AppTopoInspector.registerTagCategory(
    "permissionType",
    ["normal","signature","dangerous","special"]
);
// ===== CONFIG HOOKS =====



// ====== CONFIG TASK ====== 


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


module.exports = AppTopoInspector;