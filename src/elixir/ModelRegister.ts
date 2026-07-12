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

import {RegisterType} from "./common.js";
import {DataType} from "../types/DataType.js";

export interface ModelRegisterOptions {
    type?: RegisterType;
    id: number;
    dataType?: DataType;
    name?: string;
    initialValue?:any;
}

/**
 * Represents a model register with defined properties and initialization options.
 */
export class ModelRegister {

    type?: RegisterType;
    id: number;
    dataType?: DataType;
    name?: string;
    initialValue?:any;
    //history:Record<number,{sess:HookSessionUUID, val:any}> = {};

    constructor(pOptions:ModelRegisterOptions) {
        if(pOptions.type!=null) this.type=pOptions.type;
        if(pOptions.id!=null) this.id=pOptions.id;
        if(pOptions.dataType!=null) this.dataType=pOptions.dataType;
        if(pOptions.name!=null) this.name=pOptions.name;
        if(pOptions.initialValue!=null) this.initialValue=pOptions.initialValue;
    }

    setInitialValue( pValue:any):void {
        this.initialValue=pValue;
    }
}