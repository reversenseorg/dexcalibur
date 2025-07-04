import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import {AssuranceScannerUID} from "../common/AssuranceScanner.js";
import {AssuranceReportUUID} from "../common/AssuranceReport.js";
import {SecurityZone} from "../../security/SecurityZone.js";

/**
 *
 */
export class PolicyException extends MonitoredError {


    _zone = SecurityZone.PRIVATE;

    static ALL = {};


    static CANNOT_REMOVE_RULE = (pPolicy:string, pCause:string)=>{
        return new PolicyException(
            "Cannot remove rule from policy. Cause : "+pCause,
            ErrorCode.AUDIT_POLICY + 1,{
                policy: pPolicy
            });
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AUDIT POLICY', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }

}