import {ErrorCode, MonitoredError} from "../MonitoredError.js";
import {AndroidErrorCode} from "./AndroidApplicationException.js";

export class AndroidProviderException extends MonitoredError {

    static MISSING_IMPL_CLASS = (pFQCN:string)=>{ return new AndroidProviderException("Implementation class is missing : "+pFQCN,ErrorCode.ANALYZER_APP + AndroidErrorCode.PROVIDER + 1) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ANDROID PROVIDER', pMsg, pCode, pExtra);
    }
}