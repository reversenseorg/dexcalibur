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
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue.js";

export enum HookBuilderError {
    GENERIC = 100,
    JAVA = 200,
    NATIVE = 300,
    OBJC = 400,
    CMOD = 500,
    JS = 600
}


export class HookScriptBuilderException extends MonitoredError {

    static ERR = {
        UNTARGETABLE_NATIVE_HOOK: ErrorCode.HOOK_BUILDER + HookBuilderError.GENERIC + 1,
        UNTARGETABLE_JAVA_HOOK: ErrorCode.HOOK_BUILDER + HookBuilderError.GENERIC + 2,
        UNTARGETABLE_SYSCALL_HOOK: ErrorCode.HOOK_BUILDER + HookBuilderError.GENERIC + 3,
        UNTARGETABLE_INSN_HOOK: ErrorCode.HOOK_BUILDER + HookBuilderError.GENERIC + 4,
        UNTARGETABLE_OBJC_HOOK: ErrorCode.HOOK_BUILDER + HookBuilderError.GENERIC + 5
    };

    static UNTARGETABLE_NATIVE_HOOK = ()=>{ return new HookScriptBuilderException(" The hook target cannot be targeted into script. ",HookScriptBuilderException.ERR.UNTARGETABLE_NATIVE_HOOK) };
    static UNTARGETABLE_JAVA_HOOK = ()=>{ return new HookScriptBuilderException(" The hook target cannot be targeted into script. ",HookScriptBuilderException.ERR.UNTARGETABLE_JAVA_HOOK) };
    static UNTARGETABLE_SYSCALL_HOOK = ()=>{ return new HookScriptBuilderException(" The hook target cannot be targeted into script. ",HookScriptBuilderException.ERR.UNTARGETABLE_SYSCALL_HOOK) };
    static UNTARGETABLE_INSN_HOOK = ()=>{ return new HookScriptBuilderException(" The hook target cannot be targeted into script. ",HookScriptBuilderException.ERR.UNTARGETABLE_INSN_HOOK) };
    static UNTARGETABLE_OBJC_HOOK = ()=>{ return new HookScriptBuilderException(" The hook target cannot be targeted into script. ",HookScriptBuilderException.ERR.UNTARGETABLE_OBJC_HOOK) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('GLOBAL HOOK BUILDER', pMsg, pCode, pExtra);
    }
}