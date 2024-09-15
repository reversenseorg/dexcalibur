import {CoreDebug} from "./core/CoreDebug.js";


export enum AppIconFormat {
    VECTOR = 'vector',
    PNG = 'png'
}





/**
 * Represent an application icon
 *
 * @class
 */
export class AppIcon {

    fmt:AppIconFormat = AppIconFormat.VECTOR;

    data:any;

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

