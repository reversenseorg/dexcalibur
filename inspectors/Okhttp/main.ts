import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";

// ===== INIT =====

var OkhttpInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    hookSet: {
        id: "Okhttp",
        name: "Okhttp",
        description: "OkHttp is an HTTP client",
        strategies: [{
            name: "canonicalize_okhttp_3_3",
            descr: "Hook canonicalize based on its signature, in okhttp3.HttpUrl from okhttp_3.x version (Java)",
            search: {
                type: ModelMethod.TYPE.getName(),
                req: 'method("__signature__:/<java.lang.String><int><int><java.lang.String>' +
                    '<boolean><boolean><boolean><boolean><java.nio.charset.Charset>.<java.lang.String>$/")'
                // method("__signature__:/<java.lang.String><int><int><java.lang.String><boolean><boolean><boolean><boolean><java.nio.charset.Charset>.<java.lang.String>$/")'
                //okhttp3 v3.9.x v3.14.x  source https://github.com/square/okhttp/blob/c0739a419949a24d0c34cf38a25953c60871268b/okhttp/src/main/java/okhttp3/HttpUrl.java#L1682
                //'method("__signature__:/\(<int><int><java.lang.String><java.lang.Boolean><java.lang.Boolean>' +
                    //'<java.lang.Boolean><java.lang.Boolean><java.nio.charset.Charset>\)<java.lang.String>$/")'
                // method("__signature__:/\(<int><int><java.lang.String><java.lang.Boolean><java.lang.Boolean><java.lang.Boolean><java.lang.Boolean><java.nio.charset.Charset>\)<java.lang.String>$/")
                // method("__signature__:/<java.nio.charset.Charset>.<java.lang.String>$/")
                // method("__signature__:/<java.lang.String><int><int><java.lang.String><java.lang.Boolean><java.lang.Boolean><java.lang.Boolean><java.lang.Boolean><java.nio.charset.Charset>/")
            },
            autoEmit: true,
            emitEvent: "hook.okhhtp.canonicalizeWithCharset",
            before: ` 
                //<ts>={
             // canonicalize(String input, int pos, int limit, String encodeSet,
                //       boolean alreadyEncoded, boolean strict, boolean plusIsSpace, boolean asciiOnly,
                //       @Nullable Charset charset)
                if (arguments.length === 9) {
                    var encodeSetDict = [
                        {name:"USERNAME_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#"},
                        {name:"PASSWORD_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#"},
                        {name:"PATH_SEGMENT_ENCODE_SET", value:" \\"<>^\`{}|/\\\\?#"},
                        {name:"PATH_SEGMENT_ENCODE_SET_URI", value:"[]"},
                        {name:"QUERY_ENCODE_SET", value:" \\"'<>#"},
                        {name:"QUERY_COMPONENT_REENCODE_SET", value:" \\"'<>#&="},
                        {name:"QUERY_COMPONENT_ENCODE_SET", value:" !\\"#$&'(),/:;<=>?@[]\\\\^\`{|}~"},
                        {name:"QUERY_COMPONENT_ENCODE_SET_URI", value:"\\\\^\`{|}"},
                        //    {name:"FORM_ENCODE_SET", value:" !\\"#$&'()+,/:;<=>?@[\\\\]^\`{|}~"}, new 4+
                        {name:"FORM_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#&!$(),~"},  // old okhttp 3.x
                        {name:"FRAGMENT_ENCODE_SET", value:""},
                        {name:"FRAGMENT_ENCODE_SET_URI", value:" \\"#<>\\\\^\`{|}"}
                    ];
                    let eventData : Record<string, any> = {};
                    eventData['arg0_input'] = arguments[0];
                    eventData['arg1_pos'] = arguments[1];
                    eventData['arg2_limit'] = arguments[2];
                    eventData['arg3_encodeSet'] = arguments[3];
                    eventData['arg4_alreadyEncoded'] = arguments[4];
                    eventData['arg5_strict'] = arguments[5];
                    eventData['arg6_plusIsSpace'] = arguments[plusIsSpace];
                    eventData['arg7_asciiOnly'] = arguments[asciiOnly];
                    eventData['arg8_Charset'] = arguments[Charset].toString();
                    encodeSetDict.forEach((encodeSet) => {
                        if (encodeSet.value === arguments[3])
                            eventData['encodeSet_label'] = encodeSet.name;
                    });
                    
                    DXC.send(
                        "@@__HOOK_ID__@@",
                        "@@__FRAG_ID__@@",
                        eventData
                    );
                }
            `
         }
    //     {
    //         name: "canonicalize_okhttp_5_0",
    //         descr: "Hook canonicalize based on its signature, in okhttp3.HttpUrl from okhttp_5.0 version (Kotlin)",
    //         search: {
    //             type: ModelMethod.TYPE.getName(),
    //             req: 'method("__signature__:/<java.lang.String><int><int><java.lang.String>' +
    //                 '<boolean><boolean><boolean><boolean><java.nio.charset.Charset>.<java.lang.String>$/")'
    //             // method("__signature__:/<java.lang.String><int><int><java.lang.String><boolean><boolean><boolean><boolean><java.nio.charset.Charset>.<java.lang.String>$/")'
    //             //okhttp3 v3.9.x v3.14.x  source https://github.com/square/okhttp/blob/c0739a419949a24d0c34cf38a25953c60871268b/okhttp/src/main/java/okhttp3/HttpUrl.java#L1682
    //             //'method("__signature__:/\(<int><int><java.lang.String><java.lang.Boolean><java.lang.Boolean>' +
    //             //'<java.lang.Boolean><java.lang.Boolean><java.nio.charset.Charset>\)<java.lang.String>$/")'
    //             // method("__signature__:/\(<int><int><java.lang.String><java.lang.Boolean><java.lang.Boolean><java.lang.Boolean><java.lang.Boolean><java.nio.charset.Charset>\)<java.lang.String>$/")
    //             // method("__signature__:/<java.nio.charset.Charset>.<java.lang.String>$/")
    //             // method("__signature__:/<java.lang.String><int><int><java.lang.String><java.lang.Boolean><java.lang.Boolean><java.lang.Boolean><java.lang.Boolean><java.nio.charset.Charset>/")
    //         },
    //         autoEmit: true,
    //         emitEvent: "hook.okhhtp.canonicalizeWithCharset",
    //         before: `
    //         //<ts>={
    //         /* okhttp httpUrl 4,10
    // internal fun String.canonicalize(
    //   pos: Int = 0,
    //   limit: Int = length,
    //   encodeSet: String,
    //   alreadyEncoded: Boolean = false,
    //   strict: Boolean = false,
    //   plusIsSpace: Boolean = false,
    //   unicodeAllowed: Boolean = false,
    //   charset: Charset? = null
    // ): String
    // method("__signature__:/<int><int><java.lang.String><boolean><boolean><boolean><boolean><java.nio.charset.Charset>.<java.lang.String>$/")'
    // //TODO check if in kotlin Int is mapped to int and Boolean to boolean.
    //          */
    //         if (arguments.length === 9) {
    //             var encodeSetDict = [
    //                 {name:"USERNAME_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#"},
    //                 {name:"PASSWORD_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#"},
    //                 {name:"PATH_SEGMENT_ENCODE_SET", value:" \\"<>^\`{}|/\\\\?#"},
    //                 {name:"PATH_SEGMENT_ENCODE_SET_URI", value:"[]"},
    //                 {name:"QUERY_ENCODE_SET", value:" \\"'<>#"},
    //                 {name:"QUERY_COMPONENT_REENCODE_SET", value:" \\"'<>#&="},
    //                 {name:"QUERY_COMPONENT_ENCODE_SET", value:" !\\"#$&'(),/:;<=>?@[]\\\\^\`{|}~"},
    //                 {name:"QUERY_COMPONENT_ENCODE_SET_URI", value:"\\\\^\`{|}"},
    //                 //    {name:"FORM_ENCODE_SET", value:" !\\"#$&'()+,/:;<=>?@[\\\\]^\`{|}~"}, new 4+
    //                 {name:"FORM_ENCODE_SET", value:" \\"':;<=>@[]^\`{}|/\\\\?#&!$(),~"},  // old okhttp 3.x
    //                 {name:"FRAGMENT_ENCODE_SET", value:""},
    //                 {name:"FRAGMENT_ENCODE_SET_URI", value:" \\"#<>\\\\^\`{|}"}
    //             ];
    //             let eventData : Record<string, any> = {};
    //             eventData['arg0_input'] = arguments[0];
    //             eventData['arg1_pos'] = arguments[1];
    //             eventData['arg2_limit'] = arguments[2];
    //             eventData['arg3_encodeSet'] = arguments[3];
    //             eventData['arg4_alreadyEncoded'] = arguments[4];
    //             eventData['arg5_strict'] = arguments[5];
    //             eventData['arg6_plusIsSpace'] = arguments[plusIsSpace];
    //             eventData['arg7_asciiOnly'] = arguments[asciiOnly];
    //             eventData['arg8_Charset'] = arguments[Charset].toString();
    //             encodeSetDict.forEach((encodeSet) => {
    //                 if (encodeSet.value === arguments[3])
    //                     eventData['encodeSet_label'] = encodeSet.name;
    //             });
    //
    //             DXC.send(
    //                 "@@__HOOK_ID__@@",
    //                 "@@__FRAG_ID__@@",
    //                 eventData
    //             );
    //         }
    //     `
    //     }
        ]
    },
    eventListeners: {
    }
});


export default OkhttpInspector;