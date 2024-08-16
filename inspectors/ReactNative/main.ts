


// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var ReactNativeInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    tags: [{
        name:"tech",
        _tagsOptions:[
            { name:"react_native"}
        ]
    }],

    hookSet: {
        id: "ReactNative",
        name: "ReactNative",
        description: "Detect ReactNative app and adapt dxc behavior. One of purpose of this inspector is to avoid to create a KeyPoint for each built-in libraries",

        // must be updated at runtime
        hookShare: {

        },


        strategies: [

        ]
    },

    eventListenerSources: {
        "dxc.fullscan.post": {
            lang: "ts",
            description: "When a fullscan is done, it detects if some native libraries exists. Using such matches, it compute a probability of the application uses ReactNative. Finally, if the score reaches a threashold the app is tagged with `tech.react_native`",
            source: `
                //<ts>={
                const ctx:DexcaliburProject = pEvent.getContext();
                console.log("Search native libs from ReactNative")
                // TODO
                //console.log(ctx.find.files("name:/^librrc_.+\\.so$/"));
                
                // tags "non-react native" libs
            `
        }
    }
});


export default ReactNativeInspector;