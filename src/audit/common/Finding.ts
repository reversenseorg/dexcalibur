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

import {CoreDebug} from "../../core/CoreDebug.js";

export interface FindingOptions {
    node?:any;
    kb?:any;
    impact?:number;
    trust?:number;
}

/**
 * Represent a finding after a scan
 */
export class Finding  {

    node:any;

    kb:any = null;

    impact:number = 1;

    trust:number = 1;

    constructor( pConfig:FindingOptions) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    getTrust():number {
        return this.trust;
    }

    getImpact():number {
        return this.impact;
    }

    toJsonObject():any {
        let o:any = {};

        for(const i in this){
            switch (i){
                case 'node':
                    if(this.node!=null){
                        if(this.node.toJsonObject!=null){
                            o.node = this.node.toJsonObject();
                        }else{
                            o.node = this.node;
                        }
                    }else{
                        o.node = null;
                    }
                    break;
                case 'kb':
                    o.kb = (this.kb!=null) ? this.kb.getUID() : null;
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }

        CoreDebug.checkJsonSerialize(o, "Finding");
        return o;
    }
}