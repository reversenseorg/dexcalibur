const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js")();
const ut = require("../../src/Utils.js");


// ===== INIT =====

var Saver = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "saver",
        name: "Saver",
        description: "It offers a way to backup alias/hook and restore it as any save/open feature."
    })
});

// ===== Enable GUI =======
Saver.useGUI();


module.exports = Saver;