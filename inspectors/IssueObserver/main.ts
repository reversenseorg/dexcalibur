import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import * as Log from "../../src/Logger.js";
import ModelMethod from "../../src/ModelMethod.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====

var IssueInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    hookSet: {
        id: "IssueObserver",
        name: "Issue observer",
        description: "Track and save security exception and device logs",
        require: ["Reflect"],
        strategies: [{

            name: "SecurityException_new",
            descr: "To detect new security exception",
            search: {
                type: ModelMethod.TYPE.getName(),
                uid: [
                    "java.lang.SecurityException.<init>(<java.lang.String>)<void>",
                    "java.lang.SecurityException.<init>(<java.lang.String><java.lang.Throwable>)<void>",
                    "java.lang.SecurityException.<init>(<java.lang.Throwable>)<void>"
                ]
            },
            autoEmit: true,
            emitEvent: "hook.except.security.new",
            before: ` 
        
                    let msg="";    
                    if(DXC.util.isInstanceOf(arg0,"java.lang.String"))
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
        },{

            name: "SecurityException_new_single",
            descr: "To detect new security exception without args",
            search: {
            type: ModelMethod.TYPE.getName(),
                    uid: [
                    "java.lang.SecurityException.<init>()<void>"
                ]
            },
            autoEmit: true,
                emitEvent: "hook.except.security.new",
                before: ` 
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                msg: null
                            }
                        );
                `
            }]
    },
    
    eventListeners: {
        "hook.except.security.new": function(pEvent:BusEvent<any>):any{
            Logger.info("[INSPECTOR][TASK] IssueObserver new Security Exception ",pEvent.data.msg);
        }
    }
});


export default IssueInspector;