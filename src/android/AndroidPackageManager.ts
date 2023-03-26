import * as Log from "../Logger.js";
import {Device} from "../Device.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidPackageManager
{
    static BINARY = "pm";
    
    /**
     * 
     * @param {Device} pDevice 
     * @param {String} pAppName 
     */
    static getApkPathOf(pDevice:Device, pAppName:string):string{
        
        let buff:string = null;
        
        try{
            buff = pDevice.execSync(AndroidPackageManager.BINARY+' path '+pAppName).toString();

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
