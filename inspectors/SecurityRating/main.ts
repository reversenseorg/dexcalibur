
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

    tags : [
        /*{
            name:"security.acl.env",
            descr: "A set of tag related to access control management of environment",
            _tagsOptions:[
                {
                    name:"run_as_system",
                    descr: "The application runs with system user"
                }
            ]
        },*/{
            name:"security.acl.app",
            descr: "A set of tag related to access control management of target application",
            _tagsOptions:[
                {
                    name:"run_as_system",
                    descr: "The application runs with system user"
                }
            ]
        }
    ],

    version: "1.0.0",
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
        "dxc.fullscan.post_deploy": function(pEvent:BusEvent<any>){
            // TODO : retieve stored score
            // TODO : else init it
            if(pEvent.getContext().sharedStorage.ratings == null){
                pEvent.getContext().sharedStorage.ratings = {
                    security: {
                        overall: 0,
                        rootDetection: 0,
                        emulatorDetection: 0,
                        hookDetection: 0,
                        integrityChecck: 0,
                        antiTampering: 0,
                        communications: 0
                    },
                    attackInterest: {
                        accessControl: 0,
                        runAsSystem: 0
                    }
                };
            }
        },
        "security.root_detection.java.detectApk": function(pEvent:BusEvent<HookMessageV2>){
            pEvent.getContext().sharedStorage.ratings.security.rootDetection += 1;
        },
        "security.acl.run_as_system": function(pEvent:BusEvent<any>){
            // increment rating
            pEvent.getContext().sharedStorage.ratings.attackInterest.accessControl += 4;

            // tag the project
            const tag = pEvent.getContext().getTagManager().getTag("security.acl.app.run_as_system");
            (pEvent.getContext() as DexcaliburProject).addTag(tag);

        }
    }
});


export default SecurityRatingInspector;