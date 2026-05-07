import {Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {StringAnalyzer} from "../../analyzer/StringAnalyzer.js";

export function newTagPresets(){
    const GLOBAL = new TagCategory({ name: "global" });
    const DATA_TYPE = new TagCategory({ name: "data.type" });
    const LEX = new TagCategory({ name: "lex" });
    const DATA_HASH = new TagCategory({ name: "data.hash" });
    const CRYPTO_HASH = new TagCategory({ name: "crypto.hash" });
    const DATA_LEN = new TagCategory({ name: "data.len" });
    const DATA_ACTION = new TagCategory({ name: "data.action" });
    const DATA_CHARSET = new TagCategory({ name: "data.charset" });
    const DATA_FMT_EXEC = new TagCategory({ name: "data.fmt.exec" });
    const CODE_NATIVE = new TagCategory({ name: "code.native" });
    const CODE_GLOBAL = new TagCategory({ name: "code.global" });
    const CODE_DALVIK = new TagCategory({ name: "code.dalvik" });
    const CODE_BINDING = new TagCategory({ name: "code.binding" });
    const CODE_CALL = new TagCategory({ name: "code.call" });
    const CODE_LOC_RT = new TagCategory({ name: "code.location.runtime" });
    const CODE_LOAD = new TagCategory({ name: "data.len" });
    const RUNTIME_MSG = new TagCategory({ name: "runtime.msg" });
    const DISCOVER = new TagCategory({ name: "discover" });
    const AUDIT_TYPE = new TagCategory({ name: "audit.type" });
    const AUDIT_POLICY = new TagCategory({ name: "audit.policy" });
    const NETWORK_DATA = new TagCategory({ name: "network.data" });
    const NETWORK_PROTOCOL = new TagCategory({ name: "network.protocol" });
    const NETWORK_HOST = new TagCategory({ name: "network.host" });
    const KEYPOINT_DEF = new TagCategory({ name: "keypoint.defaults" });
    const ANAL_NATIVE = new TagCategory({ name: "analyzer.native" });
    const PURPOSE = new TagCategory({ name: "purpose" });
    const TECH = new TagCategory({ name: "tech" });
    const INPUT_DEV = new TagCategory({ name: "input.device" });
    const INPUT_TYPE = new TagCategory({ name: "input.event" });
    const OUTPUT_SCREEN = new TagCategory({ name: "output.screen" });
    const OBJC = new TagCategory({ name: "objc" });
    const SWIFT = new TagCategory({ name: "swift" });
    const IA = new TagCategory({ name: "ia" });
    const ANALYZED = new TagCategory({ name: "analyzed" });
    const JAVA = new TagCategory({ name: "java" });
    const NETWORK_URI = new TagCategory({ name: "network.uri" });
    const ENCODED = new TagCategory({ name: "encoded", descr:"To tag strings containing encoded data such as base64, hex, JWT, IPv4, etc." });
    const UI_ROLE = new TagCategory({ name: "ui.role" });
    const UI_CMP = new TagCategory({ name: "ui.cmp" });
    const KP = new TagCategory({ name: "kp" });
    const KS_TYPE = new TagCategory({ name: "keystore.type" });
    const KS_SVC = new TagCategory({ name: "keystore.svc" });
    const REACH_EPT = new TagCategory({ name: "reach.eptype", descr:"Reachability: type of entrypoint" });
    const REACH_EXP = new TagCategory({ name: "reach.exp", descr:"Reachability: exposition" });
    const PROTO = new TagCategory({ name: "proto", descr:"Protocol: agnostic type of protocol" });

    const LEX_TAGS = [
        new Tag({ name:"begin",  label:"Begin token", descr:"Token that indicated the begin of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"end", label:"End token", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"gt", label:"Tok >", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"lt", label:"Tok <", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"eq", label:"Tok =", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"sep", label:"Tok |", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"assign", label:"Tok :", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"plus", label:"Tok +", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"minus", label:"Tok -", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"div", label:"Tok /", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
        new Tag({ name:"sem", label:"Tok ;", descr:"Token that indicated the end of something", styles:{ color:"#000000", backgroundColor:"#f2ffc5"} }),
    ];

    const REACH_EXP_TAGS = [
        new Tag({ name:"av-network",  label:"AV:N", descr:"Exploitable remotely over the network", styles:{ color:"#000000", backgroundColor:"#eec5ff"} }),
        new Tag({ name:"av-adjacent", label:"AV:A", descr:"Exploitable from adjacent network", styles:{ color:"#000000", backgroundColor:"#eec5ff"} }),
        new Tag({ name:"av-local",    label:"AV:L", descr:"Exploitable with local access", styles:{ color:"#000000", backgroundColor:"#eec5ff"} }),
        new Tag({ name:"av-physical", label:"AV:P", descr:"Exploitable with physical access", styles:{ color:"#000000", backgroundColor:"#eec5ff"} }),
        new Tag({ name:"ac-low",  label:"AC:L", descr:"No special conditions required", styles:{ color:"#000000", backgroundColor:"#dcc5ff"} }),
        new Tag({ name:"ac-high", label:"AC:H", descr:"Special conditions or hardware required", styles:{ color:"#000000", backgroundColor:"#dcc5ff"} }),
        new Tag({ name:"pr-none", label:"PR:N", descr:"No privileges required", styles:{ color:"#000000", backgroundColor:"#cac5ff"} }),
        new Tag({ name:"pr-low",  label:"PR:L", descr:"Low privileges required", styles:{ color:"#000000", backgroundColor:"#cac5ff"} }),
        new Tag({ name:"pr-high", label:"PR:H", descr:"High privileges required", styles:{ color:"#000000", backgroundColor:"#cac5ff"} }),
        new Tag({ name:"ui-none",     label:"UI:N", descr:"No user interaction required (zero-click)", styles:{ color:"#000000", backgroundColor:"#b8c5ff"} }),
        new Tag({ name:"ui-required", label:"UI:R", descr:"User interaction required", styles:{ color:"#000000", backgroundColor:"#b8c5ff"} }),
    ];

    const REACH_EPT_TAGS = [
        new Tag({ name:"ep-receiver",      label:"Receiver",      descr:"Passively receives messages or events", styles:{ color:"#000000", backgroundColor:"#c5e8ff"} }),
        new Tag({ name:"ep-listener",      label:"Listener",      descr:"Listens on a port or channel", styles:{ color:"#000000", backgroundColor:"#c5e8ff"} }),
        new Tag({ name:"ep-event-handler", label:"Event Handler", descr:"Handles OS or runtime events", styles:{ color:"#000000", backgroundColor:"#c5e8ff"} }),
        new Tag({ name:"ep-interrupt",     label:"Interrupt",     descr:"Hardware or software interrupt handler", styles:{ color:"#000000", backgroundColor:"#c5e8ff"} }),
        new Tag({ name:"ep-service",   label:"Service",   descr:"Exposes a callable interface", styles:{ color:"#000000", backgroundColor:"#c5fff0"} }),
        new Tag({ name:"ep-daemon",    label:"Daemon",    descr:"Background service running continuously", styles:{ color:"#000000", backgroundColor:"#c5fff0"} }),
        new Tag({ name:"ep-rpc",       label:"RPC",       descr:"Remote procedure call endpoint", styles:{ color:"#000000", backgroundColor:"#c5fff0"} }),
        new Tag({ name:"ep-api",       label:"API",       descr:"Programmatic interface exposed to callers", styles:{ color:"#000000", backgroundColor:"#c5fff0"} }),
        new Tag({ name:"ep-provider",   label:"Provider",   descr:"Exposes data to other components", styles:{ color:"#000000", backgroundColor:"#fffac5"} }),
        new Tag({ name:"ep-file-parser",label:"Parser",     descr:"Parses an input file or data stream", styles:{ color:"#000000", backgroundColor:"#fffac5"} }),
        new Tag({ name:"ep-deserializer",label:"Deserializer",descr:"Deserializes structured input", styles:{ color:"#000000", backgroundColor:"#fffac5"} }),
        new Tag({ name:"ep-ui-handler",  label:"UI Handler",  descr:"Handles user input from a UI", styles:{ color:"#000000", backgroundColor:"#ffdfc5"} }),
        new Tag({ name:"ep-uri-handler", label:"URI Handler", descr:"Handles inbound URI or deep-link dispatch", styles:{ color:"#000000", backgroundColor:"#ffdfc5"} }),
        new Tag({ name:"ep-clipboard",   label:"Clipboard",   descr:"Reads from clipboard on activation", styles:{ color:"#000000", backgroundColor:"#ffdfc5"} }),
        new Tag({ name:"ep-debug",      label:"Debug",      descr:"Debug or diagnostic interface", styles:{ color:"#000000", backgroundColor:"#ffc5c5"} }),
        new Tag({ name:"ep-test-hook",  label:"Test Hook",  descr:"Testing hook left in production binary", styles:{ color:"#000000", backgroundColor:"#ffc5c5"} }),
        new Tag({ name:"ep-backdoor",   label:"Backdoor",   descr:"Undocumented access point", styles:{ color:"#000000", backgroundColor:"#ffc5c5"} }),

    ];

    const PROTO_TAGS = [
        new Tag({ name:"tcp-ip", label:"TCP/IP", descr:"Direct TCP or IP-based communication", styles:{ color:"#000000", backgroundColor:"#c5e8ff"} }),
        new Tag({ name:"http", label:"HTTP/S", descr:"HTTP or HTTPS protocol", styles:{ color:"#000000", backgroundColor:"#c5e8ff"} }),
        new Tag({ name:"websocket", label:"WS", descr:"WebSocket protocol", styles:{ color:"#000000", backgroundColor:"#c5e8ff"} }),
        new Tag({ name:"dns", label:"DNS", descr:"DNS-based communication or tunneling", styles:{ color:"#000000", backgroundColor:"#c5e8ff"} }),
        new Tag({ name:"sms", label:"SMS", descr:"Short Message Service", styles:{ color:"#000000", backgroundColor:"#c5ffd6"} }),
        new Tag({ name:"mms", label:"MMS", descr:"Multimedia Messaging Service", styles:{ color:"#000000", backgroundColor:"#c5ffd6"} }),
        new Tag({ name:"push-notification", label:"Push", descr:"Push notification channel (APNS, FCM…)", styles:{ color:"#000000", backgroundColor:"#c5ffd6"} }),
        new Tag({ name:"nfc", label:"NFC", descr:"Near Field Communication", styles:{ color:"#000000", backgroundColor:"#fffac5"} }),
        new Tag({ name:"bluetooth", label:"BT", descr:"Bluetooth Classic", styles:{ color:"#000000", backgroundColor:"#fffac5"} }),
        new Tag({ name:"ble", label:"BLE", descr:"Bluetooth Low Energy", styles:{ color:"#000000", backgroundColor:"#fffac5"} }),
        new Tag({ name:"wifi-direct", label:"Wi-Fi Direct", descr:"Peer-to-peer Wi-Fi without access point", styles:{ color:"#000000", backgroundColor:"#fffac5"} }),
        new Tag({ name:"zigbee", label:"Zigbee", descr:"Zigbee wireless protocol", styles:{ color:"#000000", backgroundColor:"#fffac5"} }),
        new Tag({ name:"usb", label:"USB", descr:"USB interface", styles:{ color:"#000000", backgroundColor:"#ffc5c5"} }),
        new Tag({ name:"uart", label:"UART", descr:"Serial UART interface", styles:{ color:"#000000", backgroundColor:"#ffc5c5"} }),
        new Tag({ name:"jtag", label:"JTAG", descr:"JTAG debug interface", styles:{ color:"#000000", backgroundColor:"#ffc5c5"} }),
        new Tag({ name:"spi", label:"SPI", descr:"SPI bus interface", styles:{ color:"#000000", backgroundColor:"#ffc5c5"} }),
        new Tag({ name:"i2c", label:"I2C", descr:"I2C bus interface", styles:{ color:"#000000", backgroundColor:"#ffc5c5"} }),
        new Tag({ name:"ipc", label:"IPC", descr:"Generic inter-process communication", styles:{ color:"#000000", backgroundColor:"#ffdfc5"} }),
        new Tag({ name:"shared-memory", label:"SHM", descr:"Shared memory segment", styles:{ color:"#000000", backgroundColor:"#ffdfc5"} }),
        new Tag({ name:"pipe", label:"Pipe", descr:"Named or anonymous pipe", styles:{ color:"#000000", backgroundColor:"#ffdfc5"} }),
        new Tag({ name:"socket-local", label:"Unix Socket", descr:"Unix domain socket", styles:{ color:"#000000", backgroundColor:"#ffdfc5"} }),
        new Tag({ name:"signal", label:"Signal", descr:"OS signal handling", styles:{ color:"#000000", backgroundColor:"#ffdfc5"} }),
        new Tag({ name:"uri-handler", label:"URI", descr:"URI or deep-link handler", styles:{ color:"#000000", backgroundColor:"#e8c5ff"} }),
        new Tag({ name:"file", label:"File", descr:"File-based input (parsed file, watched path…)", styles:{ color:"#000000", backgroundColor:"#e8c5ff"} }),
        new Tag({ name:"clipboard", label:"Clipboard", descr:"Clipboard read/write", styles:{ color:"#000000", backgroundColor:"#e8c5ff"} }),
    ];


    // Removed since  1.13.0
    /*
    const ANALYZED_TAGS = [
        new Tag({ name:"native_func", label:"Native Functions" }),
        new Tag({ name:"bin_sections", label:"Sections" }),
        new Tag({ name:"str", label:"Strings" }),
        new Tag({ name:"crypto_key", label:"Crypto Key" }),
        new Tag({ name:"crypto_alg", label:"Crypto Algorithm" }),
    ];
    */
    const OBJC_TAGS = [
        new Tag({ name:"bundle", label:"NSBundle" }),
        new Tag({ name:"main", label:"main" }),
        new Tag({ name:"framework", label:"Framework" }),
        new Tag({ name:"res", label:"Resource" }),
    ];

    const JAVA_TAGS = [
        new Tag({ name:"jni", label:"JNI", descr:"Java Native Interface" }),
        new Tag({ name:"jna", label:"JNA", descr:"Java Native Access" }),
        new Tag({ name:"iproxy", label:"Instance Proxy" }),
        new Tag({ name:"acf", label:"AppComponentFactory", descr:"Application Component Factory" })
    ];

    const IA_TAGS = [
        new Tag({ name:"coreml", label:"CoreML", descr:"Apple CoreML (AI)" }),
    ];

    const SWIFT_TAGS = [
        new Tag({ name:"bundle", label:"Bundle" }),
        new Tag({ name:"main", label:"main" }),
        new Tag({ name:"framework", label:"Framework" }),
        new Tag({ name:"res", label:"Resource" }),
    ];


    const FS_FILE = new TagCategory({ name: "fs.file" });
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


    const FS_FILE_TAGS = [
        new Tag({ name:"write" }),
        new Tag({ name:"read" }),
    ];

    const DATA_ACTION_TAGS = [
        new Tag({ name:"read" }),
        new Tag({ name:"wrote" }),
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
        new Tag({ name:"not_stripped" }),
        new Tag({ name:"direct_int", label:"Direct Syscall", descr:"The code perform direct system call instead of using library function. Common for security purpose" }),
    ];


    const CODE_BINDING_TAGS = [
        new Tag({ name:"native" }),
        new Tag({ name:"rust" })
    ];

    const AUDIT_TYPE_TAGS = [
        new Tag({ name:"security" }),
        new Tag({ name:"privacy" }),
    ];

    const DATA_TYPE_TAGS = [
        new Tag({ name:"string" }),
        new Tag({ name:"ELF" }),
        new Tag({ name:"MachO" }),
        new Tag({ name:"executable" }),
        new Tag({ name:"codesign" }),
        new Tag({ name:"img" }),
        new Tag({ name:"xml" }),
        new Tag({ name:"raw" }),
        new Tag({ name:"plist" }),
        new Tag({ name:"nib" }),
        new Tag({ name:"zip" }),
        new Tag({ name:"aar" }),
        new Tag({ name:"apk" }),
        new Tag({ name:"asar" }),
        new Tag({ name:"ipa" }),
        new Tag({ name:"xcprivacy" }),
        new Tag({ name:"unknown" }),
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
        new Tag({ name:"missing", descr:"Only references have been found" })
    ];

    const CODE_CALL_TAGS = [
        new Tag({ name:"static", descr:"Static call site" }), // is - deprecated ?
        new Tag({ name:"dynamic", descr:"Invoked dynamically" })  // id
    ];

    const DISCOVER_TAGS = [
        new Tag({ name:"static", descr:"Discovered by static analysis" }), // ds
        new Tag({ name:"mixed", descr:"Discovered by interactive analysis" }), // dm
        new Tag({ name:"dynamic", descr:"Discovered by dynamic analysis" }), // dd
        new Tag({ name:"internal", descr:"Discovered by analysis  of system API" }) // di
    ];



    const NETWORK_HOST_TAGS = [
        new Tag({ name:"uri" }),
        new Tag({ name:"port" }),
        new Tag({ name:"schema" }),
        new Tag({ name:"credential" })
    ];


    const NETWORK_URI_TAGS = [
        new Tag({ name:"host", label:"URI Host" }),
        new Tag({ name:"query", label:"URI Query params" }),
        new Tag({ name:"schema", label:"URI Schema"}),
        new Tag({ name:"custom_schema", label:"Custom Schema" }),
        new Tag({ name:"hash", label:"URI with Hashtag"  }),
        new Tag({ name:"any", label:"URI" })
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
        new Tag({ name:"tcp" }),
        new Tag({ name:"usb" }),
        new Tag({ name:"ftp" }),
        new Tag({ name:"ssh" })
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

    const CODE_LOC_RT_TAGS = [
        new Tag({ name:"buffer" }), // led
        new Tag({ name:"file" }) // led
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


    const TECH_TAGS = [
        new Tag({ name:"java" }),
        new Tag({ name:"objc" }),
        new Tag({ name:"native" }),
        new Tag({ name:"js", label:"JavaScript" }),
        new Tag({ name:"kt", label:"Kotlin" }),
        new Tag({ name:"html" })
    ];

    const AUDIT_POLICY_TAGS = [
        new Tag({ name:"privacy" }),
        new Tag({ name:"data" }),
        new Tag({ name:"thirdparty" }),
        new Tag({ name:"sbom" }),
        new Tag({ name:"cbom" }),
        new Tag({ name:"security" }),
        new Tag({ name:"obfuscation" }),
        new Tag({ name:"integrity" }),
        new Tag({ name:"auth" }),
        new Tag({ name:"network" })
    ];



    /*
    ui.type.purpose.form
    ui.type.purpose.edit
    ui.type.purpose.accept
    ui.type.purpose.reject
    ui.type.purpose.destroy
    ui.type.purpose.exec
    ui.type.purpose.help
     */
    const UI_ROLE_TAGS = [
        new Tag({ name:"form" }),
        new Tag({ name:"edit" }),
        new Tag({ name:"accept" }),
        new Tag({ name:"reject" }),
        new Tag({ name:"destroy" }),
        new Tag({ name:"exec" }),
        new Tag({ name:"help" })
    ];

    const UI_CMP_TAGS = [
        new Tag({ name:"input" }),
        new Tag({ name:"layout" }),
        new Tag({ name:"text" }),
        new Tag({ name:"pin" }),
        new Tag({ name:"pan" }),
        new Tag({ name:"email" }),
        new Tag({ name:"date" }),
        new Tag({ name:"zip" }),
        new Tag({ name:"select" })
    ];


    const KP_TAGS = [
        new Tag({ name:"before", label:"Before" }),
        new Tag({ name:"after", label:"After" }),
        new Tag({ name:"dlopen", label:"DlOpen" }),
        new Tag({ name:"new", label:"New" }),
        new Tag({ name:"hook", label:"Hook" }),
        new Tag({ name:"fs", label:"FS" })
    ];

    const KS_TYPE_TAGS = [
        new Tag({ name:"aks", label:"KeyStorage:AndroidKeyStore"}),
        new Tag({ name:"bks", label:"KeyStorage:BouncyCastle"}),
        new Tag({ name:"keychain", label:"KeyStorage:KeyChain"}),
        new Tag({ name:"tpm", label:"KeyStorage:TPM"}),
        new Tag({ name:"ese", label:"KeyStorage:SecureElement"}),
        new Tag({ name:"db", label:"KeyStorage:DBMS"}),
    ];

    const KS_SVC_TAGS = [
        new Tag({ name:"load", label:"KeyStore-load"}),
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

    AUDIT_POLICY_TAGS.map( x => { AUDIT_POLICY.addTag(x); });
    // removed : ANALYZED_TAGS.map( x => { ANALYZED.addTag(x); });



    CODE_NATIVE_TAGS.map( x => { CODE_NATIVE.addTag(x); });
    CODE_GLOBAL_TAGS.map( x => { CODE_GLOBAL.addTag(x); });
    CODE_CALL_TAGS.map( x => { CODE_CALL.addTag(x); });
    CODE_LOAD_TAGS.map( x => { CODE_LOAD.addTag(x); });
    CODE_BINDING_TAGS.map( x => { CODE_BINDING.addTag(x) });
    CODE_LOC_RT_TAGS.map(x => { CODE_LOC_RT.addTag(x)});


    DATA_TYPE_TAGS.map( x => { DATA_TYPE.addTag(x); });
    DATA_HASH_TAGS.map( x => { DATA_HASH.addTag(x); });
    DATA_LEN_TAGS.map( x => { DATA_LEN.addTag(x); });
    DATA_ACTION_TAGS.map( x => { DATA_ACTION.addTag(x); });
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
    FS_FILE_TAGS.map( x => { FS_FILE.addTag(x); });
    TECH_TAGS.map( x => { TECH.addTag(x); });

    OBJC_TAGS.map( x => { OBJC.addTag(x); });
    SWIFT_TAGS.map( x => { SWIFT.addTag(x); });
    IA_TAGS.map( x => { IA.addTag(x); });
    JAVA_TAGS.map( x => { JAVA.addTag(x); })
    NETWORK_URI_TAGS.map( x => { NETWORK_URI.addTag(x); });

    // dynamically built tag category
    StringAnalyzer.extractTags().map( x => { ENCODED.addTag(x); });

    UI_CMP_TAGS.map( x => { UI_CMP.addTag(x); });
    UI_ROLE_TAGS.map( x => { UI_ROLE.addTag(x); });
    KS_SVC_TAGS.map( x => { KS_SVC.addTag(x); });
    KS_TYPE_TAGS.map( x => { KS_TYPE.addTag(x); });

    REACH_EPT_TAGS.map( x => { REACH_EPT.addTag(x); });
    REACH_EXP_TAGS.map( x => { REACH_EXP.addTag(x); });
    PROTO_TAGS.map( x => { PROTO.addTag(x); });
    LEX_TAGS.map( x => { LEX.addTag(x); });

    return [
        GLOBAL,
        DISCOVER,

        CODE_GLOBAL,
        CODE_CALL,
        CODE_NATIVE,
        CODE_LOAD,
        CODE_BINDING,
        CODE_LOC_RT,

        DATA_TYPE,
        DATA_CHARSET,
        DATA_HASH,
        DATA_LEN,
        DATA_ACTION,

        RUNTIME_MSG,
        AUDIT_TYPE,
        AUDIT_POLICY,

        NETWORK_DATA,
        NETWORK_HOST,
        NETWORK_PROTOCOL,

        KEYPOINT_DEF,

        ANAL_NATIVE,
        PURPOSE,
        FS_FILE,
        TECH,

        OBJC,
        SWIFT,
        IA,
        JAVA,

        NETWORK_URI,
        ENCODED,
        UI_ROLE,
        UI_CMP,

        KS_TYPE,
        KS_SVC,

        REACH_EPT,
        REACH_EXP,
        PROTO,
        LEX
    ];
}
export const TAG_CATEGORY_PRESETS = newTagPresets();

