import {Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";

export function newTagPresets(){
    const GLOBAL = new TagCategory({ name: "global" });
    const DATA_TYPE = new TagCategory({ name: "data.type" });
    const DATA_HASH = new TagCategory({ name: "data.hash" });
    const DATA_LEN = new TagCategory({ name: "data.len" });
    const DATA_CHARSET = new TagCategory({ name: "data.charset" });
    const DATA_FMT_EXEC = new TagCategory({ name: "data.fmt.exec" });
    const CODE_NATIVE = new TagCategory({ name: "code.native" });
    const CODE_GLOBAL = new TagCategory({ name: "code.global" });
    const CODE_DALVIK = new TagCategory({ name: "code.dalvik" });
    const CODE_CALL = new TagCategory({ name: "code.call" });
    const CODE_LOAD = new TagCategory({ name: "data.len" });
    const RUNTIME_MSG = new TagCategory({ name: "runtime.msg" });
    const DISCOVER = new TagCategory({ name: "discover" });
//const AUDIT_THREAT = new TagCategory({ name: "audit.threat" });
    const AUDIT_TYPE = new TagCategory({ name: "audit.type" });
//const AUDIT_THREAT = new TagCategory({ name: "audit.threat" });
    const NETWORK_DATA = new TagCategory({ name: "network.data" });
    const NETWORK_PROTOCOL = new TagCategory({ name: "network.protocol" });
    const NETWORK_HOST = new TagCategory({ name: "network.host" });
    const KEYPOINT_DEF = new TagCategory({ name: "keypoint.defaults" });
    const ANAL_NATIVE = new TagCategory({ name: "analyzer.native" });
    const PURPOSE = new TagCategory({ name: "purpose" });
    //const SBOM_TYPE = new TagCategory({ name: "sbom.type" });

    const PURPOSE_TAGS = [
        new Tag({ name:"advertisement", label:"Ads" }),
        new Tag({ name:"marketing", label:"Marketing" }),
        new Tag({ name:"abtesting", label:"A/B Testing" }),
        new Tag({ name:"security", label:"Security" }),
        new Tag({ name:"health", label:"Healthcheck" }),
        new Tag({ name:"location", label:"Geolocation" }),
        new Tag({ name:"profiling", label:"Profiling" }),
        new Tag({ name:"analytics", label:"Analytics" }),
        new Tag({ name:"identity", label:"ID" }),
        new Tag({ name:"auth", label:"Authentication" }),
        new Tag({ name:"db", label:"DBMS" })
    ];

    const ANAL_NATIVE_TAGS = [
        new Tag({ name:"targetable" })
    ];

    const KEYPOINT_DEF_TAGS = [
        new Tag({ name:"loadOn" }),
        new Tag({ name:"unloadOn" }),
        new Tag({ name:"linking" }),
        new Tag({ name:"mapping" })
    ];

    const CODE_NATIVE_TAGS = [
        new Tag({ name:"export" }),
        new Tag({ name:"import" }),
        new Tag({ name:"not_stripped" })
    ];

    const AUDIT_TYPE_TAGS = [
        new Tag({ name:"security" }),
        new Tag({ name:"privacy" }),
    ];

    const DATA_TYPE_TAGS = [
        new Tag({ name:"string" }),
        new Tag({ name:"ELF" }),
        new Tag({ name:"Mach-O" }),
    ];

    const CODE_GLOBAL_TAGS = [
        new Tag({ name:"declare-string" }),
    ];

    const DATA_HASH_TAGS = [
        new Tag({ name:"md5" }),
        new Tag({ name:"sha1" }),
        new Tag({ name:"sha256" }),
        new Tag({ name:"sha384" }),
        new Tag({ name:"sha512" }),
    ];

    const DATA_LEN_TAGS = [
        new Tag({ name:"key-128" }),
        new Tag({ name:"key-256" }),
        new Tag({ name:"key-512" }),
        new Tag({ name:"key-1024" }),
        new Tag({ name:"key-2048" }),
        new Tag({ name:"key-4096" }),
    ];

    const GLOBAL_TAGS = [
        new Tag({ name:"missing" })
    ];

    const CODE_CALL_TAGS = [
        new Tag({ name:"static" }), // is
        new Tag({ name:"dynamic" })  // id
    ];

    const DISCOVER_TAGS = [
        new Tag({ name:"static" }), // ds
        new Tag({ name:"mixed" }), // dm
        new Tag({ name:"dynamic" }), // dd
        new Tag({ name:"internal" }) // di
    ];



    const NETWORK_HOST_TAGS = [
        new Tag({ name:"uri" }),
        new Tag({ name:"port" }),
        new Tag({ name:"schema" }),
        new Tag({ name:"credential" })
    ];

    const NETWORK_DATA_TAGS = [
        new Tag({ name:"header" }),
        new Tag({ name:"body" }),
        new Tag({ name:"request" }),
        new Tag({ name:"response" }),
    ];

    const NETWORK_PROTOCOL_TAGS = [
        new Tag({ name:"https" }),
        new Tag({ name:"http" }),
        new Tag({ name:"bluetooth" }),
        new Tag({ name:"ble" }),
        new Tag({ name:"websocket" }),
        new Tag({ name:"nfc" }),
        new Tag({ name:"gsm" }),
        new Tag({ name:"lte" }),
        new Tag({ name:"can" }),
        new Tag({ name:"tcp" })
    ];



    const DATA_CHARSET_TAGS = [
        new Tag({ name:"ascii" }),
        new Tag({ name:"hex" }),
        new Tag({ name:"octal" }),
        new Tag({ name:"binary" }),
        new Tag({ name:"base64" }),
        new Tag({ name:"utf8" })
    ];

    const CODE_LOAD_TAGS = [
        new Tag({ name:"external" }) // led
    ];

    const RUNTIME_TAGS = [
        new Tag({ name:"hook" }),
        new Tag({ name:"hk_err" }),
        new Tag({ name:"fr_err" }),
        new Tag({ name:"fs" }),
        new Tag({ name:"nfc" }),
        new Tag({ name:"bluetooth" }),
        new Tag({ name:"net" }),
        new Tag({ name:"cert" }),
        new Tag({ name:"mem" }),
        new Tag({ name:"tee" })
    ];
    /*
    Discover: {
        Statically: "ds",
            Mixed: "dm",
            Dynamically: "dd",
            Internal: "di"
    },
    Invoked: {
        Statically: "is",
            Dynamically: "id",
    },
    Load: {
        ExternalDyn: "led"
    }*/

    CODE_NATIVE_TAGS.map( x => { CODE_NATIVE.addTag(x); });
    CODE_GLOBAL_TAGS.map( x => { CODE_GLOBAL.addTag(x); });
    CODE_CALL_TAGS.map( x => { CODE_CALL.addTag(x); });
    CODE_LOAD_TAGS.map( x => { CODE_LOAD.addTag(x); });
    DATA_TYPE_TAGS.map( x => { DATA_TYPE.addTag(x); });
    DATA_HASH_TAGS.map( x => { DATA_HASH.addTag(x); });
    DATA_LEN_TAGS.map( x => { DATA_LEN.addTag(x); });
    DATA_CHARSET_TAGS.map( x => { DATA_CHARSET.addTag(x); });
    GLOBAL_TAGS.map( x => { GLOBAL.addTag(x); });
    DISCOVER_TAGS.map( x => { DISCOVER.addTag(x); });
    RUNTIME_TAGS.map( x => { RUNTIME_MSG.addTag(x); });
    AUDIT_TYPE_TAGS.map( x => { AUDIT_TYPE.addTag(x); });
    NETWORK_DATA_TAGS.map( x => { NETWORK_DATA.addTag(x); });
    NETWORK_HOST_TAGS.map( x => { NETWORK_HOST.addTag(x); });
    NETWORK_PROTOCOL_TAGS.map( x => { NETWORK_PROTOCOL.addTag(x); });
    KEYPOINT_DEF_TAGS.map(x => {KEYPOINT_DEF.addTag(x)});
    ANAL_NATIVE_TAGS.map(x => {ANAL_NATIVE.addTag(x)});
    PURPOSE_TAGS.map(x => {PURPOSE.addTag(x)});

    return [
        GLOBAL,
        DISCOVER,

        CODE_GLOBAL,
        CODE_CALL,
        CODE_NATIVE,
        CODE_LOAD,

        DATA_TYPE,
        DATA_CHARSET,
        DATA_HASH,
        DATA_LEN,

        RUNTIME_MSG,
        AUDIT_TYPE,

        NETWORK_DATA,
        NETWORK_HOST,
        NETWORK_PROTOCOL,

        KEYPOINT_DEF,

        ANAL_NATIVE,
        PURPOSE
    ];
}
export const TAG_CATEGORY_PRESETS = newTagPresets();

