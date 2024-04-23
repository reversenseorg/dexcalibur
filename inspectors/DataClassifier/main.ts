import * as _url_ from 'url';
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelStringValue from "../../src/ModelStringValue.js";
import ModelDataBlock from "../../src/ModelDataBlock.js";

const URI_REGEXP = new RegExp("([^:/]*)://([^/]*)");

const TAGS = {
    hash: {
        128: ["data.hash.md5"],
        256: ["data.hash.sha1","data.hash.sha256"],
        512: ["data.hash.sha512"]
    },
    asym_key: {
        1024: ["data.len.key-1024"],
        2048: ["data.len.key-2048"],
        4096: ["data.len.key-4096"],
    },
    sym_key: {
        128: ["data.len.key-128"],
        256: ["data.len.key-256"],
        196: ["data.len.key-196"]
    }
};

function isASCII(buffer){
    let c = buffer.count();
    for(let i=0; i<c; i++){
        // && buffer.read(i) > 0x00
        if(buffer.read(i) > 0x7f || (buffer.read(i) < 0x1f)) return false;
    }
    return true;
}


// ===== INIT =====

var DataClassifierInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_DEV_SCAN,

    version: "1.0.0",
    tags: [
        {
            name:"string.pattern",
            _tagsOptions:[
                { name:"uri"},
                { name:"ip"}
            ]
        },
        {
            name:"data.uri",
            _tagsOptions:[
                { name:"path"},
                { name:"host"},
                { name:"scheme"},
                { name:"query"}
            ]
        }
    ],

    hookSet: {
        id: "DataClassifier",
        name: "Data classifier",
        description: "Process heuristic analysis and perform data tagging (byte array, strings, ...)",
        strategies:[]
    },

    eventListeners: {
        "disass.datablock.new": function( pEvent:BusEvent<any>):void{
            if(pEvent.data!=null){
                const ctx = pEvent.getContext();
                const tmgr = ctx.getTagManager();
                let l = pEvent.data.count()*pEvent.data.width;
                let tagUIDs = [];
                if(TAGS.hash[l] != null) tagUIDs=tagUIDs.concat(TAGS.hash[l]);
                if(TAGS.asym_key[l] != null) tagUIDs=tagUIDs.concat(TAGS.asym_key[l]);
                if(TAGS.sym_key[l] != null) tagUIDs=tagUIDs.concat(TAGS.sym_key[l]);
                if(isASCII(pEvent.data)) tagUIDs.push("data.charset.ascii");

                tagUIDs.map( x => {
                    pEvent.data.addTag( tmgr.getTag(x));
                })
                //console.log(l,event.data.tags);
            }
        },
        "model.string.new": function(pEvent:BusEvent<ModelStringValue>):void{
            const ctx = pEvent.getContext();
            const tag_URI = ctx.getTagManager().getTag("string.pattern.uri");
            const pattern:RegExp = new RegExp("([^:/]*)://([^/]*)");

            if(pEvent.data!=null && pattern.exec(pEvent.data.value)){
                if(!pEvent.data.hasTag(tag_URI)){
                    pEvent.data.addTag(tag_URI);
                }
            }
        },
        "dxc.fullscan.post": function(pEvent:BusEvent<any>):void{

            const ctx = pEvent.getContext();
            const tag_URI = ctx.getTagManager().getTag("string.pattern.uri");
            let pattern:RegExp = new RegExp("([^:/]*)://([^/]*)");
    
            // tag static strings containing URI
            /*ctx.find.nocase().strings("value:^([^:/]*)://([^/]*)")
                .foreach((pOffset:number,pData:ModelStringValue)=>{
                    if(!pData.hasTag(tag_URI)){
                        pData.addTag(tag_URI);
                    }
                });*/
    
            // tag static byte array containing URI
            ctx.find.nocase().array('name:/.*/')
                .foreach((pOffset:number,pData:ModelDataBlock)=>{
                    if(pattern.exec(pData.values.join(''))){
                        if(!pData.hasTag(tag_URI)){
                            pData.addTag(tag_URI);
                        }
                    }
                });
        },
        "string.instance.new": function(pEvent:BusEvent<ModelStringValue>){
            const ctx = pEvent.getContext();
            if(pEvent.data!=null){
                if(URI_REGEXP.test(pEvent.data.value)){
                    pEvent.data.addTag(ctx.getTagManager().getTag("string.pattern.uri"));
                    ctx.bus.send(new BusEvent<ModelStringValue>({
                        type: "network.uri.string",
                        data: pEvent.data
                    }));
                }
            }
        }
    }
});

export default DataClassifierInspector;