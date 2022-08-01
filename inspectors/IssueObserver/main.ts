import {INSPECTOR_TYPE} from "../../src/Inspector";
import InspectorFactory from "../../src/InspectorFactory";
import DexcaliburProject from "../../src/DexcaliburProject";
import BusEvent from "../../src/BusEvent";
import * as Log from "../../src/Logger";
import ModelMethod from "../../src/ModelMethod";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====

var IssueInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    hookSet: {
        id: "IssueObserver",
        name: "Issue observer",
        description: "Track and save security exception and device logs",
        require: ["Reflect"],
        strategies: [{

            name: "SecurityException_new",
            descr: "To detect new security exception",
            search: {
                type: ModelMethod.TYPE,
                uid: [
                    "java.lang.SecurityException.<init>()<void>",
                    "java.lang.SecurityException.<init>(<java.lang.String>)<void>",
                    "java.lang.SecurityException.<init>(<java.lang.String><java.lang.Throwable>)<void>",
                    "java.lang.SecurityException.<init>(<java.lang.Throwable>)<void>"
                ]
            },/*
            onMatch: function(ctx:DexcaliburProject,event:Event):any{
                ctx.getInspector("IssueObserver").emits("hook.except.security.new",event);
            },
            preprocessor: ` 
                pCtx.getInspector("IssueObserver").emits("hook.except.security.new", pEvent.data);
            `,*/

            autoEmit: true,
            emitEvent: "hook.except.security.new",
            before: ` 
        
                    var msg="";    
                    if(isInstanceOf(arg0,"java.lang.String"))
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
                    /*
                    send({ 
                        id:"@@__HOOK_ID__@@", 
                        match: true, 
                        data: {
                            msg: msg
                        },
                        after: false, 
                        msg: "SecurityException", 
                        tags: [{
                            style:"black",
                            text: "error"
                        }],
                        action: "" 
                    });*/
            `
        }]
    },
    
    eventListeners: {
        "hook.except.security.new": function(ctx:DexcaliburProject,event:BusEvent):any{
            Logger.info("[INSPECTOR][TASK] IssueObserver new Security Exception ",event.data.msg);
        }
    }
});


export default IssueInspector;