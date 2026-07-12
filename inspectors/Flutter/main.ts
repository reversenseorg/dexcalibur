


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
import * as Log from "../../src/Logger.js";
import ModelMethod from "../../src/ModelMethod.js";
import {OperationType} from "../../src/search/MerlinSearchRequest.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var FlutterInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.1.0",
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
            }/*{
                name: "Dynamic method call",
                descr: "Call a method dynamically by referencing it by symbol like a dlsym followed by a call, or a method call trigged from Java's reflection",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: [{
                        type: OperationType.SEARCH,
                        args: {
                            pattern: [{
                                field: "enclosingClass."
                            }]
                        }
                    }]
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
            }*/
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