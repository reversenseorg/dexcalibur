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

import {Profile} from "../../device/profile/Profile.js";
import {Device} from "../../Device.js";
import * as Log from "../../Logger.js";
import {NosyProfile} from "../../device/profile/NosyProfile.js";
import {IBridge} from "../../Bridge.js";
import {IProfile} from "../../device/profile/IProfile.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface AdbKey {
    publicKey:string;
    username:string;
    host:string;
}

/**
 *
 * @class
 * @since 1.1.0
 */
export default class AndroidUsbProfile extends Profile implements NosyProfile{

    uid = "Android_USB";

    requireRoot = true;

    nosy = true;

    adbPKs:AdbKey[] = [];

    is(pData:any){
        const patterns = [
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
     * @param pDevice
     * @method
     * @async
     * @since 1.1.0
     */
    async performProfiling(pBridge:IBridge, pOptions = null):Promise<IProfile> {
        // cat /data/misc/adb/adb_keys
        const RE = /^(.+)\s([^@]+)@(.+)$/;
        let success:IProfile;

        this.adbPKs = [];

        try{
            let ctn = await pBridge.privilegedShell("cat /data/misc/adb/adb_keys");

            if(typeof (ctn)!=='string'){
                ctn = (ctn as Buffer).toString();
            }
            ctn.split("\n").map( (vLine:string)=>{
                const matches = RE.exec(vLine);
                if(matches!=null && vLine==matches[0]){
                    this.adbPKs.push({
                        publicKey: matches[1],
                        username: matches[2],
                        host: matches[3]
                    });
                }
            });
            success = this;
        }catch(e){
            Logger.error("[DEVICE][PROFILING][USB] ADB keys cannot be dumped : "+e.message);
            success = null;
        }

        return success;
    }

    /**
     * To get every ADB public keys added by the customers
     *
     * @return {AdbKey[]} The list of configured ADB public keys
     * @method
     * @since 1.1.0
     */
    getAdbPublicKeys():AdbKey[] {
        return this.adbPKs;
    }



    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):AndroidUsbProfile{
        const o:AndroidUsbProfile = new AndroidUsbProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }
}