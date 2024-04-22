


// ===== INIT =====
import * as _fs_ from "fs"
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelFile from "../../src/ModelFile.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var ScaInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    db: {
        dbms: 'inmemory',
        type: 'collection',
        name: 'sca'
    },

    tags: [
        {
            name:"sca.lang",
            _tagsOptions:[
                { name:"kotlin" },
                { name:"java" },
                { name:"objc" },
                { name:"js" },
                { name:"hermes" },
                { name:"c" }
            ]
        }
    ],

    hookSet: {
        id: "SCA",
        name: "Software Composition Analysis",
        description: "Detect languages and techs",

        // must be updated at runtime
        hookShare: {

        },

        strategies: [

        ]
    },

    eventListeners: {
        "dxc.fullscan.post": function(pEvent:BusEvent<any>):any{


        }
    }
});


export default ScaInspector;