import * as HOOK from '../../src/hook/HookManager.js';

import {IntentFilter} from "../../src/android/IntentFilter.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import Inspector, {INSPECTOR_TYPE} from "../../src/Inspector.js";
import DexcaliburProject from "../../src/DexcaliburProject.js";
import ModelClass from "../../src/ModelClass.js";
import BusEvent from "../../src/BusEvent.js";
import AndroidActivity from "../../src/android/AndroidActivity.js";
import * as Log from "../../src/Logger.js";
import {AndroidManifest, AndroidSharedUser} from "../../src/android/AndroidManifest.js";
import {AndroidCodeAnalyzer} from "../../src/android/analyzer/AndroidCodeAnalyzer.js";
import AndroidApplication from "../../src/android/AndroidApplication.js";
import {OperatingSystem} from "../../src/OperatingSystem.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====

interface SharedUserEvent {
    type:string;
    value:AndroidSharedUser;
    app?:AndroidApplication;
}

// === CONFIG
export default new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    /*condition: {
        os: { equal: OperatingSystem.ANDROID }
    },*/

    id: "AndroidPermissions",

    version: "1.0.0",
    tags : [
        {
            name:"android.perm",
            descr: "A set of tag related to permissions management of Android apps",
            _tagsOptions:[
                {
                    name:"shared_custom_user",
                    descr: "The application share the same Linux User ID of another applicatiion"
                },{
                    name:"shared_system_user",
                    descr: "The application runs with the Linux User ID of system"
                }
            ]
        }
    ],

    hookSet: {
        id: "AndroidPermissions",
        name: "Android Permissions analyzer",
        description: "Search things related to app permissions, and access controls",
        strategies:[]
    },

    eventListeners: {
        "dxc.fullscan.post": function(pEvent:BusEvent<any>){
            // TODO : retieve stored score
            // TODO : else init it
            if(pEvent.getContext().sharedStorage.android == null){
                pEvent.getContext().sharedStorage.android = {};
            }

            if(pEvent.getContext().sharedStorage.android.acl == null){
                pEvent.getContext().sharedStorage.android.acl = {
                    sharedUserId: null
                };
            }
        },
        "app.android.sharedUser":  function (pEvent:BusEvent<SharedUserEvent>):any {

            if(pEvent.getData().value==null) return;

            if(pEvent.getData().value.id != null){
                pEvent.getContext().sharedStorage.android.acl.sharedUserId = pEvent.getData().value.id;
                if(["android.uid.system"].indexOf(pEvent.getData().value.id)>-1){
                    pEvent.getContext().trigger({
                        type:"security.acl.run_as_system",
                        data:{
                            userId:(pEvent.getData()).value,
                            app: pEvent.getData().app.manifest.getAttrPackage()
                        }
                    });
                }
            }

        }
    }
});


