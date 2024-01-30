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

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    tags: {
        "string.pattern": ["URI", "IP"]
    },

    hookSet: {
        id: "DataClassifier",
        name: "Data classifier",
        description: "Process heuristic analysis and perform data tagging (byte array, strings, ...)",
        strategies:[]
    },

    eventListeners: {
        "disass.datablock.new": function(ctx:DexcaliburProject, event:BusEvent<any>):void{
            if(event.data!=null){
                const tmgr = ctx.getTagManager();
                let l = event.data.count()*event.data.width;
                let tagUIDs = [];
                if(TAGS.hash[l] != null) tagUIDs=tagUIDs.concat(TAGS.hash[l]);
                if(TAGS.asym_key[l] != null) tagUIDs=tagUIDs.concat(TAGS.asym_key[l]);
                if(TAGS.sym_key[l] != null) tagUIDs=tagUIDs.concat(TAGS.sym_key[l]);
                if(isASCII(event.data)) tagUIDs.push("data.charset.ascii");

                tagUIDs.map( x => {
                    event.data.addTag( tmgr.getTag(x));
                })
                //console.log(l,event.data.tags);
            }
        },
        "string.new": function(ctx:DexcaliburProject,event:BusEvent<ModelStringValue>):void{
            const tag_URI = ctx.getTagManager().getTag("string.pattern.URI");
            const pattern:RegExp = new RegExp("([^:/]*)://([^/]*)");

            if(event.data!=null && pattern.exec(event.data.value)){
                if(!event.data.hasTag(tag_URI)){
                    event.data.addTag(tag_URI);
                }
            }
        },
        "dxc.fullscan.post": function(ctx:DexcaliburProject,event:BusEvent<any>):void{

            const tag_URI = ctx.getTagManager().getTag("string.pattern.URI");
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
        "string.instance.new": function(ctx:DexcaliburProject,event:BusEvent<ModelStringValue>){
            if(event.data!=null){
                if(URI_REGEXP.test(event.data.value)){
                    event.data.addTag(ctx.getTagManager().getTag("string.pattern.URI"));
                    ctx.bus.send(new BusEvent<ModelStringValue>({
                        type: "network.uri.string",
                        data: event.data
                    }));
                }
            }
        }
    }
});

export default DataClassifierInspector;