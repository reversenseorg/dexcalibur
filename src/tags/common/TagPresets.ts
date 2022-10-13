
import {Tag} from "../Tag";
import {TagCategory} from "../TagCategory";

const GLOBAL = new TagCategory({ name: "global" });
const DATA_TYPE = new TagCategory({ name: "data.type" });
const DATA_HASH = new TagCategory({ name: "data.hash" });
const DATA_LEN = new TagCategory({ name: "data.len" });
const DATA_CHARSET = new TagCategory({ name: "data.charset" });
const CODE_NATIVE = new TagCategory({ name: "code.native" });
const CODE_GLOBAL = new TagCategory({ name: "code.global" });
const CODE_DALVIK = new TagCategory({ name: "code.dalvik" });
const CODE_CALL = new TagCategory({ name: "code.call" });
const CODE_LOAD = new TagCategory({ name: "data.len" });
const RUNTIME_MSG = new TagCategory({ name: "runtime.msg" });
const DISCOVER = new TagCategory({ name: "discover" });
//const AUDIT_THREAT = new TagCategory({ name: "audit.threat" });
const AUDIT_TYPE = new TagCategory({ name: "audit.type" });

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

export const TAG_CATEGORY_PRESETS = [
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
    AUDIT_TYPE
];

