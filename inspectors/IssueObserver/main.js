
const Inspector = require("../../src/Inspector.js");
const InspectorFactory = require("../../src/InspectorFactory.js");
const Logger = require("../../src/Logger.js")();


// ===== INIT =====

var IssueInspector = new InspectorFactory({

    startStep: Inspector.STEP.POST_APP_SCAN,

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
            onMatch: function(ctx,event){
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
        "hook.except.security.new": function(ctx, event){
            Logger.info("[INSPECTOR][TASK] IssueObserver new Security Exception ",event.data.msg);
        }
    }
});


module.exports = IssueInspector;