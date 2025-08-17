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