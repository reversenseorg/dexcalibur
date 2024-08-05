import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var OkhttpInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.10",
    hookSet: {
        id: "Okhttp",
        name: "Okhttp",
        description: "OkHttp is an HTTP client",
        strategies: [{
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("__signature__:/\\((<[\\w.]*>)?<java.lang.String><int><int><java.lang.String>' +
                    '<boolean><boolean><boolean><boolean>(<[\\w.]*>)?\\)/")'

                //  method("__signature__:/\\((<[\\w.]*>)?<java.lang.String><int><int><java.lang.String><boolean><boolean><boolean><boolean>(<[\\w.]*>)?\\)/")
                // Strange signatures with companion
                // canonicalize$okhttp method("__signature__:/\\(<java.lang.String><int><int><java.lang.String><boolean><boolean><boolean><boolean><java.nio.charset.Charset>\\)<java.lang.String>$/")
                // writeCanon(okio buff, string, int int
                // canonicalize$okhttp$default httpurl companion, string, int int, string, bool, bool , bool , bool, charset, int, object) string.

            },
            name: "canonicalize_okhttp",
            descr: "Hook canonicalize based on its signature, in okhttp3.HttpUrl okhttp.-Url",
            autoEmit: true,
            emitEvent: "hook.okhttp.canonicalize",
            before: ` 
                //<ts>={
                 console.log("[INSPECTOR][OKHTTP] Canonicalize");
                var encodeSetDict = [
                    {name:"USERNAME_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#"},
                    {name:"PASSWORD_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#"},
                    {name:"PATH_SEGMENT_ENCODE_SET", value:" \\"<>^\`{}|/\\\\?#"},
                    {name:"PATH_SEGMENT_ENCODE_SET_URI", value:"[]"},
                    {name:"QUERY_ENCODE_SET", value:" \\"'<>#"},
                    {name:"QUERY_COMPONENT_REENCODE_SET", value:" \\"'<>#&="},
                    {name:"QUERY_COMPONENT_ENCODE_SET", value:" !\\"#$&'(),/:;<=>?@[]\\\\^\`{|}~"},
                    {name:"QUERY_COMPONENT_ENCODE_SET_URI", value:"\\\\^\`{|}"},
                    {name:"FORM_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#&!$(),~"},  // from okhttp 3.x
                    {name:"FORM_ENCODE_SET_2", value:" !\\"#$&'()+,/:;<=>?@[\\\\]^\`{|}~"}, // from okhttp > 4+
                    {name:"FRAGMENT_ENCODE_SET", value:""},
                    {name:"FRAGMENT_ENCODE_SET_URI", value:" \\"#<>\\\\^\`{|}"}
                ];
                var argOffset: number = 0;
                if (DXC.util.isInstanceOf(arguments[1], 'java.lang.String')) {
                    argOffset++
                }
                let eventData : Record<string, any> = {};
                eventData['arg0_input'] = arguments[argOffset];
                eventData['arg1_pos'] = arguments[argOffset + 1];
                eventData['arg2_limit'] = arguments[argOffset + 2];
                eventData['arg3_encodeSet'] = arguments[argOffset + 3].toString();
                eventData['arg4_alreadyEncoded'] = arguments[argOffset + 4];
                eventData['arg5_strict'] = arguments[argOffset + 5];
                eventData['arg6_plusIsSpace'] = arguments[argOffset + 6];
                eventData['arg7_asciiOnly'] = arguments[argOffset + 7];
                eventData['arg8_Charset'] = arguments[argOffset + 8].toString();
                encodeSetDict.forEach((encodeSet) => {
                    if (encodeSet.value === eventData['arg3_encodeSet'])
                        eventData['encodeSet_label'] = encodeSet.name;
                });
                console.log("[INSPECTOR][OKHTTP] Canonicalize:", eventData['arg0_input'].toString());
                console.log("[INSPECTOR][OKHTTP] Canonicalize encodeSet_label:", eventData['arg3_encodeSet'].toString());
                
                DXC.send(
                    "@@__HOOK_ID__@@",
                    "@@__FRAG_ID__@@",
                    eventData
                );
            `
        }
        ]
    },
    eventListeners: {
    }
});


export default OkhttpInspector;