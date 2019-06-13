const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js")
const EventType = require("../../src/Event.js").TYPE;
const Logger = require("../../src/Logger.js");
const ut = require("../../src/Utils.js");


// ===== INIT =====

var DataClassifierInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "DataClassifier",
        name: "Data classifier",
        description: "Process heuristic analysis and perform data tagging"
    })
});


// == hook
// DataClassifierInspector.useGUI();


// prologue module
//DataClassifierInspector.hookSet.require("Reflect");
//DataClassifierInspector.hookSet.require("Common");


// add a hook intercepting the java.io.File constructors
/*
DataClassifierInspector.hookSet.addIntercept({
    when: HOOK.BEFORE,
    method: [
        "java.io.File.<init>(<java.io.File><java.lang.String>)<void>",
        "java.io.File.<init>(<java.lang.String>)<void>",
        "java.io.File.<init>(<java.lang.String><java.lang.String>)<void>",
        "java.io.File.<init>(<java.net.URI>)<void>"
    ],
    onMatch: function(ctx,event){
        DataClassifierInspector.emits("hook.file.new",event);
    },
    interceptBefore: `
        var msg={ arg0:"<null>", arg1:"<null>" }; 

        if(arg0!=null){ 
            if(isIntanceOf(arg0, "java.io.File")){
                //var a=wJava.cast(arg0, DEXC_MODULE.common.class.java.io.File).getAbsolutePath();
                msg.arg0 = arg0.getAbsolutePath();
            }
            else if(isIntanceOf(arg0, "java.net.URI"))
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
            action:"None" 
        });
    `
});
*/

const TAGS = { 
    hash: {
        128: ["md5"], 
        256: ["sha1","sha256"],
        512: ["sha512"]
    },
    asym_key: {
        1024: ["rsa-1024"], 
        2048: ["rsa-2048"],
        4096: ["rsa-4096"],
    },
    sym_key: {
        128: ["key-128"], 
        256: ["key-256"],
        196: ["key-196"]
    }
};

function isASCII(buffer){
    let c = buffer.count();
    for(let i=0; i<c; i++){
        if(buffer.read(i) > 0x7f || buffer.read(i) < 0x1f) return false;
    }
    return true;
}

DataClassifierInspector.on("disass.datablock.new",{
    task: function(ctx,event){
        if(event.data!=null){
            let l = event.data.count()*event.data.width;
            if(TAGS.hash[l] != null) event.data.tags=event.data.tags.concat(TAGS.hash[l]);
            if(TAGS.asym_key[l] != null) event.data.tags=event.data.tags.concat(TAGS.asym_key[l]);
            if(TAGS.sym_key[l] != null) event.data.tags=event.data.tags.concat(TAGS.sym_key[l]);
            if(isASCII(event.data)) event.data.tags=event.data.tags.concat(["ascii"]);
            //console.log(l,event.data.tags);
        }
    }
});

DataClassifierInspector.on("hook.cmp.array",{
    task: function(ctx,event){
        console.log("New data intercepted", event);

    }
});


module.exports = DataClassifierInspector;
