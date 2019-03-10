const HOOK = require("../HookManager.js");
//const HOOK = require("../HookManager.js");


var RootDetectionScanner = new HOOK.HookSet({
    id: "RootDetection",
    name: "Root detection",
    description: "Bypass the root detection"
});

// perform research on the application
// RootDetectionScanner.addStaticRule();


// add code before hooks 
// add @@__CTX__@@_ before each symbol
RootDetectionScanner.addPrologue(`

    const @@__CTX__@@_BLACKLIST_ROOT = [
        "/system/bin/failsafe/",
        "/system/bin/failsafe/su",
        "/system/bin/su",
        "/system/xbin/su",
        "/system/app/Superuser.apk",
        "/system/bin/.ext/",
        "/system/sd/xbin/",
        "/system/usr/we-need-root/",
        "/xbin",
        "/sbin",
        "/sbin/su",
        "/su/bin",
        "/data/local/xbin",
        "/data/local/xbin/su",
        "/data/local/bin",
        "/data/local/bin/su",
        "/data/local/su",
        "/system/bin",
        "/failsafe",
        "/system/bin",
        "/system/sbin",
        "/system/xbin",
        "/vendor/bin",
        "test-keys"
        //"/etc"
    ];

    const @@__CTX__@@_BLACKLIST_APP = [
        "com.noshufou.android.su",
        "com.noshufou.android.su.elite",
        "eu.chainfire.supersu",
        "com.koushikdutta.superuser",
        "com.thirdparty.superuser",
        "com.yellowes.su",
        "com.zachspong.temprootremovejb",
        "com.amphoras.hidemyroot",
        "com.formyhm.hideroot",
        "de.robv.android.xposed.installer",
        "com.devadvance.rootcloakplus",
        "com.koushikdutta.rommanager",
        "com.dimonvideo.luckypatcher",
        "com.chelpus.lackypatch",
        "com.ramdroid.appquarantine",
        // shortcut
        "xposed",
        "Xposed",
        "noshufou",
        "thirdparty.superuser",
        "supersu",
        "superuser",
        "koushikdutta.superuser",
        "zachspong.temprootremovejb",
        "ramdroid.appquarantine",
        "daemonsu"
    ];


    const @@__CTX__@@_BLACKLIST_COMMAND = [
        "su"
    ];

    const @@__CTX__@@_BLACKLIST_WORD = [
        "RootCloak",
        "ROOTCLOAK",
        "rootcloak",
        "frida"
    ];


    const @@__CTX__@@_WRITABLE_DIR = [
        "/data",
        "/",
        "/system",
        "/system/bin",
        "/system/sbin",
        "/system/xbin",
        "/vendor/bin",
        "/sys",
        "/sbin",
        "/etc",
        "/proc",
        "/dev"
    ];


    const @@__CTX__@@_READABLE_DIR =   [
        "/data/data",
        "xbin",
        "bin",
        "usr",
        "sbin",
        "fake-libs"
    ];


    const @@__CTX__@@_READABLE_BIN = [
        "su",
        ".su",
        "su-backup",
        "mu"
    ];


    function @@__CTX__@@_isRootFile( str){
        for(var i=0; i<@@__CTX__@@_BLACKLIST_ROOT.length ; i++ ){
            if(str.indexOf(@@__CTX__@@_BLACKLIST_ROOT[i])>-1) return true;
        }
        return false;
    }

    function @@__CTX__@@_equalsRootFile( str){
        for(var i=0; i<@@__CTX__@@_BLACKLIST_ROOT.length ; i++ ){
            if(str.indexOf(@@__CTX__@@_BLACKLIST_ROOT[i])>-1) return true;
        }
        return false;
    }

    function @@__CTX__@@_equalsRootApp( str){
        for(var i=0; i<@@__CTX__@@_BLACKLIST_APP.length ; i++ ){
            if(str.indexOf(@@__CTX__@@_BLACKLIST_APP[i])>-1) return true;
        }
        return false;
    }


    function @@__CTX__@@_isRootWord( str){
        for(var i=0; i<@@__CTX__@@_BLACKLIST_WORD.length ; i++ ){
            if(str.indexOf(@@__CTX__@@_BLACKLIST_WORD[i])>-1) return true;
        }
        return false;
    }

    function @@__CTX__@@_isWritableDir( str){
        for(var i=0; i<@@__CTX__@@_WRITABLE_DIR.length ; i++ ){
            if(str.indexOf(@@__CTX__@@_WRITABLE_DIR[i])>-1) return true;
        }
        return false;
    }

    function @@__CTX__@@_isReadableDir( str){
        for(var i=0; i<@@__CTX__@@_READABLE_DIR.length ; i++ ){
            if(str.indexOf(@@__CTX__@@_READABLE_DIR[i])>-1) return true;
        }
        return false;
    }

    function @@__CTX__@@_isReadableBin( str){
        for(var i=0; i<@@__CTX__@@_READABLE_BIN.length ; i++ ){
            if(str.indexOf(@@__CTX__@@_READABLE_BIN[i])>-1) return true;
        }
        return false;
    }


    function @@__CTX__@@_isRootCommand( str){
        for(var i=0; i<@@__CTX__@@_BLACKLIST_COMMAND.length ; i++ ){
            if(str.indexOf(@@__CTX__@@_BLACKLIST_COMMAND[i])>-1) return true;
        }
        return false;
    }
    
`);

