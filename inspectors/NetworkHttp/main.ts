
// ===== INIT =====
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import ModelMethod from "../../src/ModelMethod.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelStringValue from "../../src/ModelStringValue.js";
import HookMessageV2 from "../../src/hook/HookMessageV2.js";
import {ContextLocation, ModelInstance} from "../../src/ModelInstance.js";
import {Nullable} from "../../src/core/IStringIndex.js";
import {INode} from "@dexcalibur/dexcalibur-orm";
import {RuntimeEvent} from "../../src/hook/RuntimeEvent.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var NetworkHttpInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    hookSet: {
        id: "NetworkHttp",
        name: "Network communications (HTTP)",
        description: "Find and observe HTTP(S) communication. Support : okHttp, cronet, ..",

        // must be updated at runtime
        hookShare: {

        },


        require: [],

        strategies: [
            {
                name: "OkHttp_Request_prepare",
                descr: "A new HTTP(s) request is building using OkHttp client, and will probably executed later.",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: `method("name:^url$").filter("enclosingClass.name:okhttp")`
                },
                autoEmit: true,
                emitEvent: "network.http.request.build",
                before: `  
                    if(arg0!=null){
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                sbom: "okhttp",
                                url: (arg0.toString!=null ? arg0.toString() : arg0) 
                            }
                        );
                    }else{
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                sbom: "okhttp",
                                url: ""
                            }
                        );
                    }
                `
            },{
                name: "OkHttp_Request_execute",
                descr: "A new HTTP(s) request is building using OkHttp client, and will probably executed later.",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: `method("name:^execute$").filter("enclosingClass.name:okhttp")`
                },
                autoEmit: true,
                emitEvent: "network.http.request.send",
                before: `  
                        let request:any = {};
                        let okcl = Java.use('okhttp3.Request');
                        let ohcl = Java.use('okhttp3.Headers');
                        let obcl = Java.use('okhttp3.RequestBody');
                        let oucl = Java.use('okhttp3.HttpUrl');
                        
                        if(this.request !=null){
                            const req = Java.cast(this.request(),okcl);
                            const headers = Java.cast(req.headers(),ohcl);
                            const body = Java.cast(req.body(),obcl);
                            const url = Java.cast(req.url(),oucl);
                            
                            request = {
                                url: url.redact(),
                                method: req.method(),
                                body: body.toString(),
                                headers: headers.toString(),
                                raw: req.toString()
                            }
                        }
                        
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                sbom: "okhttp",
                                request: request
                            }
                        );
                `
            }
        ]
    },

    eventListeners: {
        "network.http.request.build": function(ctx:DexcaliburProject,event:BusEvent<HookMessageV2>){
            if(event.data!=null){

                // TODO : process SBOM

                // process URI
                // todo : retrieve session ID, be careful with concurrent session
                let loc:Nullable<ContextLocation> = null;
                let node:Nullable<INode> = null;

                if((event as RuntimeEvent<any>).node.length > 0){
                    node = (event as RuntimeEvent<any>).node[0] as INode;
                    loc = {
                        __: node.__,
                        uid: node.getUID()
                        // add arguments position
                    };
                }

                const str = new ModelStringValue({
                    value: event.data.data.url,
                    instance: [
                        new ModelInstance({
                            session: "", //ctx.getHookManager().get
                            ctx: loc
                        })
                    ]
                });

                ctx.getAnalyzer().getData().strings.addEntry(str);
                ctx.bus.send( new BusEvent<ModelStringValue>({
                    type: "network.uri.string",
                    data: str
                }));

                // TODO : push okhttp request object instance (to track sessions)
                /*ctx.bus.send( new BusEvent<any>({
                    type: "network.uri.string",
                    data: str
                }));*/
            }
        }

    }
});


export default NetworkHttpInspector;