/**
 *
 * @class
 * @author Georges-B MICHEL
 */
import {IProfile} from "./IProfile.js";
import {CoreDebug} from "../../core/CoreDebug.js";


/**
 * Generic class to hold results from device profiling
 */
export class Profile implements IProfile
{
    uid:string;

    requireRoot:boolean;

    nosy = false;

    prop:any;

    constructor(){
        this.prop = {};
    }

    isNosy():boolean {
        return this.nosy;
    }

    is(pData:any):boolean{
        return false;
    }

    /**
     *
     * @param {*} pName
     * @param {*} pValue
     */
    setProperty( pName:string, pValue:any){
        this.prop[pName] = pValue;
    }


    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):Profile{
        const o:Profile = new Profile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }

    /**
     * @method
     */
    toJsonObject(pExclude = []):any{
        const o:any = {};
        for(const i in this){
            if(pExclude.indexOf(i)>-1) continue;
            o[i] = this[i];
        }
        CoreDebug.checkJsonSerialize(o, "Profile");
        return o;
    }

    toSave(pOptions?:any):any{
        return this.toJsonObject(pOptions);
    }
}

