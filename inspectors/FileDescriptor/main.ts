

// ===== INIT =====

import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import BusEvent from "../../src/BusEvent.js";
import ModelMethod from "../../src/ModelMethod.js";

var FileDescriptorInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    useGUI: true,

    version: "1.0.0",
    hookSet: {
        id: "FileDescriptor",
        name: "file descriptor inspector",
        description: "Track file descriptors into Java",
        hookShare: {
            fd: [],
            stream: [],
            refs: {}
        },
        require: ["Reflect","Common"],
        strategies: [
            {
                name: "File_new_2",
                descr: "To detect new File instance (2)",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: [
                        "java.io.File.<init>(<java.io.File><java.lang.String>)<void>",
                        "java.io.File.<init>(<java.lang.String><java.lang.String>)<void>",
                    ]
                },

                /*onMatch: function(ctx:DexcaliburProject,event:Event):void{
                    ctx.getInspector("FileDescriptor").emits("hook.file.new",event);
                },
                preprocessor: ` 
                    pCtx.getInspector("FileDescriptor").emits("hook.file.new", pEvent.data);
                `,*/
                autoEmit: true,
                emitEvent: "hook.file.new",
                before: `
                
                    let msg:any ={ arg0:"<null>", arg1:"<null>" }; 
            
                    if(arg0!=null){ 
                        if(DXC.util.isInstanceOf(arg0, "java.io.File")){
                            msg.arg0 = (arg0 as any).getAbsolutePath();
                        }
                        else if(DXC.util.isInstanceOf(arg0, "java.net.URI"))
                            msg.arg0 = arg0.toString();
                        else
                            msg.arg0 = arg0;
            
                    }
                    if(arg1!=null){
                        msg.arg1 = arg1;
                    }
            
                     DXC.send(
                         "@@__HOOK_ID__@@",
                         "@@__FRAG_ID__@@",
                          msg
                      );
                `
            },{
                name: "File_new_1",
                descr: "To detect new File instance (1)",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: [
                        "java.io.File.<init>(<java.lang.String>)<void>",
                        "java.io.File.<init>(<java.net.URI>)<void>"
                    ]
                },
                autoEmit: true,
                emitEvent: "hook.file.new",
                before: `
                
                    let msg:any ={ arg0:"<null>", arg1:"" }; 
            
                    if(arg0!=null){ 
                        if(DXC.util.isInstanceOf(arg0, "java.net.URI"))
                            msg.arg0 = arg0.toString();
                        else
                            msg.arg0 = arg0;
            
                    }
            
                     DXC.send(
                         "@@__HOOK_ID__@@",
                         "@@__FRAG_ID__@@",
                          msg
                      );
                `
            }
        ]
    },

    eventListeners: {
        "hook.file.new": function(pEvent:BusEvent<any>):void{
                // new meth
                // get the Hook from the Hook backtrace message
                //var hook = ctx.hook.getHookByID(event.hook);
                // get the method from the hook
                //var meth = ctx.find.get.method(hook.getMethod().signature());
                // console.log("New file catched", event);

                let data:any = pEvent.data.data;
                let path:string = "";

                if(data.arg0.length>0 && data.arg0!=='<null>'){
                    path += data.arg0;
                }
                
                if(data.arg1.length>0 && data.arg1!=='<null>'){
                    path += '/'+data.arg1;                    
                }


                const s = pEvent.getContext().getAnalyzer().getData().newStringValue({
                    src: pEvent,
                    value: path
                });

                console.log("NEW STRING > ",s);

                this.getContext().trigger({
                    type: "model.string.new",
                    data: s
                });

                //pEvent.getContext().getAnalyzer()

                //let hook  = ctx.hook.getHookByID(Utils.b64_decode(event.data.hook)); 
                //console.log(data,path);
                //ctx.getFileAnalyzer().addRemoteFile(path);
                //meth.
            }
    }
});

export default FileDescriptorInspector;