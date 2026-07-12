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

import {Access, AccessMap} from "../Access.js";

export interface  UserRoleMap {
    [uid:string] :UserRole;
}

/**
 * @deprecated
 */
export class UserRole {

    private _uid:string = null;
    private _name:string ;
    private _access:AccessMap = {};

    constructor( pUID:string, pName:string, pAccessMap:AccessMap = {}) {
        this._uid = pUID;
        this._name = pName;
        this._access = pAccessMap;
    }


    get uid(): string {
        return this._uid;
    }

    set uid(value: string) {
        this._uid = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get access(): AccessMap {
        return this._access;
    }

    set access(value: AccessMap) {
        this._access = value;
    }

    addAccess(pAccess:Access):void {
        this._access[pAccess.name] = pAccess;
    }

    hasAccess(pAccess:Access):boolean {
        return (this._access[pAccess.name] != null)
    }

    toJsonObject():any {

    }
}
