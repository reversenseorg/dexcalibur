import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import {AssuranceScannerUID} from "../common/AssuranceScanner.js";
import {AssuranceReportUUID} from "../common/AssuranceReport.js";

export class AuditManagerException extends MonitoredError {

    code:number;
    extra:any;

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




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AUDIT MANAGER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}