import * as Log from "../../src/Logger.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ====== CONFIG TASK ====== 


// ===== INIT =====

var TrackerInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.BOOT,
    
    useGUI: true,
    
    color: 'warning',

    hookSet: {
        id: "TrackerIdentifier",
        name: "TrackerIdentifier inspector",
        description: "Search and identify trackers ",
        hookShare: {},
        require: [],
        strategies: [

        ]
    },

    /*
        Doc : https://reversense.jetbrains.space/p/dxc/documents/Dexcalibur/a/Main-Bus--Event-types
     */
    eventListeners: {

    }
});



export  default TrackerInspector;