import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var JavaRegexMatcherInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.3",
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
                    req: 'method("enclosingClass.name:/^java.util.Objects/").filter("name:requireNonNull")'
                },
                autoEmit: true,
                emitEvent: "hook.javaUtilsObject.requireNonNull",
                after: ` 
                    let eventData : Record<string, any> = {};
                    eventData['arg0_obj'] = arguments[0];  
                    if (arguments.length === 2) {
                        if (DXC.util.isInstanceOf(arguments[1], "java.lang.String")) 
                            eventData['arg1_message'] = arguments[1]; // String or Supplier<String> 
                        else
                            eventData['arg1_supplier'] = arguments[1]; // String or Supplier<String> 
                    }   
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