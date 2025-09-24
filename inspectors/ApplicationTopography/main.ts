import * as _path_ from "path";


import {IntentFilter} from "../../src/android/IntentFilter.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import Inspector, {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import ModelClass from "../../src/ModelClass.js";
import BusEvent from "../../src/BusEvent.js";
import * as Log from "../../src/Logger.js";
import {AndroidCodeAnalyzer} from "../../src/android/analyzer/AndroidCodeAnalyzer.js";
import AndroidAppAnalyzer from "../../src/android/AndroidAppAnalyzer.js";
import AndroidActivity from "../../src/android/AndroidActivity.js";
import {Finder} from "../../src/search/Finder.js";
import {FinderResult} from "../../src/search/FinderResult.js";
import ModelFile from "../../src/ModelFile.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====


const TAGS = Object.freeze({
    MAIN: "MAIN",
    BROWSABLE: "BROWSABLE",
    EXPOSED: "EXPOSED",
    BOOT_COMPLETED: "BOOT_COMPLETED",
    SMS: "SMS",
    PHONE: "PHONE"
});

const TAGS_SIGNATURE = {
    action: {
        "android.intent.action.MAIN": TAGS.MAIN,
        "android.provider.Telephony.SMS_RECEIVED": TAGS.SMS,
        "android.provider.Telephony.NEW_OUTGOING_SMS": TAGS.SMS,
        "android.intent.action.PHONE_STATE": TAGS.PHONE,
        "android.intent.action.BOOT_COMPLETED": TAGS.BOOT_COMPLETED
    },
    category: {
        "android.intent.category.BROWSABLE": TAGS.BROWSABLE,
    },
    attr: {
        "exported": { value: true, tag: TAGS.EXPOSED },

    }
}

function tagByIntent(context:DexcaliburProject, event:BusEvent<any>):void {
    const intents:IntentFilter[] = event.data.obj.getIntentFilters();
    intents.map(i => {
        i.getActions().map(a => {
            const t:any = TAGS_SIGNATURE.action[a.getName()];
            if (t != null) {
                event.data.obj.addTag(t);
            }
        });

        i.getCategories().map(a => {
            const t:any = TAGS_SIGNATURE.category[a.getName()];
            if (t != null) {
                event.data.obj.addTag(t);
            }
        });
    });
}


function tagByAttr(context:DexcaliburProject, pAttr:any, event:BusEvent<any>):void {

    let t:any;
    for (const i in pAttr) {
        t = TAGS_SIGNATURE.category[i];
        if (t != null) {
            if (pAttr[i] == t.value) {
                event.data.obj.addTag(t.tag);
            }
        }
    }
}


