


/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */


// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import * as Log from "../../src/Logger.js";
import ModelMethod from "../../src/ModelMethod.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var FingerprintInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    tags: [
        {
            name:"fingerprint",
            _tagsOptions:[
                { name:"fp-os"},
                { name:"fp-sim"},
                { name:"fp-device"},
            ]
        }
    ],

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
                    type: ModelMethod.TYPE.getName(),
                    uid: "android.telephony.TelephonyManager.getDeviceId()<java.lang.String>"
                },
                autoEmit: true,
                emitEvent: "fingerprint.device.getId",
                replace: `  
            
                        let ret = "fakeID";
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                name: "fakeID"
                            }
                        );
                        
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
            
                `
            }
        ]
    },

    eventListeners: {
        "fingerprint.device.getId": function(pEvent:BusEvent<any>):any{
            Logger.info("[INSPECTOR][TASK] FingerprintInspector : getDeviceId ");
        }
    }
});


export default FingerprintInspector;