
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

import * as _fs_ from "fs";

import AdbWrapper from "./AdbWrapper.js";
import {Device} from "./Device.js";
import {IBridge, IBridgeFactory} from "./Bridge.js";

let gInstance:AdbWrapperFactory = null;


/**
 * To create AdbWrapper instances : generic or pre-associated to a device
 * 
 * @class
 * @author Georges-B. MICHEL
 */
export default class AdbWrapperFactory implements IBridgeFactory
{
    /**
     * Path to "adb" executable
     * @type {string}
     * @field
     */
    path:string = null;

    /**
     * 
     * @param {require('path').Path} pAdbPath Path to ADB binary
     * @constructor
     */
    constructor( pAdbPath:string){
        this.path = pAdbPath;
    }


    /**
     * To check if ADB server is ready
     * 
     * @returns {Boolean} TRUE if ADB is reeady, else FALSE
     * @method
     */
    isReady():boolean{
        return (this.path != null) && (_fs_.existsSync(this.path));
    }


    /**
     * 
     * @param {require('path').Path} pAdbPath Path to ADB binary
     * @returns {AdbWrapperFactory} AdbWrapper factory
     * @method
     * @static
     */
    static getInstance( pAdbPath:string=null, pOverride:boolean = false):AdbWrapperFactory{

        if(gInstance == null || pOverride==true){
            if(_fs_.existsSync(pAdbPath)){
                gInstance = new AdbWrapperFactory( pAdbPath);
            }else{
                throw new Error("[ADB WRAPPER] ADB binary '"+pAdbPath+"' is not found.");
            }
        }

        return gInstance;
    }


    /**
     * To create a generic AdbWrapper
     * 
     * Commands executed by this wrapper not contain device ID (-u / -s / -e)
     * 
     * @method
     * @returns {AdbWrapper} AdbWrapper instance
     * @public
     * @method
     */
    newGenericWrapper():IBridge{
        return new AdbWrapper( gInstance.path);
    }

    /**
     * To create a virtual AdbWrapper to bridge and mock
     * communication with Virtual Dexcalibur Device (VDEv)
     *
     * @returns {AdbWrapper} AdbWrapper instance
     * @public
     * @method
     */
    newVirtualWrapper():IBridge{
        const v = new AdbWrapper( gInstance.path);
        v.turnVirtualMode();
        v.shortname = "VADB";
        return v;
    }

     /**
     * To create a device-specific AdbWrapper
     * 
     * For each commands issued by this wrapper,  the device ID is specified
     * 
     * @method
     * @returns {AdbWrapper} AdbWrapper instance
     * @public
     * @method
     */
    newSpecificWrapper( pDevice:Device):IBridge{
        
        return pDevice.getDefaultBridge().clone();
    }


    /**
     * To create AdbWrapper instance from serialized object
     *
     * @param {any} pObject Serialized object
     * @return {AdbWrapper}
     * @method
     */
    fromJsonObject(pObject:any):any{
        return AdbWrapper.fromJsonObject(pObject);
    }
}
