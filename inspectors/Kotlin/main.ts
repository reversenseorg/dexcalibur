


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


// ===== INIT =====
import * as _fs_ from "fs"
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelFile from "../../src/ModelFile.js";

import Util from "../../src/Utils.js";
import ModelClass from "../../src/ModelClass.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var KotlinInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.2",
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
                { name:"debug" },
                { name:"class" }
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
       /* "dxc.fullscan.post": function(pEvent:BusEvent<any>):any{
            Logger.info("[INSPECTOR][TASK] Kotlin : search config files ");

            const ctx = pEvent.getContext();
            const tm = ctx.getTagManager();
            const ktTags = {
                config: tm.getTag("kotlin.config"),
                debug: tm.getTag("kotlin.debug"),
                cls: tm.getTag("kotlin.class"),
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

            (async ()=>{

                const clzzReq = await ctx.merlin.class("source:/\.kt$/");
                const result = await clzzReq.execute(ctx);
                if(result.count()>0){

                    const tag = ctx.getTagManager().getTag("sca.lang.kotlin");

                    // tag class
                    Util.mapInGroups(
                        result.list(),
                        async (vClz:ModelClass)=>{

                            // add tag
                            vClz.addTag(tag);

                            // save
                            ctx.trigger({
                                type:"model.class.update",
                                data: {
                                    node: vClz
                                }
                            });

                        }, 10);

                    // emit event to notify others insoectors
                    ctx.trigger({
                        type: "lang.kotlin",
                        data: {
                            matches: result.count(),
                            pattern: clzzReq,
                        }
                    })
                }
            })();

        }*/
    },

    eventListenerSources: {
        "dxc.fullscan.post": {
            lang: "ts",
            source: `
                //import "@reversense/"
                //<js>
                (async ()=>{
                    const ctx = pEvent.getContext();
                    const tm = ctx.getTagManager();
                    const ktTags = {
                        config: tm.getTag("kotlin.config"),
                        debug: tm.getTag("kotlin.debug"),
                        cls: tm.getTag("kotlin.class")
                    };
                    
                    const clzzReq = await ctx.merlin.class("source:/\\.kt$/");
                    const result = await clzzReq.execute(ctx);
                    if(result.count()>0){
    
                        const tag = tm.getTag("sca.lang.kotlin");
    
                        // tag class
                        ctx.getUtils().mapInGroups(
                            result.list(),
                            async (vClz:ModelClass)=>{
    
                                // add tag
                                vClz.addTag(tag);
    
                                // save
                                ctx.trigger({   
                                    type:"model.class.update",
                                    data: {
                                        node: vClz
                                    }
                                });
    
                            }, 10);
    
                        // emit event to notify others insoectors
                        ctx.trigger({
                            type: "lang.kotlin",
                            data: {
                                matches: result.count(),
                                pattern: clzzReq,
                            }
                        });
                    }
                })();
                
            `
        }
    }
});


export default KotlinInspector;