/*
    Token available :

    "@@__CLSDEF__@@": md5(method.enclosingClass.name),
    "@@__FQCN__@@": method.enclosingClass.name,
    "@@__METHDEF__@@": md5(method.__signature__),
    "@@__METHNAME__@@": method.name,
    "@@__METHSIGN__@@": method.__signature__,
    "@@__ARGS__@@": "",
    "@@__HOOK_ARGS__@@": "",
    "@@__HOOK_ARGS2__@@": "",
    "@@__RET__@@": "",
    "@@__ARGS_VAL__@@": "",
    "@@__HOOK_ID__@@": UT.b64_encode(this.id)

    Example of use : 

    var cls_@@__CLSDEF__@@ = Java.use('@@__FQCN__@@');

    var meth_@@__METHDEF__@@ = cls_@@__CLSDEF__@@.@@__METHNAME__@@.overload(@@__ARGS__@@);

    meth_@@__METHDEF__@@.implementation = function(@@__HOOK_ARGS__@@) {
        send({ id:"@@__HOOK_ID__@@", msg:"[PROBE] call> @@__METHSIGN__@@", after:false @@__ARGS_VAL__@@ });

        var ret = meth_@@__METHDEF__@@.call(this @@__HOOK_ARGS2__@@);

        send({ id:"@@__HOOK_ID__@@", msg:"[PROBE] <return @@__METHSIGN__@@", after:true @@__RET__@@ });
        return ret;
    }    
*/
RootDetectionScanner.addIntercept({
    when: HOOK.BEFORE,
    //method_signature: "java.lang.ProcessBuilder.command(<java.lang.String>[])<java.lang.ProcessBuilder>",
    method: "java.lang.ProcessBuilder.command(<java.lang.String>[])<java.lang.ProcessBuilder>",
    interceptReplace: `
            var cmd = Java.cast(arguments[0][0], Java.use("java.lang.String"));
                
            if(@@__CTX__@@_isRootCommand(cmd)){
                send({ id:"@@__HOOK_ID__@@", match:true, data:arguments[0][0], after:false, msg: "ProcessBuilder.command()", action:"forced to exit" });
                arguments[0] = ["ThisCommandProbablyNotExist"];
            }else{
                send({ id:"@@__HOOK_ID__@@", after:false, data:arguments[0][0], msg:"ProcessBuilder.command()", action:"" });
            }
        
            return meth_@@__METHDEF__@@.call(this, arguments[0]);
    `
});

