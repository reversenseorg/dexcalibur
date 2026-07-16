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

import {UserAccount, UserAccountType} from "./UserAccount.js";
import {ValidationRule} from "@reversense/dexcalibur-orm";

export interface PersonOptions {
    _firstname?: string;
    _lastname?: string;
    _mail?: string;
    _bio?: string;
}


/**
 * Represent a physicial person
 *
 * @class
 */
export class Person {

    static VALIDATE:Record<string, ValidationRule> = {
        _firstname: ValidationRule.utf8String(),
        _lastname: ValidationRule.utf8String(),
        _mail: ValidationRule.email(),
        _bio: ValidationRule.utf8String(),
    }


    private _firstname:string;
    private _lastname:string;
    private _mail:string;
    private _bio:string;

    private _account: UserAccount = null;

    constructor(pOptions:PersonOptions = null) {
        if(pOptions!=null){
            for(let k in pOptions){
                this[k] = pOptions[k];
            }
        }
    }

    get firstname(): string {
        return this._firstname;
    }

    set firstname(value: string) {
        this._firstname = value;
    }

    get lastname(): string {
        return this._lastname;
    }

    set lastname(value: string) {
        this._lastname = value;
    }

    get mail(): string {
        return this._mail;
    }

    set mail(value: string) {
        this._mail = value;
    }

    get bio(): string {
        return this._bio;
    }

    set bio(value: string) {
        this._bio = value;
    }

    get account(): UserAccount {
        return this._account;
    }

    set account(value: UserAccount) {
        this._account = value;
    }
}