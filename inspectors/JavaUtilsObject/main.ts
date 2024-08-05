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