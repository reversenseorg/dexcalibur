import GenericBuildProfile from "../../device/profile/GenericBuildProfile.js";



export default class AndroidBuildProfile extends GenericBuildProfile {

    uid = "Android_Vendor";

    requireRoot = false;

    is(pData:any):boolean{
        const patterns = [
            new RegExp('^ro\.build\.'),
            new RegExp('^ro\.hwui\.'),
            new RegExp('^ro\.error\.'),
            new RegExp('^.*\.dalvik\.'),
        ];

        for(let i=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }

    getAbi(){
        return this.prop['ro.cpu']
    }

    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):AndroidBuildProfile{
        const o:AndroidBuildProfile = new AndroidBuildProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }

}