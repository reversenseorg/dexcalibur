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

import {MonitoredError} from "@dexcalibur/dexcalibur-orm";
import {ErrorCode} from "../../errors/MonitoredError.js";


export class R2Exception extends MonitoredError {


    static CANNOT_OPEN = (pMsg:string)=>{
        return new R2Exception("Radare2 cannot be started. ",
            ErrorCode.ANALYZER_NATIV_R2 + 1) };

    static INVALID_REMOTE_URI = (pURI:string)=>{
        return new R2Exception("The remote URI is invalid",
            ErrorCode.ANALYZER_NATIV_R2 + 2) };


    static STOPPED = (pName:string, pCMD:string)=>{
        return new R2Exception(`Cannot execute command because instance is stopped.`,
            ErrorCode.ANALYZER_NATIV_R2 + 3, {
                instance: pName,
                cmd: pCMD
            }) };

    static CMD_STOPPED = (pName:string, pCMD:string)=>{
        return new R2Exception(`Cannot execute command because instance is stopped.`,
            ErrorCode.ANALYZER_NATIV_R2 + 4, {
                instance: pName,
                cmd: pCMD
            }) };

    static REMOTE_OPTS_NOT_CONFIGURED = (pName:string)=>{
        return new R2Exception(`Remote options are not configure.`,
            ErrorCode.ANALYZER_NATIV_R2 + 5, {
                instance: pName
            }) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('R2', pMsg, pCode, pExtra);
    }
}