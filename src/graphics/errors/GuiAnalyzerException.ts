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

export enum GuiErrCategoryCode {
    TYPE_MGR = 100
}

export class GuiAnalyzerException extends MonitoredError {

    static ERR = {
        EXISTING_EVT_TYPE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 1,
        EXISTING_CMP_TYPE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 2,
        EXISTING_ROLE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 3,
        UNKNOWN_EVT_TYPE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 4,
        UNKNOWN_CMP_TYPE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 5,
        UNKNOWN_ROLE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 6,
    };

    static EXISTING_EVT_TYPE = (pUID:string)=>{ return new GuiAnalyzerException(` The event type [uid=${pUID}] already exists.`,GuiAnalyzerException.ERR.EXISTING_EVT_TYPE) };
    static EXISTING_CMP_TYPE = (pUID:string)=>{ return new GuiAnalyzerException(` The component type [uid=${pUID}] already exists.`,GuiAnalyzerException.ERR.EXISTING_EVT_TYPE) };
    static EXISTING_ROLE = (pUID:string)=>{ return new GuiAnalyzerException(` The role [uid=${pUID}] already exists.`,GuiAnalyzerException.ERR.EXISTING_EVT_TYPE) };
    static UNKNOWN_EVT_TYPE = (pUID:string)=>{ return new GuiAnalyzerException(` The event type [uid=${pUID}] not exists.`,GuiAnalyzerException.ERR.UNKNOWN_EVT_TYPE) };
    static UNKNOWN_CMP_TYPE = (pUID:string)=>{ return new GuiAnalyzerException(` The component type [uid=${pUID}] not exists.`,GuiAnalyzerException.ERR.UNKNOWN_CMP_TYPE) };
    static UNKNOWN_ROLE = (pUID:string)=>{ return new GuiAnalyzerException(` The role [uid=${pUID}] not exists.`,GuiAnalyzerException.ERR.UNKNOWN_ROLE) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('GUI IR MANAGER', pMsg, pCode, pExtra);
    }
}