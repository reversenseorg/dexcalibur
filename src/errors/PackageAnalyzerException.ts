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

export class PackageAnalyzerException extends MonitoredError {


    static ALL = {};

    static MAIN_INPUT_NOT_FOUND = ()=>{
        return new PackageAnalyzerException("The main input cannot be found.", ErrorCode.ANALYZER_PKG + 101) };
    static EXTRA_INPUTS_NOT_FOUND = ()=>{
        return new PackageAnalyzerException("The extra inputs cannot be found.", ErrorCode.ANALYZER_PKG + 102) };
    static CANNOT_EXTRACT_APP = (pOs:string,pApp:string)=>{
        return new PackageAnalyzerException(
            "The application cannot be extracted.",
            ErrorCode.ANALYZER_PKG + 103,{
                os: pOs,
                app: pApp
            }) };
    static CANNOT_EXTRACT_VER = (pOs:string,pExtra:any)=>{
        return new PackageAnalyzerException(
            "The version cannot be extracted from package.",
            ErrorCode.ANALYZER_PKG + 104,{
                os: pOs,
                extra: pExtra
            }) };
    static CANNOT_EXTRACT_PKGID = (pOs:string,pExtra:any)=>{
        return new PackageAnalyzerException(
            "The package identifier cannot be extracted from package.",
            ErrorCode.ANALYZER_PKG + 105,{
                os: pOs,
                extra: pExtra
            }) };

    static CANNOT_EXTRACT_NAME = (pOs:string,pExtra:any)=>{
        return new PackageAnalyzerException(
            "The app name cannot be extracted from package.",
            ErrorCode.ANALYZER_PKG + 106,{
                os: pOs,
                extra: pExtra
            }) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('PACKAGE ANALYZER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}