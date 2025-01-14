import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var ViewGroupInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.1",
    hookSet: {
        id: "ViewGroup",
        name: "ViewGroup inspector",
        description: "ViewGroup contains and control children views",
        strategies: [
        {
            name: "ViewGroup dispatchDraw",
            descr: "Hook the viewGroups that update their children views.",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^android.view.ViewGroup/").filter("name:dispatchDraw")'
            },
            autoEmit: true,
            emitEvent: "hook.viewGroup.dispatchDraw",
            after:`  
                //<psh>={
                let DUMPVIEW_MINIMUM_TIME_DIFF = 500;
                if (DXC.mods.last_dumpView == null) {
                  DXC.mods = {last_dumpView:0}
                }
                let start_time = new Date().getTime();
                if (start_time - DXC.mods.last_dumpView > DUMPVIEW_MINIMUM_TIME_DIFF) {
                  let view_list = DXC.java.ui.dumpView().data;
                  let end_time = new Date().getTime();
                  let dumpView_time = (end_time - start_time) / 1000;
                  let eventData: Record<string, any> = {dumpView_time:dumpView_time, view_list:view_list};
                  DXC.send(
                      "@@__HOOK_ID__@@",
                      "@@__FRAG_ID__@@",
                      eventData
                  );
                  DXC.mods.last _dumpView = end_time;
                } 
            `
        },
        ]
    },
    eventListeners: {
    }
});

export default ViewGroupInspector;
