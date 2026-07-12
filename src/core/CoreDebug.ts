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

import {NodeInternalTypeName} from "@dexcalibur/dxc-core-api";;

/**
 * Helper to debug core feature
 *
 * @class
 */
export class CoreDebug {

    static CHECK_JSON = true;

    /**
     * Helper to detect circular reference error when data are serialized.
     *
     * If CoreDebug.CHECK_JSON is TRUE, then `JSON.stringify()` will be applied to the output of every `*.toJsonObject()`
     * call
     *
     * @param pObject
     */
    static checkJsonSerialize( pObject:any, pSource = ""):void {
        if(CoreDebug.CHECK_JSON){
            try{
                JSON.stringify(pObject);
            }catch (e){
                let s = pSource+":";
                if(pObject.hasOwnProperty("__")){
                    s += "<"+NodeInternalTypeName[pObject.__]+"> ";
                }else{
                    s += "<TYPE NONE>";
                }

                Object.keys(pObject).map(k => {
                    const t = (typeof pObject[k]);
                    if(t==="string"||t==="number"){
                        s += `${k}= "${pObject[k]}" , `;
                    }else if(pObject[k]==null){
                        s += `${k}= null , `;
                    }else{
                        s += `${k}= [Object] , `;
                    }
                });


                console.error("[CORE DEBUG][checkJsonSerialize] "+s+"\n",e.stack);
            }
        }
    }
}