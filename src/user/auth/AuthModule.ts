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

import {Nullable} from "@dexcalibur/dxc-core-api";
import {SecurityZone} from "../../security/SecurityZone.js";
import {AuthenticationSettings} from "./AuthenticationSettings.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";

export enum AuthModuleType {
    LOCAL_PASSWD='local_pwd',
    OIDC='oidc',
    APIKEY='api_key',
    PASSWORDLESS='pwdl'
}

export interface SelfRegistrationStatus {
    orgMember:boolean;
    external:boolean;
    guests:boolean;
}

export interface AuthModuleOptions {
    type?:AuthModuleType;
    uid?:string;
    name:string;
    active:boolean;
    btnImg?:Buffer;
    selfReg?:SelfRegistrationStatus;
    [extra:string]:any;
}

export interface DirectAuthModuleOptions extends AuthModuleOptions{
    type:AuthModuleType;
}

export class AuthModule {

    static VALIDATE:Record<string, ValidationRule> = {
        type: ValidationRule.newPinklistAssert([
            AuthModuleType.OIDC,
            AuthModuleType.LOCAL_PASSWD,
            AuthModuleType.APIKEY,
            AuthModuleType.PASSWORDLESS
        ]),
        uid: ValidationRule.newRegexpAssert(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
        name: ValidationRule.newRegexpAssert(/^[0-9a-zA-Z-_]{3,64}$/),
        active: ValidationRule.newPinklistAssert([ true, false ])
    }


    type:AuthModuleType;

    uid:string = null;

    name:string;

    active = false;

    btnImg:Nullable<Buffer> = null;

    selfReg:SelfRegistrationStatus = {
        orgMember: false,
        external: false,
        guests: false
    };

    constructor(pOptions:DirectAuthModuleOptions) {
        this.update(pOptions);
    }

    getUID():string {
        return this.uid;
    }

    setUID(pUUID:string):void {
        this.uid = pUUID;
    }

    update(pOptions:AuthModuleOptions|AuthModule) {
        ['type','uid','name','active','btnImg','selfReg','selfReg'].forEach(p => {
            if(pOptions[p]!=null) this[p] = pOptions[p];
        });
    }

    async testConnection(pAuthSettings:AuthenticationSettings):Promise<boolean> {

        return false;
    }

    toJsonObject(pZone:SecurityZone = SecurityZone.PUBLIC):any{
        return {
            type: this.type,
            uid: this.uid,
            name: this.name,
            active: this.active,
            btnImg: this.btnImg,
            selfReg: this.selfReg
        };
    }
}