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

import {ErrorCode } from "./MonitoredError.js";
import {BridgeErrorCode, BridgeException} from "./BridgeException.js";

export class AdbBridgeException extends BridgeException {


    static BRIDGE_COMMAND_FAILURE = (err)=>{ return new AdbBridgeException("ADB command failure : "+err,ErrorCode.BRIDGE + BridgeErrorCode.ADB + 1) };
    static APK_PATH_IS_NULL = ()=>{ return new AdbBridgeException("Install failed : APK path is null",ErrorCode.BRIDGE + BridgeErrorCode.ADB + 2) };
    static EOP_STRATEGY_NOT_FOUND = (pName:string)=>{ return new AdbBridgeException("Privilege Escalation failure : strategy [name="+pName+"] is not found",ErrorCode.BRIDGE + BridgeErrorCode.ADB + 3) };
    static DEFAULT_EOP_STRATEGY_UNDEFINED = ()=>{ return new AdbBridgeException("Privilege escalation cannot be done : there is not default strategy.",ErrorCode.BRIDGE + BridgeErrorCode.ADB + 4) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ADB', pMsg, pCode, pExtra);
    }
}