// === CONFIG
// @ts-ignore
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    version: "1.0.5",
    tags: [
        {
            name:"android.cmp",
            _tagsOptions:[
                { name:"browsable"},
                { name:"exported"}
            ]
        },{
            name:"android.intent.action",
            _tagsOptions:[
                { name:"browsable"},
                { name:"exported"},
                { name:"main"}
            ]
        },{
            name:"android.intent.ope",
            _tagsOptions:[
                { name:"receive"},
                { name:"send"}
            ]
        },{
            name:"topo.android",
            _tagsOptions:[
                { name:"ACTIVITY"},
                { name:"RECEIVER"},
                { name:"PROVIDER"},
                { name:"SERVICE"},
                { name:"PERM"},
            ]
        }
    ],

    hookSet: {
        id: "ApplicationTopography",
        name: "Application Topography",
        description: "[INTERNAL] Manifest parser and application explorer",
        strategies:[]
    },

    eventListeners: {
        "dxc.fullscan.post":  function ( pEvent:BusEvent<any>):any {

            // scan for exported component, intentable, ..
            const exported = pEvent.getContext().getTagManager().getTag("android.intent.action.exported");
            const receiveIntent = pEvent.getContext().getTagManager().getTag("android.intent.ope.receive");
            const intentable = pEvent.getContext().getTagManager().getTag("");

/*
            pEvent.getContext().merlin.activity("attr.exported:true")
                .execute(pEvent.getContext())
                .then((vResult:FinderResult)=>{
                    (vResult.getData() as AndroidActivity[]).map(x => {
                        x.addTag(exported)
                    })
                });*/


        },
        "app.receiver.new": function (pEvent:BusEvent<any>) {

            const pCtx = pEvent.getContext();
            const cls = AndroidAppAnalyzer.getClassByManifestUid(pCtx, pEvent.data.manifest, pEvent.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                pEvent.data.obj.setImplementedBy(cls);
                cls.addTag(pCtx.getTagManager().getTag("topo.android.RECEIVER"));
            }else{
                //Logger.error("[AppTopo][receiver] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : class not found");
                return true;
            }

            if(pEvent.getData().obj.attr.exported=="true"){
                cls.addTag(pCtx.getTagManager().getTag("topo.android.RECEIVER"));
            }
            // tag by intent filter
            tagByIntent(pCtx, pEvent);

            // tag by attributes
            tagByAttr(pCtx, pEvent.data.obj.getAttributes(), pEvent);
    
            // search dependencies to platform method and class
            /*
            if (AndroidCodeAnalyzer.searchInternalDependencies(pCtx, pEvent.data.obj)!=null) {
                Logger.info("[AppTopo][receiver] Internal dependencies mapped for : ", pEvent.data.obj.name);
            } else {
                Logger.error("[AppTopo][receiver] Fail to map internal dependencies mapped for : ", pEvent.data.obj.name);
            }*/
        },
        "app.provider.new": function (pEvent:BusEvent<any>) {

            const pCtx = pEvent.getContext();

            const cls = AndroidAppAnalyzer.getClassByManifestUid(pCtx, pEvent.data.manifest, pEvent.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                pEvent.data.obj.setImplementedBy(cls);
                cls.addTag(pCtx.getTagManager().getTag("topo.android.PROVIDER") );
            }else{
                //Logger.error("[AppTopo][provider] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : class not found");
                return true;
            }


            // tag by intent filter  
            tagByIntent(pCtx, pEvent);

            // tag by attributes
            tagByAttr(pCtx, pEvent.data.obj.getAttributes(), pEvent);
    
            // search dependencies to platform method and class
            /*
            if (AndroidCodeAnalyzer.searchInternalDependencies(pCtx, pEvent.data.obj)!=null) {
                Logger.info("[AppTopo][provider] Internal dependencies mapped for : ", pEvent.data.obj.name);
            } else {
                Logger.error("[AppTopo][provider] Fail to map internal dependencies mapped for : ", pEvent.data.obj.name);
            }*/
        },
        "app.service.new": function (pEvent) {


            const pCtx = pEvent.getContext();
            const cls = AndroidAppAnalyzer.getClassByManifestUid(pCtx, pEvent.data.manifest, pEvent.data.obj.name);

            if ((cls != null) && (cls instanceof ModelClass)) {
                pEvent.data.obj.setImplementedBy(cls);
                cls.addTag(pCtx.getTagManager().getTag("topo.android.SERVICE") );
            }else{
                //Logger.error("[AppTopo][service] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : class not found");
                return true;
            }


            // tag by intent filter
            tagByIntent(pCtx, pEvent);

            // tag by attributes
            tagByAttr(pCtx, pEvent.data.obj.getAttributes(), pEvent);

            // search dependencies to platform method and class
            /*
            if (AndroidCodeAnalyzer.searchInternalDependencies(pCtx, pEvent.data.obj)!=null) {
                Logger.info("[AppTopo][service] Internal dependencies mapped for : ", pEvent.data.obj.name);
            } else {
                Logger.error("[AppTopo][service] Fail to map internal dependencies mapped for : ", pEvent.data.obj.name);
            }*/
        },
        "data.file.parsed": function(pEvent:BusEvent<any>):any{
            (async ()=>{
                const ctx = pEvent.getContext();
                const tm = ctx.getTagManager();


                // skip if target platform is not android
                if(!ctx.getPlatform().isAndroid())  return;

                const parserEvent = pEvent.getData();
                const file = pEvent.getData().file;
                const dir = _path_.dirname(parserEvent.file.getRealPath());


                if(dir.split(_path_.sep).pop()!='unknown') return;

                if((parserEvent.format === ".properties")
                    || (parserEvent.parser != null && parserEvent.parser.FORMAT_NAMES?.indexOf("properties")>-1)) {

                    if(file.data != null && file.data.ok!=null){

                        if(file.data.ok["client"]!=null && file.data.ok["version"]!=null){
                            // save
                            ctx.trigger({
                                type:"sca.detect.java.library",
                                data: {
                                    libraryName: file.data.ok["client"].value,
                                    libraryVersion: file.data.ok["version"].value,
                                    proof: {
                                        file: file.getUID(),
                                        path: file.getRelativePath(),
                                        type: "properties files"
                                    }
                                }
                            });
                        }
                    }
                }

                // ModelPackage detected


            })();

        }
    },
    eventListenerSources: {

        "app.package.new": {
            lang: 'ts',
            source: `
            // <ts>={
            
            const ctx:any = pEvent.getContext();
            const tm = ctx.getTagManager();
            
            const evt = pEvent.getData();

             if(evt.sbomType=="swift.bundle" || (tm.getTag("swift.bundle")).match(evt.pkg as ModelPackage)){
                  console.log(parserEvent);
                    ctx.trigger({
                        type:"sca.sbom.new",
                        data: {
                            libraryName: file.data.ok["client"].value,
                            libraryVersion: file.data.ok["version"].value,
                            proof: {
                                file: file.getUID(),
                                path: file.getRelativePath(),
                                type: "Swift bundle folder"
                            }
                        }
                    });
                    return;
                }
                if(evt.sbomType=="objc.bundle" || (tm.getTag("objc.bundle")).match(evt.pkg as ModelPackage)){
                    console.log(parserEvent);
                    ctx.trigger({
                        type:"sca.sbom.new",
                        data: {
                            libraryName: pkg.name,
                            libraryVersion: "",
                            proof: {
                                file: "", // file.getUID(),
                                path: "", //file.getRelativePath(),
                                type: "ObjC bundle folder"
                            }
                        }
                    });
                    return;
                }
                if(evt.sbomType=="ai.coreml" || (tm.getTag("ai.coreml")).match(evt.pkg as ModelPackage)){
                     console.log(evt);
                    ctx.trigger({
                        type:"sca.sbom.new",
                        data: {
                            libraryName: file.data.ok["client"].value,
                            libraryVersion: file.data.ok["version"].value,
                            proof: {
                                file: file.getUID(),
                                path: file.getRelativePath(),
                                type: "AI CoreML model"
                            }
                        }
                    });
                    return;
                }
            `
        },
        "app.activity.new": {
            lang: 'ts',
            source:`
            // <ts>={

            const pCtx:any = pEvent.getContext();

            function isRelativeName(pName){
                return pName[0]=='.';
            }

            function getClassByManifestUid( pContext:DexcaliburProject, pManifest:AndroidManifest, pClassName:string):ModelClass{
                let clsUID:string;
                if(isRelativeName(pClassName)){
                    clsUID = pManifest.attributes.package+pClassName;
                }else{
                    clsUID = pClassName;
                }
                
                return pContext.find.get.class(clsUID);
            }

            // to retrieve class implementign this activity
            let cmp:AndroidActivity = pEvent.getData().obj;
            
            if(cmp.attr.exported!=null && cmp.attr.exported==='true'){
                cmp.addTag(pCtx.getTagManager().getTag("android.cmp.exported"))                
            }
            
            
            if(cmp.intentFilters.length>0){
                cmp.addTag(pCtx.getTagManager().getTag("android.intent.ope.receive"));
                cmp.intentFilters.map(x => {
                    x.action.map( y => {
                        switch (y.name){
                            case "android.intent.action.MAIN":
                                cmp.addTag(pCtx.getTagManager().getTag("android.intent.action.main"))        
                                break;
                        }
                    });
                
                    x.category.map( y =>{
                         switch (y.name){
                            case "android.intent.category.BROWSABLE":
                                cmp.addTag(pCtx.getTagManager().getTag("android.cmp.browsable"))        
                                break;
                        }
                    })
                    
                
                });          
            }
            
            // tag by intent filter  
            //tagByIntent(pCtx, pEvent);

            // tag by attributes
            //tagByAttr(pCtx, acmpct.getAttributes(), pEvent);
            
            // search impl
            const cls = getClassByManifestUid(pCtx, pEvent.data.manifest, pEvent.data.obj.name);
            
            if ((cls != null) && (cls instanceof ModelClass)) {
                pEvent.data.obj.setImplementedBy(cls);
                cls.addTag( pCtx.getTagManager().getTag("topo.android.ACTIVITY"));
            }else{
                // pCtx.LOG.error("[AppTopo][activity] Fail to map internal dependencies mapped for ["+ pEvent.data.obj.name+"] : class not found");
                return true;
            }



            // search dependencies to platform method and class
            /*
            if (AndroidCodeAnalyzer.searchInternalDependencies(pCtx, pEvent.data.obj)!=null) {
                pCtx.LOG.log("[AppTopo][activity] Internal dependencies mapped for : ", pEvent.data.obj.name);
            } else {
                pCtx.LOG.error("[AppTopo][activity] Fail to map internal dependencies mapped for : ", pEvent.data.obj.name);
            }*/
            `
        }
    }
});



/*
AppTopoInspector.on("manifest.application.new", {
    task: function(ctx, event){
        Logger.info("[INSPECTOR][TASK] DynLoaderInspector new Dex file loaded ",event.data.path);
    }
});

AppTopoInspector.on("manifest.intentFilter.new", {
    task: function(ctx, event){

        Logger.info("[INSPECTOR][TASK] ApplicationTopography : declare intent filer");


        
    }
});
*/
