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

import {AccesErrCode, Access, AccessException, AccessMap, AccessProperty, AccessType} from "./Access.js";
import {AccessAttribute, AccessAttributeMap} from "./AccessAttribute.js";
import {UserAccount} from "../UserAccount.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../../Auditable.js";

/**
 *
 */
export abstract class DelegateAccessControl {


    static uid:string;

    static attr:Record<string, AccessAttribute<any>> = {};

    constructor() {

    }

    boot():void{}

    static registerAttributes<T>(pUID:string, pAttr:AccessAttribute<T>) {
        this.attr[pUID] = pAttr;
    }


    static getAttr<T>(pUID:string):AccessAttribute<T> {
        return this.attr[pUID];
    }


    check(pAccess:Access, pAccount:UserAccount, pResource?:any) {
        // nothing to do here
    }


    /**
     * To check if an attribute of a DexcaliburProject instance satisfies some constraints
     *
     * @param pAttr
     * @param pAccount
     * @param pProject
     * @param pMessage
     * @method
     */
    checkAttr(pAttr: AccessAttribute<any>, pAccount:UserAccount, pResource:Nullable<Auditable> = null, pMessage:string = ""):void {

    }
}