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

import {Person} from "./Person.js";
import {SharingConfiguration} from "./SharingConfiguration.js";

/**
 * Represent a Team
 *
 * A Team is a group of person sharing ressource (alias, comment, hook, file, terminal, device, ...)
 */
export class Team {


    private _name:string;
    private _owner:Person;
    private _members:Person[];
    private _sharedRes:any[] = [];
    private _sharingConfig:SharingConfiguration;

    get sharingConfig(): SharingConfiguration {
        return this._sharingConfig;
    }

    set sharingConfig(value: SharingConfiguration) {
        this._sharingConfig = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get owner(): Person {
        return this._owner;
    }

    set owner(value: Person) {
        this._owner = value;
    }

    get members(): Person[] {
        return this._members;
    }

    set members(value: Person[]) {
        this._members = value;
    }

    get sharedRes(): any[] {
        return this._sharedRes;
    }

    set sharedRes(value: any[]) {
        this._sharedRes = value;
    }
}