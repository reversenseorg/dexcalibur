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
import {AnalyzerErrCode} from "./AnalyzerException.js";

export class AbiException extends MonitoredError {


    static UNKNOW_ABI = (pABI:string)=>{
        return new AbiException("The ABI '"+pABI+"' is not supported. Please, fill an issue.",
            ErrorCode.ANALYZER + AnalyzerErrCode.NATIV + 1) };


    static UNDETECTABLE_ABI = (pMsg:string)=>{
        return new AbiException("The ABI cannot be detected : "+pMsg,
            ErrorCode.ANALYZER + AnalyzerErrCode.NATIV + 2) };

    static UNDETECTABLE_ISA = (pMsg:string)=>{
        return new AbiException("The ISA cannot be detected from ABI, ABI is unknown : "+pMsg,
            ErrorCode.ANALYZER + AnalyzerErrCode.NATIV + 3) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ABI', pMsg, pCode, pExtra);
    }
}