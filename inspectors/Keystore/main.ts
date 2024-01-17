import * as Log from "../../src/Logger.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelMethod from "../../src/ModelMethod.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ====== CONFIG TASK ====== 

// ajouter signature
function checkForBKSext(file){
    return file.name.endsWith(".bks");
}

// ===== INIT =====

var KeystoreInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    tags: {
        "keystore.type": ["aks","bks","keychain","tpm"],
        "keystore.service": ["aks"],
    },

    useGUI: true,
    
    color: 'warning',

    hookSet: {
        id: "Keystore",
        name: "Keystore inspector",
        description: "Update the application representation with data from keystore and new keystore",
        hookShare: {
            fd: [],
            stream: []
        },
        require: ["StringUtils"],
        strategies: [
            {
                name: "instance",
                descr: "To detect new keystore instance",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid:  [
                        "java.security.KeyStore.getInstance(<java.lang.String>)<java.security.KeyStore>",
                        "java.security.KeyStore.getInstance(<java.lang.String><java.lang.String>)<java.security.KeyStore>",
                        "java.security.KeyStore.getInstance(<java.lang.String><java.security.Provider>)<java.security.KeyStore>"
                    ]
                },
                /*onMatch: function(ctx:DexcaliburProject,event:Event):any{
                    console.log("[LISTENER][KeyStore.getInstance] embedded keystore detected",event.data);
                    ctx.getInspector("Keystore").emits("hook.keystore.getter.instance", event);
                },
                preprocessor: ` 
                    console.log("[LISTENER][KeyStore.getInstance] embedded keystore detected",pEvent.data);
                    pCtx.getInspector("Keystore").emits("hook.keystore.getter.instance", pEvent.data);
                `,*/
                autoEmit: true,
                emitEvent: "hook.keystore.get.instance",
                before: `     
                    
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        {
                            name: arg0
                        }
                    );
                `
            },{
                name: "load",
                descr: "To detect load of keystore",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid:  [
                        "java.security.KeyStore.load(<java.io.InputStream><char>[])<void>"
                    ]
                },
                autoEmit: true,
                emitEvent: "hook.keystore.load",
                /*
                preprocessor: ` 
                    console.log("[LISTENER][KeyStore.load]",pEvent.data);
                    pCtx.getInspector("Keystore").emits("hook.keystore.load", pEvent);
                `,/*
                onMatch: function(ctx:DexcaliburProject,event:Event):any{
               
                    // follow match
                    ctx.hook.lastSession().addMatch(
                        KeystoreInspector.hookSet.id,
                        "java.security.KeyStore.load(<java.io.InputStream><char>[])<void>"
                    );
                    
                    console.log("[LISTENER][Keystore.load]",event.data);
                    
                    // DBI events
                    ctx.bus.send(new Event.Event({
                        type: "hook.keystore.load",
                        data: event.data
                    }));
            
                    ctx.getInspector("Keystore").emits("hook.keystore.load", event);
            
                },*/
                before: `
                    
                    let pwd = Java.array('char',arguments[1]);
                    
                    DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                        {
                            stream: "<stream>",
                            pwd: pwd,
                            type: this.type,
                            __msg__:"@@__METHSIGN__@@"
                        }
                    );
                `
            }
        ]
    },

    eventListenerSources: {
        "hook.keystore.load": {
            source: `
                Logger.info("[INSPECTOR][TASK] KeystoreInspector keystore loaded ")
                //pContext.get.method("java.security.KeyStore.load(<java.io.InputStream><char>[])<void>")
                //        .addArgsValue(ctx.hook.lastSession(), event)
            `,
            lang: "ts"
        },
        "data.file.new.knownExt": {
            source: `
                // <ts>
                if(!pEvent.data.name.endsWith(".bks")) return 1;
                Logger.info("[INSPECTOR][TASK] KeystoreInspector BKS detected : ",pEvent.data.name);
                (pEvent.data as ModelFile).tags.push(pCtx.getTagManager().getTag("keystore.type.bks").getUUID());
            `,
            lang: "ts"
        },
    },
    eventListeners: {
        "hook.keystore.load": function(ctx:DexcaliburProject,event:BusEvent<any>):any{
            Logger.info("[INSPECTOR][TASK] KeystoreInspector keystore loaded ")
            //ctx.get.method("java.security.KeyStore.load(<java.io.InputStream><char>[])<void>")
            //        .addArgsValue(ctx.hook.lastSession(), event)
        },
        "data.file.new.knownExt": function(ctx:DexcaliburProject,event:BusEvent<any>):any{
            if(!checkForBKSext(event.data)) return 1;
            
            Logger.info("[INSPECTOR][TASK] KeystoreInspector BKS detected : ",event.data.name);
            //console.log("Note found : ","value:"+event.data.name));
        
            
            // search strings occurences into the grah
            var resStaticStr:any = ctx.find.strings("value:"+event.data.name);
            
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
    }
});



// java.security.KeyStore.<init>(<java.security.KeyStoreSpi><java.security.Provider><java.lang.String>)<void>
/*KeystoreInspector.hookSet.addIntercept({
    //when: HOOK.BEFORE,
    method: [
        "java.security.KeyStore.<init>(<java.security.KeyStoreSpi><java.security.Provider><java.lang.String>)<void>",
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
                    type: arg2.toString(),
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
});*/



export  default KeystoreInspector;