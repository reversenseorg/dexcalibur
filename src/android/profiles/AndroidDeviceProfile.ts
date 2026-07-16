
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

import AndroidBuildProfile from "./AndroidBuildProfile.js";
import AndroidNetworkProfile from "./AndroidNetworkProfile.js";
import AndroidSystemProfile from "./AndroidSystemProfile.js";
import {AndroidTrustProfile} from "./AndroidTrustProfile.js";
import {OperatingSystem} from "@reversense/dxc-core-api";
import DeviceProfile from "../../device/DeviceProfile.js";
import AndroidUsbProfile from "./AndroidUsbProfile.js";
import {DeviceProfilingOptions, IBridge} from "../../Bridge.js";
import * as Log from "../../Logger.js";
import AndroidMountedFsProfile from "./AndroidMountedFsProfile.js";
import AndroidMemoryProfile from "./AndroidMemoryProfile.js";
import AndroidInputProfile from "./AndroidInputProfile.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

const PROP_RE = /^\[(?<name>.*)\]\s*:\s*\[(?<value>.*)\]$/;

export default class AndroidDeviceProfile extends DeviceProfile {


    os:OperatingSystem = OperatingSystem.ANDROID;

    /**
     *
     * @param {*} pOptions
     * @constructor
     */
    constructor( pOptions:any = {}){
        super(pOptions);

        this.profiles = {
            //board: null,
            //radio: null,
            //dalvik: null,
            //tee: null,
            //crypto: null,
            mem: new AndroidMemoryProfile(),
            system: new AndroidSystemProfile(),
            network: new AndroidNetworkProfile(),
            trust: new AndroidTrustProfile(),
            build: new AndroidBuildProfile(),
            mounts: new AndroidMountedFsProfile(),
            usb: new AndroidUsbProfile(),
            inputs: new AndroidInputProfile()
        }
    }

    /**
     *
     * @param pBridge
     * @param pOptions
     */
    update( pBridge:IBridge, pOptions:DeviceProfilingOptions = null){

        if(Object.keys(this.sys_prop).length==0 || (pOptions.refresh==true)){
            try{
                const prop:string[] = pBridge.shellWithEHsync("getprop").toString().split("\n");
                prop.map(( ppt)=>{
                    const match:RegExpExecArray = PROP_RE.exec(ppt);

                    if(match != null)
                       this.addProperty(match.groups.name, match.groups.value);

                });
            }catch(err){
                Logger.error(err.message);
                Logger.error(err.stack);
            }
        }
    }

    static fromJsonObject( pJson:any):AndroidDeviceProfile {

        const o = new AndroidDeviceProfile();

        for(const i in pJson){
            if(i == "profiles"){
                o.profiles = {};
                for(const k in pJson.profiles){
                    switch(k){
                        case 'system':
                            o.profiles.system = AndroidSystemProfile.fromJsonObject(pJson.profiles.system);
                            break;
                        case 'network':
                            o.profiles.network = AndroidNetworkProfile.fromJsonObject(pJson.profiles.network);
                            break;
                        case 'trust':
                            o.profiles.trust = AndroidTrustProfile.fromJsonObject(pJson.profiles.trust);
                            break;
                        case 'build':
                            o.profiles.build = AndroidBuildProfile.fromJsonObject(pJson.profiles.build);
                            break;
                        case 'mounts':
                            o.profiles.mounts = AndroidMountedFsProfile.fromJsonObject(pJson.profiles.mounts);
                            break;
                        case 'usb':
                            o.profiles.usb = AndroidUsbProfile.fromJsonObject(pJson.profiles.usb);
                            break;
                        case 'mem':
                            o.profiles.mem = AndroidMemoryProfile.fromJsonObject(pJson.profiles.mem);
                            break;
                        case 'input':
                            o.profiles.input = AndroidMemoryProfile.fromJsonObject(pJson.profiles.mem);
                            break;
                    }
                }
            }else
                o[i] = pJson[i];
        }

        return o;
    }
}