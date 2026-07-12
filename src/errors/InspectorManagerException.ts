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


export enum InspectorManagerError {
    INSPECTOR = 100
}

export class InspectorManagerException extends MonitoredError {

    static ERR = {
        INSPECTOR_UPGRADE_TO_MINOR_NOT_SUPPORTED: ErrorCode.INSPECTOR + InspectorManagerError.INSPECTOR+ 1,
        INSPECTOR_UPGRADE_TO_MAJOR_NOT_SUPPORTED: ErrorCode.INSPECTOR + InspectorManagerError.INSPECTOR+ 2,
        PRESERVATIVE_UPGRADE_NOT_SUPPORTED: ErrorCode.INSPECTOR + InspectorManagerError.INSPECTOR+ 3,
        MARKER_NOT_SUPPORTED: ErrorCode.INSPECTOR + InspectorManagerError.INSPECTOR+ 4
    };

    static INSPECTOR_UPGRADE_TO_MINOR_NOT_SUPPORTED = (vUid,vOldVersion,vNewVersion)=>{
        return new InspectorManagerException(
        " Upgrade of saved Inspector [uid="+vUid+"][version="+vOldVersion+"] to next minor version ["+vNewVersion+"] is not supported : ",
            InspectorManagerException.ERR.INSPECTOR_UPGRADE_TO_MINOR_NOT_SUPPORTED)
    };

    static INSPECTOR_UPGRADE_TO_MAJOR_NOT_SUPPORTED = (vUid,vOldVersion,vNewVersion)=>{
        return new InspectorManagerException(
            " Upgrade of saved Inspector [uid="+vUid+"][version="+vOldVersion+"] to next major version ["+vNewVersion+"] is not supported : ",
            InspectorManagerException.ERR.INSPECTOR_UPGRADE_TO_MAJOR_NOT_SUPPORTED)
    };



    static PRESERVATIVE_UPGRADE_NOT_SUPPORTED = (vLocation:string)=>{
        return new InspectorManagerException(
            " Preservative upgrade not supported for [type="+vLocation+"]",
            InspectorManagerException.ERR.PRESERVATIVE_UPGRADE_NOT_SUPPORTED)
    };

    static MARKER_NOT_SUPPORTED = (pFlag:string)=>{
        return new InspectorManagerException(
            " Marker not supported [name="+pFlag+"]",
            InspectorManagerException.ERR.MARKER_NOT_SUPPORTED)
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('INSPECTOR MANAGER', pMsg, pCode, pExtra);
    }

}