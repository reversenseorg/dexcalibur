import * as HOOK from '../../src/hook/HookManager.js';

import {IntentFilter} from "../../src/android/IntentFilter.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import Inspector, {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import ModelClass from "../../src/ModelClass.js";
import BusEvent from "../../src/BusEvent.js";
import AndroidActivity from "../../src/android/AndroidActivity.js";
import * as Log from "../../src/Logger.js";
import {AndroidManifest} from "../../src/android/AndroidManifest.js";
import {AndroidCodeAnalyzer} from "../../src/android/analyzer/AndroidCodeAnalyzer.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====



// === CONFIG
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    tags : {
        "input": ["text", "date", "email"],
    },

    hookSet: {
        id: "AndroidUI",
        name: "Android UI analyzer",
        description: "Find, tag and hook UI components",
        strategies:[]
    },

    eventListeners: {
        "class.new":  function (ctx:DexcaliburProject, event:BusEvent<ModelClass>):any {

        }
    }
});


