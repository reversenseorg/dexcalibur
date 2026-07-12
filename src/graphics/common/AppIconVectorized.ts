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

import {AppIcon, AppIconFormat} from "../../AppIcon.js";

export interface VectorComponent {
    type:string;
    attr?:Record<string, any>;
    children?:VectorComponent[];
}

export class AppIconVectorized extends AppIcon {
    fmt = AppIconFormat.VECTOR;
    data:VectorComponent[] = [];

    constructor() {
        super();
    }

    setData(pData:any):void {
        this.data = pData;
    }

    /**
     *
     */
    toJsonObject(): any {
        const o = this.toJsonObject();
        o.fmt = this.fmt;
        if(this.data!=null){
            o.data = this.data;
        }
        return o;
    }
}