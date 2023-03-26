import GenericNetworkProfile from "../../device/profile/GenericNetworkProfile.js";


export default class AndroidNetworkProfile extends GenericNetworkProfile {

    uid = "Android_Network";

    requireRoot = false;

    is(pData:any){
        const patterns = [
            new RegExp('^.*\.radio\.'),
            new RegExp('^.*\.net\.'),
            new RegExp('^.*\.wlan\.'),
            new RegExp('^.*\.telephony\.'),
            new RegExp('^.*\.ril\.'),
            new RegExp('^.*\.wifi\.'),
        ];

        for(let i=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }


    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):AndroidNetworkProfile{
        const o:AndroidNetworkProfile = new AndroidNetworkProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }
}