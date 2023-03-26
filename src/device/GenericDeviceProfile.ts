
import {GenericSystemProfile} from "./profile/GenericSystemProfile.js";
import GenericTrustProfile from "./profile/GenericTrustProfile.js";
import GenericBuildProfile from "./profile/GenericBuildProfile.js";
import GenericNetworkProfile from "./profile/GenericNetworkProfile.js";
import DeviceProfile from "./DeviceProfile.js";


enum TYPE {
    mobile= 'mobile',
    watch= 'watch',
    tv= 'tv',
    automotive='automotive',
    iot='iot',
    computer='computer',
    other= 'other'
}


export interface DeviceProfileMap {
    system?: GenericSystemProfile,
    trust?: GenericTrustProfile,
    build?: GenericBuildProfile,
    network?: GenericNetworkProfile
}


/**
 *
 *
 * TODO: Refactor as AndroidDeviceProfile, add IDeviceProfile interface
 *
 * @class
 * @author Georges-B MICHEL
 */
export default class GenericDeviceProfile extends DeviceProfile
{
    /**
     * 
     * @param {*} pOptions 
     * @constructor
     */
    constructor( pOptions:any = {}){
        super(pOptions);
    }


    static fromJsonObject( pJson:any):GenericDeviceProfile {

        const o = new GenericDeviceProfile();

        for(const i in pJson){
            if(i == "profiles"){
                o.profiles = {};
                for(const k in pJson.profiles){
                    switch(k){
                        case 'system':
                            o.profiles.system = GenericSystemProfile.fromJsonObject(pJson.profiles.system);
                            break;
                        case 'network':
                            o.profiles.network = GenericNetworkProfile.fromJsonObject(pJson.profiles.network);
                            break;
                        case 'trust':
                            o.profiles.trust = GenericTrustProfile.fromJsonObject(pJson.profiles.trust);
                            break;
                        case 'build':
                            o.profiles.build = GenericBuildProfile.fromJsonObject(pJson.profiles.build);
                            break;
                    }
                }
            }else
                o[i] = pJson[i];
        }

        return o;
    }
}
