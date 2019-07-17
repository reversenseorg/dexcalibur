const Adb = require('./AdbWrapper.js');

class PackagePatcher {
    constructor(config=null) {
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
    patchPackage(package_identifier) {
        
    }

    scan(){
       this.count = 0;
       if(this.Bridges.ADB.isReady()){
           var pkgs = this.Bridges.ADB.listPackages();
           this.count += pkgs.length;

           for(let i in pkgs){
               this.packages[pkgs[i].packageIdentifier] = pkgs[i];
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
