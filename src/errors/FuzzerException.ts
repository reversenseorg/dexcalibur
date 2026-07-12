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
import {SecurityZone} from "../security/SecurityZone.js";


export enum FuzzErrCode {
    GENERIC=100,
    HOST=200,
    DEV=300
}

export class FuzzerException extends MonitoredError {

    static ERR = {
        MISSING_SESSID: ErrorCode.FUZZ_MANAGER + FuzzErrCode.HOST + 1,
        MISSING_CASEID: ErrorCode.FUZZ_MANAGER + FuzzErrCode.HOST + 2,
        MASTER_CANNOT_RUN: ErrorCode.FUZZ_MANAGER + FuzzErrCode.HOST + 3
    };

    _zone = SecurityZone.PRIVATE;

    static MISSING_SESSID = ()=>{
        return new FuzzerException(" Missing Fuzzer session UID",
            FuzzerException.ERR.MISSING_SESSID).zone(SecurityZone.PUBLIC) };
    static MISSING_CASEID = ()=>{
        return new FuzzerException(" Missing Test case UID",
            FuzzerException.ERR.MISSING_CASEID).zone(SecurityZone.PUBLIC) };
    static MASTER_CANNOT_RUN = (pMsg:string)=>{
        return new FuzzerException(" Master node cannot run fuzzer : "+pMsg,
            FuzzerException.ERR.MASTER_CANNOT_RUN) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('FUZZER', pMsg, pCode, pExtra);
    }
}