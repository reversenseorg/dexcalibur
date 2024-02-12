


// ===== INIT =====
import * as _fs_ from "fs"
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelFile from "../../src/ModelFile.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var KotlinInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    db: {
        dbms: 'inmemory',
        type: 'collection',
        name: 'kotlin'
    },

    tags: [
        {
            name:"kotlin",
            _tagsOptions:[
                { name:"config" },
                { name:"debugInfo" }
            ]
        }
    ],

    hookSet: {
        id: "Kotlin",
        name: "Kotlin",
        description: "Detect Kotlin, parse files, ... ",

        // must be updated at runtime
        hookShare: {
            /*
            fake: {
                imei: "222222222222222222222",
                operator: "xxxxx",
                deviceId: "a73839ef1O"
            }*/
        },


        require: [],

        strategies: [
            /*
            {
                name: "read_DeviceID",
                descr: "To detect read of device ID",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: "android.telephony.TelephonyManager.getDeviceId()<java.lang.String>"
                },
                autoEmit: true,
                emitEvent: "fingerprint.device.getId",
                replace: `  
            
                        ret = "fakeID";
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                name: "fakeID"
                            }
                        );
                `
            }
            */
        ]
    },

    eventListeners: {
        "dxc.fullscan.post": function(ctx:DexcaliburProject,event:BusEvent<any>):any{
            Logger.info("[INSPECTOR][TASK] Kotlin : search config files ");

            const tm = ctx.getTagManager();
            const ktTags = {
                config: tm.getTag("kotlin.config"),
                debug: tm.getTag("kotlin.debug"),
            };

            (async ()=>{
                const files = await ctx.getSearchEngine().file("name:kotlin");
                files.foreach((vI, vFile)=>{
                    const file = vFile as ModelFile;

                    try{
                        if(file.name.endsWith(".json")){
                            file.addTag(ktTags.config);
                            if(_fs_.existsSync(file.getPath())){
                                _fs_.readFile(file.getPath(),(vErr, vData)=>{
                                    if(!vErr){
                                        //ctx.add
                                        // JSON.parse(vData.toString())
                                    }
                                })
                            }

                            //ctx.getAnalyzer().addDependency()
                        }
                        else if(file.name==="DebugProbesKt.bin"){
                            file.addTag(ktTags.debug);

                        }
                    }catch(err){

                    }
                });
            })();


        }
    }
});


export default KotlinInspector;