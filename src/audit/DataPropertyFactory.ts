
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

import DataProperty from "./common/DataProperty.js";
import DexcaliburProject from "../DexcaliburProject.js";

export enum MetaSecurityProperty {
    AUTHENTICITY="authenticity",
    INTEGRITY="integrity",
    NON_REP="non-repudiability",
    CONFIDENTIALITY="confidentiality",
    AVAILABITY="availability",
    AUTHORIZATION="authorization",
}

export interface DataPropertyMap {
    [uid:string] :DataProperty
}

export default class DataPropertyFactory {

    ctx:DexcaliburProject;
    preset:DataPropertyMap = {};

    constructor(pContext:DexcaliburProject) {
        this.ctx = pContext;

        this._initPresetProperties();
    }

    /**
     * To init preset data properties
     *
     * @private
     */
    private _initPresetProperties(){
        const ppt = Object.keys(MetaSecurityProperty);
        const tag = this.ctx.getTagManager().getTag('audit.type.security');

        ppt.map( p => {
            this.preset[p] = new DataProperty({ name:MetaSecurityProperty[p], tag:[tag.getUUID()] })
        });
    }



}