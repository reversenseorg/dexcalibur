import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";

export class AuditManagerException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static MODEL_NOT_FOUND = (pUID="N/A")=>{ return new AuditManagerException("Assurance model not found [uid="+pUID+"]", ErrorCode.AUDIT_MANAGER + 1) };
    static SCANNER_NOT_FOUND = (pUID="N/A")=>{ return new AuditManagerException("Scanner not found [uid="+pUID+"]", ErrorCode.AUDIT_MANAGER + 2) };
    static CANNOT_INITIALIZE = ()=>{ return new AuditManagerException("Audit manager cannot be initialized : engine is missing", ErrorCode.AUDIT_MANAGER + 3) };
    static CANNOT_SAVE_MODEL = (pUID="N/A", pErr:string="")=>{ return new AuditManagerException("Assurance model cannot be saved [uid="+pUID+"] : "+pErr, ErrorCode.AUDIT_MANAGER + 4) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AUDIT MANAGER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}