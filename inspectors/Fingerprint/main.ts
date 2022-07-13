


// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory";
import {INSPECTOR_TYPE} from "../../src/Inspector";
import DexcaliburProject from "../../src/DexcaliburProject";
import BusEvent from "../../src/BusEvent";
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

        // must be updated at runtime
        hookShare: {
            fake: {
                imei: "222222222222222222222",
                operator: "xxxxx",
                deviceId: "a73839ef1O"
            }
        },


        require: [],

        strategies: [
            {
                name: "read_DeviceID",
                descr: "To detect read of device ID",
                search: {
                    type: ModelMethod.TYPE,
                    uid: "android.telephony.TelephonyManager.getDeviceId()<java.lang.String>"
                },/*
                onMatch: function(ctx:DexcaliburProject,event:Event):any{
                    ctx.getInspector("Fingerprint").emits("fingerprint.device.getId",event);
                },
                preprocessor: ` 
                    pCtx.getInspector("Fingerprint").emits("fingerprint.device.getId", pEvent.data);
                `,*/
                autoEmit: true,
                emitEvent: "fingerprint.device.getId",
                replace: `  
            
                        DXC.send({
                            hid: "@@__HOOK_ID__@@",
                            fid: "@@__FRAG_ID__@@",
                            data: {
                                name: "fakeID"
                            }
                        });
                        
                        /*
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
                        });*/
            
                        return "fakeID";
                `
            }
        ]
    },

    eventListeners: {
        "fingerprint.device.getId": function(ctx:DexcaliburProject,event:BusEvent):any{
            Logger.info("[INSPECTOR][TASK] FingerprintInspector : getDeviceId ");
        }
    }
});


export default FingerprintInspector;