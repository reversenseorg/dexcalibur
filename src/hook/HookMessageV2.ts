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

import {AbstractHook} from "./AbstractHook.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import HookSession from "../HookSession.js";
import {CoreDebug} from "../core/CoreDebug.js";


export default class HookMessageV2
{
    /**
     *
     */
    uid:number = null;

    /**
     * Hook ID
     *
     * Hook message can be trigged at different time (before/after/replace)
     *
     * It helps to locate WHERE the hook has been trigged
     *
     * @field
     */
    hid:string = null;

    /**
     * Fragment ID
     *
     * Several hook can have same fragment
     *
     * It helps to locate WHEN the hook has been trigged
     *
     * @field
     */
    fid:string = null;

    data:any = null;

    /**
     * Allow to override event name from associated strategy
     */
    event?:string = null;

    hook?:AbstractHook;

    frag?:HookTemplateFragment;

    session:any = null;

    when?:number = null;


    /**
     * To represent a message sent by a hook from the device to the desktop
     * @constructor
     */
    constructor(pConfig:any=null){
        if(pConfig!=null){
            for(const i in pConfig)
                this[i] = pConfig[i];
        }
        return this;
    }

    getFragment():HookTemplateFragment  {
        return this.frag;
    }

    getHook():AbstractHook  {
        return this.hook;
    }

    setSession(pSession:HookSession){
        this.session=pSession;
    }



    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} Returns an Object instance representing the type
     */
    toJsonObject():any{
        let o:any = new Object();
        o.uid = this.uid;
        o.data = {};
        for (let k in this.data) {
            if (k.startsWith("__hidden__")) {
                o.data[k] = null;
            } else {
                o.data[k] = this.data[k];
            }
        }
        o.hid = this.hid;
        o.fid = this.fid;

        //if(this.tags != null && this.tags.length > 0)
        //    o.tags = this.tags;
        CoreDebug.checkJsonSerialize(o, "HookMessageV2");
        return o;
    }
}
