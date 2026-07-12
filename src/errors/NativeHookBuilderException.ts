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
import {HookBuilderError} from "./HookScriptBuilderException.js";




export class NativeHookBuilderException extends MonitoredError {


    static ERR = {
        INVALID_DB: ErrorCode.HOOK_BUILDER + HookBuilderError.NATIVE + 1,
        MISSING_TARGET: ErrorCode.HOOK_BUILDER + HookBuilderError.NATIVE + 2,
        TYPE_READER_IS_NOT_FRIDA_OK: ErrorCode.HOOK_BUILDER + HookBuilderError.NATIVE + 3,
    };

    static MISSING_TARGET = ()=>{ return new NativeHookBuilderException(" The hook target is missing. ",NativeHookBuilderException.ERR.MISSING_TARGET) };
    static INVALID_DB = ()=>{ return new NativeHookBuilderException(" The database cannot be null",NativeHookBuilderException.ERR.INVALID_DB) };
    static TYPE_READER_IS_NOT_FRIDA_OK = (vType:string)=>{ return new NativeHookBuilderException(" The type ["+vType+"] has not code to read it from Frida",NativeHookBuilderException.ERR.TYPE_READER_IS_NOT_FRIDA_OK) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('NATIVE HOOK BUILDER', pMsg, pCode, pExtra);
    }
}