RootDetectionScanner.addIntercept({
    when: HOOK.BEFORE,
    method: "java.lang.Runtime.exec(<java.lang.String>[])<java.lang.Process>",
    interceptReplace: `
            var cmd = Java.cast(arguments[0][0], Java.use("java.lang.String"));
                
            if(@@__CTX__@@_isRootCommand(cmd)){
                send({ after:false, data:arguments[0][0], msg:"Runtime.exec()", action:"forced to exit" });
                arguments[0][0] = "ThisCommandProbablyNotExist";
            }else{
                send({ after:false, data:arguments[0][0], msg:"Runtime.exec()", action:"" });
            }
        
            return meth_@@__METHDEF__@@.call(this, arguments[0]);
    `
});

RootDetectionScanner.addIntercept({
    when: HOOK.BEFORE,
    method: "java.io.File.exists()<boolean>",
    interceptReplace: `
            var res =  meth_@@__METHDEF__@@.call(this);
            var file = Java.cast(this, cls_@@__CLSDEF__@@);
            var path = file.getAbsolutePath();

            if(@@__CTX__@@_isRootFile(path)){
                res = false;
                send({ id:"@@__HOOK_ID__@@", match:true, data:path, after:true, msg:"File.exists()", action:"forced to return FALSE" });
            }else{
                send({ id:"@@__HOOK_ID__@@", after:true, data:path, msg:"File.exists()", action:"return "+res });
            }

            return res;
    `
});

RootDetectionScanner.addIntercept({
    when: HOOK.BEFORE,
    method: "java.io.File.canRead()<boolean>",
    interceptReplace: `
            var res = meth_@@__METHDEF__@@.call(this);

            var file = Java.cast(this, cls_@@__CLSDEF__@@);
            var path = file.getAbsolutePath();

            if(@@__CTX__@@_isReadableDir(path)){
                res = false;
                send({ id:"@@__HOOK_ID__@@", match:true, data:path, after:true, msg:"File.canRead()", action:"forced to return FALSE" });
            }else{
                send({ id:"@@__HOOK_ID__@@", after:true, data:path, msg:"File.canRead()", action:"return "+res });
            }
            return res;
    `
});

RootDetectionScanner.addIntercept({
    when: HOOK.BEFORE,
    method: "java.io.File.canWrite()<boolean>",
    interceptReplace: `
            var res = meth_@@__METHDEF__@@.call(this);

            var file = Java.cast(this, cls_@@__CLSDEF__@@);
            var path = file.getAbsolutePath();

            if(@@__CTX__@@_isWritableDir(path)){
                res = false;
                send({ id:"@@__HOOK_ID__@@", match:true, data:path, after:true, msg:"File.canWrite()", action:"forced to return FALSE"});
            }else{
                send({ id:"@@__HOOK_ID__@@", after:true, data:path, msg:"File.canWrite()", action:"return "+res});
            }
            return res;
    `
});

RootDetectionScanner.addIntercept({
    //when: HOOK.BEFORE,
    method: "java.lang.String.contains(<java.lang.CharSequence>)<boolean>",
    interceptReplace: `

            var arg = Java.cast(arguments[0], cls_@@__CLSDEF__@@);
            var res = meth_@@__METHDEF__@@.call(this, arguments[0]); 

            if((@@__CTX__@@_equalsRootFile(arg) ||  @@__CTX__@@_equalsRootApp(arg) || @@__CTX__@@_isRootWord(arg))){

                send({ 
                    id:"@@__HOOK_ID__@@", 
                    match: (res==true? true : false), 
                    after:true, 
                    data:arg.toString(), 
                    msg: "String.contains()", 
                    action:"forced to return FALSE" 
                });
                res = false;
            }else{
                send({ 
                    id:"@@__HOOK_ID__@@", 
                    after:true, 
                    data:arg.toString(),  
                    msg: "String.contains()", 
                    action:""
                });
            }
            
            return res;
    `
});

module.exports = RootDetectionScanner;