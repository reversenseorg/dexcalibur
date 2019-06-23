const HOOK = require("../../src/HookManager.js");
const Inspector = require("../../src/Inspector.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js");


// ===== INIT =====

var IssueInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "IssueObserver",
        name: "Issue observer",
        description: "Track and save security exception and device logs"
    })
});

//IssueInspector.useGUI();

/*IssueInspector.registerTagCategory(
    "dynamic_loading",
    ["invoked","loaded"]
);*/
// ===== CONFIG HOOKS =====

IssueInspector.hookSet.require("Reflect");

// Define a shared struct (between hooks of this hookset)
IssueInspector.hookSet.addHookShare({
    classloader: [],
    additionalDex: []
});


IssueInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: [
        "java.lang.SecurityException.<init>()<void>",	
        "java.lang.SecurityException.<init>(<java.lang.String>)<void>",	
        "java.lang.SecurityException.<init>(<java.lang.String><java.lang.Throwable>)<void>",	
        "java.lang.SecurityException.<init>(<java.lang.Throwable>)<void>"
    ],
    onMatch: function(ctx,event){
        IssueInspector.emits("hook.except.security.new",event);
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
});



// ====== CONFIG TASK ====== 


IssueInspector.on("hook.except.security.new", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] IssueObserver new Security Exception ",event.data.msg);
    }
});


module.exports = IssueInspector;