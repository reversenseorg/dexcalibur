import {ErrorCode, MonitoredError} from "../MonitoredError.js";
import {AndroidErrorCode} from "./AndroidApplicationException.js";

export class AndroidServiceException extends MonitoredError {

    static MISSING_IMPL_CLASS = (pFQCN:string)=>{ return new AndroidServiceException("Implementation class is missing : "+pFQCN,ErrorCode.ANALYZER_APP + AndroidErrorCode.SERVICE + 1) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ANDROID SERVICE', pMsg, pCode, pExtra);
    }
}