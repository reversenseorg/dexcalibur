/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
    static getPathOf(pDevice:Device, pAppName:string):string{
        
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
