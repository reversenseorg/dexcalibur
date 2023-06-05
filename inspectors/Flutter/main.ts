


// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var FlutterInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    tags: {
        "fingerprint": ["fp-os","fp-sim","fp-device"]
    },

    hookSet: {
        id: "Flutter",
        name: "Flutter",
        description: "Detect Flutter app, related resources, extends hook agent, and more...",

        // must be updated at runtime
        hookShare: {
            /*
            fake: {
                imei: "222222222222222222222",
                operator: "xxxxx",
                deviceId: "a73839ef1O"
            }*/
        },


        require: [],

        strategies: [
            /*
            {
                name: "read_DeviceID",
                descr: "To detect read of device ID",
                search: {
                    type: ModelMethod.TYPE,
                    uid: "android.telephony.TelephonyManager.getDeviceId()<java.lang.String>"
                },
                autoEmit: true,
                emitEvent: "fingerprint.device.getId",
                replace: `  
            
                        ret = "fakeID";
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                name: "fakeID"
                            }
                        );
                `
            }
            */
        ]
    },

    eventListeners: {
        /*"fingerprint.device.getId": function(ctx:DexcaliburProject,event:BusEvent<any>):any{
            Logger.info("[INSPECTOR][TASK] FingerprintInspector : getDeviceId ");
        }*/
    }
});


export default FlutterInspector;