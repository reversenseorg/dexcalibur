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