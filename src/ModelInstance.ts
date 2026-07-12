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

import ModelFile from "./ModelFile.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CodeLocation, LocationType, ModelLocation} from "./ModelLocation.js";
import {Nullable} from "./core/IStringIndex.js";

export interface ContextLocation {
    __: NodeInternalType,
    uid:string;
    offset?:number;
    bb?:number;
    line?:number;
}

/**
 * @class
 */
export class ModelInstance {

    /**
     * Instance location
     */
    location:ModelLocation = CodeLocation.MEM;

    /**
     * Runtime session
     */
    session:Nullable<string> = null;

    /**
     * Catcher : hook who caught the instance
     */
    catcher:Nullable<any> = null;

    /**
     * Context location (method, function, lib+offset,  ...)
     */
    ctx:Nullable<ContextLocation> = null;


    constructor(pConfig:any=null) {
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }


    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getLocation():ModelLocation {
        return this.location;
    }


    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getContext():ContextLocation {
        return this.ctx;
    }
    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getSession():string {
        return this.session;
    }


    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getCatcher():any {
        return this.catcher;
    }

    /**
     *
     */
    isFileLocated():boolean {
        return (this.location.getType() == LocationType.FILE);
    }

    /**
     *
     */
    isMemoryLocated():boolean {
        return (this.location.getType() == LocationType.MEM);
    }

    /**
     *
     */
    toJsonObject():any{
        return {
          location: this.location,
          ctx: this.ctx,
          catcher: this.catcher!=null ? this.catcher.getUID() : null,
          sessions: this.session
        };
    }
}

