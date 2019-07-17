const Adb = require('./AdbWrapper');

class PackagePatcher {
    constructor(config=null) {
        this.Bridges = {
            ADB: new AdbWrapper(this.config.getAdbPath(),null)
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
        // TODO : scan for new devices
        let ret="", packages=[], device=null,re=null,id=null;

       this.count = 0;
       if(this.Bridges.ADB.isReady()){
           pkgs = this.Bridges.ADB.listPackages();
           this.count += pkgss.length;

           for(let i in pkgs){
               this.packages[pks[i].packageIdentifier] = pkgs[i];
           }
           ut.msgBox("Android packages", Object.keys(this.packages));
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
