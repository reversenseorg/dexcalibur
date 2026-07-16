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
import {NodeInternalType} from "@reversense/dxc-core-api";

export enum HookErrCode {
    GENERIC=100,
    FRIDA=200,
    MESSAGE=300
}

export class HookManagerException extends MonitoredError {

    static ERR = {
        EXISTING_HOOK_SET: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 1,
        DB_NOT_INITIALIZED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 2,
        CANNOT_SAVE_UNRECOGNIZED_OBJ: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 3,
        UNKNOW_HOOK_FRAGMENT_POS: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 4,
        HOOK_FRAGMENT_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 5,
        HOOK_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 6,
        FRIDA_DEVICE_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 7,
        HOOK_SESSION_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 8,
        HOOK_FRAGMENT_CANNOT_BE_REMOVED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 9,
        FRAGMENT_UID_IS_MANDATORY: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 10,
        OPTION_NOT_SUPPORTED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 11,
        SCRIPT_COMPILATION_FAILED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 12,
        SCRIPT_SYNTAX_ERROR: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 13,
        COMPILER_INPUT_NOT_FOUND: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 14,
        CANNOT_START_HOOK_BECAUSE_SYNTAX_ERR: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 15,
        SESSION_INTERRUPTED: ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 16,
        CANNOT_BE_HOOKED:  ErrorCode.HOOK_MANAGER + HookErrCode.GENERIC + 17
    };

    static EXISTING_HOOK_SET = ()=>{ return new HookManagerException(" An hook set already exists for this ID",HookManagerException.ERR.EXISTING_HOOK_SET) };
    static UNKNOW_HOOK_FRAGMENT_POS = ()=>{ return new HookManagerException(" Invalid position for hook fragments",HookManagerException.ERR.UNKNOW_HOOK_FRAGMENT_POS) };
    static HOOK_FRAGMENT_NOT_FOUND = (vUID = "")=>{ return new HookManagerException(" No hook fragments [uid="+vUID+"] found ",HookManagerException.ERR.HOOK_FRAGMENT_NOT_FOUND) };
    static DB_NOT_INITIALIZED = ()=>{ return new HookManagerException(" Fatal error: Database is not initiliazed",HookManagerException.ERR.DB_NOT_INITIALIZED) };
    static CANNOT_SAVE_UNRECOGNIZED_OBJ = ()=>{ return new HookManagerException(" Fatal error: Save of unrecognized object failed ",HookManagerException.ERR.CANNOT_SAVE_UNRECOGNIZED_OBJ) };
    static HOOK_NOT_FOUND = (vUID:string)=>{ return new HookManagerException(" Fatal error: Hook not found : "+vUID,HookManagerException.ERR.HOOK_NOT_FOUND) };
    static FRIDA_DEVICE_NOT_FOUND = (vUID:string)=>{ return new HookManagerException(" Fatal error: device not found by frida : "+vUID,HookManagerException.ERR.FRIDA_DEVICE_NOT_FOUND) };
    static HOOK_SESSION_NOT_FOUND = ()=>{ return new HookManagerException(" Fatal error: hook session not found",HookManagerException.ERR.HOOK_SESSION_NOT_FOUND) };
    static HOOK_FRAGMENT_CANNOT_BE_REMOVED= (vUID = "", vExtra:string="")=>{ return new HookManagerException(" The fragment [uid="+vUID+"] cannot be removed : "+vExtra,HookManagerException.ERR.HOOK_FRAGMENT_CANNOT_BE_REMOVED) };
    static FRAGMENT_UID_IS_MANDATORY = (pContext:string="")=>{ return new HookManagerException(" The fragment UID is mandatory [context="+pContext+"]",HookManagerException.ERR.FRAGMENT_UID_IS_MANDATORY) };
    static OPTION_NOT_SUPPORTED = (pName:string)=>{ return new HookManagerException(" The global hook option [name="+pName+"] is not supported",HookManagerException.ERR.OPTION_NOT_SUPPORTED) };
    static SCRIPT_COMPILATION_FAILED = (pName:string)=>{ return new HookManagerException(" The script compiling failed.",HookManagerException.ERR.SCRIPT_COMPILATION_FAILED) };
    static SCRIPT_SYNTAX_ERROR = (pLang:string, pMessage:string="")=>{ return new HookManagerException(" [targetLang="+pLang+"] The built script contains syntax errors : "+pMessage,HookManagerException.ERR.SCRIPT_SYNTAX_ERROR) };
    static COMPILER_INPUT_NOT_FOUND = ()=>{ return new HookManagerException(" Input file of TS compiler not found. ",HookManagerException.ERR.COMPILER_INPUT_NOT_FOUND) };
    static CANNOT_START_HOOK_BECAUSE_SYNTAX_ERR = (pCompilerOutput:ScriptCompilerOutput)=>{
        return new HookManagerException(
            " Hooks cannot start : syntax error.",
            HookManagerException.ERR.CANNOT_START_HOOK_BECAUSE_SYNTAX_ERR,
            pCompilerOutput
        );
    };
    static SESSION_INTERRUPTED = (pStep:string)=>{ return new HookManagerException(" Hook sessions has been interrupted by lifecycle hooks at : "+pStep,HookManagerException.ERR.SESSION_INTERRUPTED) };
    static CANNOT_BE_HOOKED = (pType:NodeInternalType,pUID:string)=>{ return new HookManagerException(" Target node not support direct hooking",HookManagerException.ERR.CANNOT_BE_HOOKED, {
        __: pType,
        _uid: pUID
    }) };





    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('HOOK MANAGER', pMsg, pCode, pExtra);
    }
}