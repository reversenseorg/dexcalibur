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

import {ValidationRule} from "@reversense/dexcalibur-orm";
import {Nullable} from "@reversense/dxc-core-api";
import {VirtualDeviceFactoryException} from "../error/VirtualDeviceFactoryException.js";



export enum OptsPurpose {
    DEFAULT,
    NETWORK,
    UI,
    SYSTEM,
    DEBUG
}

export interface EmulatorOptionSetting {
    name:EmulatorOptionID,
    value?:string,
    descr?:string,
    /**
     * To set if value is required (TRUE) or not (FALSE)
     */
    required?:boolean,
    purpose?:OptsPurpose,
    rule?:ValidationRule
}

export type EmulatorOptionID = string;

export class EmulatorOption {

    name:EmulatorOptionID;

    value?:string;

    descr:string = "";
    /**
     * To set if value is required (TRUE) or not (FALSE)
     */
    required:boolean = false;

    purpose:OptsPurpose = OptsPurpose.DEFAULT;

    rule:Nullable<ValidationRule> = null;

    constructor(pOptions:EmulatorOptionSetting) {
        this.name = pOptions.name;
        this.value = pOptions.value;
        this.descr = pOptions.descr;
        this.required = pOptions.required;
        this.purpose = pOptions.purpose;
        this.rule = pOptions.rule;
    }

    /**
     * To check if the value is valid
     *
     * @returns {boolean}
     * @method
     */
    isValid(pValue:any):boolean{

        if(this.rule==null){
            throw VirtualDeviceFactoryException.OPTION_CANNOT_BE_VALIDATED(this.name);
        }

        if(!this.rule.test(pValue)){
            console.log(pValue, this.rule.refValue);
            throw VirtualDeviceFactoryException.OPTION_VALUE_IS_INVALID(this.name);
        }

        return true;
    }

    getName():EmulatorOptionID {
        return this.name;
    }

    getValue():string {
        return this.value;
    }

    toJsonObject():any {
        return {
            name: this.name,
            value: this.value,
            descr: this.descr,
            required: this.required,
            purpose: this.purpose,
            rule: this.rule
        };
    }
}