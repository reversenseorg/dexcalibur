import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var FirebaseInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    description: "Anything related to Firebase",
    version: "1.0.9",
    hookSet: {
        id: "Firebase",
        name: "Firebase",
        description: "Firebase API : authentication, ...",
        prologue: `
            function printTest(){
                // test
                console.log("@@__CTX__@@");
            }
        `,
        strategies: [
            {

            name: "FirebaseAuth_getInstance",
            descr: "To hook the getter of firebase authentication instance. (see https://firebase.google.com/docs/auth/android/start)",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: `method("enclosingClass.name:com.google.firebase.auth.FirebaseAuth").filter("name:getInstance")`
            },
            autoEmit: true,
            emitEvent: "hook.firebase.auth.get",
            before: `
                    // <ts>={
                    let msg="";
                    if (arguments.length >= 1) {
                        if(DXC.utils.isInstanceOf(arg0,"com.google.firebase.FirebaseApp"))
                            msg = arg0;
                        else
                            msg = "<unknow>";
                    }
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        {
                            msg: msg
                        }
                    );
            `
        },{
            name: "Firestore Get instance",
            descr: "Observe Cloud DB Firestore instances",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: `method("enclosingClass.name:com.google.firebase.firestore.FirebaseFirestore").filter("name:getInstance")`
            },
            autoEmit: true,
            emitEvent: "hook.firebase.cloud_db.get",
            before: `
                let o:any = {};
                arguments.map((x:any,i:number) => {
                    o['arg'+i] = x; 
                });
                printTest();
                
                DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@",o);    
            `
        },{
            name: "Firestore",
            descr: "Observe Firestore references",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: `method("enclosingClass.name:com.google.firebase.firestore.CollectionReference").filter("name:document")`
            },
            autoEmit: true,
            emitEvent: "hook.firebase.db.ref",
            before: `
                   
                let o:any = {};
                arguments.map((x:any,i:number) => {
                    o['arg'+i] = x; 
                });
                
                DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@",o);    
                   
            `
        },{
            name: "Firestore Add document",
            descr: "Observe add of a document to Firebase's Firestore DB",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: `method("enclosingClass.name:com.google.firebase.firestore.CollectionReference").filter("name:add")`
            },
            autoEmit: true,
            emitEvent: "hook.firebase.db.insert",
            before: `
                DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@",
                    {
                        msg: msg
                    }
                );
            `
        }]
    },
    
    eventListeners: {

    }
});


export default FirebaseInspector;