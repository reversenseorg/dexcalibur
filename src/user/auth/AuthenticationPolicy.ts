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

import {AuthType} from "./AuthTypes.js";
import {AuthenticationOptions, AuthenticationSettings} from "./AuthenticationSettings.js";


function getValueFrom( pObject:any, pField:string, pDefaultValue:any):any {
    return (pObject.hasOwnProperty(pField)? pObject[pField] : pDefaultValue);
}

export interface AuthenticationPolicyOptions {
    enforced?:boolean;
    delayOnFail?:boolean;
    delay?:number;
    resetAfter?:number;
    maxAttempts?:number;
    defaultType?:AuthType;
}

/**
 * Represent an authentication policy
 */
export class AuthenticationPolicy {

    enforced:boolean = true;
    delayOnFail:boolean = false;
    delay:number = 0;
    resetAfter:number = 3600;
    maxAttempts:number = -1;
    supported: AuthType[] = [];
    defaultType: AuthType = null;

    constructor( pSettings:AuthenticationOptions) {
        let p = pSettings.policy;
        this.enforced = getValueFrom(p, 'enforced', true);
        this.delayOnFail = getValueFrom(p, 'delayOnFail', true);
        this.delay = getValueFrom(p, 'delay', 30);
        this.resetAfter = getValueFrom(p, 'resetAfter', 3600);
        this.maxAttempts = getValueFrom(p, 'maxAttempts', -1);
        this.supported = pSettings.supported;
        this.defaultType = getValueFrom(p, 'defaultType', AuthType.NONE);

        if(this.supported==null || this.supported.indexOf(this.defaultType)==-1){
            this.defaultType = null;
        }
    }

    isEnforced():boolean {
        return this.enforced;
    }

    isSupported( pType:AuthType):boolean {
        return (this.supported.indexOf(pType)>-1);
    }



    hasMaxAttempts():boolean {
        return this.maxAttempts>0;
    }

    hasDelayOnFail():boolean {
        return this.delayOnFail===true;
    }

    explains(pIndent = 2):string {
        return `
${"\t".repeat(pIndent)}enforced = ${this.enforced}  
${"\t".repeat(pIndent)}delayOnFail = ${this.delayOnFail}
${"\t".repeat(pIndent)}delay = ${this.delay}
${"\t".repeat(pIndent)}resetAfter = ${this.resetAfter}
${"\t".repeat(pIndent)}maxAttempts = ${this.maxAttempts}
${"\t".repeat(pIndent)}supported = ${this.supported}
${"\t".repeat(pIndent)}defaultType = ${this.defaultType}          
`;
    }

    toObject():AuthenticationPolicyOptions {
        return {
            enforced: this.enforced,
            defaultType: this.defaultType,
            resetAfter: this.resetAfter,
            maxAttempts: this.maxAttempts,
            delay: this.delay,
            delayOnFail: this.delayOnFail,
        };
    }
}