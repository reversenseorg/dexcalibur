/**
 * Represent an Android package
 *
 * @class
 */
import {AppIcon} from "../AppIcon";

/**
 * @class
 */
export class ApkPackage {

    uid:string = "";

    size:number = -1;

    checksum:any = {};

    icon:AppIcon = null;

    md5:string = "";
    sha1:string = "";
    sha256:string = "";

    resources:any = null;
    assets:any = null;
    libs:any = null;


    constructor(pConfig:any={}) {
        for(let i in this)
            if(this.hasOwnProperty(i))
                this[i] = pConfig[i];
    }


}