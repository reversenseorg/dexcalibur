const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js")
const EventType = require("../../src/Event.js").TYPE;
const Logger = require("../../src/Logger.js");
const ut = require("../../src/Utils.js");


// ===== INIT =====

var FileDescriptorInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "FileDescriptor",
        name: "file descriptor inspector",
        description: "Resolve FD allocate from Java"
    })
});


// == hook
FileDescriptorInspector.useGUI();

// Define a shared struct s(between hooksFileDescriptorInspector of this hookset)
FileDescriptorInspector.hookSet.addHookShare({
    fd: [],
    stream: [],
    refs: {}
});

// prologue module
FileDescriptorInspector.hookSet.require("Reflect");
FileDescriptorInspector.hookSet.require("Common");


// add a hook intercepting the java.io.File constructors
FileDescriptorInspector.hookSet.addIntercept({
    when: HOOK.BEFORE,
    method: [
        "java.io.File.<init>(<java.io.File><java.lang.String>)<void>",
        "java.io.File.<init>(<java.lang.String>)<void>",
        "java.io.File.<init>(<java.lang.String><java.lang.String>)<void>",
        "java.io.File.<init>(<java.net.URI>)<void>"
    ],
    onMatch: function(ctx,event){
        FileDescriptorInspector.emits("hook.file.new",event);
    },
    interceptBefore: `
        var msg={ arg0:"<null>", arg1:"<null>" }; 

        if(arg0!=null){ 
            if(isInstanceOf(arg0, "java.io.File")){
                //var a=wJava.cast(arg0, DEXC_MODULE.common.class.java.io.File).getAbsolutePath();
                msg.arg0 = arg0.getAbsolutePath();
            }
            else if(isInstanceOf(arg0, "java.net.URI"))
                msg.arg0 = arg0.toString();
            else
                msg.arg0 = arg0;

        }
        if(arguments.length>=2 && arg1!=null){
            msg.arg1 = arg1;
        }

        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: msg,
            after: false, 
            msg: "File()", 
            tags: [{
                style:"pink",
                text: "fs"
            }],
            action:"None" 
        });
    `
});

/*
FileDescriptorInspector.hookSet.addIntercept({
    when: HOOK.BEFORE,
    multiple_method: [
   
    ],
    onMatch: function(ctx,event){
        
        ctx.bus.send({
            type: "hook.fd.new",
            data: event.data
        });

    },
    interceptBefore: `
        var msg={ arg0:"<null>", arg1:"<null>" }; 

        if(arg0!=null){ 
            if(isIntanceOf(arg0, "java.io.File"))
                msg.arg0 = "<File>";
            else if(isIntanceOf(arg0, "java.net.URI"))
                msg.arg0 = arg0.toString();
            else
                msg.arg0 = arg0;
        }
        if(arg1!=null){
            msg.arg1 = arg1;
        }

        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: msg,
            after: false, 
            msg: "File()", 
            action:"None" 
        });
    `
});
*/

FileDescriptorInspector.on("hook.file.new",{
    task: function(ctx,event){
        // new meth
        // get the Hook from the Hook backtrace message
        //var hook = ctx.hook.getHookByID(event.hook);
        // get the method from the hook
        //var meth = ctx.find.get.method(hook.getMethod().signature());
        console.log("New file catched");
        //meth.
    }
});


module.exports = FileDescriptorInspector;
