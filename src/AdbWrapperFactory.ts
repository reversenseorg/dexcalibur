
import * as _fs_ from "fs";

import AdbWrapper from "./AdbWrapper";
import {Device} from "./Device";
import {IBridge, IBridgeFactory} from "./Bridge";

let gInstance:AdbWrapperFactory = null;


/**
 * To create AdbWrapper instances : generic or pre-associated to a device
 * 
 * @class
 * @author Georges-B. MICHEL
 */
export default class AdbWrapperFactory implements IBridgeFactory
{
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
    static getInstance( pAdbPath:string, pOverride:boolean = false):AdbWrapperFactory{

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


    fromJsonObject(pObject:any):any{
        return AdbWrapper.fromJsonObject(pObject);
    }
}
