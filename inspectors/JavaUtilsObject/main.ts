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

import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var JavaRegexMatcherInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.5",
    hookSet: {
        id: "JavaUtilsObject",
        name: "Java Utils Object",
        description: "Java Utils Object",
        strategies: [
            {
                name: "JavaUtilsObject requireNonNull",
                descr: "Hook the method that attempts to match the entire region against the pattern.",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: 'method("enclosingClass.name:/^java.util.Objects/").filter("name:requireNonNull")' +
                        '.filter("__signature__:/\\(<java.lang.Object><java.lang.String>\\)/")'
                },
                autoEmit: true,
                emitEvent: "hook.javaUtilsObject.requireNonNull",
                after: ` 
                    let eventData : Record<string, any> = {};
                    // TODO: Add an object serialisation 
                    eventData['arg0_obj'] = arguments[0].toString();  
                    eventData['arg0_obj_class'] = arguments[0].getClass().toString();  
                    eventData['arg1_message'] = arguments[1]; // String or Supplier<String> 
                    
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        eventData
                    );
                  `
            }
        ]
    },
    eventListeners: {
    }
});


export default JavaRegexMatcherInspector;