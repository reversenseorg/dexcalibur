import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelStringValue from "../../src/ModelStringValue.js";
import ModelDataBlock from "../../src/ModelDataBlock.js";



function isASCII(buffer){
    let c = buffer.count();
    for(let i=0; i<c; i++){
        // && buffer.read(i) > 0x00
        if(buffer.read(i) > 0x7f || (buffer.read(i) < 0x1f)) return false;
    }
    return true;
}


// ===== INIT =====

var CommunicationInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    tags: {
        "string.pattern": ["URI", "IP"]
    },

    hookSet: {
        id: "DataClassifier",
        name: "Data classifier",
        description: "Process heuristic analysis and perform data tagging (byte array, strings, ...)",
        strategies:[]
    },

    eventListeners: {

    }
});

export default  CommunicationInspector;