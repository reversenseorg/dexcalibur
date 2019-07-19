const Adb = require('./AdbWrapper.js');
const Path = require('path');
const Process = require('child_process');
const fs = require('fs');

class PackagePatcher {
    constructor(config=null, apkHelper) {
        this.apkHelper = apkHelper;
        this.config = config;
        this.packages = [];
        this.Bridges = {
            ADB: new Adb(this.config.getAdbPath(),null)
        };
    }
    /**
     * Pull a Package from the Device and Patch its MainActivity to load frida-gadget,
     * as well as copying the library into the apk
     * 
     * @param {*} package_name The package name
     * 
     */
    patchPackage(packageIdentifier) {
        
    }

    pullPackage(packageIdentifier) {
        var dstPath = Path.join(this.config.workspacePath, packageIdentifier, 'dex');
        var tmpPath = Path.join(this.config.workspacePath,packageIdentifier, packageIdentifier +  '.apk');

        var projectDir = Path.join(this.config.workspacePath, packageIdentifier);
        
        fs.mkdirSync(projectDir);
        fs.mkdirSync(dstPath);
        
        var pathResult = this.Bridges.ADB.getPackagePath(packageIdentifier);
        this.Bridges.ADB.pull(pathResult, tmpPath);
        this.apkHelper.extract(tmpPath, dstPath);
    }

    scan(){
       this.count = 0;
       if(this.Bridges.ADB.isReady()){
           var pkgs = this.Bridges.ADB.listPackages();
           this.count += pkgs.length;

           for(let i in pkgs){
               this.packages[pkgs[i].packageIdentifier] = pkgs[i];
               this.packages[pkgs[i].packageIdentifier].config.workspacePath = this.config.workspacePath;
           }
           //ut.msgBox("Android packages", Object.keys(this.packages));
           console.log("Android packages", Object.keys(this.packages));
       }
        
   }

   toJsonObject(){
    let json = [];
    for(let i in this.packages){
        json.push(this.packages[i].toJsonObject())
    }
    return json;
};

    
}

module.exports = PackagePatcher;
