const Logger = require("../Logger.js")();

class AndroidPackageManager
{
    static BINARY = "pm";
    
    /**
     * 
     * @param {Device} pDevice 
     * @param {String} pAppName 
     */
    static getApkPathOf(pDevice, pAppName){
        
        let buff = null; 
        
        try{
            buff = pDevice.execSync(AndroidPackageManager.BINARY+' path '+pAppName);
        
            buff = buff.toString();
            if(buff.startsWith("package:")){
                buff = buff.substring(8,buff.indexOf( require('os').EOL ));
            }else{
                Logger.error("[PM] Package not found");
                Logger.debug(buff);
                buff = null;
            }
        }catch(exception){
            Logger.error("[PM] Package not found");
            buff = null;
        }
        
        return buff;        
    }
}

module.exports = AndroidPackageManager;