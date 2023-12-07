
// ===== INIT =====
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import ModelMethod from "../../src/ModelMethod.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelStringValue from "../../src/ModelStringValue.js";
import HookMessageV2 from "../../src/hook/HookMessageV2.js";
import {ContextLocation, ModelInstance} from "../../src/ModelInstance.js";
import {Nullable} from "../../src/core/IStringIndex.js";
import {INode} from "@dexcalibur/dexcalibur-orm";
import {RuntimeEvent} from "../../src/hook/RuntimeEvent.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var SecurityRatingInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    hookSet: {
        id: "SecurityRating",
        name: "Security rating",
        description: "Gather every events related to security such as reverse engineering resistance and compute some overall score.",

        // must be updated at runtime
        hookShare: {

        },


        require: [],

        strategies: []
    },

    eventListeners: {
        "dxc.fullscan.post": function(ctx:DexcaliburProject,event:BusEvent<any>){
            // TODO : retieve stored score
            // TODO : else init it
            if(ctx.sharedStorage.ratings == null){
                ctx.sharedStorage.ratings = {
                    security: {
                        overall: 0,
                        rootDetection: 0,
                        emulatorDetection: 0,
                        hookDetection: 0,
                        integrityChecck: 0,
                        antiTampering: 0,
                        communications: 0
                    }
                };
            }

        },
        "security.root_detection.java.detectApk": function(ctx:DexcaliburProject,event:BusEvent<HookMessageV2>){
            ctx.sharedStorage.security.rootDetection += 1;
        }
    }
});


export default SecurityRatingInspector;