import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelStringValue from "../../src/ModelStringValue.js";
import ModelDataBlock from "../../src/ModelDataBlock.js";




// ===== INIT =====

var CommunicationInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    tags: [],

    hookSet: {
        id: "CommunicationMonitor",
        name: "Communication Monitor",
        description: "Process heuristic analysis and perform data tagging (byte array, strings, ...)",
        strategies:[]
    },

    eventListeners: {

    }
});

export default  CommunicationInspector;