/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import ModelMethod from "../../src/ModelMethod.js";



// ===== INIT =====

var KeystoreInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.1.0",
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
            },{
                name: "Init custom keystore",
                descr: "To detect load of keystore",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid:  [
                        "java.security.KeyStore.<init>(<java.security.KeyStoreSpi><java.security.Provider><java.lang.String>)<void>"
                    ]
                },
                autoEmit: true,
                emitEvent: "hook.keystore.getter.instance",
                before: `     
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        {
                            type: arg2.toString(),
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
                let ctx = pEvent.getContext();
                ctx.LOG.info("[INSPECTOR][TASK] KeystoreInspector keystore loaded ");
                (pEvent as RuntimeEvent).tags.push(ctx.getTagManager().getTag("keystore.svc.load").getUUID());
            `,
            description: "Detect keystore load and tag Runtime Event",
            lang: "ts"
        },
        "data.file.parsed": {
            source: `
                if(pEvent.data==null || pEvent.data.file==null) return 1;
                if(!pEvent.data.file.name.endsWith(".bks")) return 1;
                let ctx = pEvent.getContext();
                ctx.LOG.info("[INSPECTOR][TASK] KeystoreInspector BKS detected : ",pEvent.data.name);
                (pEvent.data as ModelFile).tags.push(pCtx.getTagManager().getTag("keystore.type.bks").getUUID());
            `,
            description: "Catch BouncyCastle Keystore (BKS) file when a new file is discovered",
            lang: "ts"
        },
    }
});

/*"data.file.new.knownExt": function(pEvent:BusEvent<any>):any{
           if(!checkForBKSext(pEvent.data)) return 1;

           const ctx = pEvent.getContext();

           ctx.LOG.info("[INSPECTOR][TASK] KeystoreInspector BKS detected : ",pEvent.data.name);
           // search strings occurences into the grah
           let resStaticStr:FinderResult = ctx.find.strings("value:/"+pEvent.data.name+"/");

           // var resDynStr = ctx.find.method("name:java.security.Keystore.load(<>,<>)");
           // si pas d'occurence
           if(resStaticStr.count()==0){
               //resStaticStr.show();
           }else{
               /*var dynRes = ctx.find.get.method("java.security.KeyStore.load(<java.io.InputStream><char>[])<void>");
               dynRes.filter("dyn.arg[0].value:"+event.data.name);
               if(resStaticStr.count()==0){
                   resStaticStr.show();
               }
               //console.log("Not found : ","value:"+pEvent.data.name);
           //}
       //}
       */



export  default KeystoreInspector;