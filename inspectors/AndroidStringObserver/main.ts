import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelStringValue from "../../src/ModelStringValue.js";
import ModelDataBlock from "../../src/ModelDataBlock.js";
import ModelMethod from "../../src/ModelMethod.js";



// ===== INIT =====

var AndroidStringObserverInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",

    tags: [],

    hookSet: {
        id: "AndroidStringObserver",
        name: "Observe strings objects at runtime",
        description: "Gather and classify strings. The purpose of this inspector is to improve analysis coverage",

        strategies: [
            {
                name: "StringBuilder_toString",
                descr: "A new HTTP(s) request is building using OkHttp client, and will probably executed later.",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid:  [
                        "java.lang.StringBuilder.toString()<java.lang.String>"
                    ]
                },
                autoEmit: true,
                emitEvent: "string.instance.raw",
                after: `  
                    if(ret!=null){
                        const trace = DXC.java.getStackTrace();
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                str: ret,
                                __trace__:[trace[(trace.length>2 ? 1 : 0)]]
                            }
                        );
                    }
                `
            }
        ]
    },



    eventListenerSources: {
        "string.instance.raw": {
            lang: "js",
            source: `
                // <js>
                if(pEvent.getData().data !=null){
                    // todo : retrieve session ID, be careful with concurrent session
                    let loc = null;
                    let node = null;
                    if(pEvent.node.length > 0){
                        node = pEvent.node[0];
                        loc = {
                            __: node.__,
                            uid: node.getUID()
                        };
                    }
    
                    console.log("STRING INSTANCE : ",pEvent.data.data.str)
    
                    const str = pEvent.getContext().modelAPI.newStringValue({
                        value: pEvent.data.data.str,
                        instance: [
                           pEvent.getContext().modelAPI.newInstance({
                                session: "", //ctx.getHookManager().get
                                ctx: loc
                            })
                        ]
                    });
    
    
                    pEvent.getContext().getAnalyzer().getData().strings.addEntry(str);
                    
                    pEvent.getContext().trigger( {
                        type: "string.instance.new",
                        data: str
                    });
                }
            `
    }

            /*function(ctx:DexcaliburProject, event:BusEvent<HookMessageV2>):void{
            if(event.data.data !=null){
                // todo : retrieve session ID, be careful with concurrent session
                let loc:Nullable<ContextLocation> = null;
                let node:Nullable<INode> = null;
                if((event as RuntimeEvent<any>).node.length > 0){
                    node = (event as RuntimeEvent<any>).node[0] as INode;
                    loc = {
                        __: node.__,
                        uid: node.getUID()
                    };
                }

                console.log("STRING INSTANCE : ",event.data.data.str)

                const str = new ModelStringValue({
                    value: event.data.data.str,
                    instance: [
                        new ModelInstance({
                            session: "", //ctx.getHookManager().get
                            ctx: loc
                        })
                    ]
                });


                ctx.getAnalyzer().getData().strings.addEntry(str);
                ctx.bus.send( new BusEvent<ModelStringValue>({
                    type: "string.instance.new",
                    data: str
                }));
            }

        }*/
    }
});

export default  AndroidStringObserverInspector;