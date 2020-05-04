const Adb = require('./AdbWrapper.js');
const Path = require('path');
const Process = require('child_process');
const fs = require('fs');

const ApkHelper = require("./ApkHelper");

class PackagePatcher {
    constructor(pkgName,config=null) {
        this.currentPackageName = pkgName;
        this.config = config;
        this.packages = [];
        this.bridges = {
            ADB: AdbWrapperFactory.getInstance().newGenericWrapper()
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
        
        fs.mkdirSync(projectDir, {recursive: true});
        fs.mkdirSync(dstPath, {recursive: true});

        var pathResult = this.bridges.ADB.getPackagePath(packageIdentifier);
        this.bridges.ADB.pull(pathResult, tmpPath);
        ApkHelper.extract(tmpPath, dstPath);
    }

    scan(){
       this.count = 0;
       if(this.bridges.ADB.isReady()){
           var pkgs = this.bridges.ADB.listPackages();
           this.count += pkgs.length;

           for(let i in pkgs){
               this.packages[pkgs[i].packageIdentifier] = pkgs[i];
               this.packages[pkgs[i].packageIdentifier].workspaceExists = fs.existsSync(Path.join(this.config.workspacePath,pkgs[i].packageIdentifier));
               this.packages[pkgs[i].packageIdentifier].currentWd = pkgs[i].packageIdentifier === this.currentPackageName;
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
