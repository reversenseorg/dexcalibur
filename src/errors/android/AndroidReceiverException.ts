import {ErrorCode, MonitoredError} from "../MonitoredError.js";
import {AndroidErrorCode} from "./AndroidApplicationException.js";

export class AndroidReceiverException extends MonitoredError {

    static MISSING_IMPL_CLASS = (pFQCN:string)=>{ return new AndroidReceiverException("Implementation class is missing : "+pFQCN,ErrorCode.ANALYZER_APP + AndroidErrorCode.RECEIVER + 1) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ANDROID RECEIVER', pMsg, pCode, pExtra);
    }
}