const fs = require("fs");
const Logger = require("./Logger.js");
const Platform = require("./Platform.js");


const NO_EXPORT = ["platform_available"];

function Configuration(){
    this.ready = false;

    // the default encoding ()
    this.encoding = "utf8",// "ascii",

    // Dexcalibur src location
    this.dexcaliburPath = "/mnt/dexcalibur/Sources/dexcalibur_bkp",
    
    // workspace location : folder where analyzed APK and data are stored
    this.workspacePath = "/mnt/dexcalibur/Sources/ws_bkp/", //"/tmp/ws/",
    
    // ADB location
    this.adbPath = "/home/banana/Android/Sdk/platform-tools/adb",
    this.androidSdkPath = "/home/banana/Android/Sdk",
    
    // APKTool location
    this.apktPath = "/home/banana/tools/apktool",

    // Optional : SDB location
    this.sdbPath = null,

    // Java
    this.javaBinPath = "java";

    // useless : to remove
    this.fridaDevPath = "/data/local/frida-server",
    this.fridaServerPath = "~/tools/frida/frida-server",
    
    // do not modified
    this.deviceId = null,
    this.useEmulator = false,

    // temporary files location
    this.tmpDir= "/tmp/",

    // default bridge
    this.bridge= "adb",

    // Default web server config
    this.web_port = 8002,

    // Optional : Database config
    // db_host = "localhost",
    // db_port = "27017",
    
    // Android API version 
    //this.api_default = "android:7.0.0";

    this.platform_target = "android:7.0.0",

    this.platform_available = {
        "android:7.0.0": {
            name: "android",
            version : "7.0.0",
            binaryPath: "/mnt/dexcalibur/Tools/api22/",
            //binaryPath: "APIs/android_22/"
        }
    };
}

Configuration.prototype.importFile = function(path, force=false, overwrite=false){
    let self = this;
    fs.readFile(path, {encoding:"utf8"}, function(err,data){
        if(err){
            Logger.error("[Configuration::importFile] ",err);
        }
        self.import(JSON.parse(data));
    });
    return true;
}

Configuration.prototype.getJavaBin = function(){
    return this.javaBinPath;
}

/**
 * To save the configuration into a file
 */
Configuration.prototype.exportTo = function(path){
    fs.writeFile(path, JSON.stringify(this.toJsonObject()), (err)=>{
        Logger.error("[Configuration::importFile] ",err);
    });
    return true;
}

/**
 *  To import 
 */
Configuration.prototype.import = function(data, force=false, overwrite=false){
    for(let i in data){
        if(this[i]!==undefined || force){
            if((this[i]!=null && overwrite) || this[i]==null){
                this[i] = data[i];
            }else{
                Logger.error("[Configuration::import] The property '",i,'" cannot be overwrote.');    
            }
        }else if(!force){
            Logger.error("[Configuration::import] The property '",i,'" not exists.');
        }
    }
    
    this.autocomplete();

    for(let i in this.platform_available){
        this.platform_available[i] = new Platform(this.platform_available[i],this.dexcaliburPath+"/../APIs/"); 
    }

    this.ready = true;
        
    return true;
}


Configuration.prototype.getTargetPlatformPath = function(platform_name=null){
    return this.platform_available[this.platform_target].getBinPath();
}

Configuration.prototype.autocomplete = function(){
    if(this.adbPath == null){
        this.adbPath = this.androidSdkPath+"platform-tools/adb";
    }
}

Configuration.prototype.getDexcaliburPath = function(){
    return this.dexcaliburPath;
}

Configuration.prototype.getWorkspaceDir = function(){
    return this.workspacePath;
}

Configuration.prototype.getAndroidSdkDir = function(){
    return this.androidSdkPath;
}

Configuration.prototype.getApktoolPath = function(){
    return this.apktPath;
}


Configuration.prototype.getAdbPath = function(){
    return this.adbPath;
}


Configuration.prototype.getTmpDir = function(){
    return this.tmpDir;
}

Configuration.prototype.toJsonObject = function(){
    let o = new Object();
    
    for(let i in this){ 
        switch(i){
            case "platform_available":
                o[i] = [];
                for(let k in this[i])
                    o[i].push(this[i][k].toJsonObject());            
                break;
            default:
                o[i] = this[i];    
                break;
        }
    } 

    return o;
}

module.exports = Configuration;