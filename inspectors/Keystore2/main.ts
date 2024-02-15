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

var KeystoreInspector2:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,
    
    useGUI: true,
    version: "1.0.2",
    color: 'warning',

    hookSet: {
        id: "Keystore2",
        name: "Keystore inspector 2",
        description: "Update the application representation with data from keystore and new keystore",
        hookShare: {
            fd: [],
            stream: []
        },
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
                //ctx.get.method("java.security.KeyStore.load(<java.io.InputStream><char>[])<void>")
                //        .addArgsValue(ctx.hook.lastSession(), event)
            `,
            lang: "ts"
        },
        "data.file.new.knownExt": {
            source: `
                if(!checkForBKSext(event.data)) return 1;
          
                Logger.info("[INSPECTOR][TASK] KeystoreInspector BKS detected : ",event.data.name);
                var resStaticStr:any = ctx.find.strings("value:/"+event.data.name+"/");
                // si pas d'occurence
                if(resStaticStr.count()==0){
                    resStaticStr.show();
                }else{
                    console.log("Not found : ","value:"+event.data.name);
                }
            `,
            lang: "ts"
        },
    }
});


export  default KeystoreInspector2;