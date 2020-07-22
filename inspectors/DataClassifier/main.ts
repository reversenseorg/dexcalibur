import InspectorFactory from "../../src/InspectorFactory";
import {INSPECTOR_TYPE} from "../../src/Inspector";
import DexcaliburProject from "../../src/DexcaliburProject";
import Event from "../../src/Event";


const TAGS = {
    hash: {
        128: ["md5"], 
        256: ["sha1","sha256"],
        512: ["sha512"]
    },
    asym_key: {
        1024: ["rsa-1024"], 
        2048: ["rsa-2048"],
        4096: ["rsa-4096"],
    },
    sym_key: {
        128: ["key-128"], 
        256: ["key-256"],
        196: ["key-196"]
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
        description: "Process heuristic analysis and perform data tagging (byte array, strings, ...)"
    },

    eventListeners: {
        "disass.datablock.new": function(ctx:DexcaliburProject, event:Event):void{
            if(event.data!=null){
                let l = event.data.count()*event.data.width;
                if(TAGS.hash[l] != null) event.data.tags=event.data.tags.concat(TAGS.hash[l]);
                if(TAGS.asym_key[l] != null) event.data.tags=event.data.tags.concat(TAGS.asym_key[l]);
                if(TAGS.sym_key[l] != null) event.data.tags=event.data.tags.concat(TAGS.sym_key[l]);
                if(isASCII(event.data)) event.data.tags=event.data.tags.concat(["ascii"]);
                //console.log(l,event.data.tags);
            }
        },
        "dxc.fullscan.post": function(ctx:DexcaliburProject,event:Event):void{
    
            let pattern:RegExp = new RegExp("([^:/]*)://([^/]*)");
    
            // tag static strings containing URI
            ctx.find.nocase().string("value:^([^:/]*)://([^/]*)")
                .foreach(function(pOffset,pData){
                    pData.addTag("URI");
                    console.log(pData);
                });
    
            // tag static byte array containing URI
            ctx.find.nocase().array('name:.*')
                .foreach(function(pOffset,pData){
                    if(pattern.exec(pData.values.join(''))){
                        pData.addTag("URI");
                        console.log(pData.values.join(''));
                    }
                });
        },
        /*"hook.cmp.array": function(ctx,event){
            console.log("New data intercepted", event);
        }*/
    }
});

export default  DataClassifierInspector;