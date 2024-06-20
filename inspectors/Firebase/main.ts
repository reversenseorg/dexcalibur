import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import * as Log from "../../src/Logger.js";
import ModelMethod from "../../src/ModelMethod.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====

var FirebaseInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.2",
    hookSet: {
        id: "Firebase",
        name: "Firebase",
        description: "Firebase API : auth, ...",
        prologue: `
            function printTest(){
                console.log("@@__CTX__@@");
            }
        `,
        strategies: [{

            name: "FirebaseAuth_getInstance",
            descr: "To hook the getter of firebase authentication instance. (see https://firebase.google.com/docs/auth/android/start)",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: `method("enclosingClass.name:com.google.firebase.auth.FirebaseAuth").filter("name:getInstance")`
            },
            autoEmit: true,
            emitEvent: "hook.firebase.auth.get",
            before: `
                    let msg="";    
                    if(DXC.util.isInstanceOf(arg0,"com.google.firebase.FirebaseApp"))
                        msg = arg0;
                    else
                        msg = "<unknow>";
        
        
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        {
                            msg: msg
                        }
                    );
            `
        }]
    },
    
    eventListeners: {

    }
});


export default FirebaseInspector;