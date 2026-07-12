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

import {AuthenticationResult} from "./PasswordAuthenticator.js";

export enum AuthType {
    NONE='none',
    PASSWORD='pwd',
    TOKEN='token',
    API_KEY='api_key'
}


export enum AuthCode {
    NONE,
    INVALID_PASSWORD,
    EMPTY_PASSWORD,
    INVALID_USERNAME,
    EMPTY_USERNAME,
    ACCOUNT_LOCKED,
    ACCOUNT_DEACTIVATED,
    MAX_ATTEMPTS_REACHED,

    NOT_CONFIGURED,
    INVALID_APIKEY,
}

export interface Authenticator {
    doAuthentication( ...args:any[]):AuthenticationResult|Promise<AuthenticationResult>;
}

export class AuthenticationException extends Error {

    _c:AuthCode = AuthCode.NONE


    constructor(pMsg, pCode:AuthCode = AuthCode.NONE) {
        super(pMsg);
        this._c = pCode;
    }

    /**
     * To get auth code
     */
    getCode():AuthCode {
        return this._c;
    }
}