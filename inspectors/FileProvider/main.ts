import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var ContentProviderInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.4",
    hookSet: {
        // source from @Ch0pin https://github.com/Ch0pin/medusa/blob/master/modules/content_providers/file_provider_implemetation.med
        id: "FileProvider",
        name: "File Provider",
        description: "Logs maps of file->content URIs",
        strategies: [{
            name: "SimplePathStrategy addRoot",
            descr: "Try to hook private method SimplePathStrategy addRoot",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.core.content.FileProvider\$SimplePathStrategy$/").filter("name:addRoot")'
            },
            autoEmit: true,
            emitEvent: "hook.fileProvider.$simplePathStrategy.addRoot",
            before: ` 
                let data : Record<string, any> = {};
                data['arg0_name'] = arguments[0];
                data['arg1_root'] = arguments[1];
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    data
                );
            `
        },
        {
            name: "Stripped SimplePathStrategy method",
            descr: "Hook Stripped SimplePathStrategy method",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.core.content.FileProvider\$b/").filter("name:<init>")'
            },
            autoEmit: true,
            emitEvent: "hook.fileProvider.$b.init",
            before: ` 
                if (DXC.utils.isInstanceOf(arguments[0], "java.lang.String")) {
                    let data : Record<string, any> = {};
                    data['arg0_authority'] = arguments[0];
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        data
                    );
                }
            `
        },
        {
            name: "Stripped SimplePathStrategy addRoot",
            descr: "Hook Stripped SimplePathStrategy addRoot method",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("enclosingClass.name:/^androidx.core.content.FileProvider\$b/").filter("name:a")'
            },
            autoEmit: true,
            emitEvent: "hook.fileProvider.$b.a",
            before:`
                if (DXC.utils.isInstanceOf(arguments[0], "java.lang.String") ||
                    DXC.utils.isInstanceOf(arguments[1], "java.io.File")){
                    let data : Record<string, any> = {};
                    data['arg0_name'] = arguments[0];
                    data['arg1_root'] = arguments[1];
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        data
                );}
            `
        }]
    },
    eventListeners: {
    }
});


export default ContentProviderInspector;