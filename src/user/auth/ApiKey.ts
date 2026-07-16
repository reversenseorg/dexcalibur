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

import {Metadata} from "../../audit/common/Metadata.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {randomUUID} from "crypto";
import {UserAccount} from "../UserAccount.js";
import {CryptoUtils} from "../../CryptoUtils.js";
import {ValidationRule} from "@reversense/dexcalibur-orm";

export type ApiKeyUUID = string;

export interface ApiKeyOptions {
    uid?: ApiKeyUUID;
    name?: string;
    description?: string;
    value?: string;
    created?: number;
    lifetime?: number;
    expired?: number;
    scope?: string[];
    meta?: Metadata[];
}

export class ApiKey {

    static VALIDATE:Record<string, ValidationRule> = {
        uid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        description: ValidationRule.utf8String(),
        scope: ValidationRule.asArrayOf([ ValidationRule.utf8String()])
    }

    uid:ApiKeyUUID;
    name:string;
    description:string = "";
    value:string;
    created:number;
    lifetime:number = -1;
    expired:number = -1;
    scope:string[] = [];
    meta:Metadata[] = [];

    constructor(pOptions:ApiKeyOptions = {}) {
        if (pOptions.uid !== undefined) this.uid = pOptions.uid;
        if (pOptions.name !== undefined) this.name = pOptions.name;
        if (pOptions.description !== undefined) this.description = pOptions.description;
        if (pOptions.value !== undefined) this.value = pOptions.value;
        if (pOptions.created !== undefined) this.created = pOptions.created;
        if (pOptions.lifetime !== undefined) this.lifetime = pOptions.lifetime;
        if (pOptions.expired !== undefined) this.expired = pOptions.expired;
        if (pOptions.scope !== undefined) this.scope = pOptions.scope;
        if (pOptions.meta !== undefined) this.meta = pOptions.meta;
    }

    generateUUID():void {
        this.uid = randomUUID();
    }

    isExpired():boolean {
        return this.expired >= 0;
    }

    toJsonObject(pZone : SecurityZone.PUBLIC):any {
        return {
            uid:this.uid,
            name:this.name,
            description:this.description,
            value:((pZone===SecurityZone.PUBLIC)? '***' : this.value),
            created:this.created,
            lifetime:this.lifetime,
            expired:this.expired,
            scope:this.scope,
            meta:this.meta
        }
    }

    computeValue(pClear:string):string {
        return CryptoUtils.hmac_sha256(
            pClear,
            this.uid + ':' + this.created,
            "base64",
            true
        );
    }

    keyEquals(pKey:string):boolean {
        return CryptoUtils.stringEqual(
            this.value,
            this.computeValue(pKey)
        );
    }


    static generate(pUser: UserAccount, pOptions: ApiKeyOptions): { apiKey: ApiKey, clearKey: Buffer} {

        const created = (new Date()).getTime();
        const freeUUID = pUser.generateKeyUUID();
        const clearKey = Buffer.from(randomUUID());

        const k = new ApiKey({
            ... pOptions,
            created: created,
            expired: -1,
            uid: freeUUID
        });

        k.value = k.computeValue(clearKey.toString('ascii'));

        return { apiKey: k, clearKey: clearKey};
    }
}