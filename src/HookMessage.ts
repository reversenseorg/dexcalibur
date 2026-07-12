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

import {CoreDebug} from "./core/CoreDebug.js";


export default class HookMessage
{

    data:any = null;
    msg:string = null;
    match:boolean = null;
    isIntercept:boolean = false;
    hook:string = null;
    when:number = null;
    action:string = "";
    tags:any = null;

    /**
     * To represent a message sent by a hook from the device to the desktop
     * @constructor
     */
    constructor(pConfig:any=null){
        if(pConfig!=null){
            for(let i in pConfig)
                this[i] = pConfig[i];
        }
        return this;
    }

    isBefore():boolean{
        return this.when <= 0;
    }

    isAfter():boolean{
        return this.when>0;
    }

    getHook():string{
        return this.hook;
    }

    setTags(tags:any){
        this.tags = tags;
    }

    getTags():any{
        return this.tags;
    }

    addTag(tag:any){
        if(this.tags == null) this.tags = [];
        this.tags.push(tag);
    }
    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} Returns an Object instance representing the type
     */
    toJsonObject():any{
        let o:any = new Object();
        o.data = this.data;
        o.hook = this.hook;
        o.msg = this.msg;
        o.match = this.match;
        o.action = this.action;
        o.isIntercept = this.isIntercept;

        if(this.tags != null && this.tags.length > 0)
            o.tags = this.tags;

        o.after = this.isAfter();
        o.before = this.isBefore();

        CoreDebug.checkJsonSerialize(o, "HookMessage");
        return o;
    }
}
