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

import {RuntimeSecurityException} from "../errors/RuntimeSecurityException.js";


export abstract class IncomingValue {
    protected name:string;
    protected value:any;

    constructor( pName:string, pValue:any) {
        this.name = pName;
        this.value = pValue;
    }

    abstract getName(): string;
    abstract getValue(): any;
}

export class SanitizedValue extends IncomingValue {

    getName(): string {
        return this.name;
    }

    getValue(): any {
        return this.value;
    }
}

export class PassthroughValue extends IncomingValue {

    getName(): string {
        return this.name;
    }

    getValue(): any {
        return this.value;
    }
}



export class UnsafeValue extends IncomingValue {

    getName(): string {
        return this.name;
    }

    getValue(): any {
        throw RuntimeSecurityException.USE_OF_UNSAFE_VALUE(new PassthroughValue( this.name, this.value));
    }
}