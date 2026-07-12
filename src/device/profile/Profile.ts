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

/**
 *
 * @class
 * @author Georges-B MICHEL
 */
import {IProfile} from "./IProfile.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {IStringIndex, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../../core/IStringIndex.js";
import DeviceProfile from "../DeviceProfile.js";


/**
 * Generic class to hold results from device profiling
 */
export class Profile implements IProfile
{
    uid:string;

    requireRoot:boolean = false;

    nosy = false;

    prop:any;

    onAfter = ((vProf:DeviceProfile, vOpts:any):void=>{});

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
    toJsonObject(pOptions:SerializeOptions = {exclude:{}}):any{
        const exclude:Nullable<IStringIndex<boolean>> = (pOptions!=null ? pOptions.exclude : {})
        const o:any = {};
        for(const i in this){
            if(exclude!=null && exclude[i]===true) continue;
            o[i] = this[i];
        }
        CoreDebug.checkJsonSerialize(o, "Profile");
        return o;
    }

    toSave(pOptions?:SerializeOptions):any{
        return this.toJsonObject(pOptions);
    }
}

