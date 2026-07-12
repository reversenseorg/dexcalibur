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


const FRIDA_ERR_CODE = ErrorCode.HOOK_MANAGER + HookErrCode.FRIDA;

export class FridaHelperException extends MonitoredError {

    static ERR = {
        INVALID_DEVICE: FRIDA_ERR_CODE + 1,
        INVALID_FRIDA_SERVER_PATH: FRIDA_ERR_CODE + 2,
        SPAWN_FAILED: FRIDA_ERR_CODE + 3,
        LOCAL_BIN_NOT_FOUND: FRIDA_ERR_CODE + 4
    };

    static INVALID_DEVICE = ()=>{ return new FridaHelperException(" Invalid device. Please ensure the device is connected and enrolled.",FridaHelperException.ERR.INVALID_DEVICE) };
    static INVALID_FRIDA_SERVER_PATH = ()=>{ return new FridaHelperException(" Path of Frida server is not configured for the device, or not specified.",FridaHelperException.ERR.INVALID_FRIDA_SERVER_PATH) };
    static SPAWN_FAILED = (pMsg:string)=>{ return new FridaHelperException(" Spawn of frida-server failed, path seems wrong : "+pMsg,FridaHelperException.ERR.SPAWN_FAILED) };
    static LOCAL_BIN_NOT_FOUND = (pName:string)=>{ return new FridaHelperException(`Binary cannot be found locally [name=${pName}]`,FridaHelperException.ERR.LOCAL_BIN_NOT_FOUND) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('FRIDA HELPER', pMsg, pCode, pExtra);
    }
}