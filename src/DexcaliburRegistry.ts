
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

import { URL } from "url";

import * as Got from "got";
const got = Got.default;


import * as Log from './Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const PLATFORM_FOLDER = "platforms";
const DEVICE_FOLDER = "devices";

export enum RegistryType {
    REMOTE="remote",
    LOCAL="local"
}

export default class DexcaliburRegistry
{
    type:RegistryType = RegistryType.REMOTE;
    url:string;
    api:string;

    constructor( pRegistryURL:string, pRegistryApiURL:string ){

        this.url = pRegistryURL; //new URL(pRegistryURL);
        this.api = pRegistryApiURL; //new URL(pRegistryApiURL);
    }


    /**
     * To enumerates downloadable platform
     */
    async enumeratePlatforms():Promise<any>{
       
        let response:any = null;
        try {
            response = await got(this.api+"/platforms");
            response = JSON.parse(response.body);

        } catch (error) {
            Logger.error("[REGISTRY] enumeratePlatforms(): Unable to enumerate the remote registry : "+error.message);
            //throw new Error("[REGISTRY] enumeratePlatforms(): Unable to enumerate the remote registry");
            response = [];
        } finally {
           return response;
        }
    }

    async enumerateInspectors():Promise<any>{
       
        let response = null;
        try {
            response = await got(this.api+"/inspectors");
            response = JSON.parse(response.body);

        } catch (error) {
            Logger.error("[REGISTRY] enumerateInspectors(): Unable to enumerate the remote registry : "+error.message);
            throw new Error("[REGISTRY] enumerateInspectors(): Unable to enumerate the remote registry");
        } finally {

           return response;
        }
    }


    /**
     *
     * @param {string} pPath
     */
    static newLocal(pPath:string):DexcaliburRegistry{
        const reg = new DexcaliburRegistry("","");
        reg.type = RegistryType.LOCAL;
        return reg;
    }
}
