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
import {AssuranceModelUUID} from "../common/AssuranceModel.js";

export class AuditManagerException extends MonitoredError {

    static ALL = {};

    static MODEL_NOT_FOUND = (pUID="N/A")=>{ return new AuditManagerException("Assurance model not found [uid="+pUID+"]", ErrorCode.AUDIT_MANAGER + 1) };
    static SCANNER_NOT_FOUND = (pUID="N/A", pPUID:DexcaliburProjectUUID = "")=>{ return new AuditManagerException("Scanner not found [uid="+pUID+`][project=${pPUID}]`, ErrorCode.AUDIT_MANAGER + 2) };
    static CANNOT_INITIALIZE = ()=>{ return new AuditManagerException("Audit manager cannot be initialized : engine is missing", ErrorCode.AUDIT_MANAGER + 3) };
    static CANNOT_SAVE_MODEL = (pUID="N/A", pErr:string="")=>{ return new AuditManagerException("Assurance model cannot be saved [uid="+pUID+"] : "+pErr, ErrorCode.AUDIT_MANAGER + 4) };
    static REPORT_UID_CANNOT_BE_GENERATED = (pMsg="N/A")=>{ return new AuditManagerException("Assurance Report UID cannot be generated : "+pMsg, ErrorCode.AUDIT_MANAGER + 5) };

    static CANNOT_SCAN_ORG_IS_MANDATORY = (pMsg="N/A")=>{
        return new AuditManagerException("Cannot start a scan because organization is missing. "+pMsg,
            ErrorCode.AUDIT_MANAGER + 6) };

    static SCANNER_NOT_ALLOCATED = (pPUID:DexcaliburProjectUUID, pScannerUID:string)=>{
        return new AuditManagerException(`No scanner allocated for project [uuid=${pPUID}] `,
            ErrorCode.AUDIT_MANAGER + 7) };

    static CANNOT_CREATE_SCANNER = (pScannerUID:AssuranceScannerUID)=>{
        return new AuditManagerException(`Cannot create scanner [uuid=${pScannerUID}] `,
            ErrorCode.AUDIT_MANAGER + 8) };

    static REPORT_NOT_FOUND = (pUUID:AssuranceReportUUID)=>{
        return new AuditManagerException(`Report not found [uuid=${pUUID}] `,
            ErrorCode.AUDIT_MANAGER + 9) };

    static CANNOT_MERGE_NEW_WITH_OLD = (pNew:string,pNewVersion:number,pOldVersion:number)=>{
        return new AuditManagerException(`Cannot merge newest model with old [uuid=${pNew}][new=${pNewVersion}][old=${pOldVersion}]`,
            ErrorCode.AUDIT_MANAGER + 10) };

    static KPI_NOT_FOUND = (pRep:AssuranceReportUUID,pModel:AssuranceModelUUID,pKpiID:string)=>{
        return new AuditManagerException(`Cannot find indicator in report `,
            ErrorCode.AUDIT_MANAGER + 11, {
                report: pRep,
                model: pModel,
                kpi: pKpiID
            }) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AUDIT MANAGER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }

}