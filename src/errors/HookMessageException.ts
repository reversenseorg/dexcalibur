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
import {HookErrCode} from "./HookManagerException.js";


export class HookMessageException extends MonitoredError {

    static ERR = {
        MISSING_HOOK_ID: ErrorCode.HOOK_MANAGER + HookErrCode.MESSAGE + 1,
        MISSING_FRAG_ID: ErrorCode.HOOK_MANAGER + HookErrCode.MESSAGE + 2,
        INVALID_DATA: ErrorCode.HOOK_MANAGER + HookErrCode.MESSAGE + 3,
    };

    static MISSING_HOOK_ID = ()=>{ return new HookMessageException(`The hook ID is missing`,HookMessageException.ERR.MISSING_HOOK_ID) };
    static MISSING_FRAG_ID = ()=>{ return new HookMessageException(`The fragment ID is missing `,HookMessageException.ERR.MISSING_FRAG_ID) };
    static INVALID_DATA = ()=>{ return new HookMessageException(`Data format is invalid. `,HookMessageException.ERR.INVALID_DATA) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('HOOK MESSAGE', pMsg, pCode, pExtra);
    }
}