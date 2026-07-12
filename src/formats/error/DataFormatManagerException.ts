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

import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";

export class DataFormatManagerException extends MonitoredError {


    static CODE = {
        NOT_IMPLEMENTED: ErrorCode.GENERIC + 50,
        NOT_PARSABLE: ErrorCode.GENERIC + 51,
        INVALID_MAPPING: ErrorCode.GENERIC + 52
    }

    static NOT_PARSABLE = (pFormat:string, pSrc:string="-", pFile?:string)=>{
        return new DataFormatManagerException(
            `Data format "${pFormat}" cannot be parsed in ${pSrc} ${pFile!=null?pFile:''}`,
            DataFormatManagerException.CODE.NOT_PARSABLE)
    };

    static NOT_IMPLEMENTED = (pFeature:string)=>{
        return new DataFormatManagerException(
            "Feature not implemented : "+pFeature,
            DataFormatManagerException.CODE.NOT_IMPLEMENTED)
    };


    static INVALID_MAPPING = (pType:string)=>{
        return new DataFormatManagerException(
            "Parser cannot be retrieved from : "+pType,
            DataFormatManagerException.CODE.INVALID_MAPPING)
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DATA_FMT_MGR', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}