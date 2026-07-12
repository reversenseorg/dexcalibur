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

export class DexcaliburConnectionException extends MonitoredError {


    static ALL = {};

    static IP_NOT_DEFINED = ()=>{ return new DexcaliburConnectionException("IP address is not defined", ErrorCode.REMOTE_DEXCALIBUR + 401) };
    static PORT_NOT_DEFINED = ()=>{ return new DexcaliburConnectionException("Port number is not defined", ErrorCode.REMOTE_DEXCALIBUR + 402) };
    static HOSTNAME_NOT_DEFINED = ()=>{ return new DexcaliburConnectionException("Host name is not defined", ErrorCode.REMOTE_DEXCALIBUR + 403) };
    static REMOTE_OPERATION_NOT_SUPPORTED = ()=>{ return new DexcaliburConnectionException("This operation is not yet supported for remote instance.", ErrorCode.REMOTE_DEXCALIBUR + 404) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('REMOTE CONNECTION', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}