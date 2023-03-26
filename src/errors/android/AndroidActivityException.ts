import {ErrorCode, MonitoredError} from "../MonitoredError.js";
import {AndroidErrorCode} from "./AndroidApplicationException.js";

export class AndroidActivityException extends MonitoredError {

    static MISSING_IMPL_CLASS = (pFQCN:string)=>{ return new AndroidActivityException("Implementation class is missing : "+pFQCN,ErrorCode.ANALYZER_APP + AndroidErrorCode.ACTIVITY + 1) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ANDROID ACTIVITY', pMsg, pCode, pExtra);
    }
}