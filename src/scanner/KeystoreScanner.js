const HOOK = require("../HookManager.js");


var KeystoreScanner = new HOOK.HookSet({
    id: "KeystoreScanner",
    name: "keystore detection & interception",
    description: "Discover keystore and update the application model"
});

// add code before hooks 
// add @@__CTX__@@_ before each symbol
// DeObfuscationScanner.addPrologue(``);

KeystoreScanner.addIntercept({
    when: HOOK.BEFORE,
    method: "java.security.KeyStore.load(<java.io.InputStream><char>[])<void>",
    interceptReplace: `     
        var buffer = Java.array('char', arguments[1]);

        var result = "";
        for(var i = 0; i < buffer.length; ++i){
            result+= (String.fromCharCode(buffer[i]));
        }

        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: result,
            after: true, 
            msg: "KeyStore.load(a,b)", 
            action:"Log" 
        });

        return meth_@@__METHDEF__@@.call(this, arguments[0], arguments[1]);
    `
});

KeystoreScanner.addIntercept({
    when: HOOK.BEFORE,
    method: [
        "java.security.KeyStore.getInstance(<java.lang.String>)<java.security.KeyStore>",
        "java.security.KeyStore.getInstance(<java.lang.String><java.lang.String>)<java.security.KeyStore>",
        "java.security.KeyStore.getInstance(<java.lang.String><java.security.Provider>)<java.security.KeyStore>"
    ],
    onMatch: function(ctx,event){

        ctx.hook.lastSession().addMatch(
            KeystoreScanner.id,
            "java.security.KeyStore.getInstance"
        );
        
        console.log("[LISTENER][Class.getConstructor] embedded keystore detected (BKS)",event.data);
    },
    interceptBefore: `     
        //console.log("test");
        //if(arguments[0] == "BKS"){
            send({ 
                id:"@@__HOOK_ID__@@", 
                match: true, 
                data: arguments[0],
                after: true, 
                msg: "KeyStore.getInstance(string)", 
                action:"Log" 
            });
        //}
    `
});

KeystoreScanner.addIntercept({
    when: HOOK.BEFORE,
    method: "java.security.KeyStore.load(<java.security.KeyStore$LoadStoreParameter>)<void>",
    onMatch: function(ctx,event){

        ctx.hook.lastSession().addMatch(
            KeystoreScanner.id,
            "java.security.KeyStore.getInstance"
        );
        
        console.log("[LISTENER][Class.getConstructor] embedded keystore detected (BKS)",event.data);
    },
    interceptReplace: `        
        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: "",
            after: true, 
            msg: "KeyStore.load(a)", 
            action:"Log" 
        });

        return meth_@@__METHDEF__@@.call(this, arguments[0]);
    `
});

module.exports = KeystoreScanner;