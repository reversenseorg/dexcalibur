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

import * as Log from "../../Logger.js";
import {NosyProfile} from "../../device/profile/NosyProfile.js";
import {IBridge} from "../../Bridge.js";
import Util from "../../Utils.js";
import GenericMountsProfile from "../../device/profile/GenericMountsProfile.js";
import { FileSystemMountOptions } from "../../device/filesystem/FileSystemMountOptions.js";
import FileSystemFactory from "../../device/filesystem/FileSystemFactory.js";
import {IProfile} from "../../device/profile/IProfile.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum MountPermission {
    READONLY= "ro",
    READWRITE= "rw",
}

export interface MountOptions {
    _raw:string;
    permission?:MountPermission;
    fsOpts?:FileSystemMountOptions;
}


export interface MountedFileSystem {
    partition:string;
    mountPoint:string;
    fsType:string;
    opts:MountOptions;
    dump?:number;
    fsckOrder?:number;
}



/**
 *
 * @class
 * @since 1.1.0
 */
export default class AndroidMountedFsProfile extends GenericMountsProfile implements NosyProfile{

    uid = "Android_Partitions";

    requireRoot = false;

    nosy = true;

    mounts:MountedFileSystem[] = [];

    is(pData:any){
        return false;
    }



    parseMountOptions(pBuffer: string, pFsType:string):MountOptions {
        const o:any[] = pBuffer.split(',');
        const opts:MountOptions = {
            _raw: pBuffer
        };

        o.filter( (v,offset) => {
            let ppt:string = v, val:string, keep=true;

            const i = v.indexOf('=');
            if(i>-1){
                ppt = v.substr(0,i);
                val = v.substr(i+1);
                o[offset] = { ppt:ppt, val:val };
            }

            switch(ppt){
                case "rw":
                    opts.permission = MountPermission.READWRITE;
                    keep = false;
                    break;
                case "ro":
                    opts.permission = MountPermission.READONLY;
                    keep = false;
                    break;
            }

            return keep;
        });


        opts.fsOpts = FileSystemFactory.parseMountOptions(pFsType, o);

        return opts;
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
        const RE = /^([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)(\s[^\s]+)?(\s[^\s]+)?$/;
        let ret:IProfile;

        this.mounts = [];

        try{
            let ctn = await pBridge.shell("cat /proc/mounts");

            if(typeof (ctn)!=='string'){
                ctn = (ctn as Buffer).toString();
            }

            ctn.split("\n").map( (vLine:string)=>{
                const matches = RE.exec(vLine);
                if(matches!=null && vLine==matches[0]){
                    const m:MountedFileSystem = {
                        partition: matches[1],
                        mountPoint: matches[2],
                        fsType: matches[3],
                        opts: null
                    };

                    if(matches[4]!=null){
                        m.opts = this.parseMountOptions(matches[4], m.fsType);
                    }

                    if(matches[5]!=null){
                        m.dump = parseInt(Util.trim(matches[5]));
                    }

                    if(matches[6]!=null){
                        m.fsckOrder = parseInt(Util.trim(matches[6]));
                    }

                    this.mounts.push(m);
                }
            });
            ret = this;
        }catch(e){
            Logger.error("[DEVICE][PROFILING][MOUNTS] Mounted file systems cannot be analyzed : "+e.message);
            Logger.error(e.stack);
            ret = null;
        }

        return ret;
    }

    /**
     * To get every ADB public keys added by the customers
     *
     * @return {AdbKey[]} The list of configured ADB public keys
     * @method
     * @since 1.1.0
     */
    getMountedFileSystem():MountedFileSystem[] {
        return this.mounts;
    }



    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):AndroidMountedFsProfile{
        const o:AndroidMountedFsProfile = new AndroidMountedFsProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }
}