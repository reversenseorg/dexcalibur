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
import {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import {AssuranceScannerUID} from "../common/AssuranceScanner.js";
import {AssuranceReportUUID} from "../common/AssuranceReport.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {IndicatorUUID, IndicatorViewType} from "../common/Indicator.js";

/**
 *
 */
export class IndicatorBuilderException extends MonitoredError {


    _zone = SecurityZone.PRIVATE;

    static ALL = {};


    static VIEW_TYPE_NOT_SUPPORTED = (pReport:AssuranceReportUUID, pKPI:IndicatorUUID, pView:IndicatorViewType)=>{
        return new IndicatorBuilderException(
            "Indicator type is not supported",
            ErrorCode.AUDIT_KPI + 1,{
                report: pReport,
                kpi: pKPI,
                view: pView
            });
    };

    static KPI_RULE_NOT_SUPPORTED = (pKPI:IndicatorUUID, pRule:string)=>{
        return new IndicatorBuilderException(
            "KPI rule is not supported",
            ErrorCode.AUDIT_KPI + 2,{
                kpi: pKPI,
                rule: pRule
            });
    };





    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('INDICATOR BUILDER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }

}