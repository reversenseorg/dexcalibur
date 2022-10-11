import {ErrorCode, MonitoredError} from "../MonitoredError";
import {AnalyzerErrCode} from "../AnalyzerException";



export class AndroidAnalyzerException extends MonitoredError {

    static ERR = {
        ANDROID_XREF_NOT_PROCESSED: ErrorCode.ANALYZER + AnalyzerErrCode.ANDROID_APP + 1
    };

    static ANDROID_XREF_NOT_PROCESSED = (uid:string)=>{ return new AndroidAnalyzerException(" Xref from '"+uid+"' to Android API cannot be processed.",AndroidAnalyzerException.ERR.ANDROID_XREF_NOT_PROCESSED) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ANDROID ANALYZER', pMsg, pCode, pExtra);
    }
}