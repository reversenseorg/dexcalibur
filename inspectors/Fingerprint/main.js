
const Inspector = require("../../src/Inspector.js");
const InspectorFactory = require("../../src/InspectorFactory.js")

const Logger = require("../../src/Logger.js")();


// ===== INIT =====

var FingerprintInspector = new InspectorFactory({

    startStep: Inspector.STEP.POST_APP_SCAN,

    tags: {
        "fingerprint": ["fp-os","fp-sim","fp-device"]
    },

    hookSet: {
        id: "Fingerprint",
        name: "Dynamic & static fingerprint inspector",
        description: "Detect tests, gather values and spoof fingerprint",

        hookShare: {
            fake: {
                imei: "222222222222222222222",
                operator: "xxxxx",
                deviceId: "a73839ef1O"
            }
        },


        require: ["Common","Reflect"],

        hooks: [
            {
                //when: HOOK.BEFORE,
                method: "android.telephony.TelephonyManager.getDeviceId()<java.lang.String>",
                onMatch: function(ctx,event){
                    ctx.getInspector("Fingerprint").emits("fingerprint.device.getId",event);
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
            }
        ]
    },

    eventListeners: {
        "fingerprint.device.getId": function(ctx, event){
            Logger.info("[INSPECTOR][TASK] FingerprintInspector : getDeviceId ");
        }
    }
});



module.exports = FingerprintInspector;