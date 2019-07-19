const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js");
const AnalysisHelper = require("../../src/AnalysisHelper.js");
const ut = require("../../src/Utils.js");


// ===== INIT =====

var FingerprintInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "Fingerprint",
        name: "Dynamic & static fingerprint inspector",
        description: "Detect tests, gather values and spoof fingerprint"
    })
});

//FingerprintInspector.useGUI();

FingerprintInspector.hookSet.addHookShare({
    fake: {
        imei: "222222222222222222222",
        operator: "xxxxx",
        deviceId: "a73839ef1O"
    }
});

FingerprintInspector.registerTagCategory(
    "fingerprint",
    ["fp-os","fp-sim","fp-device"]
);
// ===== CONFIG HOOKS =====

FingerprintInspector.hookSet.require("Common");
FingerprintInspector.hookSet.require("Reflect");

FingerprintInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: "android.telephony.TelephonyManager.getDeviceId()<java.lang.String>",
    onMatch: function(ctx,event){
        FingerprintInspector.emits("fingerprint.device.getId",event);
    },
    interceptReplace: `  

            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    name: "fakeID"
                },
                after: false, 
                msg: "TelephonyManager.getDeviceId()", 
                tags: [{
                    style:"orange",
                    text: "fingerprint"
                }], 
                action: "Bypass" 
            });

            return "fakeID";
    `
});





// ====== CONFIG TASK ====== 


FingerprintInspector.on("hook.dex.load", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] FingerprintInspector : getDeviceId ",event.data.path);
    }
});


module.exports = FingerprintInspector;