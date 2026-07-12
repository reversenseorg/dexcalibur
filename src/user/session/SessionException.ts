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

import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {SecurityZone} from "../../security/SecurityZone.js";


export enum SessionCode {
    NONE,
    EXPIRED,
    DESTROYED,
    INVALID_ACCOUNT,
    ACCOUNT_LOCKED,
    EMPTY_SESSID,
    INVALID_SESSID,
    NO_SESSION_FOUND
}



export class SessionException extends MonitoredError {



    _c:SessionCode = SessionCode.NONE

    static INVALID_SESSION = ()=>{ return new SessionException("Session is invalid", ErrorCode.AUTH + 101) };
    static EXPIRED_SESSION = ()=>{ return new SessionException("Session is expired", ErrorCode.AUTH + 102) };
    static NO_ACTIVE_PROJECT = ()=>{ return new SessionException("This session has not active project", ErrorCode.AUTH + 103) };
    static MULTIPLE_ACTIVE_PROJECT = ()=>{ return new SessionException("This session has multiple active project, please specify.", ErrorCode.AUTH + 104) };
    static INVALID_ACTIVE_PROJECT_UID = (vUID:string = 'unknow')=>{ return new SessionException("This session has not active project with the given UID : "+vUID, ErrorCode.AUTH + 105) };
    static INVALID_COOKIE_VALUE_FMT = (pValue:string)=>{ return new SessionException(`Cookie value contains some forbidden char [value=${pValue}]`, ErrorCode.AUTH + 106).zone(SecurityZone.PRIVATE) };



    constructor(pMsg, pCode:SessionCode = SessionCode.NONE) {
        super('SESSION',pMsg,pCode);
        this._c = pCode;
    }

    /**
     * To get auth code
     */
    getCode():SessionCode {
        return this._c;
    }
}