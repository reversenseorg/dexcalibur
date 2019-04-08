const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js");
const ut = require("../../src/Utils.js");


// ===== INIT =====

var CleanerInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "BytecodeCleaner",
        name: "Bytecode cleaner",
        description: "It offers several cleanup solution : remove NOP, replace goto, detect wrapper, detect duplicate function ..."
    })
});

// ===== Enable GUI =======
CleanerInspector.useGUI();


// ===== CONFIG HOOKS =====



// ====== CONFIG TASK ====== 

/*
CleanerInspector.on("hook.dex.load", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] CleanerInspector new Dex file loaded ");
    }
});

CleanerInspector.on("hook.dex.new", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] CleanerInspector new Dex file");
    }
});*/

module.exports = CleanerInspector;