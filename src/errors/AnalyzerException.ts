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
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;

export enum AnalyzerErrCode {
    GENERIC=1000,
    JAVA=2000,
    OBJC=3000,
    NATIV=4000,
    SCRIPT=5000,
    ANDROID_APP=6000,
    IOS_APP=7000,
    BIN_APP=8000,
    SEARCH=9000
}

export class AnalyzerException extends MonitoredError {


    static UNKNOW_ANAL = (pABI:string)=>{
        return new AnalyzerException("The ABI '"+pABI+"' is not supported. Please, fill an issue.",
            ErrorCode.ANALYZER_NATIV + 201) };

    static ANDROID_SEARCH_SPLITTED_DEV_FAIL = ()=>{
        return new AnalyzerException("Android Package Analyzer : Splitted APK cannot be search because device is offline or unknow",
            ErrorCode.ANALYZER_NATIV + 202) };

    static MISSING_DATA_SET = (pNodeType:string|NodeInternalType)=>{
        return new AnalyzerException("Data set missing for node type : "+pNodeType,
            ErrorCode.ANALYZER_NATIV + 203) };

    static PLATFORM_NOT_SUPPORTED = (pOS:string)=>{
        return new AnalyzerException("The platform is not supported, app cannot be analyzed : "+pOS,
            ErrorCode.ANALYZER_NATIV + 204) };
    static EXTRACT_NOT_SUPPORTED = (pType:string, pOS:string)=>{
        return new AnalyzerException("The targeted app has not extractor [type="+pType+"][os="+pOS+"]",
            ErrorCode.ANALYZER_NATIV + 205) };
    static CANNOT_PREPARE_PKG = (pMsg:string)=>{
        return new AnalyzerException("Cannot prepare the target package. "+pMsg,
            ErrorCode.ANALYZER_NATIV + 206) };


    static ANDROID_RES_CANNOT_BE_PARSED = (pFile:string,pCause:string = "")=>{
        return new AnalyzerException(`Cannot parse resource from file [${pFile}]${pCause!=""?"[cause="+pCause+"]":""}`,
            ErrorCode.ANALYZER_NATIV + 207) };

    static ANDROID_RES_MULTIPLE_NOT_SUPPORTED = (pFile:string)=>{
        return new AnalyzerException(`Resource file [${pFile}] contains multiple node at root`,
            ErrorCode.ANALYZER_NATIV + 208) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('GENERIC ANALYZER', pMsg, pCode, pExtra);
    }
}