import {Profile} from "./Profile.js";
import Certificate from "../../formats/common/Certificate.js";
import {CoreDebug} from "../../core/CoreDebug.js";

export default abstract class GenericTrustProfile extends Profile {


    uid = "Generic_AC";

    customCAs:Certificate[] = [];
    systemCAs:Certificate[] = [];

    abstract getCustomCAs():Certificate[];
    abstract getSystemCAs():Certificate[];


    /**
     * @method
     * @override
     */
    toJsonObject(pExclude:string[]=['_raw']):any{
        const o:any = {};
        for(const i in this){
            switch (i){
                case 'customCAs':
                    o.customCAs = [];
                    this.customCAs.map( (vCert)=>{ if(vCert!=null) o.customCAs.push(vCert.toJsonObject(pExclude)) });
                    break;
                case 'systemCAs':
                    o.systemCAs = [];
                    this.systemCAs.map( (vCert)=>{ if(vCert!=null) o.systemCAs.push(vCert.toJsonObject(pExclude)) });
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "GenericTrustProfile");
        return o;
    }

    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):GenericTrustProfile{
        const o:GenericTrustProfile = super.fromJsonObject(pJson) as GenericTrustProfile;
        for(const i in pJson){
            switch (i) {
                case 'customCAs':
                    o.customCAs = [];
                    pJson.customCAs.map( x => {
                        o.customCAs.push( Certificate.fromJsonObject(x) )
                    });
                    break;
                case 'systemCAs':
                    o.systemCAs = [];
                    pJson.systemCAs.map( x => {
                        o.systemCAs.push( Certificate.fromJsonObject(x) )
                    });
                    break;
                default:
                    o[i] = pJson[i];
                    break;
            }

        }
        return o;
    }
}