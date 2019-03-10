const fs = require("fs");
const UT = require("./Utils.js");
const Logger = require("./Logger.js");

const DX_JAR_PATH = "/lib/dx.jar";

//Logger.push("[PlatformBuilder::");

function PlatformBuilder(config){
    this.wd = config.getDexcaliburPath()+"APIs/";
    this.android_sdk = config.getAndroidSdkDir();
    this.java = config.getJavaBin();
    this.dxPath = null;
    return this;
}


PlatformBuilder.prototype.exists = function(platform){
    return fs.existsSync(this.wd+platform.getInternalName())
} 


PlatformBuilder.prototype.findDxPath = function(){
    if(this.dxPath != null) return this.dxPath;

    let self = this;
    UT.forEachFileOf(this.android_sdk+"/build-tools/", function(file){
        console.log(file);
        self.dxPath = file;
    },false);
    
    return this.dxPath;
}

PlatformBuilder.prototype.buildDex = function(classes_path){
    let dxBin = this.findDxPath();
    let output = this.config.getTmpDir()+"/dexc_"+UT.time()+".dex";
    
    UT.execSync(this.java+" --jar "+dxBin+" --dex --core-library --output="+output+" "+classes_path);

    return output;
}


PlatformBuilder.prototype.getAndroidClasses = function(api_version){
    let apiPath = this.android_sdk + "/platforms/";
    let availableApi = [], apiName = "", dstPath="", ret=null;

    if(api_version != null){
        apiPath += apiName = "android-"+api_version;
    }else{
        Logger.info("Searching platform ...");
        UT.forEachFileOf(apiPath, (x)=>{ availableApi.push(x) },false);
        if(availableApi.length==0){
            Logger.error("[PlatformeBuilder::getAndroidClasses]","No available Android API");
            return false;
        }
        apiPath += apiName = availableApi[0];
    }
    apiPath += "/android.jar";
    dstPath = this.config.getTmpDir()+"/"+apiName+"_"+UT.time();

    Logger.info("Copying platform file ...")
    ret = UT.execSync("cp "+apiPath+" "+dstPath+".jar");
    console.log(ret);

    fs.mkdirSync(dstPath.substr(0,dstPath-4)+"/")

    Logger.info("Extracting platform class files ...")
    ret = UT.execSync("unzip "+apiPath+".jar "+dstPath);

    Logger.info("Building dex file ...")
    let dex = this.buildDex(dstPath+"/");
    
    Logger.info("Smaling file ...");
    // UT.execSync(this.config.getSmaluPath());


    //ret = UT.execSync("cp "+dex+" "+this.config.getDexcaliburPath()+".jar");
    

}

PlatformBuilder.prototype.isBuildable = function(platform){
    if(platform.isAndroid()){

        this.buildDex()
        return true;
    }else{
        Logger.error("[PlatformeBuilder::isBuildable]","Only official Android API can be build."); 
        return false;
    }
} 

PlatformBuilder.prototype.build = function(platform, forced=false){
    if(this.exists(platform)){
        if(forced){
            this.remove(platform);
        }else{
            Logger.error("[PlatformeBuilder::build]","The platform already exists.");
        }
    }


}


PlatformBuilder.prototype.toJsonObject = function(){
    let o = new Object();

    for(let i in this) o[i] = this[i];

    return o;
}

module.exports = PlatformBuilder;