import {INSPECTOR_TYPE} from "../../src/Inspector";
import InspectorFactory from "../../src/InspectorFactory";
import DexcaliburProject from "../../src/DexcaliburProject";
import Event from "../../src/Event";
import * as Log from "../../src/Logger";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====

var IssueInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    hookSet: {
        id: "IssueObserver",
        name: "Issue observer",
        description: "Track and save security exception and device logs",
        require: ["Reflect"],
        hooks: [{
            //when: HOOK.BEFORE,
            method: [
                "java.lang.SecurityException.<init>()<void>",	
                "java.lang.SecurityException.<init>(<java.lang.String>)<void>",	
                "java.lang.SecurityException.<init>(<java.lang.String><java.lang.Throwable>)<void>",	
                "java.lang.SecurityException.<init>(<java.lang.Throwable>)<void>"
            ],
            onMatch: function(ctx:DexcaliburProject,event:Event):any{
                ctx.getInspector("IssueObserver").emits("hook.except.security.new",event);
            },
            interceptBefore: ` 
        
                    var msg="";    
                    if(isInstanceOf(arg0,"java.lang.String"))
                        msg = arg0;
                    else
                        msg = "<unknow>";
        
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
                    });
            `
        }]
    },
    
    eventListeners: {
        "hook.except.security.new": function(ctx:DexcaliburProject,event:Event):any{
            Logger.info("[INSPECTOR][TASK] IssueObserver new Security Exception ",event.data.msg);
        }
    }
});


export default IssueInspector;