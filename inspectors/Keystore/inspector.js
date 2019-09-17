const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js")();
const ut = require("../../src/Utils.js");


// ===== INIT =====

var KeystoreInspector = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "Keystore",
        name: "Keystore inspector",
        description: "Update the application representation with data from keystore and new keystore"
    })
});

// ===== CONFIG HOOKS =====

// Define a shared struct (between hooks of this hookset)
KeystoreInspector.hookSet.addHookShare({
    fd: [],
    stream: []
});

// prologue module
KeystoreInspector.hookSet.require("StringUtils");



KeystoreInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: [
        "java.security.KeyStore.getInstance(<java.lang.String>)<java.security.KeyStore>",
        "java.security.KeyStore.getInstance(<java.lang.String><java.lang.String>)<java.security.KeyStore>",
        "java.security.KeyStore.getInstance(<java.lang.String><java.security.Provider>)<java.security.KeyStore>"
    ],
    onMatch: function(ctx,event){
        console.log("[LISTENER][KeyStore.getInstance] embedded keystore detected",event.data);
        KeystoreInspector.emits("hook.keystore.getter.instance", event);
    },
    interceptBefore: `     
        
            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: {
                    name: arguments[0],
                },
                after: true, 
                msg: "KeyStore.getInstance(string)", 
                tags: [{
                    style:"danger",
                    text: "keystore"
                }], 
                action:"Log" 
            });
    `
});

// add a hook intercepting the java.io.File constructors
KeystoreInspector.hookSet.addIntercept({
    when: HOOK.BEFORE,
    method: [ "java.security.KeyStore.load(<java.io.InputStream><char>[])<void>"],
    onMatch: function(ctx,event){
   
        // follow match
        /* ctx.hook.lastSession().addMatch(
            KeystoreInspector.hookSet.id,
            "java.security.KeyStore.load(<java.io.InputStream><char>[])<void>"
        ); */
        
        console.log("[LISTENER][Keystore.load]",event.data);
        
        // DBI events
        /*ctx.bus.send(new Event.Event({
            type: "hook.keystore.load",
            data: event.data
        }));*/

        KeystoreInspector.emits("hook.keystore.load", event);

    },
    interceptBefore: `
        
        var pwd = Java.array('char',arguments[1]);
        
        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: {
                stream: "<stream>",
                pwd: "<pwd>"
            },
            after: true, 
            msg: "Keystore.load()", 
            tags: [{
                style:"danger",
                text: "keystore"
            }], 
            action:"Logging keystore load" 
        });
    `
});


// ====== CONFIG TASK ====== 

// ajouter signature
function checkForBKSext(file){
    return file.name.endsWith(".bks");
}
function checkForBKSfmt(file){
    //return file.path
}


KeystoreInspector.on("hook.keystore.load", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] KeystoreInspector keystore loaded ")
        console.log(event);
        //ctx.get.method("java.security.KeyStore.load(<java.io.InputStream><char>[])<void>")
        //        .addArgsValue(ctx.hook.lastSession(), event)
    }
});

// it will be trigged for each update of the app view
KeystoreInspector.on("data.file.new.knownExt", {
    task: function(ctx, event){        
        if(!checkForBKSext(event.data)) return 1;
        Logger.info("[INSPECTOR][TASK] KeystoreInspector BKS detected : ",event.data.name);
        //console.log("Note found : ","value:"+event.data.name));
  
        
        // search strings occurences into the grah
        var resStaticStr = ctx.find.string("value:"+event.data.name);
        
        //var resDynStr = ctx.find.method("name:java.security.Keystore.load(<>,<>)");
        
        // si pas d'occurence
        if(resStaticStr.count()==0){
            resStaticStr.show();
        }else{
            /*var dynRes = ctx.find.get.method("java.security.KeyStore.load(<java.io.InputStream><char>[])<void>");
            dynRes.filter("dyn.arg[0].value:"+event.data.name);
            if(resStaticStr.count()==0){
                resStaticStr.show();
            } */  
            console.log("Not found : ","value:"+event.data.name);
        }
    }
});



module.exports = KeystoreInspector;
