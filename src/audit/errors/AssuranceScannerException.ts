import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import {AssuranceScannerUID} from "../common/AssuranceScanner.js";
import {AssuranceReportUUID} from "../common/AssuranceReport.js";
import {SecurityZone} from "../../security/SecurityZone.js";

/**
 *
 */
export class AssuranceScannerException extends MonitoredError {

    code:number;
    extra:any;

    _zone = SecurityZone.PRIVATE;

    static ALL = {};



    static MODEL_UNDEFINED = (pScanner:string, pProject:DexcaliburProjectUUID)=>{
        return new AssuranceScannerException(
            "Scanner cannot start because the assurance model is undefined.",
            ErrorCode.AUDIT_SCANNER + 1,{
                scanner: pScanner,
                project: pProject
            });
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AUDIT SCANNER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}