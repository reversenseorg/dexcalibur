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

import {Profile} from "./Profile.js";
import Certificate from "../../formats/common/Certificate.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {SerializeOptions} from "@dexcalibur/dexcalibur-orm";

export default abstract class GenericTrustProfile extends Profile {


    uid = "Generic_AC";

    customCAs:Certificate[] = [];
    systemCAs:Certificate[] = [];

    abstract getCustomCAs():Certificate[];
    abstract getSystemCAs():Certificate[];


    /**
     * @method
     * @override
     */
    toJsonObject(pOptions:SerializeOptions = {exclude:{_raw:true}}):any{
        const o:any = {};
        for(const i in this){
            switch (i){
                case 'customCAs':
                    o.customCAs = [];
                    this.customCAs.map( (vCert)=>{ if(vCert!=null) o.customCAs.push(vCert.toJsonObject(pOptions)) });
                    break;
                case 'systemCAs':
                    o.systemCAs = [];
                    this.systemCAs.map( (vCert)=>{ if(vCert!=null) o.systemCAs.push(vCert.toJsonObject(pOptions)) });
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "GenericTrustProfile");
        return o;
    }

    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):GenericTrustProfile{
        const o:GenericTrustProfile = super.fromJsonObject(pJson) as GenericTrustProfile;
        for(const i in pJson){
            switch (i) {
                case 'customCAs':
                    o.customCAs = [];
                    pJson.customCAs.map( x => {
                        o.customCAs.push( Certificate.fromJsonObject(x) )
                    });
                    break;
                case 'systemCAs':
                    o.systemCAs = [];
                    pJson.systemCAs.map( x => {
                        o.systemCAs.push( Certificate.fromJsonObject(x) )
                    });
                    break;
                default:
                    o[i] = pJson[i];
                    break;
            }

        }
        return o;
    }
}