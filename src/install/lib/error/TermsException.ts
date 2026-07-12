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

import {ErrorCode, MonitoredError} from "../../../errors/MonitoredError.js";
import {SecurityZone} from "../../../security/SecurityZone.js";

/**
 *
 */
export class TermsException extends MonitoredError {
    static CANNOT_READ_LICENSE_PDF = (pPath: string)=>{
        return (new TermsException(`The license file (pdf) at [${pPath}] cannot be read  `,
            ErrorCode.INSTALLER + 20, { path:pPath })).zone(SecurityZone.PRIVATE);
    };

    static CANNOT_READ_LICENSE_TEXT = (pPath: string, message: any)=>{
        return (new TermsException(`The license file (raw text) at [${pPath}] cannot be read : ${message} `,
            ErrorCode.INSTALLER + 21, { path:pPath, msg:message })).zone(SecurityZone.PRIVATE);
    };

    static INVALID_FOLDER = (pLang:string, pPath:string )=>{
        return (new TermsException("The license folder ["+pPath+"] for [lang="+pLang+"] not found.",
            ErrorCode.INSTALLER + 22, { lang:pLang, path:pPath })).zone(SecurityZone.PRIVATE) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('TERMS MGT', pMsg, pCode, pExtra);
    }
}