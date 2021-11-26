


// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory";
import {INSPECTOR_TYPE} from "../../src/Inspector";
import DexcaliburProject from "../../src/DexcaliburProject";
import Event from "../../src/Event";
import * as Log from "../../src/Logger";
import ModelMethod from "../../src/ModelMethod";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var FingerprintInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

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
                search: {
                    type: ModelMethod.TYPE,
                    uid: "android.telephony.TelephonyManager.getDeviceId()<java.lang.String>"
                },
                onMatch: function(ctx:DexcaliburProject,event:Event):any{
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
        "fingerprint.device.getId": function(ctx:DexcaliburProject,event:Event):any{
            Logger.info("[INSPECTOR][TASK] FingerprintInspector : getDeviceId ");
        }
    }
});


export default FingerprintInspector;