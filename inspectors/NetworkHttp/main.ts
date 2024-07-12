
// ===== INIT =====
import InspectorFactory, {FlattenTagCategoryOptions} from "../../src/InspectorFactory.js";
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

    version: "1.0.17",
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
            if ((pEvent.getData().data?.regex != null) && (pEvent.getData().data.regex === PARAM_URL_REGEX)) {
                console.log("[INSPECTOR][NETWORKHTTP] Regex match the one use in Retrofit.requestFactory.parsePathParameters(path) or parseHttpMethodAndPath (queryParams)");
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
        }
    }
});


export default NetworkHttpInspector;
