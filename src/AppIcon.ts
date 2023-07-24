import {CoreDebug} from "./core/CoreDebug.js";


/**
 * Represent an application icon
 *
 * @class
 */
export class AppIcon {

    data:Buffer = null;

    localPath:string = "";
    appPath:string = "";

    /**
     * Icon Size
     */
    size:any = null;

    format:string = null;

    /**
     * @constructor
     * @param pConfig
     */
    constructor( pConfig:any = {}) {
        for(let i in pConfig)
            if(this.hasOwnProperty(i))
                this[i] = pConfig[i];
    }

    toJsonObject(){
        //let o:any = new Object();
        //for(let i in this) o[i] = this[i];
        const  o  =this;
        CoreDebug.checkJsonSerialize(o, "AppIcon");
        return o;
    }

}