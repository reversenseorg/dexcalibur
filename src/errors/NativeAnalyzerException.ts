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
import {NativeBackend} from "../types/common.js";


export class NativeAnalyzerException extends MonitoredError {

    static ERR = {
        MISSING_FUNC: ErrorCode.ANALYZER_NATIV + 101,
        UNKNOW_FUNC: ErrorCode.ANALYZER_NATIV + 102,
        CANNOT_DISASS_VOLATILE: ErrorCode.ANALYZER_NATIV + 103,
        MISSING_FILE: ErrorCode.ANALYZER_NATIV + 104,
        ANALYSIS_REQUIRED: ErrorCode.ANALYZER_NATIV + 105,
        INVALID_FUNC_SIGN: ErrorCode.ANALYZER_NATIV + 106,
        ALIAS_CONFLICT: ErrorCode.ANALYZER_NATIV + 107,
        ALIAS_MUST_DIFFERS_FROM_NAME: ErrorCode.ANALYZER_NATIV + 108,
        BACKEND_NOT_SUPPORTED: ErrorCode.ANALYZER_NATIV + 109,
        NOT_READY_TO_EMULATE: ErrorCode.ANALYZER_NATIV + 110
    };

    static UNKNOW_FUNC = ()=>{ return new NativeAnalyzerException(" Native function is unknow",NativeAnalyzerException.ERR.UNKNOW_FUNC) };
    static MISSING_FUNC = ()=>{ return new NativeAnalyzerException(" Function is missing",NativeAnalyzerException.ERR.MISSING_FUNC) };
    static MISSING_FILE = (file = 'null')=>{ return new NativeAnalyzerException(" File is missing : "+file,NativeAnalyzerException.ERR.MISSING_FILE) };
    static ANALYSIS_REQUIRED = (file = "null")=>{ return new NativeAnalyzerException(" File must be analyzed first : "+file,NativeAnalyzerException.ERR.ANALYSIS_REQUIRED) };
    static CANNOT_DISASS_VOLATILE = ()=>{ return new NativeAnalyzerException(" Volatile function cannot be disassembled",NativeAnalyzerException.ERR.CANNOT_DISASS_VOLATILE) };
    static INVALID_FUNC_SIGN = ()=>{ return new NativeAnalyzerException(" Signature of native function is invalid or missing",NativeAnalyzerException.ERR.INVALID_FUNC_SIGN) };
    static ALIAS_CONFLICT = ()=>{ return new NativeAnalyzerException(" Two native functions from same file cannot have same alias",NativeAnalyzerException.ERR.ALIAS_CONFLICT) };
    static ALIAS_MUST_DIFFERS_FROM_NAME = ()=>{ return new NativeAnalyzerException("Ignoreed : alias MUST differs from native function name",NativeAnalyzerException.ERR.ALIAS_MUST_DIFFERS_FROM_NAME) };
    static BACKEND_NOT_SUPPORTED = (pBackend:NativeBackend)=>{ return new NativeAnalyzerException(`Native backend '${pBackend}' is not supported`,NativeAnalyzerException.ERR.BACKEND_NOT_SUPPORTED) };
    static NOT_READY_TO_EMULATE = (pMsg:string,pSign="")=>{ return new NativeAnalyzerException(`Code emulation [${pSign}]: ${pMsg}`,NativeAnalyzerException.ERR.NOT_READY_TO_EMULATE) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('NATIVE ANALYZER', pMsg, pCode, pExtra);
    }

}