


// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import ModelMethod from "../../src/ModelMethod.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var FlutterInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.1",
    tags: [],

    hookSet: {
        id: "Flutter",
        name: "Flutter",
        description: "Detect Flutter app, related resources, extends hook agent, and more...",

        // must be updated at runtime
        hookShare: {

        },


        strategies: [
            {
                name: "Keyboard_visibility_detect_change",
                descr: "React to keyboard visiblity change (https://pub.dev/packages/flutter_keyboard_visibility)",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: `method("enclosingClass.source:/FlutterKeyboard/").filter("name:/onAttach/")`
                },
                autoEmit: true,
                emitEvent: "hook.flutter.keyboard.visibility",
                replace: `  
         
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                name: "@@__METHNAME__@@"
                            }
                        );
                `
            }
        ]
    },

    eventListenerSources: {
        "dxc.fullscan.post_deploy": {
            lang: "ts",
            source: `
            //<ts>={
            let ctx = pEvent.getContext();
            let app = ctx.find.file("name:/^libapp\.so$/").get(0);
            let flutter = ctx.find.file("name:/^libflutter\.so$/").get(0);
            
            ctx.merlin.file("path:/flutter_assets\/[a-zA-Z]+\.json$/");
            
            //try to detect through libapp.so + libflutter.so
            if( app!=null && flutter!=null ){
                ctx.trigger({
                    type: "lang.flutter.new",
                    data: {
                        app: app,
                        lib: flutter
                    }
                })
            }
            
            
            `
        }
    }
});


export default FlutterInspector;