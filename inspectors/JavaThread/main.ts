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