import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// source from @Ch0pin https://github.com/Ch0pin/medusa/blob/master/modules/fragments/fragment_hook_basics.med
// source: https://github.com/Ch0pin/medusa/blob/20f463c590e13700f42e413212bb3d6d996d8a7f/libraries/js/android_core.js#L96
// ===== INIT =====

var FragmentInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.1.7",
    hookSet: {
        id: "Fragments",
        name: "Fragments",
        description: "Basic hooks for Fragment class calls",
        prologue: `
            // <ts>={;
            function getApplicationContext(){
                return Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();
            }
            function isActivityExported(intent: any){
                try{
                  const context = getApplicationContext();
                  const packageManager = context.getPackageManager();  
                  let resolveInfo = packageManager.resolveActivity(intent, 0);
                  return resolveInfo.activityInfo.value.exported.value;
                }
                  catch(error){
                  //console.log(error)
                }
            }
            function dumpIntent(intent:any , eData:Record<string, any> , redump=true) {
                let eData_prefix:string = "intent_";
                if (intent.getStringExtra("marked_as_dumped") && redump === false)
                    return;
                eData[eData_prefix + "intent"] = intent;
                eData[eData_prefix + "exported"] = isActivityExported(intent);
                var type = null;
                var intentData = intent.getData();
                if (intentData != null)
                    eData[eData_prefix + "data"] = intentData
                var action = intent.getAction();
                if (action != null)
                    eData[eData_prefix + "action"] = action
                var bundle_clz = intent.getExtras();
                if (bundle_clz != null) {
                    var keySet = bundle_clz.keySet();
                    var iter = keySet.iterator();
                    while(iter.hasNext()) {
                        var currentKey = iter.next();
                        var currentValue = bundle_clz.get(currentKey);
                        if (currentValue != null)
                            type =  currentValue.getClass().toString();
                        else type = 'undefined'
                        
                        var t = type.substring(type.lastIndexOf('.') + 1, type.length)
                        if (currentKey !== 'marked_as_dumped')
                             eData[eData_prefix + t + '_' + currentKey] = currentValue
                    }
                }
                intent.putExtra("marked_as_dumped","marked");
            }`,
        strategies: [{
            name: "getArguments",
            descr: "Hook Fragment getArguments",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.fragment.app.Fragment$/").filter("name:getArguments")'
            },
            autoEmit: true,
            emitEvent: "hook.fragment.getArguments",
            before: ` 
                let data : Record<string, any> = {};
                data['fragmentActivity'] = this.getActivity();
                data['fragment'] = this;
                // TODO add return value
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                );
            `
        },
        {
            name: "setArguments",
            descr: "Hook Fragment setArguments",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.fragment.app.Fragment$/").filter("name:setArguments")'
            },
            autoEmit: true,
            emitEvent: "hook.fragment.setArguments",
            before: ` 
            let data : Record<string, any> = {};
            data['fragmentActivity'] = this.getActivity();
            data['fragment'] = this;
            data['arg0_args'] = arguments[1];
            DXC.send(
                "@@__HOOK_ID__@@",
                "@@__FRAG_ID__@@",
                data
            );
        `
        },
        {
            name: "startActivity",
            descr: "Hook Fragment startActivity",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.fragment.app.Fragment$/").filter("name:startActivity")'
            },
            autoEmit: true,
            emitEvent: "hook.fragment.startActivity",
            before: ` 
            let data : Record<string, any> = {};
            data['fragmentActivity'] = this.getActivity();
            data['fragment'] = this;
            if (arguments.length === 2) {
                data['arg1_options'] = arguments[1];
            }
            var intent = arguments[0];
            // dumpIntent(intent, data, true);
            DXC.send(
                "@@__HOOK_ID__@@",
                "@@__FRAG_ID__@@",
                data
            );
        `
        },
        {
            name: "startActivityForResult",
            descr: "Hook Fragment startActivityForResult",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.fragment.app.Fragment$/").filter("name:startActivityForResult")'
            },
            autoEmit: true,
            emitEvent: "hook.fragment.startActivityForResult",
            before: ` 
            let data : Record<string, any> = {};
            data['fragmentActivity'] = this.getActivity();
            data['fragment'] = this;
            data['arg1_requestCode'] = arguments[1];
            if (arguments.length === 3) {
                data['arg2_options'] = arguments[2];
            }
            var intent = arguments[0];
            // dumpIntent(intent, data, true);
            DXC.send(
                "@@__HOOK_ID__@@",
                "@@__FRAG_ID__@@",
                data
            );
        `
        }]
    },
    eventListeners: {
    }
});

export default FragmentInspector;