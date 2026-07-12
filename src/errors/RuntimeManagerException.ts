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
import {ScriptCompilerOutput} from "../hook/HookWorkspace.js";
import {RuntimeSessionUUID} from "../runtime/RuntimeSession.js";

export enum HookErrCode {
    GENERIC=100,
    FRIDA=200,
    MESSAGE=300
}

export class RuntimeManagerException extends MonitoredError {

    static ERR = {
        NO_DEVICE_SELECTED: ErrorCode.RT_MANAGER +  1,
        SESS_NOT_FOUND: ErrorCode.RT_MANAGER +  2
    };

    static NO_DEVICE_SELECTED = ()=>{
        return new RuntimeManagerException("There is no device selected.",RuntimeManagerException.ERR.NO_DEVICE_SELECTED) };
    static SESS_NOT_FOUND = (pUID:RuntimeSessionUUID)=>{
        return new RuntimeManagerException("Session not found.",RuntimeManagerException.ERR.SESS_NOT_FOUND) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('RUNTIME MANAGER', pMsg, pCode, pExtra);
    }
}