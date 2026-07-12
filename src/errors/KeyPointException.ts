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

import {ErrorCode, MonitoredError} from "./MonitoredError.js";


export class KeyPointException extends MonitoredError {

    static ERR = {
        INVALID_KP: ErrorCode.KP_MANAGER + 201,
    };

    static INVALID_KP = (pName:string)=>{ return new KeyPointException(` The template of the keypoint [uid= ${pName} ] is empty. `,KeyPointException.ERR.INVALID_KP) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('KEY POINT', pMsg, pCode, pExtra);
    }
}