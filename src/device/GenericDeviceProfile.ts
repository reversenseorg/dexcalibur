
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
