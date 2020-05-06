const HOOK = require("../../src/HookManager.js");
const Inspector = require("../../src/Inspector.js");
const InspectorFactory = require("../../src/InspectorFactory.js");
const Utils = require('../../src/Utils');


// ===== INIT =====

var FileDescriptorInspector = new InspectorFactory({

    startStep: Inspector.STEP.POST_APP_SCAN,

    useGUI: true,

    hookSet: {
        id: "FileDescriptor",
        name: "file descriptor inspector",
        description: "Track file descriptors into Java",
        hookShare: {
            fd: [],
            stream: [],
            refs: {}
        },
        require: ["Reflect","Common"],
        hooks: [
            {
                when: HOOK.BEFORE,
                method: [
                    "java.io.File.<init>(<java.io.File><java.lang.String>)<void>",
                    "java.io.File.<init>(<java.lang.String>)<void>",
                    "java.io.File.<init>(<java.lang.String><java.lang.String>)<void>",
                    "java.io.File.<init>(<java.net.URI>)<void>"
                ],
                onMatch: function(ctx,event){
                    ctx.getInspector("FileDescriptor").emits("hook.file.new",event);
                },
                interceptBefore: `
                
                    var msg={ arg0:"<null>", arg1:"<null>" }; 
            
                    if(arg0!=null){ 
                        if(isInstanceOf(arg0, "java.io.File")){
                            msg.arg0 = arg0.getAbsolutePath();
                        }
                        else if(isInstanceOf(arg0, "java.net.URI"))
                            msg.arg0 = arg0.toString();
                        else
                            msg.arg0 = arg0;
            
                    }
                    if(arguments.length==2 && arg1!=null){
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
            }
        ]
    },

    eventListeners: {
        "hook.file.new": function(ctx,event){
                // new meth
                // get the Hook from the Hook backtrace message
                //var hook = ctx.hook.getHookByID(event.hook);
                // get the method from the hook
                //var meth = ctx.find.get.method(hook.getMethod().signature());
                // console.log("New file catched", event);

                let data = event.data.data;
                let path = "";

                if(data.arg0.length>0 && data.arg0!=='<null>'){
                    path += data.arg0;
                }
                
                if(data.arg1.length>0 && data.arg1!=='<null>'){
                    path += '/'+data.arg1;                    
                }

                //let hook  = ctx.hook.getHookByID(Utils.b64_decode(event.data.hook)); 
                //console.log(data,path);
                //ctx.getFileAnalyzer().addRemoteFile(path);
                //meth.
            }
    }
});




module.exports = FileDescriptorInspector;
