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

var JavaThreadInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    hookSet: {
        id: "JavaThread",
        name: "JavaThread",
        description: "Hooks on java.lang.Thread",
        strategies: [{
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("__signature__:/\\(<java.lang.Thread><java.lang.Throwable>\\)/")'
            },
            name: "ThreadUncaughtExceptionHandler uncaughtException",
            descr: "Hook uncaughtException method, invoked when the given thread terminates due to the given uncaught " +
                "exception. DefaultUncaughtException is often overwritten to hide exceptions information.",
            autoEmit: true,
            emitEvent: "hook.thread.uncaughtException",
            before: ` 
                //<ts>={
                let eventData : Record<string, any> = {};
                eventData['arg0_thread'] = arguments[0].toString();
                eventData['arg1_throwable'] = arguments[1].toString();
                
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

export default JavaThreadInspector;