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

import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {GenericSystemProfile} from "./profile/GenericSystemProfile.js";
import GenericTrustProfile from "./profile/GenericTrustProfile.js";
import GenericBuildProfile from "./profile/GenericBuildProfile.js";
import GenericNetworkProfile from "./profile/GenericNetworkProfile.js";
import {IProfile} from "./profile/IProfile.js";
import {DeviceProfilingOptions, IBridge} from "../Bridge.js";
import GenericMountsProfile from "./profile/GenericMountsProfile.js";
import * as Log from "../Logger.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {GenericMemoryProfile} from "./profile/GenericMemoryProfile.js";
import GenericInputProfile from "./profile/GenericInputProfile.js";


export enum TYPE {
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
    network?: GenericNetworkProfile,
    mounts?: GenericMountsProfile
    inputs?: GenericInputProfile
}

export interface ProfileMap {
    [name:string] :IProfile;
}


const Logger:Log.ProdLogger = Log.newLogger() as Log.ProdLogger;

/**
 *
 *
 * TODO: Refactor as AndroidDeviceProfile, add IDeviceProfile interface
 *
 * @class
 * @author Georges-B MICHEL
 */
export default class DeviceProfile
{
    os: OperatingSystem;
    type:TYPE;
    sys_prop:any = {};
    profiles:ProfileMap = {};



    /**
     * 
     * @param {*} pOptions 
     * @constructor
     */
    constructor( pOptions:any = {}){

        this.type = TYPE.mobile;

        for(const i in pOptions){
            this[i] = pOptions[i];
        }
    }

    update( pBridge:IBridge, pOptions:DeviceProfilingOptions):void {
        // nothing to do
    }


    /**
     * To check if the device is a mobile
     * 
     * @returns {Boolean}
     * @method
     */
    isMobileDevice():boolean{
        return this.type == TYPE.mobile;
    }

    /**
     * @method
     */
    isWatch():boolean{
        return this.type == TYPE.watch;
    }

    /**
     * @method
     */
    isTV():boolean{
        return this.type == TYPE.tv;
    }

    /**
     * @method
     */
    isComputer():boolean{
        return this.type == TYPE.computer;
    }

    /**
     * @method
     */
    isAutomotive():boolean{
        return this.type == TYPE.automotive;
    }

    /**
     * @method
     */
    isIoT():boolean{
        return this.type == TYPE.iot;
    }

    /**
     * To perform basic detection of emulator mainly based on device ID
     *
     * @return {boolean} Return TRUE if the device is emulated else FALSE.
     * @method
     */
    isEmulated():boolean {
        return this.getSystemProfile().isEmulator();
    }

    /**
     * 
     * @param {*} pName 
     * @param {*} pValue 
     * @method
     */
    addProperty( pName:string, pValue:any, pAsSys=true):boolean{
        let profiled = false;

        if(pAsSys) this.sys_prop[pName] = pValue;

        for(const i in this.profiles){
            if(this.profiles[i].is(pName)){
                this.profiles[i].setProperty(pName, pValue);
                profiled = true;
            }
        }
        return profiled;
    }


    /**
     *
     * @param {*} pName
     * @param {*} pValue
     * @method
     */
    refresh():boolean{

        for(const ppt in this.sys_prop){
            for(const i in this.profiles){

                Logger.debug("[DEVICE][PROFILE] is() : "+i+" ");
                if(this.profiles[i].is(ppt)){
                    this.profiles[i].setProperty(ppt, this.sys_prop[ppt]);
                }
            }
        }

        return true;
    }

    getProfiles(pUIDs:string[] = null):ProfileMap{
        if(pUIDs != null && pUIDs.length>0){
            const prof:ProfileMap = {};
            pUIDs.map( id => { prof[id] = this.profiles[id]; });
            return prof;
        }else{
            return this.profiles;
        }
    }

    /**
     * @method
     */
    getMemoryProfile():GenericMemoryProfile{
        return this.profiles.mem as GenericMemoryProfile;
    }


    /**
     * @method
     */
    getSystemProfile():GenericSystemProfile{
        return this.profiles.system as GenericSystemProfile;
    }

    /**
     * @method
     */
    getTrustProfile():GenericTrustProfile{
        return this.profiles.trust as GenericTrustProfile;
    }

    /**
     * @method
     */
    getBuildProfile():GenericBuildProfile{
        return this.profiles.build as GenericBuildProfile;
    }

    /**
     * @method
     */
    getNetworkProfile():GenericNetworkProfile{
        return this.profiles.network as GenericNetworkProfile;
    }

    /**
     * @method
     */
    getMountedFsProfile():GenericMountsProfile{
        return this.profiles.mounts as GenericMountsProfile;
    }

    /**
     * To get the profile of input devices available for the device
     *
     * @return {GenericInputProfile}
     * @method
     */
    getInputProfile():GenericInputProfile{
        return this.profiles.inputs as GenericInputProfile;
    }

    /**
     * @method
     */
    toJsonObject( pOptions:SerializeOptions = {}):any{
        const exclude = pOptions.exclude!=null ? pOptions.exclude : null;
        const o:any = {};

        for(const i in this){
            if(exclude!=null && exclude[i]===true) continue;
            
            if(i == "profiles"){
                o.profiles = {};
                for(const k in this.profiles){
                    o.profiles[k] = this.profiles[k].toJsonObject();
                }
            }else
                o[i] = this[i];
        }
        CoreDebug.checkJsonSerialize(o, "DeviceProfile");
        return o;
    }

    toSave(pOptions:any = null):any{
        const o:any = {};

        for(const i in this){

            if(i == "profiles"){
                o.profiles = {};
                for(const k in this.profiles){
                    o.profiles[k] = this.profiles[k].toSave( (pOptions!=null && pOptions[k]!=null ? pOptions[k] : []) );
                }
            }else
                o[i] = this[i];
        }

        return o;
    }

    /**
     *
     * @param pName
     * @param pProfile
     */
    updateSubProfile(pName: string, pProfile: IProfile) {
        // todo: implement incremental update
        this.profiles[pName] = pProfile;
    }

    /**
     * To execute every profile which hook after
     */
    doAfter(pOptions:any) {
        for(let k in this.profiles){
            if(this.profiles[k].onAfter!=null){
                this.profiles[k].onAfter.apply(null,[this,pOptions]);
            }
        }
    }
}
