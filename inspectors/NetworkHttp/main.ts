
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
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import ModelMethod from "../../src/ModelMethod.js";

var NetworkHttpInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.24",
    tags: [{
        name: "network.data",
        _tagsOptions: [
            {name:"pathName", label:"pathName from Retrofit detection"}]
    }],
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
                name: "OkHttp_Request_Builder",
                descr: "OkHttp Request builder is the predecessor of any HTTP request made by this lib",
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
            }, {
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
            },
            {
                name: "Retrofit_Response",
                descr: "A Retrofit Response is forged from the Okhttp3 Response.",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: `method("enclosingClass.name:/^com.squareup.retrofit2.Response$/").filter("name:<init>")`
                },
                autoEmit: true,
                emitEvent: "network.http.response.receive",
                after: `
                    //<ts>={
                    if(ret != null){
                        var eventData : Record<string, any> = {};
                        eventData["code"] = ret.code();
                        eventData["message"] = ret.message();
                        eventData["headers"] = ret.headers().toString() ;
                        eventData["isSuccessful"] = ret.isSuccessful();
                        eventData["body"] = (ret.body() || '').toString();
                        eventData["errorBody"] = (ret.errorBody() || '').toString();
                        // eventData["rawResponse"] = ret.toString();
                        
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            eventData
                        );
                    }
                `
            },
            {
                name: "Retrofit_requireNonNull_rawResponse",
                descr: "Hook java.utils.Object requireNonNull to check the message argument",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: `method("enclosingClass.name:/^java.utils.Object$/").filter("name:requireNonNull")`
                },
                autoEmit: true,
                emitEvent: "hook.retrofit.requireNonNull.rawResponse",
                before: `
                    //<ts>={
                    if ((arguments.length === 2) && (arguments[1] === "rawResponse == null")) {
                        var eventData : Record<string, any> = {};
                        eventData['message'] = 'This requireNonNull may come from RetroFit Response';
                        // TODO cast rawResponse into okhttp.Response
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            eventData
                        );
                    }
                `
            }
        ]
    },

    // eventListeners: {
    //     "network.http.request.build": function(pEvent:BusEvent<HookMessageV2>){
    //         if(pEvent.data!=null){
    //
    //             // TODO : process SBOM
    //
    //             // process URI
    //             // todo : retrieve session ID, be careful with concurrent session
    //             let loc:Nullable<ContextLocation> = null;
    //             let node:Nullable<INode> = null;
    //             let ctx = pEvent.getContext();
    //
    //             if((pEvent as RuntimeEvent<any>).node.length > 0){
    //                 node = (pEvent as RuntimeEvent<any>).node[0] as INode;
    //                 loc = {
    //                     __: node.__,
    //                     uid: node.getUID()
    //                     // add arguments position
    //                 };
    //             }
    //
    //             const str = pEvent.getContext().modelAPI.newStringValue({
    //                 value: pEvent.data.data.url,
    //                 instance: [
    //                     pEvent.getContext().modelAPI.newInstance({
    //                         session: "", //ctx.getHookManager().get
    //                         ctx: loc
    //                     })
    //                 ]
    //             });
    //
    //             ctx.getAnalyzer().getData().strings.addEntry(str);
    //             ctx.trigger({
    //                 type: "network.uri.string",
    //                 data: str
    //             });
    //
    //             // TODO : push okhttp request object instance (to track sessions)
    //             /*ctx.bus.send( new BusEvent<any>({
    //                 type: "network.uri.string",
    //                 data: str
    //             }));*/
    //         }
    //     }
    // },
    eventListenerSources: {
        "hook.javaRegexMatcher.matches": {
            lang: "ts",
            source: `
            //<ts>={
            const PARAM_URL_REGEX = "[a-zA-Z][a-zA-Z0-9_-]*";
            let ctx: Record<string,any> = pEvent.getContext();
            if ((pEvent.getData().data?.regex != null) && (pEvent.getData().data.regex === PARAM_URL_REGEX)) {
                console.log("[INSPECTOR][NETWORKHTTP] Regex match the one use in Retrofit.requestFactory.validatePathName");
                let eventData: Record<string, any> = {};
                eventData['regex'] = pEvent.getData().data.regex;
                eventData['stringTested'] = pEvent.getData().data.text.toString();
                eventData['possibleStringLabel'] = "pathName";
                console.log(eventData['possibleStringLabel'] + ':', eventData['stringTested']);
                var networkPathTag = ctx.getTagManager().getTag('network.data.pathName');
                
                finderResult = ctx.find.strings("value:" + eventData['stringTested']);
                if (finderResult.count() > 1) {
                    finderResult.foreach(
                    (pOffset:number,pData:ModelStringValue) => {
                        if(!pData.hasTag(networkPathTag)){
                            pData.addTag(networkPathTag);
                        }
                    });
                } else {
                    let newStringValue = eventData['stringTested']
                    let newStringLoc = null;
                    const str = pEvent.getContext().modelAPI.newStringValue({
                        value: newStringValue,
                        instance: [
                           pEvent.getContext().modelAPI.newInstance({
                                session: "", //ctx.getHookManager().get
                                ctx: newStringLoc
                            })
                        ]
                    });
                    str.addTag(networkPathTag);
                    pEvent.getContext().getAnalyzer().getData().strings.addEntry(str);
                    pEvent.getContext().trigger( {
                        type: "string.instance.new",
                        data: str
                    });
                }
                
                pEvent.getContext().trigger( {
                    type: "hypothesis.retrofit.requestFactory.validatePathName",
                    data: eventData
                });
            }
                
                pEvent.getContext().trigger( {
                    type: "hypothesis.retrofit.requestFactory.validatePathName",
                    data: eventData
                });
            }
            `
        },
        "hook.javaRegexMatcher.find": {
            lang: "ts",
            source: `
            //<ts>={
            const PARAM_URL_REGEX = "\\{([a-zA-Z][a-zA-Z0-9_-]*)\\}";
            let ctx: Record<string,any> = pEvent.getContext();
            if (pEvent.getData().data?.regex === PARAM_URL_REGEX) {
                console.log("[INSPECTOR][NETWORKHTTP] Regex match the one use in Retrofit." +
                 "requestFactory.parsePathParameters(path) or parseHttpMethodAndPath (queryParams)");
                let eventData: Record<string, any> = {};
                eventData['regex'] = pEvent.getData().data.regex;
                eventData['stringTested'] = pEvent.getData().data.text.toString();
                eventData['possibleStringLabel'] = "path, queryParams";
                console.log(eventData['possibleStringLabel'] + ':', eventData['stringTested']);
                var networkPathTag = ctx.getTagManager().getTag('network.data.pathName');
                
                finderResult = ctx.find.strings("value:" + eventData['stringTested']);
                if (finderResult.count() > 1) {
                    finderResult.foreach(
                    (pOffset:number,pData:ModelStringValue) => {
                        if(!pData.hasTag(networkPathTag)){
                            pData.addTag(networkPathTag);
                        }
                    });
                } else {
                    let newStringValue = eventData['stringTested']
                    let newStringLoc = null;
                    const str = pEvent.getContext().modelAPI.newStringValue({
                        value: newStringValue,
                        instance: [
                           pEvent.getContext().modelAPI.newInstance({
                                session: "", //ctx.getHookManager().get
                                ctx: newStringLoc
                            })
                        ]
                    });
                    str.addTag(networkPathTag);
                    pEvent.getContext().getAnalyzer().getData().strings.addEntry(str);
                    pEvent.getContext().trigger( {
                        type: "string.instance.new",
                        data: str
                    });
                }
                
                pEvent.getContext().trigger( {
                    type: "hypothesis.retrofit.requestFactory.parsePathParameters",
                    data: eventData
                });
            }
            `
        },
        "hook.javaUtilsObject.requireNonNull": {
            lang: "ts",
            source: `
                //<ts>={
                if (pEvent.getData().data?.arg1_message != null) {
                    const MESSAGE_RAW_RESPONSE = "rawResponse == null";
                    const MESSAGE_BASE_URL = "baseUrl == null";
                    // [INSPECTOR][NETWORKHTTP] baseUrl : <instance: java.lang.Object, $className: java.lang.String>
                    // [INSPECTOR][NETWORKHTTP] rawResponse : <instance: java.lang.Object, $className: okhttp3.Response>    
                    if (pEvent.getData().data?.arg1_message === MESSAGE_RAW_RESPONSE) {
                        console.log("[INSPECTOR][NETWORKHTTP] JavaUtilsObject requireNonNull on " +
                         + "rawResponse" + ", similar to those used in Retrofit.Response");
                        let eventData: Record<string, any> = {};
                        eventData['requireNonNullMessage'] = pEvent.getData().data.arg1_message;
                        eventData['rawResponse'] = pEvent.getData().data.arg0_obj.toString() ; //okhttp3.Response
                        console.log("[INSPECTOR][NETWORKHTTP] rawResponse :", eventData['rawResponse'].toString());
                    }
                    if (pEvent.getData().data?.arg1_message === MESSAGE_BASE_URL) {
                        console.log("[INSPECTOR][NETWORKHTTP] JavaUtilsObject requireNonNull on " +
                            "baseUrl" + ", similar to those used in Retrofit.Response");
                        let eventData: Record<string, any> = {};
                        let arg0_obj = pEvent.getData().data.arg0_obj;
                        if (typeof arg0_obj === 'string') {
                            eventData['baseUrl'] = arg0_obj.value ? arg0_obj.value : arg0_obj.toString();
                        }
                        else if (DXC.utils.isInstanceOf(arg0_obj, 'java.net.URL')) {
                            eventData['baseUrl'] = arg0_obj.value ? arg0_obj.value.toString() : arg0_obj.toString();
                        }
                        else { // Okhttp3.HttpUrl
                            eventData['baseUrl'] = arg0_obj.value ? arg0_obj.value.toString() : arg0_obj.toString();
                            console.log("[INSPECTOR][NETWORKHTTP] Probably Okhttp3.HttpUrl", arg0_obj.toString());
                            console.log("[INSPECTOR][NETWORKHTTP] value ", arg0_obj.value?.toString());

                        }
                        eventData['requireNonNullMessage'] = pEvent.getData().data.arg1_message;
                        console.log("[INSPECTOR][NETWORKHTTP] baseUrl :", eventData['baseUrl']);
                    }
                }
                
                `
            }
    }
});


export default NetworkHttpInspector;
