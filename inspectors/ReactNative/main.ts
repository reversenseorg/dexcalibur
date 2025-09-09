import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import BusEvent from "../../src/BusEvent.js";
import ModelMethod from "../../src/ModelMethod.js";


// ===== INIT =====

var ReactNativeGenericInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    /*tags: [
        {
            name:"react.type",
            _tagsOptions:[
                { name:"aks", label:"KeyStorage:AndroidKeyStore"},
                { name:"bks", label:"KeyStorage:BouncyCastle"},
                { name:"keychain", label:"KeyStorage:KeyChain"},
                { name:"tpm", label:"KeyStorage:TPM"},
                { name:"ese", label:"KeyStorage:SecureElement"},
                { name:"db", label:"KeyStorage:DBMS"},
            ]
        },{
            name:"keystore.service",
            _tagsOptions:[
                { name:"aks", label:"KeyService:AndroidKeyStore"}
            ]
        }
    ],*/

    id: "ReactNative",

    hookSet: {
        name: "ReactNative generic inspector",
        description: "Detect globally React Native application and generate usefull hooks",
        hookShare: {
            fd: [],
            stream: []
        },
        strategies: [
            {
                name: "instance",
                descr: "To detect new keystore instance",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid:  [
                        "java.security.KeyStore.getInstance(<java.lang.String>)<java.security.KeyStore>",
                        "java.security.KeyStore.getInstance(<java.lang.String><java.lang.String>)<java.security.KeyStore>",
                        "java.security.KeyStore.getInstance(<java.lang.String><java.security.Provider>)<java.security.KeyStore>"
                    ]
                },
                autoEmit: true,
                emitEvent: "hook.keystore.get.instance",
                before: `     
                    
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        {
                            name: arg0
                        }
                    );
                `
            }
        ]
    },

    eventListenerSources: {
        "dxc.fullscan.post_deploy": {
            source: `
                //<ts>={
                let ctx = pEvent.getContext();
                

                let app = ctx.find.file("@data.type.ELF").filter("@");
                
            `,
            lang: "ts"
        }
    },
});



export  default ReactNativeGenericInspector;